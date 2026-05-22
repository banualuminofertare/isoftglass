import type { ManualSection, ManualCategory } from './types';

export const categoriesHR: ManualCategory[] = [
  { id: 'introducere', label: 'Prvi koraci', order: 1 },
  { id: 'calculatoare', label: '3D Kalkulatori', order: 2 },
  { id: 'vanzari', label: 'Prodaja', order: 3 },
  { id: 'productie', label: 'Proizvodnja', order: 4 },
  { id: 'operational', label: 'Operativa', order: 5 },
  { id: 'setari', label: 'Postavke', order: 6 },
];

export const sectionsHR: ManualSection[] = [
  {
    id: 'getting-started', category: 'introducere', roles: ['all'], order: 1,
    title: 'Dobrodošli u iSoftGlass',
    image: '/manual/setari-companie.png',
    imageAlt: 'iSoftGlass zaslon — Informacije o tvrtki',
    content: `# Dobrodošli u iSoftGlass

iSoftGlass je **SaaS** platforma za proizvođače i distributere stakla. Pokriva cijeli tijek: 3D konfiguracija → ponuda → narudžba → proizvodnja → isporuka → servis.

## Što možete učiniti u 5 minuta

1. **Ispunite podatke o tvrtki** u *Postavke → Tvrtka* (CUI, adresa, IBAN, logotip).
2. **Provjerite cijene** u *Postavke → Cijene* — standardni katalog je automatski učitan, prilagodite samo ono što se razlikuje.
3. **Dodajte prvog klijenta** u *Klijenti → Novi klijent* (ili dopustite da se automatski stvori prilikom spremanja prve ponude).
4. **Otvorite 3D kalkulator** iz bočnog izbornika (npr. *Tuš kabine*) i konfigurirajte u 6 koraka.
5. **Spremite kao ponudu** — pojavljuje se u *Narudžbama* s PDF-om spremnim za slanje.
6. **Pošaljite u proizvodnju** kada klijent potvrdi — zalihe se automatski umanjuju.`,
    tips: [
      'Gornja traka ima prekidač RON / EUR — interne cijene su uvijek u RON, ovo je samo za prikaz.',
      'Pritisnite ikonu 📖 (zelenkasto-plava) u bilo kojem trenutku kako biste ponovno otvorili ovaj priručnik točno na trenutnom odjeljku.',
    ],
  },
  {
    id: 'header-icons', category: 'introducere', roles: ['all'], order: 2,
    title: 'Gornja traka i brze naredbe',
    content: `# Gornja traka

U gornjem desnom kutu nalaze se sve globalne naredbe:

1. 🔔 **Žuto zvono (jantar)** — obavijesti i novosti koje objavljuje tim iSoftGlass. Crveni broj = nepročitane obavijesti.
2. 📖 **Priručnik (zelenkasto-plavi obris)** — priručnik koji upravo vidite. Otvara se na odjeljku relevantnom za trenutnu stranicu.
3. **RON / EUR** — mijenja valutu prikazanu u cijeloj aplikaciji. Konverzija koristi tečaj iz *Postavke → Tvrtka*.
4. **🇷🇴 RO** — birač jezika. Podržavamo 9 jezika (RO, EN, IT, DE, PL, FR, ES, NL, HR).
5. **Logout** — sigurna odjava s računa.

## Bočna traka — lijevi izbornik

- **Glavno** — Nadzorna ploča, 3D Kalkulatori, Postavke
- **Operativa** — Narudžbe, Proizvodnja, Skener, Klijenti, Izvještaji, Montaža
- Kliknite na gumb **⬅** pored logotipa kako biste saželi bočnu traku (više prostora na zaslonu).`,
    tips: [
      'Interno pohranjivanje cijena uvijek je u RON — promjena u EUR je samo za prikaz.',
      'Promjena jezika utječe samo na sučelje; uneseni podaci ostaju na izvornom jeziku.',
    ],
  },
  {
    id: 'calc-flow-6-steps', category: 'calculatoare', roles: ['all'], order: -1,
    title: '6 koraka u 3D kalkulatoru',
    image: '/manual/calc-step6-finalizare.png',
    imageAlt: 'Korak 6 - dovršetak ponude s podacima o klijentu i gumbovima PDF/Spremi/Dodaj u košaricu',
    content: `# 6 koraka u 3D kalkulatoru

Svaki 3D kalkulator (tuš kabina, vrata, ograda, ogledalo, kuhinjska staklena obloga, pregradni panel) slijedi **isti linearni tijek u 6 koraka**. U svakom koraku s desne strane imate 3D vizualizaciju koja se ažurira u stvarnom vremenu, a napredak je označen u gornjoj traci.

---

## Korak 1 — Vrsta proizvoda

Odabirete oblik ili tipologiju (npr. **Kut 90°**, **Walk-in / Niša**, **Pentagon**, **Zaslon za kadu**, **Fiksni panel**). Svaka vrsta pred-učitava osnovnu geometriju i popis odgovarajućih profila.

![Korak 1 - odabir vrste proizvoda](/manual/calc-step1-tip.png)

## Korak 2 — Sustav otvaranja

Odabirete način rada: **sa šarkama** (klasično), **pivot** gore-dolje (minimalistički) ili **klizni** na vodilici (ušteda prostora). Odabir ovdje automatski određuje koje ćete dodatke moći dodati u Koraku 5.

![Korak 2 - sustav otvaranja](/manual/calc-step2-dimensiuni.png)

## Korak 3 — Staklo

Postavljate **debljinu** (6/8/10/12 mm), **završnu obradu** (prozirno, sivo, brončano, pjeskareno) i opcije: **tretman protiv kamenca**, **brušenje rubova**, **kaljenje**, **laminiranje**. Cijena stakla se trenutačno ponovno izračunava.

![Korak 3 - odabir stakla](/manual/calc-step3-sticla.png)

## Korak 4 — Konfiguracija vrata i dimenzije

Određujete **stranu otvaranja** (prednja / bočna), **smjer** (unutra / van), **stranu šarki** (lijeva / desna) i konačne **dimenzije** (širina × visina × dubina). Kliknite na bilo koju mjeru u 3D sceni za brzo uređivanje (Enter / Tab sprema).

![Korak 4 - vrata i dimenzije](/manual/calc-step4-profile.png)

## Korak 5 — Profili i dodaci

Odabirete iz prilagođenih popisa: **brtve**, **U-profili / perimetralni profili**, **stabilizacijske šipke**, **dodatni setovi**. Za detaljne informacije o tome kako funkcionira ovaj korak, pogledajte odjeljak **„Kako funkcioniraju dodaci u kalkulatorima"**.

![Korak 5 - profili i dodaci](/manual/calc-step5-accesorii.png)

---

## Korak 6 — Dovršetak ponude (detaljno)

Ovdje pretvarate konfiguraciju u komercijalnu akciju. Korak 6 ima 3 jasne zone: **podaci o klijentu**, **dodatni iznos i ukupno**, **gumbi za akciju**.

![Korak 6 - dovršetak](/manual/calc-step6-finalizare.png)

### Podaci o klijentu (Client info)

- **Vrsta klijenta** — Fizička osoba / Tvrtka / Distributer. **Vrlo važno**: ovdje odabrana vrsta automatski primjenjuje maržu konfiguriranu u **Postavke → Marže za klijente**, tako da prikazana cijena već uzima u obzir maržu po vrsti.
- **Ime klijenta** — naziv koji se pojavljuje na ponudi i na PDF-u.
- **Telefon** i **E-mail** — kontakt podaci koji se koriste u CRM-u i za slanje ponude.

> Prilikom spremanja, ako ime klijenta ne postoji u CRM bazi, sustav **automatski stvara novu karticu**. Ako postoji, koristi postojeću (prema podudaranju imena).

### Dodatni iznos (Extra amount)

Polje **„Extra amount" / „Dodatni iznos"** omogućuje vam dodavanje slobodnog iznosa povrh izračunatog podzbroja. Za što se koristi u praksi:

- **Prijevoz** do klijenta (npr. +150 RON za dostavu).
- **Dodatna montaža** izvan standardnog paketa.
- **Posebni radovi** (npr. bušenje granita, nestandardni dijelovi).
- **Hitna nadoplata** kada se posao mora izvršiti prioritetno.
- **Komercijalni popust** — unesete **negativnu** vrijednost (npr. -50 RON) i ona se oduzima od ukupnog iznosa.

Iznos se dodaje na podzbroj **prije** PDV-a i pojavljuje se zasebno na PDF-u, transparentno prema klijentu.

### Podzbroj, PDV i ukupno

Kartica prikazuje u stvarnom vremenu: **Podzbroj (bez PDV-a)**, **PDV %** (iz postavki) i **Ukupno s PDV-om**. Promjena bilo kojeg parametra (staklo, dodatak, dodatni iznos) trenutačno ponovno izračunava iznose.

### 3 gumba za akciju

1. **Preuzmi PDF** — generira PDF ponudu (logotip tvrtke, podaci o klijentu, popis proizvoda sa 3D snimkom 70×47 px, dodaci grupirani po kodu, rad, ukupno s PDV-om). **Koristi se za** brzo slanje e-mailom / WhatsAppom, **bez** spremanja u sustav. Korisno kada želite samo orijentacijsku ponudu.

2. **Spremi ponudu** — stvara u bazi podataka ponudu s brojem **OFR-YYYYMMDD-HHMMSS** i **narudžbu sa statusom „Ponuda"**. **Koristi se kada** je ponuda fiksna i želite je kasnije pronaći u **Narudžbama**, ponovno je urediti ili je pretvoriti u posao.

3. **Dodaj u košaricu** — dodaje trenutni proizvod u **aktivnu košaricu** (ikona dolje desno s brojačem) **bez** zaključivanja narudžbe. **Koristi se za** ponude s više proizvoda: npr. tuš + ogledalo + kuhinjska obloga za istog klijenta — dodajete redom, zatim dovršite cijelu košaricu kao jednu narudžbu.

---

## Što se događa nakon „Dodaj u košaricu"

![Košarica s dodanim proizvodima](/manual/cos-flow.png)

### 1. Košarica (ikona dolje desno)

Kliknite na ikonu košarice s brojačem i otvara se bočna ploča **Order Products**:

- Prikazuje sve dodane proizvode, svaki s **dimenzijama**, **debljinom stakla** i **cijenom**.
- Gumbi **+ / -** za količinu na svakoj stavci.
- Ikona **kante za smeće** crvene boje briše stavku.
- Gumb **„Empty" / „Isprazni"** uklanja cijelu košaricu.
- Dolje: **Order total** (zbroj svih proizvoda).

### 2. Dovrši narudžbu

Pritisnite **„Finalize" / „Dovrši"** i otvara se dijaloški prozor **Create order from cart**:

![Dijaloški prozor za dovršetak narudžbe](/manual/cos-finalizare.png)

- **Cart products** — sažetak proizvoda iz košarice s ukupnim iznosom.
- **Client** — podaci o klijentu (automatski preuzeti iz posljednjeg dodanog proizvoda).
- **Delivery Address** — adresa za isporuku / montažu.
- **Delivery Date** — procijenjeni rok.
- **Notes** — interne napomene.

Pritisnite **Create Order**: sustav generira jedinstveni broj narudžbe i smješta narudžbu u **Upravljanje narudžbama** sa statusom **„Ponuda"**.

### 3. U Upravljanju narudžbama

Narudžba se odmah pojavljuje na popisu. Odavde:

- **Preuzimate konsolidirani PDF** (svi proizvodi grupirani, dodaci zbrojeni po kodu).
- **Šaljete u proizvodnju** — automatski oduzima zalihe, stvara radni nalog i Kanban karticu.
- **Izdajete račun** ili **predračun (avans)**.
- **Planirate montažu** za tim za instalaciju.
- **Otvarate narudžbu** (klikom na redak) za kartice **Detalji / Proizvodi / Povijest / Pregled**.

### 4. Naknadno uređivanje

Iz kartice **Proizvodi** narudžbe, gumb **Uredi** vraća vas u izvorni kalkulator s **cijelom restauriranom konfiguracijom** iz \`full_config\` — uključujući vrstu klijenta, dodatni iznos, dodatke. Izmijenite → Spremite → narudžba se automatski ažurira.`,
    tips: [
      'U Koraku 6, promjena **Vrste klijenta** između Fizička osoba / Tvrtka / Distributer trenutačno ponovno izračunava cijeli podzbroj s točnom maržom.',
      'Koristite **Preuzmi PDF** za brze ponude putem e-maila, a **Spremi ponudu** samo kada je ponuda fiksna — izbjegavate zatrpavanje povijesti skicama.',
      'Košarica vam omogućuje da konfigurirate više proizvoda za istog klijenta i pošaljete ih u **jednoj narudžbi** s jednim agregiranim PDF-om.',
      'Cijela konfiguracija (uključujući dodatni iznos i vrstu klijenta) sprema se u `full_config` — prilikom ponovnog otvaranja, sve se vraća točno onako kako je bilo.',
    ],
    warnings: [
      'Negativni dodatni iznos (popust) NE provjerava je li ukupni iznos ispod nule — pazite na vrijednost.',
      'Ako promijenite cijene u Postavkama **nakon** što ste spremili ponudu, stare ponude se **ne** preračunavaju automatski — zadržavaju početne vrijednosti.',
    ],
  },
  {
    id: 'accessory-flow', category: 'calculatoare', roles: ['all'], order: 0,
    title: 'Kako funkcioniraju dodaci u kalkulatorima',
    image: '/manual/accesorii-import.png',
    imageAlt: 'Katalog dodataka — gumb Uvezi na moj popis',
    content: `# Kako funkcioniraju dodaci u kalkulatorima

Svi 3D kalkulatori (Tuš kabina, Vrata, Ograda, Ogledalo, Kuhinjska obloga, Pregradni zidovi) koriste **isti sustav** za dodatke: šarke, ručke, U-profili, stabilizacijske šipke, klizni setovi, zaustavljači, brave itd.

Logika je jednostavna i radi se **samo jednom**:

> **Uvozite iz kataloga → pamti se u "Odaberi proizvod" → koristite ih bilo gdje, u bilo kojoj ponudi.**

Ne morate ponovno tražiti dodatak za svaki posao — jednom uvezen, ostaje na vašem osobnom popisu dok ne odlučite ga ukloniti.

---

## Korak 1 — Otvorite katalog dodataka

Idite na **Postavke → Cijene → Dodaci** (ili izravno **Postavke → Katalog dodataka**, ovisno o verziji sučelja).

Ovdje vidite globalni katalog sustava — tisuće kodova grupiranih po kategorijama: šarke, ručke, U-profili, klizni setovi, brtve, stabilizacijske šipke, zaustavljači, brave, nosači, poklopci.

![Katalog dodataka](/manual/accesorii-import.png)

- Koristite **unakrsno pretraživanje** (gore) — tražite po kodu, nazivu ili završnoj obradi, u svim kategorijama.
- Bočni filtri sužavaju pretragu po kategoriji / podkategoriji.

## Korak 2 — Uvezite dodatke koji su vam potrebni

Na retku svakog dodatka u katalogu imate gumb **„Uvezi"** (ili „Dodaj na moj popis"). Kliknite na njega — dodatak odmah ulazi na **vaš osobni popis**, izoliran po tvrtki (strogi RLS).

Označite više redaka i pritisnite **„Uvezi odabrano"** kako biste dodali cijelu grupu (npr. cijeli set šarki za tuš kabine).

> **To radite samo jednom.** Nakon uvoza, dodatak je dostupan svim korisnicima u tvrtki, u svim kalkulatorima.

## Korak 3 — Provjerite cijene i jedinice

Na vašem lokalnom popisu, svaki dodatak prikazuje:

- **Kod** i **naziv** (preuzeti iz kataloga).
- **Cijena** (možete postaviti vlastitu — ne utječe na globalni katalog).
- **Jedinica** (kom, m, set) — podržava i decimalne vrijednosti za metre.
- **Dostupna završna obrada** (krom, mat, brušeno itd.).

Izmijenite cijenu izravno u ćeliji — automatski se sprema i odmah se pojavljuje u kalkulatorima.

## Korak 4 — U kalkulatoru, otvorite „Odaberi proizvod"

Uđete u kalkulator (npr. **Tuš kabine**), dođete do koraka **Dodaci** (šarke, ručka, U-profil, šipka itd.).

Za svako mjesto, padajući izbornik **„Odaberi proizvod"** prikazuje **samo dodatke koje ste uvezli** — suženo na odgovarajuću vrstu (npr. na mjestu Ručka vidite samo ručke).

![Padajući izbornik Odaberi proizvod u kalkulatoru](/manual/accesorii-selecteaza-produs.png)

- Popis je čist: ne gubite se u tisućama nevažnih kodova.
- Brzo pretraživanje u padajućem izborniku po kodu ili nazivu.

## Korak 5 — Prilagodite količinu i završnu obradu

Nakon što odaberete dodatak:

- **Količina** — za šarke možete odabrati 2 ili 3 (vaš odabir je mjerodavan, nadjačava automatsko pravilo).
- **Završna obrada** — boja/završna obrada iz dostupnih varijanti (s vraćanjem na roditeljski element ako točna varijanta nedostaje).
- **Položaj** — šarke se mjere odozgo prema dolje, ručka odozdo prema gore (industrijska konvencija, već unaprijed konfigurirana).

## Korak 6 — Spremite konfiguraciju → dodaci ulaze u ponudu

Pritisnite **„Spremi kao ponudu"** ili **„Dodaj u košaricu"**. Odabrani dodaci:

1. Pripajaju se proizvodu s njihovom cijenom u RON (prikaz konvertibilan u EUR).
2. Pojavljuju se u **OrderPreview** i u PDF-u ponude, automatski grupirani po kodu (isti kod = zbroj količina).
3. Pamte se u \`full_config\` JSON-u — izvor istine za PDF, DXF i naknadno uređivanje.
4. Prilikom slanja u proizvodnju, **zalihe se automatski smanjuju** prema količinama iz ponude.

![Dodatak dodan u ponudu](/manual/accesorii-in-oferta.png)`,
    tips: [
      'Uvozite samo jednom — nakon toga dodaci ostaju u „Odaberi proizvod" za sve kolege u tvrtki.',
      'Cijene se mogu lokalno nadjačati (po tvrtki) bez utjecaja na sistemski katalog.',
      'Koristite isti tijek u SVIM kalkulatorima: tuš, vrata, ograda, ogledalo, kuhinjska obloga, pregrade.',
    ],
    warnings: [
      'Ako uklonite dodatak s osobnog popisa, stare ponude ostaju važeće (konfiguracija je spremljena u `full_config`), ali ga više ne možete odabrati u novim poslovima dok ga ponovno ne uvezete.',
    ],
  },
  {
    id: 'calc-shower', category: 'calculatoare', roles: ['all'], order: 1,
    title: 'Kalkulator tuš kabine',
    image: '/manual/calc-dus.png',
    imageAlt: '3D konfigurator tuš kabine',
    content: `# Kalkulator tuš kabine

Vizualno konfigurirajte u 3D bilo koju vrstu kabine: kut 90°, walk-in, pentagon, za kadu, fiksni panel.

## 6 koraka

1. **Vrsta kabine** — odabirete oblik (kut 90°, niša, pentagon, zaslon za kadu, fiksna).
2. **Dimenzije** — kliknite na mjeru u 3D sceni da biste je uredili (Enter / Tab sprema).
3. **Staklo** — debljina (8/10/12 mm), završna obrada (prozirno, sivo, brončano), opcionalno kaljenje.
4. **Profili** — U, zidni, kut 90°, klizni set (kada je primjenjivo).
5. **Dodaci** — šarke (2 ili 3), ručka, stabilizacijska šipka, brtve.
6. **Spremi** — kao ponudu ili izravno kao novi posao.`,
    tips: [
      'Šarke se mjere od **vrha prema dolje**, a ručka od **dna prema gore** — industrijska konvencija.',
      'Fiksni panel NEMA podrazumijevani odbitak od 10 mm — samo kumulativni profili + brtve.',
      'Klizni sustav ne zahtijeva šarke i automatski izračunava preklapanje iz seta.',
    ],
    warnings: [
      'Kod kuta 90°, U-profili su prisilno skriveni na spoju kako bi se izbjeglo dupliciranje.',
    ],
  },
  {
    id: 'calc-door', category: 'calculatoare', roles: ['all'], order: 2,
    title: 'Kalkulator za staklena vrata',
    image: '/manual/calc-usa.png',
    imageAlt: '3D konfigurator staklenih vrata',
    content: `# Kalkulator za vrata

Za unutarnja vrata sa šarkama, pivotom ili klizanjem na vodilici.

## Koraci

1. **Sustav** — Sa šarkama, Pivot gore-dolje, Klizni na vodilici.
2. **Dimenzije** — širina, visina, otvor vrata.
3. **Staklo** — debljina i završna obrada.
4. **Bočne brtve** — niz \`lateralSelections\` s odvojenim opcijama lijevo/desno/gore/dolje.
5. **Izrezi** — za ručku ili bravu (prag >50 mm = velik, ≤50 mm = mali).
6. **Dodaci** — šarke, ručka, zaustavljač, brava.`,
    tips: [
      'Pivot se automatski izračunava prema težini stakla.',
      'Kod kliznog sustava, vodilica i klizač su uključeni u set — nemojte dodavati zasebno.',
    ],
  },
  {
    id: 'calc-balustrade', category: 'calculatoare', roles: ['all'], order: 3,
    title: 'Kalkulator za ograde',
    image: '/manual/calc-balustrada.png',
    imageAlt: '3D konfigurator ograde',
    content: `# Kalkulator za ograde

Konfiguracija staklenih ograda: unutarnje, vanjske (obavezno laminirano), stepenice (nagnuti paneli).

## Koraci

1. **Vrsta** — Unutarnja, Vanjska, Stubište.
2. **Ukupna duljina** i **visina** — u mm.
3. **Staklo** — laminirano 8+8, 10+10 ili jednostavno kaljeno (samo unutarnje).
4. **Pričvršćivanje** — kontinuirani U-profil, točkasti nosači, stupići.
5. **Rukohvat** — opcionalno (drvo, nehrđajući čelik, aluminij).
6. **Poklopci** — za U-profil.`,
    warnings: [
      'Za vanjske prostore, staklo MORA biti laminirano — obvezna sigurnosna norma.',
    ],
  },
  {
    id: 'calc-mirror', category: 'calculatoare', roles: ['all'], order: 4,
    title: 'Kalkulator za ogledala',
    image: '/manual/calc-oglinda.png',
    imageAlt: '3D konfigurator ogledala',
    content: `# Kalkulator za ogledala

Za jednostavna ogledala ili s posebnim obradama.

## Koraci

1. **Oblik** — Pravokutnik, Kvadrat, Krug, Oval, Prilagođeno.
2. **Dimenzije** — u mm; za prilagođeni oblik crtate u CAD editoru.
3. **Vrsta ogledala** — standardno posrebreno, antikno, dimljeno, brončano.
4. **Rub** — brušen, fazetiran, poliran.
5. **Izrezi** — za prekidače, utičnice, nosače.
6. **LED rasvjeta** — opcionalno, perimetralna ili pozadinska.`,
  },
  {
    id: 'calc-kitchen', category: 'calculatoare', roles: ['all'], order: 5,
    title: 'Kalkulator za kuhinjske staklene obloge',
    image: '/manual/calc-front-bucatarie.png',
    imageAlt: '3D konfigurator kuhinjske staklene obloge',
    content: `# Kalkulator za kuhinjske staklene obloge

Fronte namještaja od lakiranog stakla, s digitalnim tiskom ili mat pjeskarene.

## Koraci

1. **Završna obrada** — Lakirano po RAL-u, Digitalni tisak, Mat pjeskareno.
2. **Dimenzije** — širina × visina po fronti; množite koliko fronti.
3. **Boja / Tisak** — odaberite RAL ili učitajte datoteku za tisak.
4. **Izrezi** — za ručke ili push-to-open.
5. **Sustav pričvršćivanja** — ljepilo na MDF, vijci straga, aluminijski profil.
6. **Spremanje** — automatsko grupiranje za cijele kuhinje.`,
    tips: [
      'Za digitalni tisak, preporučena minimalna rezolucija je 150 dpi pri konačnoj veličini.',
    ],
  },
  {
    id: 'calc-panels', category: 'calculatoare', roles: ['all'], order: 6,
    title: 'Paneli i pregradni zidovi',
    image: '/manual/calc-panouri.png',
    imageAlt: '3D konfigurator panela i pregradnog zida',
    content: `# Paneli i pregradni zidovi

Dva pod-modula:

- **Jednostavni panel** — staklo bez obrada (staklo po mjeri).
- **Pregradni zid** — konfigurabilna rešetka s integriranim vratima.

## Pregradni zidovi — ključni koraci

1. **Rešetka** — definirate koliko stupaca × redova; mijenjate veličinu povlačenjem (suma širina ostaje konstantna).
2. **Perimetralni profili** — gore, dolje, bočno; automatski se prekidaju tamo gdje su vrata.
3. **Unutarnji profili** — vertikalni i horizontalni; \`usableWidth/Height\` osigurava odgovarajuće panele.
4. **Integrirana vrata** — u bilo kojoj ćeliji; automatski se oduzimaju od perimetralnog profila.
5. **Bočni paneli 90°** — visina se sinkronizira s visinom vrata.
6. **Staklo i završne obrade** — po ćeliji ili globalno.`,
    warnings: [
      'Prilikom promjene veličine jednog stupca, susjedni se automatski prilagođavaju kako bi se zadržala ukupna širina.',
    ],
  },
  {
    id: 'orders', category: 'vanzari', roles: ['all'], order: 1,
    title: 'Upravljanje narudžbama',
    image: '/manual/comenzi-deschide.png',
    imageAlt: 'Popis narudžbi sa statusima',
    content: `# Narudžbe

Sve ponude i narudžbe, s brzim filtrima po statusu: Ponuda → Potvrđeno → U proizvodnji → Dovršeno → Isporučeno → Otkazano.

## Brze akcije na retku narudžbe

1. **Promijeni status** — obojeni gumbi izravno na retku (Potvrdi, Dovrši, Isporuči).
2. **Pošalji u proizvodnju** — automatski oduzima zalihe i stvara radni nalog.
3. **Generiraj DXF** — za CNC, za svaki panel.
4. **Uredi** — ponovno otvara ponudu u izvornom kalkulatoru (svi podaci su vraćeni).
5. **Obriši** — samo ako još nije u proizvodnji.

## Otvaranje detalja narudžbe

Kliknite na broj narudžbe (ili na njezin redak) s **Popisa narudžbi** i otvara se okvir sa zaglavljem narudžbe (broj, status, gumb **Preuzmi PDF**) i 4 kartice:

![Okvir otvorene narudžbe](/manual/comenzi-detalii.png)

### 1. Detalji
Podaci o klijentu, datum stvaranja, podzbroj, PDV, ukupno. Ovdje brzo provjeravate komercijalne podatke i imate gumbe za **Planiraj montažu**, **Izdaj račun** i **Predračun (avans)**.

### 2. Proizvodi
Popis konfiguriranih proizvoda, s količinom, jediničnom cijenom i dodatnim iznosom (ako postoji). Gumb **Uredi** na svakom proizvodu vraća vas u kalkulator za prilagodbe.

![Kartica Proizvodi](/manual/comenzi-produse.png)

### 3. Povijest
Dnevnik izmjena: promjene statusa, uređivanja, plaćanja, generiranje dokumenata. Korisno za sljedivost i reviziju — vidite tko je i kada napravio svaku izmjenu.

![Kartica Povijest](/manual/comenzi-istoric.png)

### 4. Pregled
Detaljan prikaz ponude točno onako kako se pojavljuje na **PDF-u koji se šalje klijentu**: za svaki proizvod vidite vrstu konfiguracije, dimenzije i površinu stakla, primijenjene obrade, popis dodataka s kodom i jediničnom cijenom, rad i ukupni iznos. **Koristi se za konačnu provjeru** prije slanja ponude klijentu ili narudžbe u proizvodnju — potvrđujete da su cijene proizvoda, dodataka i rada točne.

![Kartica Pregled](/manual/comenzi-previzualizare.png)

## Gornje kartice

Trenutačni sažetak: ukupan broj narudžbi, vrijednost u RON, distribucija po statusima.`,
    tips: [
      'Potpuna konfiguracija (`full_config`) ostaje netaknuta od košarice do narudžbe — podaci se ne gube.',
      'Identični dodaci se automatski grupiraju na konačnom PDF-u (zbroj količina, jedinstveni kod).',
      'Kartica Pregled uvijek odražava trenutne vrijednosti — ako promijenite cijenu u Postavkama, ovdje se ažurira.',
    ],
  },
  {
    id: 'invoicing', category: 'vanzari', roles: ['all'], order: 2,
    title: 'Fakturiranje',
    image: '/manual/facturare.png',
    imageAlt: 'Modul za fakturiranje s KPI i grafikonima',
    content: `# Fakturiranje

Izdavanje računa iz potvrđenih narudžbi, s prilagođenim serijama i izvozom e-Računa (CIUS-RO i FatturaPA za IT).

## Koraci

1. **Konfigurirajte serije** u *Postavke → Fakturiranje → Serije* (prefiks, godina, brojač).
2. **Generirajte račun** iz narudžbe: gumb **€** na retku narudžbe.
3. **Uredite stavke** — dodajte/uklonite, prilagodite cijene, PDV po stavci.
4. **Izdaj** — broj se dodjeljuje automatski, status postaje "Izdano".
5. **Zabilježite plaćanje** — djelomično ili u cijelosti.
6. **Izvoz XML** — za ANAF (RO) ili SDI (IT).

## KPI

Gornje kartice: fakturirano, naplaćeno, dospjelo, otkazano.`,
    warnings: [
      'Izdani račun se ne može obrisati — samo stornirati s razlogom i zamijeniti ispravkom.',
    ],
  },
  {
    id: 'clients-crm', category: 'vanzari', roles: ['all'], order: 3,
    title: 'Klijenti i CRM',
    image: '/manual/clienti-crm.png',
    imageAlt: 'Popis CRM klijenata s vrstama',
    content: `# Klijenti

Kompletna baza podataka klijenata: fizičke osobe, tvrtke, distributeri.

## Koraci

1. **Dodaj klijenta** — gumb "Novi klijent" ili automatski kada spremite ponudu za novi e-mail.
2. **Vrsta klijenta** — Osoba / Tvrtka / Distributer (s globalnim popustom).
3. **Kontakt podaci** — telefon, e-mail, adresa, CUI (ako je tvrtka).
4. **CRM Pipeline** (admin) — leadovi, faze, konverzije.
5. **Povijest** — sve ponude i narudžbe klijenta na jednom mjestu.
6. **Specifična marža** — u *Postavke → Marža klijenta* postavite različitu maržu za različite vrste.`,
    tips: [
      'Klijenti se automatski stvaraju iz 3D kalkulatora kada spremite prvu ponudu s novim e-mailom.',
    ],
  },
  {
    id: 'production-kanban', category: 'productie', roles: ['all'], order: 1,
    title: 'Kanban tijek proizvodnje',
    image: '/manual/productie-kanban.png',
    imageAlt: 'Kanban ploča sa stupcima Rezanje, Obrada, Kaljenje',
    content: `# Kanban proizvodnja

Vizualni tijek po fazama: **Rezanje → Obrada → Kaljenje → Premaz/Tisak → Sastavljanje → Spremno za isporuku**.

## Dnevni koraci

1. **Provjerite gornje KPI-jeve**: ukupno aktivnih, u radu, na čekanju, spremno za isporuku.
2. **Povucite i ispustite** karticu između stupaca kako biste je ručno pomaknuli.
3. **Kliknite na karticu** — otvara se radni nalog s tehničkim crtežima, materijalima, dodacima.
4. **Dodjela operatera** — unaprijed planirano u *Narudžbe → Planiranje operatera*; sprema se u \`operator_name\` za sljedivost.
5. **Prikaz kalendara** — alternativna kartica za planiranje po datumu.

## Naljepnice s crtičnim kodom

Iz radnog naloga svake proizvodne narudžbe (i sa stranice **Skener**) imate gumb **„Ispis naljepnice"**:

- Crtični kod je **CODE128**, generiran automatski iz broja naloga (pomoću biblioteke JsBarcode).
- Naljepnica sadrži: **broj naloga**, **broj narudžbe**, **klijent**, **rok isporuke** i **trenutnu fazu**.
- Otvara se izravno dijaloški prozor za ispis preglednika — možete koristiti obične A4 pisače ili namjenske pisače za naljepnice (Zebra, Brother itd.).
- Zalijepite naljepnicu na staklo / okvir / paket i ponovno je koristite u svakoj fazi tijeka.

## Skeniranje u radionici

Stranica **Proizvodnja → Skener** optimizirana je za ritam radionice:

1. **Automatski fokus** na polje za skeniranje — ne morate klikati prije svakog skeniranja.
2. **HID čitači** — bilo koji USB skener tipa „tipkovnica” radi plug-and-play (ne zahtijeva drivere).
3. **Skenirate kod** s naljepnice → narudžba **automatski prelazi** na sljedeću fazu u tijeku.
4. **Trenutna vizualna potvrda**: kartica prikazuje novi status, a Kanban se ažurira.

Na taj način operateri više ne gube vrijeme na ručno povlačenje i ispuštanje i nema grešaka poput „zaboravio sam označiti da sam završio”.

## Praćenje u stvarnom vremenu

Kanban ploča se **automatski osvježava** u pozadini:

- Skeniranja obavljena u radionici pojavljuju se **odmah** na uredskim zaslonima — bez ručnog osvježavanja.
- Gornji KPI-jevi (aktivni, u radu, spremno za isporuku) ponovno se izračunavaju uživo.
- Više operatera može istovremeno raditi na različitim fazama, bez preklapanja.
- Menadžer u svakom trenutku vidi **gdje se nalazi svaka narudžba** i **tko radi na njoj**.

## Procijenjeni datum isporuke

Izračunava se automatski kada narudžba uđe u proizvodnju, ovisno o opterećenju stupaca.`,
    tips: [
      'Ispišite naljepnicu s crtičnim kodom odmah nakon što narudžba uđe u proizvodnju i zalijepite je na paket — postaje izvor istine za cijeli tijek.',
      'Ostavite stranicu Skener otvorenom na tabletu/laptopu u radionici; automatski fokus osigurava da se svako skeniranje zabilježi čak i ako nitko nije za tipkovnicom.',
      'Za 24/7 tijek, otvorite Kanban na velikom TV-u — vidite napredak u stvarnom vremenu bez da išta dirate.',
    ],
  },
  {
    id: 'inventory', category: 'productie', roles: ['all'], order: 2,
    title: 'Zalihe i inventura',
    image: '/manual/stoc.png',
    imageAlt: 'Modul za inventuru s popisima materijala',
    content: `# Zalihe

Upravljanje materijalima: staklo, dodaci (hardver), potrošni materijal. Automatsko oduzimanje prilikom ulaska u proizvodnju.

## Koraci

1. **Dodaj materijal** — gumb "Novi materijal" (kod, vrsta, cijena, minimalne zalihe).
2. **Prilagodi zalihe** — gumb po retku za ručne unose/izlaze.
3. **Kretanja zaliha** — kartica s poviješću transakcija (ulazi, izlazi, razlog).
4. **Mjesečni izvještaj o potrošnji** — gumb gore, izvoz u CSV/Excel.
5. **Upozorenja o minimalnim zalihama** — crveni KPI "Min. zalihe" na gornjoj kartici.
6. **Lokacija** — opcionalno, za više skladišta.

## Automatsko oduzimanje

Kada narudžba pređe u status **"U proizvodnji"**, zalihe se automatski smanjuju prema popisu materijala svakog proizvoda.`,
    warnings: [
      'Negativne zalihe su dopuštene, ali označene crvenom bojom — upravitelj mora obaviti fizičku inventuru i prilagodbu.',
    ],
  },
  {
    id: 'cutting', category: 'productie', roles: ['all'], order: 3,
    title: 'Optimizacija rezanja',
    image: '/manual/optimizare-debitare.png',
    imageAlt: 'Modul za optimizaciju rezanja s odabirom ploča',
    content: `# Optimizacija rezanja

Algoritam guillotine nesting za do 50 narudžbi istovremeno — minimizira otpad stakla.

## Koraci

1. **Vrsta ploče** — odaberite iz kataloga (npr. 3210×2250 mm).
2. **Debljina oštrice** — zadano 3 mm, podesivo.
3. **Odaberite narudžbe** — s popisa s pretraživanjem i filtrom statusa (možete "Odaberi sve 26").
4. **Pritisnite Optimiziraj** — algoritam se pokreće i prikazuje ploče s ugniježđenim panelima.
5. **Vizualizirajte SVG** — svaka ploča s mjerama, oznakama panela, obojenim otpadom.
6. **Izvoz DXF/PDF** — za slanje na stroj za rezanje.

## Upravljanje staklenim pločama

![Dijalog Upravljaj pločama sa standardnim dimenzijama stakla na stranici Optimizacija Rezanja](/manual/manage-glass-sheets.png)

Standardne dimenzije (2550×3210, 2250×3210, Jumbo 6000×3210) učitavaju se automatski pri prvom korištenju. Možeš ih uređivati u bilo kojem trenutku bez napuštanja stranice rezanja — klikni gumb **⚙ Upravljaj pločama** pored selektora *Tip ploče*.

1. **Dodaj novu ploču** — ispuni *Naziv* (npr. "Custom 2000×3000"), *Širinu (mm)* i *Visinu (mm)*, zatim klikni **+ Dodaj**.
2. **Uključi / isključi** — prekidač uz svaku dimenziju skriva je iz selektora *Tip ploče* bez brisanja (korisno za sezonske dimenzije).
3. **Obriši** — crveni gumb (kanta) trajno uklanja dimenziju; koristi samo ako si siguran.
4. **Zatvori dijalog** — promjene se primjenjuju odmah i selektor *Tip ploče* automatski se osvježava s novim dimenzijama i površinom u m².

> Ploče se pohranjuju po tvrtki — cijeli tim vidi istu listu, odvojeno od drugih računa.

## Statistika

Postotak iskoristivosti, površina otpada, broj ploča.`,
    tips: [
      'Ograničenje na 50 narudžbi po sesiji radi održavanja razumnog vremena izračuna.',
    ],
  },
  {
    id: 'service', category: 'operational', roles: ['all'], order: 1,
    title: 'Reklamacije i servisne intervencije',
    image: '/manual/service.png',
    imageAlt: 'Modul za reklamacije s grafikonima i popisom tiketa',
    content: `# Reklamacije i servis

Upravljanje incidentima nakon isporuke: reklamacije klijenata, tvorničke greške, planirane intervencije.

## Koraci

1. **Nova reklamacija** — gumb gore desno.
2. **Poveži narudžbu** — opcionalno, za sljedivost.
3. **Prioritet** — Nizak / Srednji / Visok / Kritičan.
4. **Vrsta kvara** — Reklamacija klijenta, Tvornička greška, Oštećenje u transportu, Jamstvo.
5. **Planiraj intervenciju** — odaberite datum i tim za montažu.
6. **Zatvori tiket** — s rješenjem i troškovima.

## Grafikoni

Učestalost kvarova, distribucija prioriteta, status tiketa.`,
  },
  {
    id: 'installation', category: 'operational', roles: ['all'], order: 2,
    title: 'Montaža i timovi',
    image: '/manual/montaj.png',
    imageAlt: 'Kalendar montaže s karticama Timovi, Vozila, Kontrolna lista',
    content: `# Montaža

Planiranje montaža, timova, vozila, kontrolnih lista i optimizacija rute.

## Kartice

1. **Kalendar montaže** — mjesečni prikaz s povlačenjem i ispuštanjem.
2. **Timovi za montažu** — dodajte članove, dodijelite ih timovima.
3. **Kontrolna lista** — predlošci klonirani na svaki posao prilikom stvaranja.
4. **Optimizacija rute** — izračunava optimalni redoslijed montaža za dan.
5. **Vozila** — vozni park s upozorenjima 30 dana prije isteka tehničkog pregleda i obveznog osiguranja.

## Koraci planiranja

1. Gumb **"Planiraj montažu"** gore desno.
2. Odaberite narudžbu, tim, vozilo, datum.
3. Priložite kontrolnu listu (zadanu ili prilagođenu).
4. Spremi — pojavljuje se u kalendaru.
5. **Odgoda** — zatvara trenutni posao i unaprijed popunjava novi.`,
    tips: [
      'Vozila s tehničkim pregledom/obveznim osiguranjem koji istječu za manje od 30 dana primaju automatsko upozorenje.',
    ],
  },
  {
    id: 'settings-company', category: 'setari', roles: ['all'], order: 1,
    title: 'Postavke tvrtke i brendiranje',
    image: '/manual/setari-companie.png',
    imageAlt: 'Postavke tvrtke — opće informacije',
    content: `# Postavke → Tvrtka

Podaci koji se pojavljuju na SVIM generiranim dokumentima (ponude, narudžbe, računi, radni nalozi).

## Bitan polja

1. **Naziv tvrtke** — pojavljuje se u zaglavlju PDF-a.
2. **CUI / CIF** — s prefiksom HR za Hrvatsku.
3. **Puna adresa** — Ulica, Br., Grad, Županija, Poštanski broj.
4. **Telefon i E-mail** — za kontakt na dokumentima.
5. **Bankovni račun i BIC/SWIFT** — za račune.
6. **Logotip tvrtke** — PNG/JPG/WebP/SVG, max 2 MB.

## Prilagodba PDF-a

- **Veličina logotipa** i **položaj** — za ponude i račune.
- **Prilagođeni tekstovi** — uvjeti, odredbe, podnožje (rich-text putem Tiptap-a).
- **Tečaj EUR/RON** — koristi se za globalnu konverziju.

## White label

Pretplatnici mogu u potpunosti prilagoditi PDF-ove s vlastitim logotipom i HTML tekstovima.`,
    tips: [
      'Idealan logotip je prozirni PNG, omjera 3:1 ili kvadratni, min 400×400 px za kvalitetan ispis.',
    ],
  },
  {
    id: 'settings-pricing', category: 'setari', roles: ['all'], order: 2,
    title: 'Postavke cijena i katalog',
    content: `# Postavke → Cijene

Vaš lokalni katalog cijena: materijali, dodaci, setovi, završne obrade.

## Koraci

1. **Kartica Materijali** — staklo, profili, grupirani dodaci.
2. **Pretraži** — unakrsno pretraživanje po kategorijama.
3. **Uredi cijenu** — kliknite na ćeliju, automatsko spremanje.
4. **Vrati na sustav** — gumb za odustajanje od vlastite promjene i povratak na osnovnu cijenu.
5. **Privatne varijante** — dodajte vlastite materijale s jedinstvenim kodom po tvrtki.
6. **Uvoz / Izvoz** — Excel + ZIP za slike, automatsko mapiranje na kategorije sustava.

## Hijerarhija cijena

Tvrtka (vlastita promjena) > Globalni korisnik > Sustav (zadani katalog).`,
    tips: [
      'Vlastite promjene cijena tvrtke nisu vidljive drugim tvrtkama — strogo izolirano putem RLS-a.',
      'Slike materijala imaju cachebusting s vremenskom oznakom kako bi se odmah vidjela nova verzija.',
    ],
    warnings: [
      'Vraćanje cijene briše vlastitu promjenu i ne može se poništiti — provjerite prije.',
    ],
  },
  {
    id: 'settings-team', category: 'setari', roles: ['all'], order: 3,
    title: 'Postavke tima i dopuštenja',
    content: `# Postavke → Tim

Pozovite članove tima i upravljajte dopuštenjima po modulima.

## Koraci

1. **Pozovi člana** — e-mail; prima link za registraciju.
2. **Uloga** — Pretplatnik (prodaja), Proizvodnja, Montaža, Admin tvrtke.
3. **Dopušteni moduli** — označite pristup: Narudžbe, Proizvodnja, Zalihe, Fakturiranje, Servis, itd.
4. **Aktivacija/Deaktivacija** — zadržavate povijest, samo blokirate prijavu.
5. **Prijenos admina** — jednim klikom, na drugog člana.
6. **Sljedivost** — sve akcije se bilježe s \`created_by\`.

## Razine pristupa

- **Basic (60)** — Narudžbe + 1-2 kalkulatora.
- **Plus (100)** — Svi kalkulatori + Zalihe.
- **Operational (150)** — Sve, uključujući Servis, Montažu, Optimizaciju.

## Naplata

Pretplata je vezana za **vlasnika tvrtke** — zaposlenici su besplatni.`,
    tips: [
      'Popravak siročadskog računa (admin) — korisnici bez tvrtke mogu se ručno dodijeliti.',
    ],
  },
  {
    id: 'pricing-client-types', category: 'setari', roles: ['all'], order: 9,
    title: 'Marža po vrsti klijenta (Fizička osoba / Tvrtka / Distributer)',
    image: '/manual/setari-adaos-tip-client.png',
    imageAlt: 'Postavke → Marže za klijente — Fizička osoba, Tvrtka, Distributer',
    content: `# Postotna marža po vrsti klijenta

U **Postavke → Marže za klijente** možete definirati **3 različita cjenika** počevši od istog kataloga, bez dupliciranja artikala.

## 3 vrste

- **Fizička osoba** — krajnji kupci (maloprodaja). Ovdje obično stavljate pozitivnu maržu (npr.: +10% … +20%) jer ne ostvaruju komercijalni popust.
- **Tvrtka** — tvrtke i partnerske firme. Obično se ostavlja **0%** (osnovna cijena).
- **Distributer** — partneri za daljnju prodaju. Ovdje obično stavljate **negativnu vrijednost** (npr.: −10% … −25%) kako biste im ponudili povlaštenu cijenu.

## Kako funkcionira

- Postotak se primjenjuje **automatski** na osnovnu cijenu svakog artikla u ponudi (staklo, dodaci, rad, setovi).
- **Pozitivne** vrijednosti = marža na standardnu cijenu. **Negativne** vrijednosti = popust.
- Polje prihvaća vrijednosti između **−100% i +500%**, s korakom od 0,5%.
- Izmjene postaju aktivne nakon što pritisnete **„Spremi marže"** (gumb dolje desno). Kartica ističe izmijenjene retke s oznakom „izmijenjeno".

## Gdje se primjenjuje

U svakom **3D kalkulatoru**, na kartici **Informacije o klijentu**, postoji birač **Vrsta klijenta** (Fizička osoba / Tvrtka / Distributer). Kada ga promijenite:

1. Kalkulator detektira odabranu vrstu.
2. Automatski primjenjuje postotak postavljen ovdje na podzbroj.
3. Cijena prikazana u ponudi (i kasnije u PDF-u) već odražava novu vrstu.

## Čemu služi

- **Jedan jedini katalog**, ali različite cijene po kategoriji klijenta — bez ručnog dupliciranja artikala.
- Možete **brzo odobriti popust distributerima** bez mijenjanja osnovnih kataloga.
- Fizičkim osobama se može fakturirati sa standardnom komercijalnom maržom, bez ručnih izračuna u svakoj ponudi.
- Izmjene su **retroaktivne samo za nove ponude** — već spremljene narudžbe zadržavaju svoje početne cijene (\`full_config\` je izvor istine).`,
    tips: [
      'Možete postaviti negativne vrijednosti (npr.: −15%) kako biste trajno ponudili rabat jednoj kategoriji bez diranja kataloga.',
      'Ako ste u nedoumici, počnite s Tvrtka = 0% (referentna cijena) i prilagodite druge dvije u odnosu na nju.',
      'Birač Vrsta klijenta u kalkulatoru se pamti u ponudi, tako da ponovno otvorena ponuda zadržava početno odabranu vrstu.',
    ],
    warnings: [
      'Promjena postotka utječe samo na nove ponude. Postojeće narudžbe moraju se ponovno urediti ako želite da se preračunaju.',
    ],
  },
  {
    id: 'pricing-overview', category: 'setari', roles: ['all'], order: 10,
    title: 'Cijene — opći pregled',
    image: '/manual/setari-preturi.png',
    imageAlt: 'Postavke → Cijene — popis kategorija',
    content: `# Postavke → Cijene

Ovdje kontrolirate **sve cijene** korištene u 3D kalkulatorima, ponudama i PDF-ovima.

## Dostupne kategorije

- **Dodaci** — šarke, ručke, šipke, kotačići, zaustavljači, brtve, konektori
- **Staklo** — po debljini i vrsti (prozirno, mat, dimljeno, ogledalo)
- **Rad** — montaža, rezanje, poliranje, bušenje, izrezivanje
- **Profili** — U, zidni, kut 90°, klizni profili
- **Setovi** — grupe dodataka prodane kao jedna stavka
- **Klizni mehanizmi** — kompletni sustavi (s profilom + kotačićima + zaustavljačima)

## Globalni katalog naspram osobnih promjena

- **Globalni katalog** (kojim upravlja admin) je polazišna točka — vidite ga automatski.
- Kada izmijenite cijenu ili odbitak, sprema se **osobna promjena** u vašem prostoru (\`pricing_config\`). Globalni katalog ostaje netaknut.
- Uvijek možete resetirati osobnu promjenu gumbom **„Vrati na katalošku vrijednost"** (pogledajte posvećeni odjeljak).

## Valuta

Cijene su interno pohranjene u **RON**. Prekidač **RON / EUR** u gornjoj traci pretvara samo prikaz — ne vrši se nikakva konverzija u bazi podataka.`,
    tips: [
      'Filtar za pretraživanje radi na svim kategorijama istovremeno (kod, naziv, završna obrada).',
      'Ako ne vidite artikl, provjerite jeste li ga deaktivirali iz izbornika na retku (prekriženo zvono).',
    ],
  },
  {
    id: 'pricing-add-accessory', category: 'setari', roles: ['all'], order: 11,
    title: 'Dodavanje novog dodatka',
    image: '/manual/setari-adauga-accesoriu.png',
    imageAlt: 'Dijalog Dodaj element — dodatak',
    content: `# Kako dodati novi dodatak

1. Idite na **Postavke → Cijene** i odaberite karticu **Dodaci**.
2. Pritisnite **„Dodaj element"** (gore desno).
3. Ispunite:
- **Kod** — jedinstven; koristi se za deduplikaciju, skeniranje crtičnog koda i grupiranje u PDF-u.
- **Naziv** — prikazan u kalkulatoru i PDF-u.
- **Kategorija / Vrsta** — šarka, ručka, stabilizacijska šipka, kotačići, zaustavljač, brtva itd.
- **Cijena** — u aktivnoj valuti (pohranjuje se u RON).
- **Jed. mj.** — \`pcs\` za komade, \`ml\` za metre dužine, \`m²\` za površinu, \`kg\` za težinu.
- **Završna obrada i boja** — odaberite iz predložaka ili unesite prilagođeni hex; koristi se i u 3D renderiranju.
- **Slika** — učitana u pohranu; pojavljuje se u biraču dodataka i u PDF-u.
4. Označite **„Vrste proizvoda"** gdje se dodatak pojavljuje (tuš, vrata, ograda, ogledalo, paneli, kuhinjska obloga).
5. Označite **„Vrste obrade"** kompatibilne (laminirano, kaljeno, mat).
6. **Spremi** — dodatak odmah postaje dostupan u označenim kalkulatorima.`,
    tips: [
      'Za jedinice mjere različite od komada možete koristiti decimale (npr. 2.5 ml).',
      'Ako ne postavite sliku, automatski se nasljeđuje od roditeljske kategorije.',
    ],
    warnings: [
      'Kod mora biti jedinstven. Ako već postoji, sustav ažurira postojeći artikl umjesto da stvori novi.',
    ],
  },
  {
    id: 'pricing-edit-fields', category: 'setari', roles: ['all'], order: 12,
    title: 'Uređivanje elementa — napredna polja',
    image: '/manual/setari-editare-element.png',
    imageAlt: 'Dijalog Uredi element s odbicima za staklo',
    content: `# Uređivanje elementa — polje po polje

Kliknite na olovku na retku (ili dvoklik) da biste otvorili **Uređivanje elementa**. Osim cijene i jed. mj., imate i ova tehnička polja:

## Cijena i jed. mj.

- Cijena se unosi u aktivnoj valuti iz zaglavlja (RON ili EUR) i interno se pohranjuje u RON.
- Jed. mj. određuje kako se cijena množi u kalkulatoru: \`pcs\` × količina, \`ml\` × duljina, \`m²\` × površina.

## Završna obrada i boja

- **Hex boja** + **hrapavost** koriste se i na popisu cijena i u 3D renderiranju — sinkronizirano putem \`MetalMaterial\`.
- Ako ostavite prazno, nasljeđuje se od roditeljskog elementa (npr. varijanta profila nasljeđuje boju osnovnog profila).

## Odbitak stakla po strani (\`glass_deduction\`)

Koliko **mm** profil ulazi u staklo na svakoj strani gdje je montiran. Kalkulator automatski oduzima ovu vrijednost od bruto dimenzije kako bi se dobilo stvarno staklo za rezanje.

> Primjer: U-profil 8 mm na laminiranom staklu 8 mm → \`8 + 0.38 + 8 = 16.38 mm\` ukupni odbitak (profili + folija + profili, kumulativno).

## Detaljni odbici po strani (\`glass_deductions\`)

JSON s odvojenim \`top\`, \`bottom\`, \`left\`, \`right\`. Koristi se kada profil ima različite vrijednosti na svakom rubu (npr. duboki podni profil + tanki zidni profil). **Kumulira se** s brtvama.

- **\`profile_height\`** (u istom JSON-u) — nadjačava zbroj \`top + bottom\` za U-profil, ako želite jednu ukupnu vrijednost.

## Preklapanje (\`width_overlap\`)

Koliko mm se klizni paneli **preklapaju** preko drugog panela ili zida. Sustav oduzima ovu vrijednost od **korisne širine** kliznog seta.

> Primjer: klizni set 1200 mm s preklapanjem 40 mm → efektivna korisna širina 1160 mm.

## Odbitak za visinu vrata (\`door_height_deduction\`)

mm oduzeti od ukupne visine za **vrata na šarkama** (prostor za šarku gore + prag dolje). Obično 5–20 mm ovisno o šarki.

## Odbitak za visinu fiksnog panela (\`fixed_panel_height_deduction\`)

Isto, ali za fiksni panel. **Zadano 0** — fiksni panel nema automatski odbitak od 10 mm.

## Vrste proizvoda / obrade

Označite gdje se dodatak pojavljuje (tuš, vrata, ograda...) i koje obrade podržava (laminirano, kaljeno). Neoznačeno = ne pojavljuje se u dotičnom kalkulatoru.`,
    tips: [
      'Odbici su **kumulativni**: profil + brtva + laminirana folija zbrajaju se na istoj strani.',
      'Šarke se mjere od **vrha prema dolje**, ručka od **dna prema gore** — to je konvencija koja se poštuje u svim kalkulatorima.',
      'Klizni sustav **ne koristi šarke** — polje za količinu šarki automatski ostaje 0.',
    ],
    warnings: [
      'Svaka promjena odbitaka odmah utječe na **sve buduće 3D izračune**, uključujući nepotvrđene ponude. Već spremljene narudžbe imaju zamrznute podatke u `full_config` i ne mijenjaju se.',
    ],
  },
  {
    id: 'pricing-add-glass', category: 'setari', roles: ['all'], order: 13,
    title: 'Dodavanje vrste stakla',
    image: '/manual/setari-sticla.png',
    imageAlt: 'Postavke → Cijene → Staklo',
    content: `# Staklo

1. Kartica **Staklo** → **„Dodaj element"**.
2. Odaberite **debljinu**: 4 / 6 / 8 / 10 / 12 mm.
3. Odaberite **vrstu**: prozirno, dimljeno, mat (pjeskareno), ogledalo, brončano, sivo.
4. Postavite **cijenu / m²** (u aktivnoj valuti).
5. Označite **obrade** dostupne za ovo staklo: kaljeno, laminirano, polirano, mat.

## Kaljenje

Za kaljenje se cijena izračunava formulom:

\`\`\`text
Cijena kaljenja = Cijena_kaljenja × Debljina_mm × Površina_m²
\`\`\`

Postavite jednu osnovnu cijenu; sustav automatski primjenjuje formulu ovisno o debljini i površini stakla.

## Laminirano

Kod laminiranog stakla, odbici na stranama kumuliraju se s **debljinom folije** (zadano 0.38 mm) na svakom rubu. Pogledajte primjer u odjeljku „Uređivanje elementa”.`,
    tips: [
      'Mat (pjeskareno) staklo obično ima postotnu maržu u odnosu na prozirno — konfigurirate je kao množitelj u polju obrade.',
    ],
  },
  {
    id: 'pricing-add-labor', category: 'setari', roles: ['all'], order: 14,
    title: 'Dodavanje rada',
    image: '/manual/setari-manopera.png',
    imageAlt: 'Postavke → Cijene → Rad',
    content: `# Rad

1. Kartica **Rad** → **„Dodaj element"**.
2. Odaberite **vrstu**: montaža, rezanje, poliranje rubova, bušenje, izrezivanje, prijevoz.
3. Postavite **Jed. mj.**:
- \`sat\` — za montažu
- \`ml\` — za poliranje rubova
- \`kom\` — za rupe, izrezivanja
- \`m²\` — za površinski rad
4. **Cijena** po jedinici.
5. **Postotak naspram fiksne vrijednosti** — označite ako je množitelj (npr. 15% na vrijednost stakla) ili fiksni iznos.
6. Povežite s **vrstama proizvoda** gdje se automatski primjenjuje.`,
    tips: [
      'Postotni rad nije pod utjecajem prekidača EUR/RON — ostaje isti u bilo kojoj valuti.',
    ],
  },
  {
    id: 'pricing-add-kit', category: 'setari', roles: ['all'], order: 15,
    title: 'Setovi dodataka',
    image: '/manual/setari-kituri.png',
    imageAlt: 'Postavke → Setovi',
    content: `# Setovi

**Set** je grupa dodataka prodana kao jedna stavka. Korisno za klizne sustave za tuš: set uključuje profil, kotačiće, zaustavljače, vodilicu.

## Stvaranje seta

1. Idite na **Postavke → Setovi** (ili kartica Setovi u Cijenama).
2. **„Dodaj set"** → kod, naziv, **cijena seta** (konačna), **pokrivena korisna širina**.
3. Dodajte **komponente** — odaberite s popisa dodataka i unesite količinu.
4. Komponente se **dedupliciraju po kodu** — ako se isti kod pojavi dvaput, količine se zbrajaju.

## Korištenje u kalkulatoru

U kalkulatoru za **klizni tuš**, odaberite set iz padajućeg izbornika. Sustav izračunava:

\`\`\`text
Efektivna korisna širina = Širina_seta - width_overlap
\`\`\`

i automatski primjenjuje **0 šarki** (klizni sustav nema šarke).`,
    tips: [
      'Cijene komponenti su informativne — **cijena seta prevladava** u ponudi.',
      'Slika seta se pojavljuje u PDF-u; ako nedostaje, koristi se slika glavnog profila.',
    ],
  },
  {
    id: 'pricing-reset', category: 'setari', roles: ['all'], order: 16,
    title: 'Vrati na katalošku vrijednost',
    image: '/manual/setari-reset.png',
    imageAlt: 'Gumb Vrati na katalošku vrijednost',
    content: `# Resetiranje osobne promjene

Ako ste izmijenili cijenu ili odbitak i želite se vratiti na **standardnu vrijednost iz globalnog kataloga**:

1. Otvorite **Uređivanje elementa**.
2. Pritisnite **„Vrati na katalošku vrijednost"** (dolje lijevo u dijalogu).
3. Vaša osobna promjena iz \`pricing_config\` se briše i artikl ponovno prikazuje adminovu vrijednost.

> Resetiranje utječe **samo na dotični artikl**. Ostale vaše osobne promjene ostaju netaknute.`,
    warnings: [
      'Akcija je trenutna i ne može se poništiti. Ako trebate povijest, izvezite cijene (Postavke → Izvoz podataka) prije resetiranja.',
    ],
  },

  // ====== New sections — for subscribers ======
// ====== Secțiuni noi — pentru abonați ======
  {
    id: 'dashboard-home', category: 'introducere', roles: ['all'], order: 0,
    title: 'Glavna nadzorna ploča',
    image: '/manual/dashboard-home.png',
    imageAlt: 'Glavna nadzorna ploča',
    content: `# Glavna nadzorna ploča

Nakon prijave dolazite na **početnu stranicu (\`/\`)** — kontrolnu ploču s ključnim pokazateljima vašeg poslovanja, ažuriranim u stvarnom vremenu.

## Što vidite

- **Gornji KPI-jevi**: prihod, narudžbe u obradi, isporučene narudžbe u tekućem mjesecu, prosječna vrijednost narudžbe.
- **Grafikon prodaje** za posljednjih 12 mjeseci (stupci, s usporedbom prethodne godine).
- **Grafikon prihoda** po kategorijama proizvoda (tuševi, vrata, ograde, ogledala, kuhinja, paneli).
- **Najprodavaniji proizvodi** u odabranom razdoblju.
- **Kritično stanje zaliha** — materijali s količinom ispod konfiguriranog minimalnog praga.
- **Nedavne narudžbe** — posljednjih 10 narudžbi sa statusom i klijentom, s izravnim klikom na narudžbu.

## Filtri

Prekidač **RON / EUR** na gornjoj traci utječe na sve ovdje prikazane vrijednosti (dinamička konverzija, bez PDV-a).
`,
    tips: [
      'Nadzorna ploča se automatski ponovno učitava pri svakoj promjeni valute ili jezika.',
      'Za operativni pregled (proizvodnja, montaža, servis) koristite izbornik *Operativna nadzorna ploča*.',
    ],
  },
  {
    id: 'announcements', category: 'introducere', roles: ['all'], order: 3,
    title: 'Obavijesti i notifikacije',
    image: '/manual/announcements.png',
    imageAlt: 'Obavijesti i notifikacije',
    content: `# Obavijesti i notifikacije

Ikona 🔔 **žutog zvona** na gornjoj traci prikazuje obavijesti koje objavljuje iSoftGlass tim: ažuriranja, nove funkcionalnosti, planirano održavanje.

## Kako radi

- Crveni broj na zvonu = **nepročitane** obavijesti.
- Klikom na zvono otvara se popis — svaka obavijest ima naslov, kategoriju (**Ažuriranje** ili **Informacija**), datum i cjelokupni sadržaj.
- Obavijesti se automatski označavaju kao pročitane kada ih otvorite.
- Važne obavijesti tipa **Ažuriranje** također se pojavljuju kao **notifikacija na vrhu stranice** pri izlasku nove verzije.

## Kategorije

- **Ažuriranje** — nova verzija, dodane funkcionalnosti, ispravci.
- **Informacija** — opće informacije, savjeti, događaji.

Obavijesti se automatski prevode na jezik vašeg sučelja.
`,
    tips: [
      'Redovito provjeravajte obavijesti kako biste saznali o novim funkcionalnostima koje vam mogu uštedjeti vrijeme.',
    ],
  },
  {
    id: 'currency-language', category: 'introducere', roles: ['all'], order: 4,
    title: 'Valuta i jezik',
    image: '/manual/currency-language.png',
    imageAlt: 'Valuta i jezik',
    content: `# Valuta i jezik

## Prekidač RON / EUR

Gumb **RON / EUR** na gornjoj traci mijenja valutu prikazanu u cijeloj aplikaciji — 3D kalkulatori, ponude, narudžbe, izvještaji, nadzorna ploča.

- **Interno pohranjivanje** se vrši **uvijek u RON**. EUR je samo prikaz, dinamički izračunat prema tečaju postavljenom u *Postavke → Tvrtka*.
- **Sve vrijednosti su bez PDV-a** u internim izračunima; PDV se primjenjuje samo pri generiranju računa.
- Možete unositi vrijednosti u EUR — automatski se pretvaraju u RON pri spremanju.

## Izbornik jezika

Gumb **🇷🇴 RO** otvara popis s **9 dostupnih jezika**: Română, English, Italiano, Deutsch, Polski, Français, Español, Nederlands, Hrvatski.

- Promjena jezika utječe **samo na sučelje** (izbornici, gumbi, oznake, priručnik).
- Podaci koje ste unijeli (nazivi klijenata, opisi, bilješke) ostaju na izvornom jeziku.
- Postavka se sprema za vaš račun između sesija.
`,
    tips: [
      'Tečaj EUR-a ažurira se samo kada ga ručno promijenite u Postavke → Tvrtka.',
      'Korisnički priručnik u potpunosti je preveden na svih 9 jezika.',
    ],
  },
  {
    id: 'working-in-eur', category: 'introducere', roles: ['all'], order: 5,
    title: 'Rad isključivo u EUR (preporučeno za pretplatnike izvan RO)',
    image: '/manual/working-in-eur.png',
    imageAlt: 'Postavke → Cijene — EUR tečaj',
    content: `# Rad isključivo u EUR

Ovaj vodič namijenjen je pretplatnicima koji rade **100% u EUR** — kupuju od dobavljača u EUR i prodaju klijentima u EUR, bez miješanja RON u katalogu.

## Kako funkcionira interno pohranjivanje

- Sve cijene pohranjuju se u bazi podataka kao jedan broj.
- Interna tehnička oznaka je „RON", ali je za vas **nebitna** — nikada je ne vidite u sučelju.
- Prekidač **EUR** u gornjoj traci izvodi konverziju prikaza koristeći tečaj postavljen u *Postavke → Cijene*.

## Problem koji izbjegavate

Ako ostavite zadani tečaj (npr. \`EUR tečaj = 4,97\`) i unesete šarku po cijeni **100 EUR**, sustav interno pohranjuje \`497\`. Sutra, ako se tečaj promijeni na \`5,02\`, isti proizvod pojavljuje se kao **99,00 EUR** u katalogu — bez vaše izmjene.

Ovaj „drift" matematički je točan, ali stvara zbunjenost i izgleda kao greška.

## Preporučena konfiguracija — 3 koraka

1. **Postavke → Cijene** → postavite **EUR tečaj = 1**.
2. U gornjoj traci odaberite **EUR** kao aktivnu valutu.
3. Unesite sve cijene izravno u EUR u *Postavke → Cijene* (i u nove narudžbe).

## Što dobivate

- Cijene ostaju **apsolutno stabilne** — 100 EUR danas = 100 EUR za godinu dana.
- Nulta konverzija pri spremanju, **nulti drift**.
- PDF-ovi ponuda, narudžbe i izvještaji izlaze prirodno u EUR.
- Povijesne narudžbe više se ne „pomiču" kroz vrijeme.

## Što se NE mijenja

- Interna oznaka „RON" ostaje u bazi podataka (nevidljiva u sučelju).
- Sva logika aplikacije radi identično — nijedna funkcionalnost nije izgubljena.

## Ograničenja — kada NE koristiti ovu konfiguraciju

- Ako imate **dobavljače u RON** i klijente u EUR (mješoviti tijek) → potreban vam je stvarni tečaj.
- Ako radite u drugoj valuti (PLN, HRK, itd.) → kontaktirajte iSoftGlass tim za proširenje.
`,
    tips: [
      'Postavljanje EUR tečaj = 1 utječe samo na konverziju prikaza — ne mijenja niti jednu već spremljenu vrijednost.',
      'Preporučuje se napraviti ovu konfiguraciju prije unosa prvih cijena u katalog.',
    ],
  },
  {
    id: 'production-scanner', category: 'productie', roles: ['all'], order: 2,
    title: 'Skener za proizvodnju (barkodovi)',
    image: '/manual/production-scanner.png',
    imageAlt: 'Skener za proizvodnju (barkodovi)',
    content: `# Skener za proizvodnju

Stranica **Proizvodnja → Skener** (\`/productie/scanner\`) omogućuje vam brzo premještanje narudžbi između Kanban faza pomoću **skenera za barkodove CODE128** spojenog kao HID tipkovnica.

## Kako radi

1. Otvorite stranicu **Skener**. Polje za unos ima stalni autofokus.
2. **Skenirajte barkod** s proizvodnog lista ili etikete proizvoda.
3. Aplikacija automatski identificira narudžbu i **pomiče je u sljedeću fazu** na Kanbanu (npr.: *Rezanje* → *Brušenje*, *Brušenje* → *Kaljenje*).
4. Potvrda se prikazuje na ekranu sa zvukom i zelenom bojom; greška (nepoznati kod) s crvenom bojom.

## Zahtjevi

- Skener CODE128 konfiguriran kao **HID keyboard** (standardni način rada, bez upravljačkih programa).
- Sufiks **Enter (\\r)** nakon svakog skeniranja (zadana postavka na većini modela).

## Prednosti

- Operater više ne mora ručno tražiti narudžbe na Kanbanu.
- Potpuna sljedivost: vrijeme svake faze automatski se sprema.
- Radi i na tabletu s Bluetooth skenerom.
`,
    tips: [
      'Ako izgubite fokus s polja za unos (klikom negdje drugdje), jednostavno skeniranje ga automatski vraća.',
      'Polje ignorira ručni unos sporiji od 50 ms — samo skener pokreće premještanje.',
    ],
    warnings: [
      'Skeniranje koda koji je već u posljednjoj fazi nema nikakav učinak — narudžba ostaje tamo.',
    ],
  },
  {
    id: 'processing-cad', category: 'productie', roles: ['all'], order: 3,
    title: 'Obrade i CAD Editor',
    image: '/manual/processing-cad.png',
    imageAlt: 'Obrade i CAD Editor',
    content: `# Obrade i CAD Editor

Stranica **Obrade** (\`/prelucrari\`) je tehnička radionica za proizvodne listove: rupe, šarke, ručke, izrezi, obrade rubova — sve vizualizirano na staklu u interaktivnom CAD editoru.

## Radni nalog za obradu

- Potpuni popis panela u narudžbi (s dimenzijama i vrstom stakla).
- Za svaki panel: popis obrada (kod predloška + parametri: udaljenost, promjer, odmak).
- Mnoge obrade se **automatski popunjavaju** iz 3D konfiguracije (šarke, ručke, brave) — uređujete samo iznimke.

## CAD Editor — brze naredbe

| Tipka | Radnja |
|---|---|
| **J** | SPOJI (JOIN) — spaja dvije bliske obrade (tolerancija 10 mm) |
| **Ctrl + D** | Dupliciraj odabranu obradu |
| **Ctrl + Shift + D** | Dupliciraj **sve** obrade na drugi panel (automatsko zrcaljenje po X osi) |
| **Delete** | Izbriši odabranu obradu |
| **Lijevi klik + povlačenje** | Premjesti obradu |
| **Kotačić miša** | Zumiranje (Zoom) |

## Predlošci

Katalog **Predlošci obrada** (kategorije: **30. šarke & cutout-uri**, **51. rupe za ručke**) automatski se sinkronizira s odabranim okovima u 3D prikazu. Dodavanje nove šarke u katalog generira ispravan izrez na staklu.

## Izvoz

- **DXF** (R9 → R2010) — za industrijski CNC, s mapiranjem slojeva (layera).
- **PDF** — za radionicu, s kotama i legendom obrada.
- Gumb **"Pošalji na CNC"** generira kombinirani DXF + popis za rezanje.
`,
    tips: [
      'Korak pozicioniranja je 0.5 mm; koristite zarez za decimale.',
      'Neodabrani elementi prikazani su crno — odaberite ih da biste vidjeli kote i parametre.',
    ],
    warnings: [
      'Promjene na panelu spremaju se samo kada pritisnete **Spremi obradu** — promjena stranice bez spremanja gubi promjene.',
    ],
  },
  {
    id: 'operational-dashboard', category: 'operational', roles: ['all'], order: 0,
    title: 'Operativna nadzorna ploča',
    image: '/manual/operational-dashboard.png',
    imageAlt: 'Operativna nadzorna ploča',
    content: `# Operativna nadzorna ploča

Stranica **Operativna nadzorna ploča** (\`/operational\`) je jedinstvena ploča za radionicu i logistiku: u stvarnom vremenu vidite što se događa u proizvodnji, montaži, servisu i rezanju.

## Sažete kartice

- **Proizvodnja**: broj narudžbi u svakoj Kanban fazi (rezanje, brušenje, kaljenje, sastavljanje, pakiranje).
- **Montaža**: radovi zakazani za danas / ovaj tjedan, kašnjenja.
- **Servis**: otvorene intervencije, prioritet, SLA.
- **Rezanje**: paneli u redu za optimizaciju, staklo dodijeljeno po ploči.

## Automatsko osvježavanje

Stranica se **automatski ponovno učitava svakih 60 sekundi** — možete ostaviti TV ekran u radionici da je trajno prikazuje.

## Brze radnje

- Klik na bilo koju karticu vodi vas izravno na detaljnu stranicu (Kanban proizvodnja, popis montaža, itd.).
- Gumb **"Osvježi sada"** prisilno pokreće trenutačno ažuriranje.
`,
    tips: [
      'Koristite ovu stranicu na velikom ekranu u radionici za vidljivost na razini tima.',
      'Za financijske pokazatelje (prihod, marže) koristite glavnu nadzornu ploču.',
    ],
  },
  {
    id: 'reports', category: 'operational', roles: ['all'], order: 3,
    title: 'Izvještaji',
    image: '/manual/reports.png',
    imageAlt: 'Izvještaji',
    content: `# Izvještaji

Stranica **Izvještaji** (\`/rapoarte\`) pruža vam potpunu vidljivost prodaje i potrošnje materijala.

## Dostupni izvještaji

1. **Mjesečna prodaja** — prihod po mjesecu, raščlanjen po kategorijama (tuševi, vrata, ograde itd.) i po prodajnom operateru.
2. **Potrošnja materijala** — količine stakla, profila i okova potrošene u određenom razdoblju, agregirano po kodu proizvoda.
3. **Najbolji klijenti** — poredak prema vrijednosti narudžbi u odabranom razdoblju.
4. **Marže** — razlika između troška proizvodnje i prodajne cijene, po narudžbi.

## Filtri

- **Vremenski interval** (kalendar od / do).
- **Kategorija proizvoda**.
- **Operater** (prodavač).
- **Status narudžbe** (ponuda, potvrđena, u proizvodnji, isporučena).

## Izvoz

Svi se izvještaji izvoze u **CSV** formatu s **BOM UTF-8** (Excel ispravno otvara hrvatske dijakritičke znakove).

Vrijednosti poštuju globalni prekidač **RON / EUR**.
`,
    tips: [
      'Za vanjsku analizu u Excelu koristite CSV izvoz — BOM osigurava da se dijakritički znakovi ispravno prikazuju.',
      'Filtri se spremaju za vaš račun između sesija.',
    ],
  },
  {
    id: 'installation-reports', category: 'operational', roles: ['all'], order: 4,
    title: 'Izvještaji o montaži',
    image: '/manual/installation-reports.png',
    imageAlt: 'Izvještaji o montaži',
    content: `# Izvještaji o montaži

Stranica **Izvještaji o montaži** (\`/rapoarte-montaj\`) prati učinkovitost instalaterskih timova i optimizira planiranje.

## Što vidite

- **Učinkovitost po timu**: broj dovršenih montaža, prosječno vrijeme po poslu, prijeđena udaljenost.
- **Karta s optimiziranim rutama** — sustav predlaže optimalan redoslijed dnevnih poslova za svaki tim (algoritam za minimiziranje udaljenosti).
- **Kontrolni popis za završetak (Checklist)** — postotak ispravno popunjenih kontrolnih popisa, potpisi klijenata.
- **Incidenti** — odgođeni radovi, reklamacije, povrati.

## Filtri

- **Interval** (dan / tjedan / mjesec).
- **Tim** ili **vozilo**.
- **Geografsko područje**.

## Brze radnje

- Klik na posao otvara potpune detalje: klijent, adresa, proizvodi, fotografije prije/poslije, potpis.
- Gumb **"Promijeni termin"** premješta posao u kalendar bez gubitka popunjenog kontrolnog popisa.
`,
    tips: [
      'Optimizirana ruta uzima u obzir raspored svakog tima i vremenske okvire potvrđene s klijentima.',
      'Upozorenja o tehničkom pregledu/osiguranju za vozila pojavljuju se 30 dana prije isteka.',
    ],
  },
  {
    id: 'data-export', category: 'setari', roles: ['all'], order: 17,
    title: 'Izvoz i uvoz podataka',
    image: '/manual/export-date.png',
    imageAlt: 'Postavke › Podaci — izvoz i uvoz',
    accent: 'green',
    content: `# Izvoz i uvoz podataka

U **Postavke → Podaci** imaš potpunu kontrolu nad podacima unesenima u platformu. Svi podaci pripadaju pretplatniku, strogo su izolirani po tvrtki (RLS na \`company_id\`) i **mogu se izvesti ili ponovno uvesti u bilo kojem trenutku, bez ikakvih ograničenja**.

---

## 1. Izvoz podataka

![Područje izvoza](/manual/export-date.png)

Kartica **Izvoz podataka** nudi 5 gumba:

- **Klijenti (CSV)** — potpuni popis s imenom, tipom, tvrtkom, kontaktom, adresom, OIB, popustom, bilješkama.
- **Ponude (CSV)** — sve ponude s ref. br., proizvodom, klijentom, cijenom, PDV-om, maržom, statusom, datumom.
- **Narudžbe (CSV)** — narudžbe s brojem, statusom, podzbrojem, popustom, ukupnim iznosom, plaćenim, dostavom.
- **Materijali (CSV)** — vlastiti katalog s kodom, nazivom, tipom, jedinicom, cijenom, zalihom, dobavljačem.
- **Potpuni izvoz (JSON)** — jedna datoteka sa svim 4 tablice + vremenska oznaka (\`exported_at\`).

### Kako izvesti

1. Idi na **Postavke → kartica Podaci**.
2. Klikni gumb željene kategorije (ili **Potpuni izvoz** za sve).
3. Datoteka se automatski preuzima. Naziv sadrži datum: \`klijenti_2026-05-22.csv\`, \`potpuni_izvoz_2026-05-22.json\`.
4. Otvori CSV izravno u Excelu / LibreOfficeu (UTF-8 BOM jamči ispravne znakove) ili JSON u uređivaču teksta.

> **Važno za pretplatnike:** imaš GDPR pravo na **prenosivost podataka**. Možeš izvoziti i lokalno čuvati sve svoje podatke, uvijek i koliko god puta želiš, bez ograničenja.

---

## 2. Uvoz podataka

![Područje uvoza](/manual/export-date-import.png)

Kartica **Uvoz podataka** omogućuje ti da u platformu vratiš CSV datoteke (po kategoriji) ili prethodno spremljeni potpuni JSON. Korisno za:

- **migraciju** s drugog sustava (pripremi CSV s istim zaglavljima kao izvoz),
- **vraćanje** nakon slučajnog brisanja (s posljednjim potpunim izvozom),
- **masovno učitavanje** klijenata, materijala ili ponuda.

### Kako uvesti

1. U kartici **Uvoz podataka** klikni gumb kategorije (Klijenti / Ponude / Narudžbe / Materijali) za CSV, ili **Potpuni uvoz** za JSON.
2. Odaberi datoteku s računala.
3. Otvara se **dijalog pregleda** koji prikazuje: ciljnu tablicu, broj otkrivenih zapisa i prve pronađene stupce.
4. Provjeri podatke i klikni **Potvrdi uvoz** (ili Odustani).
5. Na kraju se pojavljuje obavijest s brojem uspješno uvezenih redova / pogrešaka.

### Ključevi konflikta (duplikati)

Uvoz koristi jedinstveni ključ po tablici:

| Tablica | Ključ konflikta |
|---|---|
| Klijenti | \`name\` |
| Ponude | \`ref_number\` |
| Narudžbe | \`order_number\` |
| Materijali | \`code\` |

Redovi s već postojećim ključem mogu biti **prepisani** — napravi izvoz prije uvoza ako želiš sigurnosnu kopiju.

### Očekivani format

- **CSV** — isti skup zaglavlja kao u odgovarajućem izvozu, UTF-8 kodiranje.
- **JSON** — točno struktura proizvedena **Potpunim izvozom** (\`clients\`, \`quotes\`, \`orders\`, \`materials\` + \`exported_at\`).

---

## Tehnički detalji

- Izvoz preuzima **sve zapise**, s automatskom paginacijom od 1000 u pozadini.
- Uvoz obrađuje serije od 100 redaka i automatski ubacuje kontekst tvrtke (RLS).
- Sve što izvoziš/uvoziš izolirano je na tvoju tvrtku.
`,
    tips: [
      'Mjesečno radi potpuni (JSON) izvoz — to je najsigurniji oblik lokalne sigurnosne kopije.',
      'Prije svakog masovnog uvoza izvezi ciljnu tablicu kako bi imao prethodnu verziju pri ruci.',
      'Za CSV s posebnim znakovima, otvori u Excelu putem *Podaci → Iz teksta/CSV* s UTF-8.',
    ],
  },
  {
    id: 'data-protection', category: 'setari', roles: ['all'], order: 18,
    title: 'Zaštita podataka',
    image: '/manual/protectia-datelor.png',
    imageAlt: 'Kartice Sigurnosna kopija / Oporavak / Sigurnost',
    content: `# Zaštita podataka

Sigurnost i dostupnost vaših podataka glavni su prioritet. Platforma se izvodi na **Lovable Cloud infrastrukturi**, s višeslojnom zaštitom i GDPR usklađenošću.

## Automatska sigurnosna kopija

- **Dnevna automatska kopija**, bez intervencije s vaše strane.
- Povijest najmanje 7 dana (Point-in-Time Recovery).
- Kopije su šifrirane i redundantno pohranjene u europskim podatkovnim centrima.

## Oporavak

- U slučaju slučajnog gubitka, podaci se mogu oporaviti na zahtjev putem tima za podršku.
- Preporučujemo i **periodični lokalni izvoz** (sekcija *Izvoz podataka*).

## Sigurnost

- **Stroga multi-tenant izolacija** putem Row-Level Security na \`company_id\`.
- **Šifriranje u prijenosu** (HTTPS/TLS) i **u mirovanju** na disku.
- **JWT** za sesije, **snažno hashiranje** lozinki.
- Provjera **HIBP** pri stvaranju računa i promjeni lozinke.
- Europski podatkovni centri, **GDPR** sukladnost.

## Vaša GDPR prava

| Pravo | Kako ga ostvariti |
|---|---|
| Prenosivost | Izvoz iz Postavke → Podaci |
| Pristup | Vidite sve svoje podatke u platformi |
| Ispravak | Uredite bilo koje polje u namjenskim sučeljima |
| Brisanje | Na zahtjev putem podrške (\`isoftplustech@gmail.com\`) |

## Preporuke

- Koristite **jaku i jedinstvenu lozinku**.
- Ne dijelite račun — za kolege stvorite namjenske korisnike (Postavke → Tim).
- **Odjavite se** na javnim ili dijeljenim uređajima.
- Napravite **mjesečni izvoz** i pohranite datoteku na sigurno mjesto.
- Pogledajte [Pravila privatnosti](/privacy-policy) i [Politiku kolačića](/cookie-policy).
`,
    tips: [
      'Vaši podaci ostaju vaši: uvijek se mogu izvesti u otvorenom formatu (CSV/JSON).',
      'Najsigurnija kombinacija: automatska kopija platforme + mjesečni lokalni izvoz.',
    ],
    warnings: [
      'Nikada ne šaljite lozinku e-poštom, chatom ili telefonom — podrška je nikada neće tražiti.',
    ],
  },
];
