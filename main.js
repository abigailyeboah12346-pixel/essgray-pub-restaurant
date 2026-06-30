// ===== ESSGRAY PUB & RESTAURANT — MAIN SCRIPT =====

// ===== LOADER =====
function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.add('hidden');
}
window.addEventListener('load', () => {
  setTimeout(hideLoader, 1600);
});
// Failsafe: never let the loader stay stuck for more than 4s, no matter what.
setTimeout(hideLoader, 4000);

// ===== NAVBAR SCROLL =====
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
  document.querySelector('.back-to-top').classList.toggle('visible', window.scrollY > 400);
});

// ===== HAMBURGER MENU =====
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileNav.classList.toggle('open');
});
document.querySelectorAll('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('open');
  });
});

// ===== MENU TABS =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.menu-tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ===== CART STATE =====
let cart = [];

function getItemById(id) {
  return cart.find(i => i.id === id);
}

// ===== ADD TO CART =====
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.menu-card');
    const id = card.dataset.id;
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price) || 0;
    const img = card.dataset.img;
    const isFood = card.dataset.type === 'food';

    const existing = getItemById(id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price, img, isFood, qty: 1 });
    }

    updateCartUI();
    showToast(`🛒 ${name} added to cart`);
  });
});

// ===== UPDATE CART UI =====
function updateCartUI() {
  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  // Badge
  const badge = document.querySelector('.cart-count');
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);

  // Items
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.querySelector('.cart-empty');

  if (cart.length === 0) {
    itemsEl.innerHTML = '';
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.img}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${item.isFood ? 'Price on order' : 'GH₵' + item.price.toFixed(2)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="remove-item" onclick="removeItem('${item.id}')" title="Remove">🗑</button>
      </div>
    `).join('');
  }

  // Footer totals
  const drinkTotal = cart.filter(i => !i.isFood).reduce((sum, i) => sum + i.price * i.qty, 0);
  document.querySelector('.drink-total').textContent = 'GH₵' + drinkTotal.toFixed(2);
  document.querySelector('.grand-total').textContent = 'GH₵' + drinkTotal.toFixed(2);
}

function changeQty(id, delta) {
  const item = getItemById(id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeItem(id);
  else updateCartUI();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

// ===== CART DRAWER =====
const cartToggle = document.querySelector('.cart-toggle');
const cartOverlay = document.querySelector('.cart-overlay');
const cartDrawer = document.querySelector('.cart-drawer');
const cartCloseBtn = document.querySelector('.cart-close');

function openCart() {
  cartOverlay.classList.add('open');
  cartDrawer.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartOverlay.classList.remove('open');
  cartDrawer.classList.remove('open');
  document.body.style.overflow = '';
}
cartToggle.addEventListener('click', openCart);
cartCloseBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ===== CHECKOUT (open order modal) =====
document.querySelector('.checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) return showToast('Your cart is empty!');
  populateOrderModal();
  closeCart();
  document.querySelector('.modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
});

function populateOrderModal() {
  const list = document.getElementById('modalOrderItems');
  const drinkTotal = cart.filter(i => !i.isFood).reduce((sum, i) => sum + i.price * i.qty, 0);
  list.innerHTML = cart.map(i =>
    `<div class="modal-order-item">
      <span>${i.name} × ${i.qty}</span>
      <span>${i.isFood ? 'TBC' : 'GH₵' + (i.price * i.qty).toFixed(2)}</span>
    </div>`
  ).join('');
  document.getElementById('modalDrinkTotal').textContent = 'GH₵' + drinkTotal.toFixed(2);
}

// ===== ORDER MODAL CLOSE =====
document.querySelector('.modal-close').addEventListener('click', closeOrderModal);
document.querySelector('.modal-overlay').addEventListener('click', e => {
  if (e.target === document.querySelector('.modal-overlay')) closeOrderModal();
});
function closeOrderModal() {
  document.querySelector('.modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ===== DELIVERY TOGGLE =====
document.getElementById('deliveryMethod').addEventListener('change', function () {
  const addrGroup = document.getElementById('addressGroup');
  addrGroup.style.display = this.value === 'delivery' ? 'block' : 'none';
});

// ===== SEND ORDER (to Telegram via /api/send-order) =====
document.getElementById('orderForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('orderName').value.trim();
  const phone = document.getElementById('orderPhone').value.trim();
  const method = document.getElementById('deliveryMethod').value;
  const address = document.getElementById('orderAddress').value.trim();
  const notes = document.getElementById('orderNotes').value.trim();

  const drinkTotal = cart.filter(i => !i.isFood).reduce((sum, i) => sum + i.price * i.qty, 0);

  const submitBtn = this.querySelector('.submit-btn');
  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const response = await fetch('/api/send-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phone,
        method,
        address,
        notes,
        items: cart,
        drinkTotal,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Failed to send order');
    }

    closeOrderModal();
    cart = [];
    updateCartUI();
    this.reset();
    document.getElementById('addressGroup').style.display = 'none';
    document.querySelector('.success-overlay').classList.add('open');
  } catch (err) {
    console.error('Order send failed:', err);
    showToast('❌ Could not send order. Please try again or call us.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
});

// ===== SUCCESS CLOSE =====
document.querySelector('.success-close-btn').addEventListener('click', () => {
  document.querySelector('.success-overlay').classList.remove('open');
});

// ===== GALLERY LIGHTBOX =====
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox img');
document.querySelectorAll('.gallery-item img').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});
document.querySelector('.lightbox-close').addEventListener('click', () => {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
});
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ===== BACK TO TOP =====
document.querySelector('.back-to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  showToast('✅ Message sent! We\'ll be in touch soon.');
  this.reset();
});

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== INIT =====
updateCartUI();
