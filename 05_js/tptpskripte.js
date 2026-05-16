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

  /* ============================================================
     2. SKOČI NA VRH
     ============================================================
*/
  const dugmeVrh = document.getElementById("dugme-vrh");

  if (dugmeVrh) {
    dugmeVrh.addEventListener("click", function () {
      document.getElementById("vrh").scrollIntoView({
        behavior: "smooth",
      });
    });
  }

  /* ============================================================
     3. pokretna traka kartica - karusel(01_index.html)
     ============================================================
     - Logiku pomjeranja karusela pomoću translateX i currentIndex
       vrijednosti implementirao sam uz pomoć AI asistenta nakon što
       sam razumio način rada overflow i transform svojstava.
     ============================================================ */

  const karuselTrak = document.getElementById("karusel-trak");
  const strelicaLijevo = document.getElementById("strelica-lijevo");
  const strelicaDesno = document.getElementById("strelica-desno");

  if (karuselTrak && strelicaLijevo && strelicaDesno) {
    let currentIndex = 0;
    const kartice = karuselTrak.querySelectorAll(".card");
    const ukupnoKartica = kartice.length;

    /* funkcija koja vraća broj vidljivih kartica ovisno o širini */
    function vidljivoKartica() {
      if (window.innerWidth >= 900) return 4;
      if (window.innerWidth >= 600) return 2;
      return 1;
    }

    /* funkcija koja pomiče karusel na currentIndex poziciju */
    function pomakniKarusel() {
      const vidljivo = vidljivoKartica();
      const maxIndex = Math.max(0, ukupnoKartica - vidljivo);

      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      const prvaKartica = kartice[0];
      const gap = parseFloat(getComputedStyle(karuselTrak).gap) || 0;
      const sirinaKartice = prvaKartica.offsetWidth + gap;
      const pomakPx = currentIndex * sirinaKartice;

      karuselTrak.style.transform = `translateX(-${pomakPx}px)`;

      // upravljanje vidljivošću strelica, skrivanje na granicama
      strelicaLijevo.style.opacity = currentIndex === 0 ? "0.3" : "1";
      strelicaLijevo.disabled = currentIndex === 0;

      strelicaDesno.style.opacity = currentIndex >= maxIndex ? "0.3" : "1";
      strelicaDesno.disabled = currentIndex >= maxIndex;
    }

    /* klik na lijevu strelicu -> idi nazad */
    strelicaLijevo.addEventListener("click", function () {
      currentIndex--;
      pomakniKarusel();
    });

    /* klik na desnu strelicu -> idi naprijed */
    strelicaDesno.addEventListener("click", function () {
      currentIndex++;
      pomakniKarusel();
    });

    /* podrska za swipe na mobitelu (touch events)
       AI mi je pokazao ovaj pattern za touchstart/touchend */
    let touchPocetakX = 0;
    let touchKrajX = 0;

    karuselTrak.addEventListener(
      "touchstart",
      function (e) {
        touchPocetakX = e.touches[0].clientX;
      },
      { passive: true },
    );

    karuselTrak.addEventListener(
      "touchend",
      function (e) {
        touchKrajX = e.changedTouches[0].clientX;
        const razlika = touchPocetakX - touchKrajX;

        // Ako je swipe veći od 50px, smatramo ga namjernim swipeom
        if (razlika > 50) {
          currentIndex++; // swipe lijevo → naprijed
          pomakniKarusel();
        } else if (razlika < -50) {
          currentIndex--; // swipe desno → nazad
          pomakniKarusel();
        }
      },
      { passive: true },
    );

    /* podrska za keyboard - strelice lijevo/desno */
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        currentIndex--;
        pomakniKarusel();
      } else if (e.key === "ArrowRight") {
        currentIndex++;
        pomakniKarusel();
      }
    });

    window.addEventListener("resize", function () {
      currentIndex = 0; // resetujemo na početak pri resize-u
      pomakniKarusel();
    });

    // inicijalna postava karusela pri učitavanju stranice
    pomakniKarusel();
  }
});
