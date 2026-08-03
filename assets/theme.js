/**
 * DhabiCart Theme JavaScript
 * Handles global UI interactions, hero carousel, variant switching, PDP tabs
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeroCarousel();
  initIntersectionObserver();
  initPDP();
  initVariantSwatches();
  initWishlist();
});

/* ==============================================
   MOBILE MENU & BOTTOM NAV
   ============================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuBtn');
  const catBtn = document.getElementById('mobileNavCat');
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileOverlay');
  const closeBtn = document.getElementById('mobileMenuClose');

  const openMenu = () => {
    menu.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  if (toggleBtn) toggleBtn.addEventListener('click', openMenu);
  if (catBtn) catBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay) overlay.addEventListener('click', () => {
    closeMenu();
    // Also close cart if open
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartDrawer) cartDrawer.classList.remove('is-open');
    if (cartOverlay) cartOverlay.classList.remove('is-open');
  });
}

/* ==============================================
   HERO CAROUSEL
   ============================================== */
function initHeroCarousel() {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) return;

  const track = document.getElementById('heroTrack');
  const prev = document.getElementById('heroPrev');
  const next = document.getElementById('heroNext');
  const dots = document.querySelectorAll('.hero__dot');
  
  if (!track || dots.length <= 1) return;

  let currentIdx = 0;
  const slideCount = dots.length;
  const isAutoplay = carousel.dataset.autoplay === 'true';
  const interval = parseInt(carousel.dataset.interval) || 4000;
  let timer;

  const goToSlide = (idx) => {
    currentIdx = idx;
    if (currentIdx < 0) currentIdx = slideCount - 1;
    if (currentIdx >= slideCount) currentIdx = 0;
    
    track.style.transform = `translateX(-${currentIdx * 100}%)`;
    dots.forEach(d => d.classList.remove('is-active'));
    dots[currentIdx].classList.add('is-active');
  };

  if (prev) prev.addEventListener('click', () => { goToSlide(currentIdx - 1); resetTimer(); });
  if (next) next.addEventListener('click', () => { goToSlide(currentIdx + 1); resetTimer(); });
  
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index));
      resetTimer();
    });
  });

  const resetTimer = () => {
    if (isAutoplay) {
      clearInterval(timer);
      timer = setInterval(() => goToSlide(currentIdx + 1), interval);
    }
  };

  if (isAutoplay) {
    timer = setInterval(() => goToSlide(currentIdx + 1), interval);
  }
}

/* ==============================================
   INTERSECTION OBSERVER (Fade Up)
   ============================================== */
function initIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll('.fade-up').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

/* ==============================================
   TOAST NOTIFICATION
   ============================================== */
window.showToast = function(message) {
  const toast = document.getElementById('toastMessage');
  const text = document.getElementById('toastText');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.add('is-visible');
  setTimeout(() => toast.classList.remove('is-visible'), 3000);
};

/* ==============================================
   WISHLIST TOGGLE (UI ONLY)
   ============================================== */
function initWishlist() {
  document.querySelectorAll('.product-card__wish, .pdp-wish-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.classList.toggle('is-liked');
      if(this.classList.contains('is-liked')) {
        window.showToast('Added to wishlist ❤️');
      } else {
        window.showToast('Removed from wishlist');
      }
    });
  });
}

/* ==============================================
   PRODUCT CARD COLOR SWATCHES
   ============================================== */
function initVariantSwatches() {
  document.querySelectorAll('.card-colors .color-swatch').forEach(swatch => {
    swatch.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const card = this.closest('.product-card');
      if (!card) return;

      // Update active swatch
      card.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('is-active'));
      this.classList.add('is-active');

      // Update image
      const newImg = this.dataset.img;
      const imgEl = card.querySelector('.product-card__img img');
      if (imgEl && newImg) {
        imgEl.srcset = '';
        imgEl.src = newImg;
      }
    });
  });
}

/* ==============================================
   PRODUCT DETAIL PAGE LOGIC
   ============================================== */
function initPDP() {
  // 1. Gallery Thumbnail Switching
  const thumbs = document.querySelectorAll('.thumb-box');
  const mainImg = document.getElementById('mainProductImg');
  
  if (thumbs.length && mainImg) {
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', function() {
        thumbs.forEach(t => t.classList.remove('is-active'));
        this.classList.add('is-active');
        mainImg.src = this.dataset.img;
      });
    });
  }

  // 2. Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns.length) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('is-active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('is-active'));
        this.classList.add('is-active');
        const tabId = 'tab' + this.dataset.tab.charAt(0).toUpperCase() + this.dataset.tab.slice(1);
        document.getElementById(tabId).classList.add('is-active');
      });
    });
  }

  // 3. Variant Option Selection (Product Page)
  const productJsonEl = document.querySelector('[id^="ProductJson-"]');
  if (!productJsonEl) return;

  try {
    const productData = JSON.parse(productJsonEl.textContent);
    const variantPills = document.querySelectorAll('.variant-pill');
    
    variantPills.forEach(pill => {
      pill.addEventListener('click', function() {
        // Update active class within the same option group
        const optionIndex = this.dataset.optionIndex;
        document.querySelectorAll(`.variant-pill[data-option-index="${optionIndex}"]`).forEach(p => p.classList.remove('is-active'));
        this.classList.add('is-active');

        // Build current selections array
        const selections = [];
        document.querySelectorAll('.variant-pill.is-active').forEach(p => {
          selections.push(p.dataset.value);
        });

        // Find matching variant
        const matchedVariant = productData.variants.find(v => {
          return selections.every((val, index) => v.options[index] === val);
        });

        if (matchedVariant) {
          // Update Hidden Input
          const idInput = document.getElementById('productVariantId');
          if (idInput) idInput.value = matchedVariant.id;

          // Update URL
          window.history.replaceState({}, '', `${window.location.pathname}?variant=${matchedVariant.id}`);

          // Update Price
          const priceNow = document.getElementById('pdpPriceNow');
          const priceWas = document.getElementById('pdpPriceWas');
          const badge = document.getElementById('pdpDiscountBadge');

          if (priceNow) priceNow.innerHTML = formatMoney(matchedVariant.price);
          
          if (matchedVariant.compare_at_price > matchedVariant.price) {
            if (priceWas) {
              priceWas.innerHTML = formatMoney(matchedVariant.compare_at_price);
              priceWas.style.display = 'block';
            }
            if (badge) {
              const diff = Math.round((matchedVariant.compare_at_price - matchedVariant.price) * 100 / matchedVariant.compare_at_price);
              badge.innerHTML = `${diff}% OFF`;
              badge.style.display = 'block';
            }
          } else {
            if (priceWas) priceWas.style.display = 'none';
            if (badge) badge.style.display = 'none';
          }

          // Update SKU
          const skuEl = document.getElementById('pdpSku');
          if (skuEl) skuEl.innerHTML = matchedVariant.sku || 'N/A';

          // Update Button State
          const atcBtn = document.getElementById('addToCartBtn');
          if (atcBtn) {
            if (matchedVariant.available) {
              atcBtn.disabled = false;
              atcBtn.innerHTML = 'Add to Cart';
            } else {
              atcBtn.disabled = true;
              atcBtn.innerHTML = 'Sold Out';
            }
          }

          // Update Image
          if (matchedVariant.featured_image) {
            if (mainImg) mainImg.src = matchedVariant.featured_image.src;
            // Also select corresponding thumb
            thumbs.forEach(t => {
              if (t.dataset.img.includes(matchedVariant.featured_image.src.split('?')[0])) {
                thumbs.forEach(tb => tb.classList.remove('is-active'));
                t.classList.add('is-active');
              }
            });
          }
        }
      });
    });

  } catch (e) {
    console.error('Error parsing product JSON', e);
  }
}

// Helper formatting function
function formatMoney(cents) {
  const moneyFormat = window.DhabiCart?.moneyFormat || 'AED {{amount}}';
  if (typeof cents === 'string') cents = cents.replace('.', '');
  let value = '';
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  
  function defaultOption(opt, def) { return (typeof opt == 'undefined' ? def : opt); }
  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');
    if (isNaN(number) || number == null) return 0;
    number = (number/100.0).toFixed(precision);
    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';
    return dollars + cents;
  }

  switch(moneyFormat.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }
  return moneyFormat.replace(placeholderRegex, value).replace(window.DhabiCart?.currencyCode || 'AED', '').trim();
}
