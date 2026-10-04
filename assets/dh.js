/* ==========================================================================
   Dianamar Hogar · lógica de la tienda nueva (rama dev)
   - Menú lateral en celular y buscador
   - Cesta lateral conectada al carrito de Shopify (/cart/*.js)
   - Carrusel de productos del inicio
   - Filtros del catálogo en celular
   Expone window.DH.addToCart(variantId, qty, { checkout }) para las páginas de producto.
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.DH_CONFIG || {};
  var moneyFormat = cfg.moneyFormat || '${{amount_no_decimals_with_comma_separator}}';

  function formatMoney(cents) {
    var n = Math.round(Number(cents) || 0);
    var m = moneyFormat.match(/\{\{\s*(\w+)\s*\}\}/);
    var key = m ? m[1] : 'amount_no_decimals_with_comma_separator';
    function delim(num, precision, thousands, decimal) {
      var parts = (num / 100).toFixed(precision).split('.');
      return parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands) + (parts[1] ? decimal + parts[1] : '');
    }
    var value;
    switch (key) {
      case 'amount': value = delim(n, 2, ',', '.'); break;
      case 'amount_no_decimals': value = delim(n, 0, ',', '.'); break;
      case 'amount_with_comma_separator': value = delim(n, 2, '.', ','); break;
      default: value = delim(n, 0, '.', ',');
    }
    return moneyFormat.replace(/\{\{\s*\w+\s*\}\}/, value.replace(/[.,]00$/, ''));
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------------- Paneles (menú y cesta) ---------------- */
  var backdrop, lastFocus = null;

  function openPanel(panel) {
    if (!panel) return;
    lastFocus = document.activeElement;
    closePanels();
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    var focusable = panel.querySelector('button, a, input');
    if (focusable) setTimeout(function () { focusable.focus(); }, 50);
  }

  function closePanels() {
    $all('.dh-menu.is-open, .dh-cart.is-open').forEach(function (p) {
      p.classList.remove('is-open');
      p.setAttribute('aria-hidden', 'true');
    });
    if (backdrop) backdrop.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  /* ---------------- Cesta ---------------- */
  var cartEl;

  function setCount(count) {
    $all('[data-dh-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = !count;
    });
    $all('[data-dh-cart-label]').forEach(function (el) {
      el.setAttribute('aria-label', 'Cesta, ' + count + (count === 1 ? ' producto' : ' productos'));
    });
  }

  function renderCart(cart, justAdded) {
    if (!cartEl) return;
    var body = $('[data-dh-cart-body]', cartEl);
    var added = $('[data-dh-cart-added]', cartEl);
    var total = $('[data-dh-cart-total]', cartEl);
    var title = $('[data-dh-cart-title]', cartEl);
    var foot = $('[data-dh-cart-foot]', cartEl);
    var count = cart.item_count || 0;

    setCount(count);
    if (title) title.textContent = 'Tu cesta (' + count + ')';
    if (added) added.hidden = !justAdded;
    if (total) total.textContent = formatMoney(cart.total_price);
    if (foot) foot.hidden = count === 0;

    if (!count) {
      body.innerHTML = '<div class="dh-cart-empty"><p>Tu cesta está vacía.</p><a class="dh-btn dh-btn-primary" href="/collections/all">Ver productos</a></div>';
      return;
    }

    var html = cart.items.map(function (it) {
      var img = it.image ? it.image + (it.image.indexOf('?') > -1 ? '&' : '?') + 'width=160' : '';
      var variant = it.variant_title && it.variant_title !== 'Default Title' ? it.variant_title : '';
      var price = it.original_line_price !== it.final_line_price
        ? '<s style="display:block;font-weight:500;font-size:12px;color:#6B5E5B">' + formatMoney(it.original_line_price) + '</s>' + formatMoney(it.final_line_price)
        : formatMoney(it.final_line_price);
      return '<div class="dh-cart-item" data-key="' + esc(it.key) + '">' +
        (img ? '<img src="' + esc(img) + '" alt="" width="68" height="68" loading="lazy">' : '<span style="width:68px;height:68px;border-radius:10px;background:#FCEFEC"></span>') +
        '<div><a class="dh-cart-item-title" href="' + esc(it.url) + '">' + esc(it.product_title) + '</a>' +
        (variant ? '<div class="dh-cart-item-variant">' + esc(variant) + '</div>' : '') +
        '<div style="display:flex;align-items:center">' +
        '<div class="dh-qty" role="group" aria-label="Cantidad">' +
        '<button type="button" data-dh-qty="' + (it.quantity - 1) + '" aria-label="Quitar una unidad">−</button>' +
        '<span>' + it.quantity + '</span>' +
        '<button type="button" data-dh-qty="' + (it.quantity + 1) + '" aria-label="Agregar una unidad">+</button></div>' +
        '<button type="button" class="dh-cart-remove" data-dh-qty="0">Quitar</button></div></div>' +
        '<div class="dh-cart-item-price">' + price + '</div></div>';
    }).join('');

    var up = cfg.upsell;
    if (up && up.variantId && !cart.items.some(function (it) { return String(it.product_id) === String(up.productId); })) {
      html += '<div class="dh-upsell">' +
        (up.image ? '<img src="' + esc(up.image) + '" alt="" width="56" height="56" loading="lazy">' : '<span></span>') +
        '<div style="font-size:14px"><div style="font-weight:800">' + esc(up.heading || 'Completa tu cama') + '</div><div>' + esc(up.title) + ' · ' + formatMoney(up.price) + '</div></div>' +
        '<button type="button" class="dh-btn dh-btn-outline" style="min-height:44px;padding:0 14px" data-dh-upsell>Añadir</button></div>';
    }
    body.innerHTML = html;
  }

  function fetchCart() {
    return fetch('/cart.js', { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); });
  }

  function refreshCart(justAdded) {
    return fetchCart().then(function (cart) { renderCart(cart, justAdded); return cart; });
  }

  function changeLine(key, quantity) {
    cartEl.classList.add('is-busy');
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    }).then(function (r) { return r.json(); })
      .then(function (cart) { renderCart(cart, false); })
      .finally(function () { cartEl.classList.remove('is-busy'); });
  }

  function addToCart(variantId, quantity, opts) {
    opts = opts || {};
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id: Number(variantId), quantity: Number(quantity) || 1 }] })
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.description || data.message || 'No se pudo añadir el producto.');
        return data;
      });
    }).then(function () {
      if (opts.checkout) { window.location.href = '/checkout'; return; }
      return refreshCart(true).then(function () { openPanel(cartEl); });
    });
  }

  /* ---------------- Carrusel del inicio ---------------- */
  function initHero(root) {
    var slides = $all('[data-dh-slide]', root);
    var imgs = $all('[data-dh-slide-img]', root);
    var tabs = $all('[data-dh-slide-tab]', root);
    var tag = $('[data-dh-slide-tagtext]', root);
    if (slides.length < 2) return;
    var i = 0, timer = null;
    var delay = (parseInt(root.getAttribute('data-autoplay'), 10) || 5) * 1000;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.hidden = k !== i; });
      imgs.forEach(function (im, k) { im.classList.toggle('is-active', k === i); });
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      if (tag && tabs[i]) tag.textContent = tabs[i].textContent.trim();
    }
    function start() { stop(); if (!reduce) timer = setInterval(function () { show(i + 1); }, delay); }
    function stop() { clearInterval(timer); timer = null; }

    tabs.forEach(function (t, k) { t.addEventListener('click', function () { show(k); stop(); setTimeout(start, 8000); }); });
    root.addEventListener('pointerenter', stop);
    root.addEventListener('pointerleave', start);

    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
      x0 = null; setTimeout(start, 6000);
    }, { passive: true });

    show(0); start();
  }

  /* ---------------- Carril de categorías ----------------
     Se mueve solo, despacio y en bucle (hacia la derecha por defecto).
     Se puede deslizar con el dedo o arrastrar con el mouse; al tocarlo se pausa
     y retoma 3 s después. Un arrastre no cuenta como clic en la categoría. */
  function initCatsRail(rail) {
    var originals = $all('.dh-cat', rail);
    if (originals.length < 2) return;
    var motion = rail.getAttribute('data-motion') || 'right';
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var animate = motion !== 'none' && !reduce;

    // Copias para que el bucle no tenga saltos (ocultas para lectores de pantalla).
    if (animate) {
      originals.forEach(function (el) {
        var c = el.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.setAttribute('tabindex', '-1');
        c.removeAttribute('role');
        rail.appendChild(c);
      });
    }

    var half = 0, pos = 0, last = 0, paused = false, visible = true, resumeTimer = null;
    var speed = 32; // px por segundo
    var dir = motion === 'left' ? 1 : -1; // -1: el contenido avanza hacia la derecha

    function measure() { half = rail.scrollWidth / 2; }
    function wrap() {
      if (!animate || !half) return;
      if (rail.scrollLeft >= half) rail.scrollLeft -= half;
      else if (rail.scrollLeft <= 0) rail.scrollLeft += half;
      pos = rail.scrollLeft;
    }
    function pause() { paused = true; clearTimeout(resumeTimer); }
    function resumeLater() { clearTimeout(resumeTimer); resumeTimer = setTimeout(function () { pos = rail.scrollLeft; paused = false; }, 3000); }

    function tick(t) {
      if (!last) last = t;
      var dt = Math.min(64, t - last); last = t;
      if (animate && !paused && visible && !document.hidden && half) {
        pos += dir * speed * dt / 1000;
        if (pos >= half) pos -= half;
        if (pos <= 0) pos += half;
        rail.scrollLeft = pos;
      }
      requestAnimationFrame(tick);
    }

    // Toque / rueda: pausa y deja que el navegador haga el desplazamiento nativo.
    rail.addEventListener('touchstart', pause, { passive: true });
    rail.addEventListener('touchend', resumeLater, { passive: true });
    rail.addEventListener('wheel', function () { pause(); resumeLater(); }, { passive: true });
    rail.addEventListener('scroll', function () { if (paused) wrap(); }, { passive: true });
    rail.addEventListener('focusin', pause);
    rail.addEventListener('focusout', resumeLater);

    // Arrastre con el mouse en computador.
    var dragging = false, startX = 0, startLeft = 0, moved = 0;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true; moved = 0; startX = e.clientX; startLeft = rail.scrollLeft; pause();
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 6) rail.classList.add('is-dragging');
      rail.scrollLeft = startLeft - dx;
      wrap(); startLeft = rail.scrollLeft + dx;
    });
    window.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      setTimeout(function () { rail.classList.remove('is-dragging'); }, 0);
      resumeLater();
    });
    rail.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); moved = 0; } }, true);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(rail);
    }
    window.addEventListener('resize', function () { measure(); wrap(); });

    measure();
    if (animate) {
      // Empieza en la mitad para poder avanzar en cualquier dirección sin saltos.
      rail.scrollLeft = dir < 0 ? half : 0;
      pos = rail.scrollLeft;
      requestAnimationFrame(tick);
      // Las imágenes pueden cambiar el ancho al cargar.
      window.addEventListener('load', function () { measure(); wrap(); });
    }
  }

  /* ---------------- Inicio ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    backdrop = $('[data-dh-backdrop]');
    cartEl = $('[data-dh-cart]');
    var menu = $('[data-dh-menu]');

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('[data-dh-open-menu]')) { e.preventDefault(); openPanel(menu); return; }
      if (t.closest('[data-dh-open-cart]')) { e.preventDefault(); refreshCart(false); openPanel(cartEl); return; }
      if (t.closest('[data-dh-close]') || t === backdrop) { e.preventDefault(); closePanels(); return; }
      if (t.closest('[data-dh-toggle-search]')) {
        var s = $('[data-dh-search]');
        if (s) { s.hidden = !s.hidden; if (!s.hidden) { var inp = $('input', s); if (inp) inp.focus(); } }
        return;
      }
      var qtyBtn = t.closest('[data-dh-qty]');
      if (qtyBtn && cartEl && cartEl.contains(qtyBtn)) {
        var line = qtyBtn.closest('[data-key]');
        changeLine(line.getAttribute('data-key'), parseInt(qtyBtn.getAttribute('data-dh-qty'), 10));
        return;
      }
      if (t.closest('[data-dh-upsell]') && cfg.upsell) {
        cartEl.classList.add('is-busy');
        addToCart(cfg.upsell.variantId, 1).finally(function () { cartEl.classList.remove('is-busy'); });
        return;
      }
      var ft = t.closest('[data-dh-filter-toggle]');
      if (ft) {
        var f = $('[data-dh-filters]');
        if (f) { var open = f.classList.toggle('is-open'); ft.setAttribute('aria-expanded', open ? 'true' : 'false'); }
      }
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanels(); });

    // El selector de orden del catálogo recarga con el nuevo orden.
    $all('[data-dh-sort]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var url = new URL(window.location.href);
        url.searchParams.set('sort_by', sel.value);
        url.searchParams.delete('page');
        window.location.href = url.toString();
      });
    });

    // Footer: abierto en computador, en acordeón en celular.
    if (window.matchMedia('(max-width: 760px)').matches) {
      $all('.dh-footer details[open]').forEach(function (d) { d.open = false; });
    }

    $all('[data-dh-hero]').forEach(initHero);
    $all('[data-dh-cats]').forEach(initCatsRail);
    if (cartEl) fetchCart().then(function (c) { setCount(c.item_count || 0); }).catch(function () {});
  });

  window.DH = { addToCart: addToCart, openCart: function () { refreshCart(false); openPanel(cartEl); }, refreshCart: refreshCart, formatMoney: formatMoney };
})();
