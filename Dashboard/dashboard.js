// ===== script.js — Comportements généraux du dashboard =====
alert("le script est change!");
document.addEventListener('DOMContentLoaded', () => {

  // ---------- 1. Réservation : Modifier / Annuler ----------
  const btnModifier = document.getElementById('btn-modifier');
  const btnAnnuler = document.getElementById('btn-annuler');

  if (btnModifier) {
    btnModifier.addEventListener('click', () => {
      // Rend chaque valeur (les <dd>) de la réservation éditable
      const valeurs = document.querySelectorAll('.reservation-list__row dd');
      valeurs.forEach(dd => {
        dd.contentEditable = true;
        dd.classList.add('editing');
        dd.style.outline = '1px dashed var(--color-primary, #b5622e)';
      });
      alert('Vous pouvez maintenant modifier votre réservation. Cliquez ailleurs pour valider.');
    });
  }

  if (btnAnnuler) {
    btnAnnuler.addEventListener('click', () => {
      const confirmation = confirm('Voulez-vous vraiment annuler cette réservation ?');
      if (confirmation) {
        // Le <dd> "Statut" est le 3e dd de la liste (Nombre de personnes, Espace réservé, Statut)
        const lignes = document.querySelectorAll('.reservation-list__row');
        lignes.forEach(ligne => {
          const label = ligne.querySelector('dt')?.textContent.trim();
          if (label === 'Statut') {
            ligne.querySelector('dd').textContent = 'Annulée';
          }
        });
        alert('Réservation annulée.');
      }
    });
  }

  // ---------- 2 & 3. Cartes plats : Commander à nouveau / Découvrir ----------
  document.body.addEventListener('click', (e) => {
    const carte = e.target.closest('.dish-card');
    if (carte && e.target.matches('.btn')) {
      const nomPlat = carte.querySelector('.dish-card__name')?.textContent.trim() || 'ce plat';
      const texteBouton = e.target.textContent.trim();

      if (texteBouton === 'Commander à nouveau') {
        alert(`Commande envoyée pour : ${nomPlat}`);
        // Ici tu pourrais plus tard faire un fetch() vers un serveur pour enregistrer la commande
      }

      if (texteBouton === 'Découvrir') {
        alert(`Découverte de : ${nomPlat}`);
        // Ici tu pourrais rediriger vers une page détail du plat
      }
    }

    // ---------- 4. Commandes récentes : Voir ----------
    if (e.target.matches('.btn--voir')) {
      const numero = e.target.dataset.order;
      const ligne = e.target.closest('tr');
      if (ligne) {
        const cellules = ligne.querySelectorAll('td');
        const articles = cellules[2]?.textContent.trim();
        const montant = cellules[3]?.textContent.trim();
        const statut = ligne.querySelector('.badge')?.textContent.trim();
        alert(
          `Commande n°${numero}\nArticles : ${articles}\nMontant : ${montant}\nStatut : ${statut}`
        );
      }
    }
  });

});
