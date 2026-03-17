// ===== State =====
const WHATSAPP_NUMBER = "972505808069";
let products = [];
let cart = JSON.parse(localStorage.getItem("ofa-cart") || "[]");
let activeCategory = "הכל";
let searchTerm = "";
let sortMode = "default";

// ===== DOM refs =====
const catalogEl = document.getElementById("catalog");
const emptyCatalogEl = document.getElementById("emptyCatalog");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const cartItemsEl = document.getElementById("cartItems");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartFooterEl = document.getElementById("cartFooter");
const cartTotalEl = document.getElementById("cartTotal");
const cartBadgeEl = document.getElementById("cartBadge");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

// ===== Init =====
document.addEventListener("DOMContentLoaded", async () => {
  await loadProducts();
  renderCatalog();
  renderCart();
  bindEvents();
});

// ===== Load Products =====
async function loadProducts() {
  const res = await fetch("products.json");
  products = await res.json();
}

// ===== Catalog Rendering =====
function getFilteredProducts() {
  let filtered = products;

  // Category filter
  if (activeCategory !== "הכל") {
    filtered = filtered.filter((p) => p.category === activeCategory);
  }

  // Search filter
  if (searchTerm) {
    filtered = filtered.filter(
      (p) => p.name.includes(searchTerm) || p.description.includes(searchTerm),
    );
  }

  // Sort
  if (sortMode === "price-asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortMode === "price-desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  return filtered;
}

function renderCatalog() {
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    catalogEl.innerHTML = "";
    emptyCatalogEl.style.display = "block";
    return;
  }

  emptyCatalogEl.style.display = "none";

  catalogEl.innerHTML = filtered
    .map((product) => {
      const inCart = cart.find((item) => item.id === product.id);
      const btnText = inCart ? `✓ נוסף (${inCart.qty})` : "הוספה לסל";
      const btnClass = inCart ? "btn-add added" : "btn-add";

      return `
      <div class="product-card" data-id="${product.id}">
        <img class="card-image" src="${product.image}" alt="${product.name}">
        <div class="card-body">
          <span class="card-category">${product.category}</span>
          <h3 class="card-name">${product.name}</h3>
          <p class="card-description">${product.description}</p>
          <div class="card-footer">
            <span class="card-price">₪${product.price}</span>
            <button class="${btnClass}" data-id="${product.id}">${btnText}</button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// ===== Cart Logic =====
function saveCart() {
  localStorage.setItem("ofa-cart", JSON.stringify(cart));
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
    });
  }

  saveCart();
  renderCart();
  renderCatalog();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
  renderCatalog();
}

function updateQty(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  renderCart();
  renderCatalog();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  renderCatalog();
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return cart.reduce((count, item) => count + item.qty, 0);
}

// ===== Cart Rendering =====
function renderCart() {
  const count = getCartCount();
  const total = getCartTotal();

  // Badge
  cartBadgeEl.textContent = count;
  cartBadgeEl.classList.toggle("hidden", count === 0);

  // Empty / filled state
  const hasItems = cart.length > 0;
  cartEmptyEl.classList.toggle("hidden", hasItems);
  cartFooterEl.classList.toggle("hidden", !hasItems);

  if (!hasItems) {
    cartItemsEl.innerHTML = "";
    return;
  }

  // Items
  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item" data-id="${item.id}">
      <img class="cart-item-thumb" src="${item.image || "assets/placeholder.svg"}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₪${item.price} ליחידה</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
        <span class="cart-item-qty">${item.qty}</span>
        <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
      </div>
      <span class="cart-item-subtotal">₪${item.price * item.qty}</span>
      <button class="btn-remove" data-id="${item.id}" title="הסר">✕</button>
    </div>
  `,
    )
    .join("");

  // Total
  cartTotalEl.textContent = `₪${total}`;
}

// ===== Cart Sidebar Toggle =====
function openCart() {
  cartSidebar.classList.add("open");
  cartOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartSidebar.classList.remove("open");
  cartOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

// ===== WhatsApp Order =====
function sendWhatsAppOrder() {
  if (cart.length === 0) return;

  const total = getCartTotal();

  let message = `הזמנה חדשה מאופה אופה 🍰\n`;
  message += `─────────────\n`;

  cart.forEach((item) => {
    message += `• ${item.name} x${item.qty} — ₪${item.price * item.qty}\n`;
  });

  message += `─────────────\n`;
  message += `סה״כ: ₪${total}\n`;

  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
}

// ===== Event Bindings =====
function bindEvents() {
  // Add to cart — event delegation on catalog
  catalogEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    addToCart(id);
  });

  // Cart sidebar — event delegation
  cartItemsEl.addEventListener("click", (e) => {
    const target = e.target.closest("[data-id]");
    if (!target) return;
    const id = Number(target.dataset.id);

    if (target.classList.contains("btn-remove")) {
      removeFromCart(id);
    } else if (target.dataset.action === "increase") {
      updateQty(id, 1);
    } else if (target.dataset.action === "decrease") {
      updateQty(id, -1);
    }
  });

  // Cart toggle
  document.getElementById("cartToggleBtn").addEventListener("click", openCart);
  document.getElementById("cartCloseBtn").addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // WhatsApp send
  document
    .getElementById("sendOrderBtn")
    .addEventListener("click", sendWhatsAppOrder);

  // Clear cart
  document.getElementById("clearCartBtn").addEventListener("click", () => {
    if (confirm("למחוק את כל ההזמנה?")) {
      clearCart();
    }
  });

  // Category filters
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.category;
      renderCatalog();
    });
  });

  // Search
  searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value.trim();
    renderCatalog();
  });

  // Sort
  sortSelect.addEventListener("change", (e) => {
    sortMode = e.target.value;
    renderCatalog();
  });
}
