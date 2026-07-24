const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
form.addEventListener("submit", function(event) {
    event.preventDefault();
    const nom = document.getElementById("nom").value.trim();
    const email = document.getElementById("email").value.trim() ;
    const message = document.getElementById("message").value.trim();
    if (nom === "" || email === "" || message === "") {
        status.textContent = "Veuillez remplir tous les champs obligatoires";
        status.style.color = "red";
        return;
    }
    status.textContent = " ✅Votre message a bien été envoyé. Nous vous répondrons rapidement.";
   status.style.color="#2e7d32";
    form.reset();
});
setTimeout(() => {
    status.textContent = "";
},5000);

const btnCommander = document.getElementById('btn-commander');
const cartCount = document.getElementById('cart-count');

let compteur = 0;

btnCommander.addEventListener('click', () => {
  compteur++;
  cartCount.textContent = compteur; 
});
