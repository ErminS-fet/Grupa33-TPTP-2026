/* ============================================================
 DARK / LIGHT MOD
===============================================================
 Kako radi:
   - Čitamo iz localStorage da li je korisnik ranije odabrao mod
   - Na klik dugmeta toggle-ujemo CSS klasu "light-mode" na body
   - CSS varijable u tptpstil.css se automatski mijenjaju
   - Koristimo localStorage.setItem da zapamtimo odabir korisnika
NAPOMENA O KORIŠTENJU AI-a:
   Logiku za Dark/Light mod i scroll na vrh sam razumio i
   implementirao uz pomoć Claude asistenta koji mi je objasnio
   kako classList.toggle radi i zašto koristimo localStorage.
 ============================================================ */

 (function inicijalizujMod() {
  const sacuvaniMod = localStorage.getItem("pumpabon-mod");
 
  if (sacuvaniMod === "light") {
    document.body.classList.add("light-mode");
  }
})();
 
document.addEventListener("DOMContentLoaded", function () {
 
  const dugmeMod = document.getElementById("dugme-mod");
 
  if (dugmeMod) {
    // Postavi tekst dugmeta prema trenutnom modu pri učitavanju
    osvjeziTekstDugmeta(dugmeMod);
 
    dugmeMod.addEventListener("click", function () {
    
      document.body.classList.toggle("light-mode");
 
      // Zapamti trenutni mod u localStorage
      // AI mi je pokazao ovaj pattern: provjera classList → setItem
      if (document.body.classList.contains("light-mode")) {
        localStorage.setItem("pumpabon-mod", "light");
      } else {
        localStorage.setItem("pumpabon-mod", "dark");
      }
 
      osvjeziTekstDugmeta(dugmeMod);
    });
  }
 
  /* pomocna funkcija */
  function osvjeziTekstDugmeta(dugme) {
    if (document.body.classList.contains("light-mode")) {
      dugme.textContent = "🌙 Dark Mode";
    } else {
      dugme.textContent = "☀️ Light Mode";
    }
  }

});