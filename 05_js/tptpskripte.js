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

  /* ============================================================
   4. VALIDACIJA KONTAKT FORME (03_kontakt.html)
   - prikaz grešaka ispod polja i live validacija dok korisnik unosi podatke
   - brojač znakova za textarea koji mijenja boju kada je ispunjen minimum
   - nakon uspješnog slanja, prikaz poruke i onemogućavanje forme
   AI mi je pomogao napisati regex za email validaciju i
   objasnio mi šta svaki dio regex-a znači, kao i regex za telefon.
   ============================================================ */

  const forma = document.getElementById("form");

  if (forma) {
    const poljeIme = document.getElementById("fname");
    const poljePrezime = document.getElementById("lname");
    const poljeEmail = document.getElementById("mail");
    const poljeTelefon = document.getElementById("phone");
    const poljeSelect = document.getElementById("temaupita");
    const poljeTextarea = document.querySelector("textarea");
    const dugmePosalji = document.getElementById("podesi");
    const dugmeIzbrisi = document.getElementById("izbrisi");

    /* -- Regex za email validaciju
       AI mi je objasnio ovaj regex dio po dio:
       ^         = počni na početku stringa
       [^\s@]+   = jedan ili više znakova koji NISU razmak ili @
       @         = obavezni @ znak
       [^\s@]+   = domen dio (npr. gmail)
       \.        = tačka (escapovana jer je . poseban znak u regex-u)
       [^\s@]+   = sufiks domene (npr. com, ba, org)
       $         = kraj stringa
    ---------------------------------------------------------- */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    /* -- Regex za telefon
       Dozvoljava: cifre, razmake, +, -, /
       Primjeri: 061-123-456, +387 61 123 456, 061/123/456 */
    const telefonRegex = /^[0-9\s+\-/]{7,20}$/;
    const MIN_ZNAKOVA = 10;

    let brojacEl = document.getElementById("textarea-brojac");

    if (poljeTextarea && !brojacEl) {
      brojacEl = document.createElement("small");
      brojacEl.id = "textarea-brojac";
      brojacEl.style.cssText = `
      display: block;
      margin-top: 4px;
      font-size: 0.76rem;
      transition: color 0.3s ease;
    `;
      poljeTextarea.parentElement.insertBefore(
        brojacEl,
        poljeTextarea.nextSibling,
      );
    }

    function osvjeziTekstBrojac(duzina) {
      if (!brojacEl) return;

      brojacEl.textContent = `${duzina} / ${MIN_ZNAKOVA} znakova minimalno`;
      brojacEl.style.color = duzina >= MIN_ZNAKOVA ? "#2ecc71" : "#aaaaaa";
    }

    if (poljeTextarea) {
      osvjeziTekstBrojac(poljeTextarea.value.trim().length);

      poljeTextarea.addEventListener("input", function () {
        osvjeziTekstBrojac(this.value.trim().length);
      });
    }

    function prikaziGresku(polje, poruka) {
      if (!polje) return;

      const wrapper = polje.closest(".forma-polje") || polje.parentElement;
      let errorSpan = wrapper.querySelector(".js-error");

      if (!errorSpan) {
        errorSpan = document.createElement("span");
        errorSpan.classList.add("js-error");
        errorSpan.setAttribute("role", "alert");

        errorSpan.style.cssText = `
      display: block;
      color: #ff6b6b;
      font-size: 0.78rem;
      margin-top: 4px;
      margin-bottom: 10px;
      font-family: var(--font-tijelo);
    `;

        wrapper.appendChild(errorSpan);
      }

      errorSpan.textContent = poruka;
      polje.style.borderColor = "#ff6b6b";
      polje.style.boxShadow = "0 0 0 2px rgba(255,107,107,0.25)";
    }

    function obrisiGresku(polje) {
      if (!polje) return;

      const wrapper = polje.closest(".forma-polje") || polje.parentElement;
      const errorSpan = wrapper.querySelector(".js-error");

      if (errorSpan) {
        errorSpan.textContent = "";
      }

      polje.style.borderColor = "";
      polje.style.boxShadow = "";
    }

    function validirajIme(vrijednost) {
      if (!vrijednost || vrijednost.trim().length === 0) {
        return "Ime je obavezno polje.";
      }

      if (vrijednost.trim().length < 2) {
        return "Ime mora imati najmanje 2 znaka.";
      }

      return "";
    }

    function validirajPrezime(vrijednost) {
      if (!vrijednost || vrijednost.trim().length === 0) {
        return "Prezime je obavezno polje.";
      }

      if (vrijednost.trim().length < 2) {
        return "Prezime mora imati najmanje 2 znaka.";
      }

      return "";
    }

    function validirajEmail(vrijednost) {
      if (!vrijednost || vrijednost.trim().length === 0) {
        return "E-mail adresa je obavezna.";
      }

      if (!emailRegex.test(vrijednost.trim())) {
        return "Unesite ispravnu e-mail adresu, npr. ime@domen.com.";
      }

      return "";
    }

    function validirajTelefon(vrijednost) {
      if (!vrijednost || vrijednost.trim().length === 0) {
        return "Broj telefona je obavezan.";
      }

      if (!telefonRegex.test(vrijednost.trim())) {
        return "Unesite ispravan broj telefona, npr. 061-123-456.";
      }

      return "";
    }

    function validirajSelect(vrijednost) {
      if (!vrijednost || vrijednost.trim().length === 0) {
        return "Molimo odaberite temu upita.";
      }

      return "";
    }

    function validirajPoruku(vrijednost) {
      if (!vrijednost || vrijednost.trim().length === 0) {
        return "Poruka je obavezna.";
      }

      if (vrijednost.trim().length < MIN_ZNAKOVA) {
        return `Poruka mora imati najmanje ${MIN_ZNAKOVA} znakova.`;
      }

      return "";
    }

    /* -- Live validacija (validates on blur = kad korisnik napusti polje)
       AI mi je preporučio blur event umjesto input event da ne nervira
       korisnika dok još kuca */
    function dodajLiveValidaciju(polje, validatorFn) {
      if (!polje) return;

      polje.addEventListener("blur", function () {
        const greska = validatorFn(this.value);

        if (greska) {
          prikaziGresku(this, greska);
        } else {
          obrisiGresku(this);
        }
      });

      polje.addEventListener("input", function () {
        const greska = validatorFn(this.value);

        if (!greska) {
          obrisiGresku(this);
        }
      });
    }

    dodajLiveValidaciju(poljeIme, validirajIme);
    dodajLiveValidaciju(poljePrezime, validirajPrezime);
    dodajLiveValidaciju(poljeEmail, validirajEmail);
    dodajLiveValidaciju(poljeTelefon, validirajTelefon);
    dodajLiveValidaciju(poljeSelect, validirajSelect);
    dodajLiveValidaciju(poljeTextarea, validirajPoruku);

    function prikaziUspjesnuPoruku() {
      forma.style.opacity = "0.4";
      forma.style.pointerEvents = "none";

      let uspjesnaPoruka = document.getElementById("uspjesna-poruka");

      if (!uspjesnaPoruka) {
        uspjesnaPoruka = document.createElement("div");
        uspjesnaPoruka.id = "uspjesna-poruka";
        uspjesnaPoruka.style.cssText = `
        margin: 24px 0;
        padding: 20px 24px;
        background: rgba(39, 174, 96, 0.15);
        border: 1px solid rgba(39, 174, 96, 0.5);
        border-radius: 8px;
        color: #2ecc71;
        font-size: 1rem;
        text-align: center;
        animation: textFadeIn 0.4s ease;
      `;
        forma.parentElement.insertBefore(uspjesnaPoruka, forma);
      }

      uspjesnaPoruka.style.display = "block";
      uspjesnaPoruka.innerHTML = `
      <strong>✅ Poruka uspješno poslana!</strong><br>
      <small>Javit ćemo vam se na unesenu e-mail adresu u roku od 48 sati.</small>
    `;

      uspjesnaPoruka.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (dugmePosalji) {
      dugmePosalji.addEventListener("click", function (e) {
        e.preventDefault();

        const greske = [
          {
            polje: poljeIme,
            poruka: validirajIme(poljeIme ? poljeIme.value : ""),
          },
          {
            polje: poljePrezime,
            poruka: validirajPrezime(poljePrezime ? poljePrezime.value : ""),
          },
          {
            polje: poljeEmail,
            poruka: validirajEmail(poljeEmail ? poljeEmail.value : ""),
          },
          {
            polje: poljeTelefon,
            poruka: validirajTelefon(poljeTelefon ? poljeTelefon.value : ""),
          },
          {
            polje: poljeSelect,
            poruka: validirajSelect(poljeSelect ? poljeSelect.value : ""),
          },
          {
            polje: poljeTextarea,
            poruka: validirajPoruku(poljeTextarea ? poljeTextarea.value : ""),
          },
        ];

        let imaGresaka = false;

        greske.forEach(function (stavka) {
          if (!stavka.polje) return;

          if (stavka.poruka) {
            prikaziGresku(stavka.polje, stavka.poruka);
            imaGresaka = true;
          } else {
            obrisiGresku(stavka.polje);
          }
        });
        if (imaGresaka) {
          const sveGreske = forma.querySelectorAll(".js-error");

          const prvaGreska = Array.from(sveGreske).find(
            (greska) => greska.textContent.trim() !== "",
          );

          if (prvaGreska) {
            const pozicija =
              prvaGreska.getBoundingClientRect().top + window.scrollY - 120;

            window.scrollTo({
              top: pozicija,
              behavior: "smooth",
            });
          }

          return;
        }

        prikaziUspjesnuPoruku();
      });
    }

    if (dugmeIzbrisi) {
      dugmeIzbrisi.addEventListener("click", function () {
        if (poljeIme) {
          poljeIme.value = "";
          obrisiGresku(poljeIme);
        }
        if (poljePrezime) {
          poljePrezime.value = "";
          obrisiGresku(poljePrezime);
        }
        if (poljeEmail) {
          poljeEmail.value = "";
          obrisiGresku(poljeEmail);
        }
        if (poljeTelefon) {
          poljeTelefon.value = "";
          obrisiGresku(poljeTelefon);
        }
        if (poljeSelect) {
          poljeSelect.value = "";
          obrisiGresku(poljeSelect);
        }

        if (poljeTextarea) {
          poljeTextarea.value = "";
          obrisiGresku(poljeTextarea);
          osvjeziTekstBrojac(0);
        }

        const uspjesnaPoruka = document.getElementById("uspjesna-poruka");

        if (uspjesnaPoruka) {
          uspjesnaPoruka.style.display = "none";
        }

        forma.style.opacity = "1";
        forma.style.pointerEvents = "auto";
      });
    }
  }
  /* ============================================================
   5. PRETRAGA NAJJEFTINIJE BENZINSKE (02_sadrzaj.html)
   ============================================================ */

  const formaPretraga = document.getElementById("pretraga");

  if (formaPretraga) {
    const lokacijaInput = document.getElementById("lokacija");
    const gorivoSelect = document.getElementById("vrstagoriva");
    const rastojanjeInput = document.getElementById("rastojanjebenzinske");
    const dugmePotvrdi = document.getElementById("potvrdi");
    const rezultatAside = formaPretraga.querySelector("aside");
    const dugmeTrenutnaLokacija = document.getElementById("trenutnalokacija");

    const pumpe = [
      {
        grad: "Tuzla",
        naziv: "Bingo Petrol",
        udaljenost: 3,
        goriva: {
          Dizel: 2.46,
          "Super 95": 2.51,
          "Super 98": 2.66,
          "LPG/Plin": 1.21,
          "Lož Ulje": 2.18,
        },
      },
      {
        grad: "Tuzla",
        naziv: "Hifa Petrol",
        udaljenost: 5,
        goriva: {
          Dizel: 2.52,
          "Super 95": 2.57,
          "Super 98": 2.72,
          "LPG/Plin": 1.25,
          "Lož Ulje": 2.23,
        },
      },
      {
        grad: "Lukavac",
        naziv: "Gazprom",
        udaljenost: 12,
        goriva: {
          Dizel: 2.48,
          "Super 95": 2.55,
          "Super 98": 2.7,
          "LPG/Plin": 1.24,
          "Lož Ulje": 2.2,
        },
      },
      {
        grad: "Kalesija",
        naziv: "Polo",
        udaljenost: 18,
        goriva: {
          Dizel: 2.44,
          "Super 95": 2.5,
          "Super 98": 2.68,
          "LPG/Plin": 1.19,
          "Lož Ulje": 2.16,
        },
      },
      {
        grad: "Živinice",
        naziv: "Junuzović-Kopex",
        udaljenost: 9,
        goriva: {
          Dizel: 2.49,
          "Super 95": 2.53,
          "Super 98": 2.69,
          "LPG/Plin": 1.22,
          "Lož Ulje": 2.19,
        },
      },
    ];

    function postaviTekst(id, tekst) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = tekst;
      }
    }

    function popuniTabeluGoriva() {
      const goriva = [
        { naziv: "Dizel", id: "dizel" },
        { naziv: "Super 95", id: "super95" },
        { naziv: "Super 98", id: "super98" },
        { naziv: "LPG/Plin", id: "lpg" },
        { naziv: "Lož Ulje", id: "lozulje" },
      ];

      goriva.forEach(function (gorivo) {
        let najjeftinija = pumpe[0];

        pumpe.forEach(function (pumpa) {
          if (pumpa.goriva[gorivo.naziv] < najjeftinija.goriva[gorivo.naziv]) {
            najjeftinija = pumpa;
          }
        });

        postaviTekst(
          `cijena-${gorivo.id}`,
          formatirajCijenu(najjeftinija.goriva[gorivo.naziv]),
        );
        postaviTekst(`promjena-${gorivo.id}`, "Stabilno");
        postaviTekst(
          `najjeftinija-${gorivo.id}`,
          formatirajCijenu(najjeftinija.goriva[gorivo.naziv]),
        );
        postaviTekst(`grad-${gorivo.id}`, najjeftinija.grad);
        postaviTekst(`pumpa-${gorivo.id}`, najjeftinija.naziv);
      });
    }
    function prikaziRezultat(poruka, tip) {
      if (!rezultatAside) return;

      const boja = tip === "greska" ? "#ff6b6b" : "#2ecc71";

      rezultatAside.innerHTML = `
      <div style="
        margin-top: 20px;
        padding: 16px;
        border: 1px solid ${boja};
        border-radius: 8px;
        color: ${boja};
        background: rgba(255,255,255,0.05);
        line-height: 1.6;
      ">
        ${poruka}
      </div>
    `;
    }

    if (dugmeTrenutnaLokacija) {
      dugmeTrenutnaLokacija.addEventListener("click", function (e) {
        e.preventDefault();

        prikaziRezultat(
          "Precizna GPS lokacija trenutno nije dostupna u demo verziji projekta. Unesite ručno grad, npr. Tuzla, Lukavac, Kalesija ili Živinice.",
          "greska",
        );
      });
    }

    function formatirajCijenu(cijena) {
      return cijena.toFixed(2).replace(".", ",") + " KM";
    }

    popuniTabeluGoriva();

    if (dugmePotvrdi) {
      dugmePotvrdi.addEventListener("click", function (e) {
        e.preventDefault();

        const lokacija = lokacijaInput.value.trim().toLowerCase();
        const gorivo = gorivoSelect.value;
        const rastojanje = parseFloat(rastojanjeInput.value);

        if (!lokacija) {
          prikaziRezultat("Unesite lokaciju.", "greska");
          return;
        }

        if (!gorivo || gorivo === "prazno") {
          prikaziRezultat("Odaberite vrstu goriva.", "greska");
          return;
        }

        if (isNaN(rastojanje) || rastojanje <= 0) {
          prikaziRezultat(
            "Unesite ispravno rastojanje u kilometrima.",
            "greska",
          );
          return;
        }

        const rezultati = pumpe.filter(function (pumpa) {
          return (
            pumpa.grad.toLowerCase().includes(lokacija) &&
            pumpa.udaljenost <= rastojanje &&
            pumpa.goriva[gorivo] !== undefined
          );
        });

        if (rezultati.length === 0) {
          prikaziRezultat(
            "Nema pronađene benzinske pumpe za unesene podatke.",
            "greska",
          );
          return;
        }

        let najjeftinija = rezultati[0];

        rezultati.forEach(function (pumpa) {
          if (pumpa.goriva[gorivo] < najjeftinija.goriva[gorivo]) {
            najjeftinija = pumpa;
          }
        });

        prikaziRezultat(
          `
        <strong>Najjeftinija benzinska:</strong> ${najjeftinija.naziv}<br>
        <strong>Grad:</strong> ${najjeftinija.grad}<br>
        <strong>Gorivo:</strong> ${gorivo}<br>
        <strong>Cijena:</strong> ${formatirajCijenu(najjeftinija.goriva[gorivo])}<br>
        <strong>Udaljenost:</strong> ${najjeftinija.udaljenost} km
        `,
          "uspjeh",
        );
      });
    }
  }
  /* ============================================================
   6. OTVARANJE LISTE PUMPI PO GRADOVIMA (02_sadrzaj.html)
   ============================================================ */

  const gradovi = document.querySelectorAll(".kategorija");

  if (gradovi.length > 0) {
    gradovi.forEach(function (grad) {
      grad.addEventListener("click", function () {
        const vecOtvoren = grad.classList.contains("otvoren");

        gradovi.forEach(function (g) {
          g.classList.remove("otvoren");
        });

        if (!vecOtvoren) {
          grad.classList.add("otvoren");
        }
      });
    });
  }
  /* ============================================================
   7. OTVARANJE LISTE PUMPI PO GRADOVIMA (02_sadrzaj.html)
   ============================================================ */

  const karticeWrapper = document.getElementById("kartice");

  if (karticeWrapper) {
    function normalizujTekst(tekst) {
      return tekst
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }
    const filterBox = document.createElement("div");
    filterBox.classList.add("kartice-filter");

    filterBox.innerHTML = `
    <input 
      type="text" 
      id="filter-kartica" 
      placeholder="Pretraži benzinsku pumpu..."
    >
  `;

    karticeWrapper.parentElement.insertBefore(filterBox, karticeWrapper);

    const filterInput = document.getElementById("filter-kartica");
    const kartice = document.querySelectorAll("#karusel-trak .card");

    filterInput.addEventListener("input", function () {
      const pojam = normalizujTekst(this.value.trim());

      kartice.forEach(function (kartica) {
        const naslov = normalizujTekst(
          kartica.querySelector("h3")?.textContent || "",
        );
        const opis = normalizujTekst(
          kartica.querySelector("p")?.textContent || "",
        );
        const alt = normalizujTekst(kartica.querySelector("img")?.alt || "");

        kartica.style.display =
          naslov.includes(pojam) || opis.includes(pojam) || alt.includes(pojam)
            ? "flex"
            : "none";
      });
        const karusel = document.getElementByld("karusel-trak");
        if (karusel) {
         karusel.style.transform = "translateX(0px)";
        }
        window.dispatchEvent(new Event("resize"));
    });
  }
});
