(function () {
  "use strict";

  const grid = document.getElementById("menu-grid");
  const pillsWrap = document.getElementById("filter-pills");
  const searchInput = document.getElementById("search-input");
  const resultsCount = document.getElementById("results-count");
  const emptyState = document.getElementById("empty-state");
  const cartBadge = document.getElementById("cart-badge");
  const floatingCartBadge = document.getElementById("floating-cart-badge");

  let state = {
    items: [],
    categories: [],
    activeCategory: "tout",
    query: "",
    cartCount: 0,
    favorites: new Set(),
    cart: new Set(),
  };

  function money(n) {
    return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " FCFA";
  }

  function stars(rating) {
    const full = "★".repeat(rating);
    const empty = "☆".repeat(5 - rating);
    return full + empty;
  }

  window.afficherConfirmation = function() {
    if (state.cartCount === 0) {
      alert("Votre panier est vide. Ajoute des plats avant de commander.");
      return;
    }

    alert("✓ Votre commande a été passée !\n\nNombre d'articles : " + state.cartCount + "\n\nMerci pour votre confiance ! ");

    state.cart.clear();
    state.cartCount = 0;
    updateCartBadge();
    renderGrid();
  };



  function renderPills() {
    pillsWrap.innerHTML = "";
    state.categories.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "pill";
      btn.textContent = cat.label;
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", String(cat.id === state.activeCategory));
      btn.addEventListener("click", () => {
        state.activeCategory = cat.id;
        renderPills();
        renderGrid();
      });
      pillsWrap.appendChild(btn);
    });
  }

  function getFilteredItems() {
    const q = state.query.trim().toLowerCase();
    return state.items.filter((item) => {
      const matchesCategory = state.activeCategory === "tout" || item.category === state.activeCategory;
      const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }

  function renderGrid() {
    const items = getFilteredItems();
    grid.innerHTML = "";

    resultsCount.textContent = items.length + (items.length === 1 ? " plat trouvé" : " plats trouvés");
    emptyState.hidden = items.length !== 0;

    items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card";

      const isFav = state.favorites.has(item.id);
      const inCart = state.cart.has(item.id);

      card.innerHTML = `
        <div class="card-media">
          ${item.tag ? `<span class="tag-chip">${item.tag}</span>` : ""}
          <button class="fav-btn${isFav ? " active" : ""}" aria-label="Ajouter aux favoris" data-id="${item.id}" title="${isFav ? "Retirer des favoris" : "Ajouter aux favoris"}">
            ${isFav ? "♥" : "♡"}
          </button>
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="card-body">
          <h3>${item.name}</h3>
          <p class="card-desc">${item.description}</p>
          <div class="card-meta">
            <span class="price">${money(item.price)}</span>
            <span class="stars" aria-label="${item.rating} sur 5 étoiles">${stars(item.rating)}</span>
          </div>
          <button class="add-btn${inCart ? " added" : ""}" data-id="${item.id}" title="${inCart ? "Déjà dans le panier" : "Ajouter au panier"}">
            ${inCart ? "Ajouté ✓" : "Ajouter au panier"}
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Event listeners
    grid.querySelectorAll(".fav-btn").forEach((btn) => {
      btn.addEventListener("click", () => toggleFavorite(btn.dataset.id));
    });
    grid.querySelectorAll(".add-btn").forEach((btn) => {
      btn.addEventListener("click", () => addToCart(btn.dataset.id));
    });
  }

  function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);

    // Si on retire un favori :
    let favoriteDishes = parseInt(localStorage.getItem('favoriteDishes')) || 0;
    if (favoriteDishes > 0) {
      localStorage.setItem('favoriteDishes', favoriteDishes - 1);
    }
  } else {
    state.favorites.add(id);

    // ---> RAJOUTE CES 3 LIGNES DANS LE ELSE <---
    let favoriteDishes = parseInt(localStorage.getItem('favoriteDishes')) || 0;
    favoriteDishes++;
    localStorage.setItem('favoriteDishes', favoriteDishes);
  }
  renderGrid();
}

  function addToCart(id) {
  if (state.cart.has(id)) return;
  state.cart.add(id);
  state.cartCount += 1;

  // ---> RAJOUTE CES LIGNES POUR LE DASHBOARD <---
  let totalOrders = parseInt(localStorage.getItem('totalOrders')) || 0;
  let pendingOrders = parseInt(localStorage.getItem('pendingOrders')) || 0;

  totalOrders++;
  pendingOrders++;

  localStorage.setItem('totalOrders', totalOrders);
  localStorage.setItem('pendingOrders', pendingOrders);

  updateCartBadge();
  renderGrid();
}

  function updateCartBadge() {
    cartBadge.textContent = state.cartCount;
    floatingCartBadge.textContent = state.cartCount;
  }

  function bindToolbar() {
    searchInput.addEventListener("input", (e) => {
      state.query = e.target.value;
      renderGrid();
    });
  }


  async function init() {
    try {
      const res = await fetch("data/menu.json");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      state.items = data.items;
      state.categories = data.categories;
    } catch (err) {
      console.error("Erreur de chargement du menu :", err);
      grid.innerHTML = `<p class="empty-state">Impossible de charger le menu. Assurez-vous que menu.json existe et que vous lancez le site via un serveur local.</p>`;
      return;
    }

    renderPills();
    bindToolbar();
    renderGrid();
    updateCartBadge();
  }

  init();
})();
