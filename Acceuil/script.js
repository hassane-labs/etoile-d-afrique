document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Ferme le menu mobile après un clic sur un lien
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('is-open'));
  });

 
  /* ---------- Panier ---------- */
  const cartCountEl = document.getElementById('cartCount');
  const toastEl = document.getElementById('toast');
  let cartCount = 0;
  let toastTimer = null;

  const showToast = (message) => {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  };

  document.querySelectorAll('[data-add]').forEach(button => {
    button.addEventListener('click', () => {
      const card = button.closest('.dish-card');
      const name = card ? card.dataset.name : 'Article';

      cartCount += 1;
      cartCountEl.textContent = cartCount;
      cartCountEl.style.transform = 'scale(1.3)';
      setTimeout(() => { cartCountEl.style.transform = 'scale(1)'; }, 180);

      showToast(`${name} ajouté au panier`);
    });
  });

  document.getElementById('cartBtn').addEventListener('click', () => {
    showToast(cartCount > 0 ? `Vous avez ${cartCount} article(s) dans le panier` : 'Votre panier est vide');
  });

  /*  En-tête no scroll */
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }, { passive: true });

});
