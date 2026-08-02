/**
 * DhabiCart Cart API
 * Replaces localStorage with Shopify AJAX Cart API
 */

document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  initAddToCartButtons();
  initCartItemActions();
});

function initCartDrawer() {
  const toggleBtn = document.getElementById('cartToggle');
  const mobileCartBtn = document.getElementById('mobileNavCart');
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  const closeBtn = document.getElementById('cartClose');

  const openCart = () => {
    if (!window.DhabiCart.cartDrawerEnabled) {
      window.location.href = window.DhabiCart.cartUrl;
      return;
    }
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    refreshCartDrawer();
  };

  const closeCart = () => {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  if (toggleBtn) toggleBtn.addEventListener('click', openCart);
  if (mobileCartBtn) mobileCartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);
}

function initAddToCartButtons() {
  // Product Card Buttons
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const variantId = this.dataset.variantId;
      if (variantId) {
        addToCart(variantId, 1);
        
        // Visual feedback
        const originalBg = this.style.background;
        const originalHTML = this.innerHTML;
        this.style.background = '#059669';
        this.innerHTML = '✓ Added';
        setTimeout(() => {
          this.style.background = originalBg;
          this.innerHTML = originalHTML;
        }, 1500);
      }
    });
  });

  // PDP Add to Cart Form
  const pdpForm = document.getElementById('addToCartForm');
  if (pdpForm) {
    pdpForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const variantId = document.getElementById('productVariantId').value;
      const qty = parseInt(document.getElementById('productQuantity').value) || 1;
      addToCart(variantId, qty);
    });

    const pdpBtn = document.getElementById('addToCartBtn');
    if (pdpBtn) {
      pdpBtn.addEventListener('click', (e) => {
        // Prevent default only if inside a form, though button type="button" handles this
        e.preventDefault();
        const variantId = document.getElementById('productVariantId').value;
        const qty = parseInt(document.getElementById('productQuantity').value) || 1;
        addToCart(variantId, qty);
      });
    }
  }
}

function initCartItemActions() {
  const drawerBody = document.getElementById('cartItemsList');
  if (!drawerBody) return;

  drawerBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-remove-item')) {
      updateCartItem(e.target.dataset.key, 0);
    } else if (e.target.classList.contains('cart-qty-minus')) {
      const currentQty = parseInt(e.target.nextElementSibling.textContent);
      updateCartItem(e.target.dataset.key, currentQty - 1);
    } else if (e.target.classList.contains('cart-qty-plus')) {
      const currentQty = parseInt(e.target.previousElementSibling.textContent);
      updateCartItem(e.target.dataset.key, currentQty + 1);
    }
  });
}

function addToCart(variantId, quantity) {
  fetch(window.DhabiCart.cartAddUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: variantId,
      quantity: quantity
    })
  })
  .then(response => response.json())
  .then(data => {
    if (window.showToast) window.showToast('Item added to cart!');
    if (window.DhabiCart.cartDrawerEnabled) {
      const drawer = document.getElementById('cartDrawer');
      if (drawer && !drawer.classList.contains('is-open')) {
        document.getElementById('cartToggle')?.click();
      } else {
        refreshCartDrawer();
      }
    } else {
      window.location.href = window.DhabiCart.cartUrl;
    }
  })
  .catch(error => {
    console.error('Error adding to cart:', error);
    if (window.showToast) window.showToast('Failed to add item to cart');
  });
}

function updateCartItem(lineKey, quantity) {
  fetch(window.DhabiCart.cartChangeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: lineKey,
      quantity: quantity
    })
  })
  .then(response => response.json())
  .then(cart => {
    updateCartUI(cart);
  })
  .catch(error => console.error('Error updating cart:', error));
}

function refreshCartDrawer() {
  fetch(`${window.DhabiCart.cartUrl}.js`)
    .then(response => response.json())
    .then(cart => {
      updateCartUI(cart);
    })
    .catch(error => console.error('Error fetching cart:', error));
}

function updateCartUI(cart) {
  // Update badges
  const headerBadge = document.getElementById('cartBadge');
  const mobileBadge = document.getElementById('mobileCartBadge');
  
  if (headerBadge) {
    headerBadge.textContent = cart.item_count;
    headerBadge.style.display = cart.item_count > 0 ? 'flex' : 'none';
  }
  
  if (mobileBadge) {
    mobileBadge.textContent = cart.item_count;
    mobileBadge.style.opacity = cart.item_count > 0 ? '1' : '0';
  }

  // Update Drawer
  const emptyState = document.getElementById('cartEmptyState');
  const itemsList = document.getElementById('cartItemsList');
  const footer = document.getElementById('cartFooter');
  const total = document.getElementById('cartTotal');

  if (!itemsList) return;

  if (cart.item_count === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (footer) footer.style.display = 'none';
    itemsList.innerHTML = '';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    if (footer) footer.style.display = 'block';
    
    // Format money (basic fallback if theme.js missing)
    const fmt = (cents) => {
      if (window.formatMoney) return window.formatMoney(cents);
      return (cents / 100).toFixed(2);
    };

    itemsList.innerHTML = cart.items.map(item => `
      <div class="cart-item" data-key="${item.key}">
        <div class="cart-item__img">
          ${item.image ? `<img src="${item.image}" alt="${item.product_title}">` : ''}
        </div>
        <div class="cart-item__info">
          <div class="cart-item__title">${item.product_title}</div>
          ${item.variant_title ? `<div style="font-size: 0.75rem; color: var(--gray-500); margin-bottom: 4px;">${item.variant_title}</div>` : ''}
          <div class="cart-item__price"><span class="currency">${window.DhabiCart.currencyCode}</span> ${fmt(item.final_line_price)}</div>
          
          <div class="cart-item__qty">
            <button class="cart-item__qty-btn cart-qty-minus" data-key="${item.key}">-</button>
            <span class="cart-item__qty-val">${item.quantity}</span>
            <button class="cart-item__qty-btn cart-qty-plus" data-key="${item.key}">+</button>
          </div>
          <button class="cart-item__remove cart-remove-item" data-key="${item.key}">Remove</button>
        </div>
      </div>
    `).join('');

    if (total) {
      total.innerHTML = `<span class="currency">${window.DhabiCart.currencyCode}</span> ${fmt(cart.total_price)}`;
    }
  }
}
