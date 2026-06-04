const menuItems = [
  { id: 1, name: 'Margherita Pizza', category: 'pizza', price: 249, rating: 4.5 },
  { id: 2, name: 'Farmhouse Pizza', category: 'pizza', price: 349, rating: 4.7 },
  { id: 3, name: 'Cheese Burger', category: 'burger', price: 189, rating: 4.4 },
  { id: 4, name: 'Paneer Wrap', category: 'indian', price: 179, rating: 4.3 },
  { id: 5, name: 'Butter Chicken', category: 'indian', price: 329, rating: 4.8 },
  { id: 6, name: 'Chocolate Brownie', category: 'dessert', price: 139, rating: 4.6 },
  { id: 7, name: 'Cold Coffee', category: 'drink', price: 119, rating: 4.2 },
  { id: 8, name: 'Mango Shake', category: 'drink', price: 129, rating: 4.1 }
];

const cart = new Map();

const menuGrid = document.getElementById('menuGrid');
const cartItems = document.getElementById('cartItems');
const emptyCart = document.getElementById('emptyCart');
const subtotalEl = document.getElementById('subtotal');
const deliveryEl = document.getElementById('delivery');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const etaEl = document.getElementById('eta');
const orderStatusEl = document.getElementById('orderStatus');
const trackerFill = document.getElementById('trackerFill');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const checkoutBtn = document.getElementById('checkoutBtn');

function currency(value) {
  return `₹${value.toFixed(0)}`;
}

function renderMenu() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery = item.name.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  menuGrid.innerHTML = filtered
    .map(
      (item) => `
      <article class="food-card">
        <h3>${item.name}</h3>
        <p>Category: ${item.category}</p>
        <p>Rating: ⭐ ${item.rating}</p>
        <div class="price-row">
          <strong>${currency(item.price)}</strong>
          <button class="btn secondary" data-id="${item.id}">Add</button>
        </div>
      </article>
    `
    )
    .join('');
}

function addToCart(id) {
  const existing = cart.get(id);
  if (existing) {
    existing.qty += 1;
  } else {
    const item = menuItems.find((food) => food.id === id);
    cart.set(id, { ...item, qty: 1 });
  }
  renderCart();
}

function updateQuantity(id, delta) {
  const item = cart.get(id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart.delete(id);
  }
  renderCart();
}

function renderCart() {
  const items = [...cart.values()];
  emptyCart.style.display = items.length ? 'none' : 'block';

  cartItems.innerHTML = items
    .map(
      (item) => `
      <article class="cart-item">
        <div>
          <h4>${item.name}</h4>
          <p class="small muted">${currency(item.price)} each</p>
        </div>
        <div>
          <div class="qty-controls">
            <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
          </div>
          <p><strong>${currency(item.price * item.qty)}</strong></p>
        </div>
      </article>
    `
    )
    .join('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal > 0 ? (subtotal > 499 ? 0 : 40) : 0;
  const tax = subtotal * 0.05;
  const total = subtotal + delivery + tax;

  subtotalEl.textContent = currency(subtotal);
  deliveryEl.textContent = currency(delivery);
  taxEl.textContent = currency(tax);
  totalEl.textContent = currency(total);

  checkoutBtn.disabled = items.length === 0;
}

function startTracking() {
  const stages = [
    { text: 'Order placed successfully!', progress: 25 },
    { text: 'Food is being prepared.', progress: 50 },
    { text: 'Order is out for delivery.', progress: 75 },
    { text: 'Order delivered. Enjoy your meal!', progress: 100 }
  ];

  let i = 0;
  orderStatusEl.textContent = stages[i].text;
  trackerFill.style.width = `${stages[i].progress}%`;

  const interval = setInterval(() => {
    i += 1;
    if (i >= stages.length) {
      clearInterval(interval);
      cart.clear();
      renderCart();
      return;
    }
    orderStatusEl.textContent = stages[i].text;
    trackerFill.style.width = `${stages[i].progress}%`;
  }, 2500);
}

menuGrid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  addToCart(Number(button.dataset.id));
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  updateQuantity(id, action === 'increase' ? 1 : -1);
});

searchInput.addEventListener('input', renderMenu);
categoryFilter.addEventListener('change', renderMenu);

checkoutBtn.addEventListener('click', () => {
  const now = new Date();
  const eta = new Date(now.getTime() + 35 * 60000);
  etaEl.textContent = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  startTracking();
});

renderMenu();
renderCart();
