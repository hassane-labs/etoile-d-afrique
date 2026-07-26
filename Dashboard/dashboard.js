alert("le js est change!");
document.addEventListener('DOMContentLoaded', () => {

  // 1. Récupération des éléments HTML par leurs ID
  const totalOrdersElem = document.getElementById('total-orders');
  const pendingOrdersElem = document.getElementById('pending-orders');
  const totalReservationsElem = document.getElementById('total-reservations');
  const favoriteDishesElem = document.getElementById('favorite-dishes');

  // 2. Lecture des valeurs sauvegardées dans le localStorage (0 par défaut)
  const totalOrders = localStorage.getItem('totalOrders') || 0;
  const pendingOrders = localStorage.getItem('pendingOrders') || 0;
  const totalReservations = localStorage.getItem('totalReservations') || 0;
  const favoriteDishes = localStorage.getItem('favoriteDishes') || 0;

  // 3. Injection des valeurs dans les cartes
  if (totalOrdersElem) totalOrdersElem.textContent = totalOrders;
  if (pendingOrdersElem) pendingOrdersElem.textContent = pendingOrders;
  if (totalReservationsElem) totalReservationsElem.textContent = totalReservations;
  if (favoriteDishesElem) favoriteDishesElem.textContent = favoriteDishes;

  // 4. Bouton "Voir" (commandes)
  document.querySelectorAll('.btn--voir').forEach(button => {
    button.addEventListener('click', () => {
      const orderId = button.getAttribute('data-order');
      alert('Commande sélectionnée : ' + orderId);
    });
  });

  // 5. Bouton "Découvrir" (plats recommandés)
  document.querySelectorAll('.btn--ghost').forEach(button => {
    button.addEventListener('click', () => {
      alert('Vous découvrez ce plat. Cliquez ailleurs pour continuer.');
    });
  });

  // 6. Bouton "Modifier" (réservation)
  const modifierBtn = document.getElementById('btn-modifier');
  if (modifierBtn) {
    modifierBtn.addEventListener('click', () => {
      alert('Vous pouvez maintenant modifier votre réservation. Cliquez ailleurs pour valider.');
    });
  }

  // 7. Bouton "Annuler" (réservation)
  const annulerBtn = document.getElementById('btn-annuler');
  if (annulerBtn) {
    annulerBtn.addEventListener('click', () => {
      alert('Votre réservation a été annulée.');
    });
  }

});

 
