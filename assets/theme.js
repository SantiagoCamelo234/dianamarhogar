// SIDEBAR Toggles
function toggleSidebar() {
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
}

function toggleSubmenu(element) {
  const parentLi = element.parentElement;
  parentLi.classList.toggle('open');
}

function toggleFooterCol(element) {
  if (window.innerWidth <= 768) {
    element.classList.toggle('active');
  }
}

(function styleEasySellButton() {
  function findButton() {
    const mount = document.querySelector('[data-easy-sell-mount]');
    const candidates = document.querySelectorAll(
      '.releasit-buy-now-button, .es-button.es-sticky-btn'
    );

    candidates.forEach((candidate) => {
      if (candidate.matches('.ls-faq-q')) return;
      candidate.classList.add('dianamar-easysell-button');
      if (candidate.matches('.es-button.es-sticky-btn')) {
        if (window.innerWidth <= 768 && mount && !mount.contains(candidate)) {
          mount.appendChild(candidate);
        }
        candidate.classList.remove('dianamar-easysell-hidden');
        candidate.style.setProperty('display', 'flex', 'important');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', findButton);
  window.addEventListener('resize', findButton);
  new MutationObserver(findButton).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();

// SEARCH Toggle
function toggleSearch() {
  const container = document.querySelector('.search-container');
  const input = document.getElementById('searchInput');

  if (container.classList.contains('active') && input.value.trim() !== '') {
    container.closest('form').submit();
    return;
  }

  container.classList.toggle('active');
  if (container.classList.contains('active')) {
    input.focus();
  }
}

let isLoginMode = true;

function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  const title = document.getElementById('authTitle');
  const subtitle = document.getElementById('authSubtitle');
  const nameInput = document.getElementById('authName');
  const btnSubmit = document.getElementById('authBtnSubmit');
  const switchText = document.getElementById('authSwitchText');

  if (isLoginMode) {
    title.innerText = "Iniciar Sesión";
    subtitle.innerText = "Ingresa a tu cuenta para ver tus pedidos";
    nameInput.style.display = "none";
    nameInput.removeAttribute('required');
    btnSubmit.innerText = "Entrar";
    switchText.innerHTML = '¿No tienes cuenta? <a onclick="toggleAuthMode()">Regístrate aquí</a>';
  } else {
    title.innerText = "Crear Cuenta";
    subtitle.innerText = "Únete a Dianamar Hogar";
    nameInput.style.display = "block";
    nameInput.setAttribute('required', 'true');
    btnSubmit.innerText = "Registrarme";
    switchText.innerHTML = '¿Ya tienes cuenta? <a onclick="toggleAuthMode()">Inicia sesión aquí</a>';
  }
}

// RUTEO DE VISTAS SIMPLE
function showHome() {
  document.getElementById('view-product').classList.remove('active');
  document.getElementById('view-auth').classList.remove('active');
  document.getElementById('view-cart').classList.remove('active');
  document.getElementById('view-home').classList.add('active');
  window.scrollTo(0, 0);
}

function showProduct() {
  document.getElementById('view-home').classList.remove('active');
  document.getElementById('view-auth').classList.remove('active');
  document.getElementById('view-cart').classList.remove('active');
  document.getElementById('view-product').classList.add('active');
  window.scrollTo(0, 0);
}

function showAuth() {
  document.getElementById('view-home').classList.remove('active');
  document.getElementById('view-product').classList.remove('active');
  document.getElementById('view-cart').classList.remove('active');
  document.getElementById('view-auth').classList.add('active');
  window.scrollTo(0, 0);
}

function showCart() {
  document.getElementById('view-home').classList.remove('active');
  document.getElementById('view-product').classList.remove('active');
  document.getElementById('view-auth').classList.remove('active');
  document.getElementById('view-cart').classList.add('active');
  window.scrollTo(0, 0);
}

// Slider Imágenes / Video
function changeMedia(index, thumbElement) {
  const slider = document.getElementById('mainImageSlider');
  const slides = document.querySelectorAll('.media-slide');
  const muteBtn = document.getElementById('mute-btn');
  
  if (!slider || slides.length === 0) return;

  // Actualizar clase activa (para PC)
  slides.forEach(s => s.classList.remove('active'));
  slides[index].classList.add('active');

  // Scroll (para móvil)
  slider.scrollTo({
    left: slides[index].offsetLeft,
    behavior: 'smooth'
  });

  // Manejar botón de mute y video
  const activeSlide = slides[index];
  const isVideo = activeSlide.getAttribute('data-media-type') === 'video';
  
  if (muteBtn) {
    muteBtn.style.display = isVideo ? 'flex' : 'none';
  }

  // Actualizar thumbnails
  document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
  if (thumbElement) thumbElement.classList.add('active');
}

// Navegación por flechas (PC)
function navMedia(direction) {
  const slides = document.querySelectorAll('.media-slide');
  const thumbs = document.querySelectorAll('.thumbnail');
  if (slides.length <= 1) return;

  let currentIndex = 0;
  slides.forEach((slide, idx) => {
    if (slide.classList.contains('active')) currentIndex = idx;
  });

  let newIndex = currentIndex + direction;
  
  // Hacerlo cíclico
  if (newIndex < 0) newIndex = slides.length - 1;
  if (newIndex >= slides.length) newIndex = 0;

  // Cambiar media usando el índice calculado
  changeMedia(newIndex, thumbs[newIndex]);
}

// Sincronizar scroll con thumbnails en móvil
document.addEventListener("DOMContentLoaded", function() {
  const slider = document.getElementById('mainImageSlider');
  if (slider) {
    slider.addEventListener('scroll', function() {
      const index = Math.round(slider.scrollLeft / slider.offsetWidth);
      const thumbs = document.querySelectorAll('.thumbnail');
      const slides = document.querySelectorAll('.media-slide');
      
      if (thumbs[index]) {
        thumbs.forEach(t => t.classList.remove('active'));
        thumbs[index].classList.add('active');
      }
      
      const muteBtn = document.getElementById('mute-btn');
      if (slides[index] && muteBtn) {
        const isVideo = slides[index].getAttribute('data-media-type') === 'video';
        muteBtn.style.display = isVideo ? 'flex' : 'none';
      }
    });
  }
  // Verificar estado inicial al cargar
  const initialSlide = document.querySelector('.media-slide.active');
  const initialMuteBtn = document.getElementById('mute-btn');
  if (initialSlide && initialMuteBtn) {
    const isVideo = initialSlide.getAttribute('data-media-type') === 'video';
    initialMuteBtn.style.display = isVideo ? 'flex' : 'none';
  }
});

// Mute / Unmute Video
function toggleMute() {
  // Intentar por id primero; si no, buscar el video en el slide activo
  let vid = document.getElementById('main-product-video');
  if (!vid) {
    const activeSlide = document.querySelector('.media-slide.active');
    if (activeSlide) vid = activeSlide.querySelector('video');
  }
  const icon = document.getElementById('mute-icon');
  const text = document.getElementById('mute-text');

  if (!vid) return;

  vid.muted = !vid.muted;

  if (vid.muted) {
    // Ícono: altavoz tachado (silenciado)
    if (icon) icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
    if (text) text.textContent = 'Activar Sonido';
  } else {
    // Ícono: altavoz con ondas (con sonido)
    if (icon) icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
    if (text) text.textContent = 'Silenciar';
  }
}

// Selector Talla
function selectVariant(element, cm) {
  document.querySelectorAll('.size-option').forEach(t => t.classList.remove('selected'));
  element.classList.add('selected');
  const precios = {
    120: "$250,000",
    140: "$300,000",
    160: "$350,000",
    180: "$400,000",
    200: "$450,000"
  };
  const priceDisplay = document.querySelector('.product-price');
  if(priceDisplay) priceDisplay.innerHTML = `${precios[cm]} <span class="compare-price">Antes mayor</span>`;
}

// Selector Cantidad
function updateQty(change) {
  const input = document.getElementById('qty');
  if(!input) return;
  let val = parseInt(input.value) + change;
  if(val < 1) val = 1;

  // Limitar por el atributo max si existe (Inventario Shopify)
  if(input.hasAttribute('max') && input.getAttribute('max') !== '') {
    const maxVal = parseInt(input.getAttribute('max'));
    if(val > maxVal) {
      val = maxVal;
      alert('Has alcanzado el límite de unidades disponibles en inventario para este producto.');
    }
  }
  
  input.value = val;
}

// ── CRONÓMETRO GLOBAL DE OFERTA ──────────────────────────────────────────────
(function initGlobalOfferTimer() {
  const KEY_EXPIRY = 'dianamar_custom_offer_expiry';

  function getOrCreateExpiry(durationMs) {
    const stored = localStorage.getItem(KEY_EXPIRY);
    const now = Date.now();

    if (stored) {
      const expiry = parseInt(stored, 10);
      if (expiry > now) return expiry;
    }

    const newExpiry = now + durationMs;
    localStorage.setItem(KEY_EXPIRY, newExpiry);
    return newExpiry;
  }

  function tick() {
    const wrappers = document.querySelectorAll('.countdown-timer-blocks');
    if (wrappers.length === 0) return;

    wrappers.forEach(wrapper => {
      const hoursAttr = wrapper.getAttribute('data-hours') || "48";
      const durationMs = parseFloat(hoursAttr) * 60 * 60 * 1000;

      let expiry = getOrCreateExpiry(durationMs);
      let remaining = expiry - Date.now();

      if (remaining <= 0) {
        const newExpiry = Date.now() + durationMs;
        localStorage.setItem(KEY_EXPIRY, newExpiry);
        expiry = newExpiry;
        remaining = durationMs;
      }

      const totalSec = Math.floor(remaining / 1000);
      const d = Math.floor(totalSec / (3600 * 24));
      const h = Math.floor((totalSec % (3600 * 24)) / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;

      const dEl = wrapper.querySelector('.countdown-days');
      const hEl = wrapper.querySelector('.countdown-hours');
      const mEl = wrapper.querySelector('.countdown-minutes');
      const sEl = wrapper.querySelector('.countdown-seconds');

      if (dEl) dEl.textContent = d;
      if (hEl) hEl.textContent = h;
      if (mEl) mEl.textContent = m;
      if (sEl) sEl.textContent = s;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      tick();
      setInterval(tick, 1000);
    });
  } else {
    tick();
    setInterval(tick, 1000);
  }
})();

// Acordeones interactivos
function toggleAccordion(element) {
  element.classList.toggle('open');
  const icon = element.querySelector('.accordion-icon');
  if (element.classList.contains('open')) {
    icon.style.transform = 'rotate(45deg)';
  } else {
    icon.style.transform = 'rotate(0deg)';
  }
}

// Actualizar variante seleccionada visualmente y en el select oculto
let currentCartData = null;

async function syncProductStockWithCart() {
  const qtyInput = document.getElementById('qty');
  const variantSelect = document.getElementById('product-variant-select');
  const btnAdd = document.getElementById('add-to-cart-button');
  const buySection = document.getElementById('buy-section-container');
  const alreadyInCartMsg = document.getElementById('already-in-cart-msg');
  
  if (!variantSelect) return;

  // 1. Obtener el carrito actualizado siempre
  try {
    const res = await fetch('/cart.js');
    currentCartData = await res.json();
  } catch (e) {
    console.error("Error fetching cart:", e);
    return;
  }

  // 2. Identificar variante seleccionada
  const selectedVariantId = variantSelect.value;
  let totalInventory = 999;
  let inventoryPolicy = 'deny';

  if (variantSelect.tagName === 'SELECT') {
    const selectedOption = variantSelect.options[variantSelect.selectedIndex];
    if (selectedOption) {
      totalInventory = parseInt(selectedOption.getAttribute('data-inventory-quantity') || '999', 10);
      inventoryPolicy = selectedOption.getAttribute('data-inventory-policy');
    }
  } else {
    // Es un input hidden (productos sin variantes)
    totalInventory = parseInt(variantSelect.getAttribute('data-inventory-quantity') || '999', 10);
    inventoryPolicy = variantSelect.getAttribute('data-inventory-policy');
  }

  // 3. Buscar si el artículo ya está en el carrito
  const cartItem = currentCartData.items.find(item => item.variant_id.toString() === selectedVariantId.toString());
  
  if (cartItem) {
    // YA ESTÁ EN EL CARRITO
    if (buySection) buySection.style.display = 'none';
    if (alreadyInCartMsg) alreadyInCartMsg.style.display = 'block';
  } else {
    // NO ESTÁ EN EL CARRITO
    if (buySection) buySection.style.display = 'flex';
    if (alreadyInCartMsg) alreadyInCartMsg.style.display = 'none';
    
    if (qtyInput) {
      qtyInput.setAttribute('max', totalInventory > 0 ? totalInventory : 0);
      if (parseInt(qtyInput.value) > totalInventory && inventoryPolicy !== 'continue') {
        qtyInput.value = totalInventory > 0 ? totalInventory : 1;
      }
    }

    if (totalInventory <= 0 && inventoryPolicy !== 'continue' && btnAdd) {
      btnAdd.classList.add('out-of-stock');
      btnAdd.classList.remove('btn-animated');
      btnAdd.innerText = 'Agotado';
      btnAdd.disabled = true;
    } else if (btnAdd) {
      btnAdd.classList.remove('out-of-stock');
      btnAdd.classList.add('btn-animated');
      btnAdd.innerHTML = '<span class="promo-btn-title">📦 COMPRA AHORA Y PAGA EN CASA </span>';
      btnAdd.disabled = false;
    }
  }
}

function selectShopifyVariant(element, selectId) {
  const parent = element.parentElement;
  parent.querySelectorAll('.size-option').forEach(el => el.classList.remove('selected'));
  element.classList.add('selected');

  const selectedOptions = Array.from(document.querySelectorAll('.size-selector .selected')).map(el => el.innerText.trim());
  const optionsString = selectedOptions.join(',');

  const select = document.getElementById(selectId);
  if(select) {
    let found = false;
    Array.from(select.options).forEach(opt => {
       if(opt.getAttribute('data-options') === optionsString) {
         select.value = opt.value;
         found = true;
         
          // El estado del botón se gestionará íntegramente en syncProductStockWithCart
          // para incluir la verificación del carrito.
         
          const priceDisplay = document.querySelector('.product-price');
          if(priceDisplay) {
            const price = opt.getAttribute('data-price');
            const comparePrice = opt.getAttribute('data-compare-price');
            let priceHtml = price;
            
            if(comparePrice && comparePrice.trim() !== '') {
              // Calcular el % de descuento
              const priceNum = parseFloat(opt.getAttribute('data-price-raw') || price.replace(/[^0-9.]/g, ''));
              const comparePriceNum = parseFloat(opt.getAttribute('data-compare-price-raw') || comparePrice.replace(/[^0-9.]/g, ''));
              let discountBadge = '';
              if(comparePriceNum > priceNum) {
                const pct = Math.round((comparePriceNum - priceNum) / comparePriceNum * 100);
                discountBadge = '<span class="discount-badge">-' + pct + '%</span>';
              }
              priceHtml = price + ' <span class="compare-price">' + comparePrice + '</span>' + discountBadge;
            }
            priceDisplay.innerHTML = priceHtml;
          }

          // Sincronizar stock con el carrito para la nueva variante seleccionada
          syncProductStockWithCart();
       }
    });
  }
}

// Inicializar sincronización de stock al cargar la página si estamos en vista de producto
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('product-variant-select')) {
    syncProductStockWithCart();
  }
});

// ==========================================
// LÓGICA DE RESEÑAS (REVIEWS)
// ==========================================

// --- REVIEWS LOGIC ---
function loadMoreReviews() {
  const hiddenReviews = document.querySelectorAll('.review-card.hidden');
  const container = document.getElementById('loadMoreContainer');
  
  // Mostrar 6 más cada vez
  let count = 0;
  hiddenReviews.forEach(review => {
    if (count < 6) {
      review.classList.remove('hidden');
      review.style.animation = 'fadeIn 0.5s ease forwards';
      count++;
    }
  });

  // Si ya no quedan reseñas ocultas, esconder el contenedor del botón
  if (document.querySelectorAll('.review-card.hidden').length === 0) {
    if (container) container.style.display = 'none';
  }
}

