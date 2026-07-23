document.addEventListener('DOMContentLoaded', () => {

  const tablesStock = {
    terrasse: { 
      name: 'Terrasse (2 pers)', 
      maxCapacity: 2, 
      total: 4, 
      available: 4, 
      elementId: 'status-terrasse' 
    },
    interieur2: { 
      name: 'Intérieur (2 pers)', 
      maxCapacity: 2, 
      total: 6, 
      available: 6, 
      elementId: 'status-interieur-2' 
    },
    interieur4: { 
      name: 'Intérieur (4 pers)', 
      maxCapacity: 4, 
      total: 5, 
      available: 5, 
      elementId: 'status-interieur-4' 
    },
    prive: { 
      name: 'Espace Privé (2 pers)', 
      maxCapacity: 2, 
      total: 5, 
      available: 5, 
      elementId: 'status-prive' 
    }
  };

  // Mettre à jour l'affichage des tables restantes dans l'interface
  function updateAvailabilityUI() {
    for (const key in tablesStock) {
      const space = tablesStock[key];
      const card = document.getElementById(space.elementId);
      if (card) {
        const countElem = card.querySelector('.count');
        if (countElem) countElem.textContent = space.available;
        card.style.opacity = space.available === 0 ? '0.5' : '1';
      }
    }
  }


  const dateInput = document.getElementById('date');
  const heureSelect = document.getElementById('heure');

  if (dateInput && heureSelect) {
    // Bloquer les dates passées
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // Écouter le changement de date
    dateInput.addEventListener('change', (e) => {
      if (!e.target.value) return;

      const selectedDate = new Date(e.target.value);
      const dayOfWeek = selectedDate.getDay(); // 0 = Dimanche, 6 = Samedi, 1-5 = Lundi-Vendredi

      let startHour = 9;
      let endHour = 22;

      // Définition des plages selon le jour
      if (dayOfWeek === 0) { 
        startHour = 12;
        endHour = 21;
      } else if (dayOfWeek === 6) { 
        startHour = 10;
        endHour = 23;
      } else { 
        startHour = 9;
        endHour = 22;
      }

      generateTimeOptions(startHour, endHour);
    });
  }

  // Générateur de créneaux horaires 
  function generateTimeOptions(start, end) {
    heureSelect.innerHTML = '<option value="">Choisir une heure</option>';
    
    // Dernier créneau 1h avant la fermeture
    const lastBookingHour = end - 1; 

    for (let hour = start; hour <= lastBookingHour; hour++) {
      const hStr = hour < 10 ? `0${hour}` : `${hour}`;

      // Heure pile
      const opt1 = document.createElement('option');
      opt1.value = `${hStr}:00`;
      opt1.textContent = `${hStr}:00`;
      heureSelect.appendChild(opt1);

      // Demi-heure
      const opt2 = document.createElement('option');
      opt2.value = `${hStr}:30`;
      opt2.textContent = `${hStr}:30`;
      heureSelect.appendChild(opt2);
    }
  }


  const minusBtn = document.getElementById('minus');
  const plusBtn = document.getElementById('plus');
  const countSpan = document.getElementById('count');
  let count = 1;

  if (minusBtn && plusBtn && countSpan) {
    minusBtn.addEventListener('click', () => {
      if (count > 1) {
        count--;
        countSpan.textContent = count;
      }
    });

    plusBtn.addEventListener('click', () => {
      if (count < 4) {
        count++;
        countSpan.textContent = count;
      } else {
        alert("Pour les groupes de plus de 4 personnes, merci de réaliser une seconde réservation.");
      }
    });
  }


  const form = document.getElementById('reservationForm');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nbPersonnes = parseInt(countSpan.textContent, 10);
      const espaceRadio = form.querySelector('input[name="espace"]:checked');
      
      if (!espaceRadio) {
        alert("Veuillez choisir un espace.");
        return;
      }

      const espaceChoisi = espaceRadio.value;
      let targetKey = null;

      // Attribution de la table selon le nombre de personnes et la zone
      if (espaceChoisi === 'terrasse') {
        if (nbPersonnes <= 2) targetKey = 'terrasse';
      } else if (espaceChoisi === 'prive') {
        if (nbPersonnes <= 2) targetKey = 'prive';
      } else if (espaceChoisi === 'interieur') {
        if (nbPersonnes <= 2) {
          // Priorité aux tables de 2, puis de 4 si plus de table de 2
          targetKey = tablesStock.interieur2.available > 0 ? 'interieur2' : 'interieur4';
        } else if (nbPersonnes <= 4) {
          targetKey = 'interieur4';
        }
      }

      // Vérification du stock
      if (!targetKey || tablesStock[targetKey].available <= 0) {
        alert(`Désolé, nous n'avons plus de table disponible en zone "${espaceChoisi}" pour ${nbPersonnes} personne(s).`);
        return;
      }

      // Validation et décompte
      tablesStock[targetKey].available--;
      updateAvailabilityUI();

      const nom = document.getElementById('nom').value;
      const date = document.getElementById('date').value;
      const heure = document.getElementById('heure').value;

      alert(`Réservation confirmée au nom de ${nom} !\nDate : ${date} à ${heure}\nTable : ${tablesStock[targetKey].name}`);

      // Réinitialisation
      form.reset();
      count = 1;
      countSpan.textContent = count;
      heureSelect.innerHTML = '<option value="">Choisir d\'abord une date</option>';
    });
  }


  const btnOrder = document.querySelector('.btn-order');
  const cartBadge = document.querySelector('.nav-actions a span');

  if (btnOrder && cartBadge) {
    btnOrder.addEventListener('click', () => {
      let currentItems = parseInt(cartBadge.textContent, 10) || 0;
      cartBadge.textContent = currentItems + 1;
    });
  }

  // Initialisation au chargement de la page
  updateAvailabilityUI();
});
