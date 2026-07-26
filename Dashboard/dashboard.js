alert('Le fichier js est bien chargé');
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
  if (totalOrdersElem) {
    totalOrdersElem.textContent = totalOrders;
  }
  
  if (pendingOrdersElem) {
    pendingOrdersElem.textContent = pendingOrders;
  }
  
  if (totalReservationsElem) {
    totalReservationsElem.textContent = totalReservations;
  }
  
  if (favoriteDishesElem) {
    favoriteDishesElem.textContent = favoriteDishes;
  }

});
