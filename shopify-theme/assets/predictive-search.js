/**
 * DhabiCart Predictive Search
 * Uses Shopify Predictive Search API to replace the custom client-side search
 */

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  const resultsDropdown = document.getElementById('predictiveSearchResults');
  
  if (!input || !resultsDropdown) return;

  let debounceTimer;

  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();

    if (query.length === 0) {
      resultsDropdown.classList.remove('is-open');
      return;
    }

    debounceTimer = setTimeout(() => {
      fetchPredictiveSearch(query);
    }, 300);
  });

  input.addEventListener('focus', () => {
    if (input.value.trim().length > 0 && resultsDropdown.innerHTML.trim().length > 0) {
      resultsDropdown.classList.add('is-open');
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header__search')) {
      resultsDropdown.classList.remove('is-open');
    }
  });

  function fetchPredictiveSearch(query) {
    fetch(`${window.DhabiCart.searchUrl}/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5&section_id=predictive-search`)
      .then(response => response.json())
      .then(data => {
        const products = data.resources.results.products;
        
        if (products && products.length > 0) {
          const html = products.map(product => {
            // Basic formatting for money
            const price = (product.price_min || product.price) || 0;
            const formattedPrice = window.formatMoney ? window.formatMoney(price * 100) : (price).toFixed(2);
            
            return `
              <a href="${product.url}" class="predictive-search__item">
                ${product.image ? `<img src="${product.image}" alt="${product.title}">` : '<div style="width:40px;height:40px;background:#f3f4f6;border-radius:8px;"></div>'}
                <div>
                  <div class="predictive-search__item-title">${product.title}</div>
                  <div class="predictive-search__item-price">${window.DhabiCart.currencyCode} ${formattedPrice}</div>
                </div>
              </a>
            `;
          }).join('');
          
          // View all link
          const viewAll = `
            <a href="${window.DhabiCart.searchUrl}?q=${encodeURIComponent(query)}" class="predictive-search__item" style="justify-content: center; background: #F8F9FC; border-top: 1px solid #E5E7EB;">
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--navy);">View all results for "${query}"</span>
            </a>
          `;
          
          resultsDropdown.innerHTML = html + viewAll;
          resultsDropdown.classList.add('is-open');
        } else {
          resultsDropdown.innerHTML = `
            <div style="padding: 16px; text-align: center; font-size: 0.85rem; color: var(--gray-500);">
              No results found for "${query}"
            </div>
          `;
          resultsDropdown.classList.add('is-open');
        }
      })
      .catch(error => {
        console.error('Error fetching predictive search:', error);
      });
  }
});
