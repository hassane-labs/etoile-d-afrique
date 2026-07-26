/* 
   ÉTOILE D'AFRIQUE — Tableau de bord client
   script.js — recherche, filtres, favoris, modals, tri
    */

(function () {
  "use strict";

  /** État global de l'application, alimenté par data.json */
  let state = {
    utilisateur: null,
    statistiques: null,
    commandesRecentes: [],
    prochaineReservation: null,
    platsFavoris: [],
    recommandations: [],
    sort: { key: null, dir: 1 },
    searchTerm: ""
  };

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* 
     CHARGEMENT DES DONNÉES
      */
  async function loadData() {
    try {
      const res = await fetch("data.json");
      if (!res.ok) throw new Error("Réponse réseau invalide");
      const data = await res.json();
      state.utilisateur = data.utilisateur;
      state.statistiques = data.statistiques;
      state.commandesRecentes = data.commandesRecentes;
      state.prochaineReservation = data.prochaineReservation;
      state.platsFavoris = data.platsFavoris;
      state.recommandations = data.recommandations;
      renderAll();
    } catch (err) {
      console.warn("Impossible de charger data.json :", err);
      renderLoadError();
    }
  }

  function renderLoadError() {
    const tbody = $("#orders-tbody");
    if (tbody) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="empty-state">Impossible de charger les données (data.json). Lancez le site via un serveur local : <code>python3 -m http.server 8000</code></td></tr>';
    }
  }

  /* 
     RENDU GÉNÉRAL
      */
  function renderAll() {
    renderUser();
    renderStats();
    renderOrders();
    renderReservation();
    renderFavorites();
    renderRecommendations();
  }

  function renderUser() {
    if (!state.utilisateur) return;
    $("#user-name").textContent = state.utilisateur.nom;
    $("#profile-name").textContent = state.utilisateur.nom;
    $$(".user-btn__avatar, .profile-block__avatar").forEach((img) => {
      img.src = state.utilisateur.avatar;
      img.alt = "Photo de profil de " + state.utilisateur.nom;
    });
  }

  function renderStats() {
    const s = state.statistiques;
    if (!s) return;
    $("#stat-total").textContent = s.commandesTotales;
    $("#stat-cours").textContent = s.commandesEnCours;
    $("#stat-reservations").textContent = s.reservations;
    $("#stat-favoris").textContent = state.platsFavoris.filter((p) => p.favori).length;
  }

  function formatMontant(v) {
    return v.toFixed(2).replace(".", ",") + " FCFA";
  }

  function statutClass(statut) {
    return (
      { preparation: "statut-badge--preparation", livraison: "statut-badge--livraison", terminee: "statut-badge--terminee" }[
        statut
      ] || ""
    );
  }

  /* 
     COMMANDES — tableau, tri, recherche
      */
  function getFilteredSortedOrders() {
    let list = state.commandesRecentes.slice();
    const term = state.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (o) => o.numero.toLowerCase().includes(term) || o.articles.toLowerCase().includes(term)
      );
    }
    if (state.sort.key) {
      const key = state.sort.key;
      list.sort((a, b) => {
        let av = a[key];
        let bv = b[key];
        if (key === "date") {
          av = new Date(a.date).getTime();
          bv = new Date(b.date).getTime();
        }
        if (key === "statut") {
          av = a.statutLabel;
          bv = b.statutLabel;
        }
        if (av < bv) return -1 * state.sort.dir;
        if (av > bv) return 1 * state.sort.dir;
        return 0;
      });
    }
    return list;
  }

  function orderRowHTML(o) {
    return `
      <tr data-numero="${o.numero}">
        <td>${o.numero}</td>
        <td>${o.dateAffichee}</td>
        <td>${o.articles}</td>
        <td>${formatMontant(o.montant)}</td>
        <td><span class="statut-badge ${statutClass(o.statut)}">${o.statutLabel}</span></td>
        <td><button class="btn-voir" type="button" data-voir="${o.numero}">Voir</button></td>
      </tr>`;
  }

  function renderOrders() {
    const list = getFilteredSortedOrders();
    const tbody = $("#orders-tbody");
    const tbodyFull = $("#orders-tbody-full");
    const empty = $("#orders-empty");

    const html = list.map(orderRowHTML).join("");
    if (tbody) tbody.innerHTML = html;
    if (tbodyFull) tbodyFull.innerHTML = html || "";

    if (empty) empty.hidden = list.length !== 0;

    // (Re)attacher les écouteurs "Voir"
    $$("[data-voir]").forEach((btn) => {
      btn.addEventListener("click", () => openOrderModal(btn.dataset.voir));
    });
  }

  function openOrderModal(numero) {
    const o = state.commandesRecentes.find((c) => c.numero === numero);
    if (!o) return;
    $("#modal-title").textContent = "Commande n°" + o.numero;
    $("#modal-body").innerHTML = `
      <dl>
        <dt>Date</dt><dd>${o.dateAffichee}</dd>
        <dt>Articles</dt><dd>${o.articles}</dd>
        <dt>Montant</dt><dd>${formatMontant(o.montant)}</dd>
        <dt>Statut</dt><dd><span class="statut-badge ${statutClass(o.statut)}">${o.statutLabel}</span></dd>
      </dl>`;
    openModal("#modal-overlay");
  }

  function setupSorting() {
    $$(".th-sort").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.sort;
        if (state.sort.key === key) {
          state.sort.dir *= -1;
        } else {
          state.sort.key = key;
          state.sort.dir = 1;
        }
        $$(".th-sort").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        renderOrders();
      });
    });
  }

  /* 
     RÉSERVATION
      */
  function reservationHTML(r) {
    return `
      <dt>Date</dt><dd>${r.dateAffichee}</dd>
      <dt>Heure</dt><dd>${r.heure}</dd>
      <dt>Nombre de personnes</dt><dd>${r.personnes}</dd>
      <dt>Espace réservé</dt><dd>${r.espace}</dd>
      <dt>Statut</dt><dd>${r.statut}</dd>`;
  }

  function renderReservation() {
    const r = state.prochaineReservation;
    if (!r) return;
    const html = reservationHTML(r);
    const el1 = $("#reservation-info");
    const el2 = $("#reservation-info-full");
    if (el1) el1.innerHTML = html;
    if (el2) el2.innerHTML = html;
  }

  /* 
     PLATS FAVORIS / RECOMMANDATIONS
      */
  function dishCardHTML(dish, mode) {
    const isFav = mode === "favori";
    const heartActive = isFav && dish.favori;
    return `
      <article class="dish-card" data-id="${dish.id}">
        <div class="dish-card__media">
          <img src="${dish.image}" alt="${dish.nom}" loading="lazy">
          <button class="dish-card__fav" type="button" data-fav-toggle="${dish.id}"
            data-active="${heartActive}" aria-pressed="${heartActive}"
            aria-label="${heartActive ? "Retirer des favoris" : "Ajouter aux favoris"}">
            <svg aria-hidden="true"><use href="#icon-heart"/></svg>
          </button>
        </div>
        <div class="dish-card__body">
          <p class="dish-card__name">${dish.nom}</p>
          ${dish.prix != null ? `<p class="dish-card__price">${formatMontant(dish.prix)}</p>` : ""}
          <span class="dish-card__stars" aria-hidden="true">
            ${"".padStart(5, "★").split("").map(() => '<svg><use href="#icon-star"/></svg>').join("")}
          </span>
          <button class="dish-card__action" type="button" data-order="${dish.id}">
            ${isFav ? "Commander à nouveau" : "Découvrir"}
          </button>
        </div>
      </article>`;
  }

  function renderFavorites() {
    const html = state.platsFavoris.map((d) => dishCardHTML(d, "favori")).join("");
    const row1 = $("#favorites-row");
    const row2 = $("#favorites-row-full");
    if (row1) row1.innerHTML = html;
    if (row2) row2.innerHTML = html;
    attachDishListeners();
    renderStats();
  }

  function renderRecommendations() {
    const html = state.recommandations.map((d) => dishCardHTML(d, "reco")).join("");
    const row = $("#recommendations-row");
    if (row) row.innerHTML = html;
    attachDishListeners();
  }

  function attachDishListeners() {
    $$("[data-fav-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => toggleFavorite(btn.dataset.favToggle));
    });
    $$("[data-order]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dish =
          state.platsFavoris.find((d) => d.id === btn.dataset.order) ||
          state.recommandations.find((d) => d.id === btn.dataset.order);
        showToast(
          dish ? `« ${dish.nom} » a été ajouté à votre commande.` : "Action effectuée."
        );
      });
    });
  }

  function toggleFavorite(id) {
    const dish = state.platsFavoris.find((d) => d.id === id);
    if (dish) {
      dish.favori = !dish.favori;
      renderFavorites();
      showToast(dish.favori ? `« ${dish.nom} » ajouté aux favoris.` : `« ${dish.nom} » retiré des favoris.`);
    }
  }

  /* 
     RECHERCHE
      */
  function setupSearch() {
    const input = $("#search-input");
    if (!input) return;
    input.addEventListener("input", () => {
      state.searchTerm = input.value;
      renderOrders();
    });
  }

  /* 
     NAVIGATION LATÉRALE (sections)
      */
  const sectionTitles = {
    dashboard: "Tableau de bord",
    commandes: "Mes commandes",
    reservations: "Mes réservations",
    favoris: "Mes favoris",
    profil: "Mon profil",
    parametres: "Paramètres",
    deconnexion: "Déconnexion"
  };

  function goToSection(section) {
    $$(".nav__item").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.section === section));
    $$(".view").forEach((view) => view.classList.toggle("is-active", view.id === "view-" + section));
    $("#page-title").textContent = sectionTitles[section] || "Tableau de bord";
    closeAllPopovers();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setupNav() {
    $$(".nav__item").forEach((btn) => {
      btn.addEventListener("click", () => goToSection(btn.dataset.section));
    });
    $$("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => goToSection(btn.dataset.goto));
    });
    const relogin = $("#btn-relogin");
    if (relogin) relogin.addEventListener("click", () => goToSection("dashboard"));
  }

  /* 
     POPOVERS (notifications / utilisateur)
      */
  function closeAllPopovers() {
    $$(".popover").forEach((p) => (p.hidden = true));
    $$(".popover-wrap button[aria-expanded]").forEach((b) => b.setAttribute("aria-expanded", "false"));
  }

  function setupPopovers() {
    const pairs = [
      ["#notif-btn", "#notif-popover"],
      ["#user-btn", "#user-popover"]
    ];
    pairs.forEach(([btnSel, popSel]) => {
      const btn = $(btnSel);
      const pop = $(popSel);
      if (!btn || !pop) return;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const willOpen = pop.hidden;
        closeAllPopovers();
        pop.hidden = !willOpen;
        btn.setAttribute("aria-expanded", String(willOpen));
      });
    });
    document.addEventListener("click", closeAllPopovers);

    const notifClear = $("#notif-clear");
    if (notifClear) {
      notifClear.addEventListener("click", () => {
        $("#notif-badge").hidden = true;
        $("#notif-popover").hidden = true;
        showToast("Notifications marquées comme lues.");
      });
    }
  }

  /* 
     MODALS
      */
  function openModal(sel) {
    const overlay = $(sel);
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal(sel) {
    const overlay = $(sel);
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  function setupModals() {
    $("#modal-close").addEventListener("click", () => closeModal("#modal-overlay"));
    $("#modal-overlay").addEventListener("click", (e) => {
      if (e.target.id === "modal-overlay") closeModal("#modal-overlay");
    });

    $("#confirm-close").addEventListener("click", () => closeModal("#confirm-overlay"));
    $("#confirm-overlay").addEventListener("click", (e) => {
      if (e.target.id === "confirm-overlay") closeModal("#confirm-overlay");
    });
    $("#confirm-cancel").addEventListener("click", () => closeModal("#confirm-overlay"));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal("#modal-overlay");
        closeModal("#confirm-overlay");
      }
    });

    // Boutons Modifier / Annuler réservation (tableau de bord + section dédiée)
    let pendingAction = null;

    function askConfirm(title, text, actionLabel, onConfirm) {
      $("#confirm-title").textContent = title;
      $("#confirm-text").textContent = text;
      $("#confirm-ok").textContent = actionLabel;
      pendingAction = onConfirm;
      openModal("#confirm-overlay");
    }

    $("#confirm-ok").addEventListener("click", () => {
      if (pendingAction) pendingAction();
      closeModal("#confirm-overlay");
    });

    const modifierBtns = ["#btn-modifier-resa", '[data-action="modifier-resa"]'];
    const annulerBtns = ["#btn-annuler-resa", '[data-action="annuler-resa"]'];

    $$(modifierBtns.join(",")).forEach((btn) => {
      btn.addEventListener("click", () => {
        askConfirm(
          "Modifier la réservation",
          "Un conseiller vous recontactera pour ajuster la date, l'heure ou le nombre de personnes de votre réservation.",
          "Confirmer",
          () => showToast("Demande de modification envoyée.")
        );
      });
    });

    $$(annulerBtns.join(",")).forEach((btn) => {
      btn.addEventListener("click", () => {
        askConfirm(
          "Annuler la réservation",
          "Voulez-vous vraiment annuler votre réservation du " +
            (state.prochaineReservation ? state.prochaineReservation.dateAffichee : "") +
            " à " +
            (state.prochaineReservation ? state.prochaineReservation.heure : "") +
            " ?",
          "Annuler la réservation",
          () => showToast("Votre réservation a été annulée.")
        );
      });
    });
  }

  /* 
     TOAST
      */
  let toastTimer = null;
  function showToast(message) {
    const toast = $("#toast");
    const text = $("#toast-text");
    if (!toast || !text) return;
    text.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.hidden = true), 3200);
  }

  /* 
     INIT
      */
  document.addEventListener("DOMContentLoaded", () => {
    setupNav();
    setupPopovers();
    setupModals();
    setupSearch();
    setupSorting();
    loadData();
  });
})();
