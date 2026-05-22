import type { ManualSection, ManualCategory } from './types';

export const categoriesRO: ManualCategory[] = [
  { id: 'introducere', label: 'Primii pași', order: 1 },
  { id: 'calculatoare', label: 'Calculatoare 3D', order: 2 },
  { id: 'vanzari', label: 'Vânzări', order: 3 },
  { id: 'productie', label: 'Producție', order: 4 },
  { id: 'operational', label: 'Operațional', order: 5 },
  { id: 'setari', label: 'Setări', order: 6 },
];

export const sectionsRO: ManualSection[] = [
  {
    id: 'getting-started', category: 'introducere', roles: ['all'], order: 1,
    title: 'Bun venit în iSoftGlass',
    image: '/manual/setari-companie.png',
    imageAlt: 'Ecran iSoftGlass — Informații companie',
    content: `# Bun venit în iSoftGlass

iSoftGlass este platforma **SaaS** pentru producători și distribuitori de sticlă. Acoperă tot fluxul: configurare 3D → ofertă → comandă → producție → livrare → service.

## Ce poți face în 5 minute

1. **Completează datele companiei** în *Setări → Companie* (CUI, adresă, IBAN, logo).
2. **Verifică prețurile** în *Setări → Prețuri* — sunt încărcate automat catalogul standard, ajustezi doar ce diferă.
3. **Adaugă primul client** în *Clienți → Client nou* (sau lasă să se creeze automat când salvezi prima ofertă).
4. **Deschide un calculator 3D** din meniul lateral (ex: *Cabine duș*) și configurează în 6 pași.
5. **Salvează ca ofertă** — apare în *Comenzi* cu PDF gata de trimis.
6. **Trimite în producție** când clientul confirmă — stocul se deduce automat.
`,
    tips: [
      'Bara de sus are comutator RON / EUR — prețurile interne sunt mereu în RON, e doar afișaj.',
      'Apasă pe iconul 📖 (teal) oricând pentru a redeschide acest manual exact pe secțiunea curentă.',
    ],
  },
  {
    id: 'header-icons', category: 'introducere', roles: ['all'], order: 2,
    title: 'Bara de sus și comenzi rapide',
    content: `# Bara de sus

În colțul dreapta sus ai toate comenzile globale:

1. 🔔 **Clopoțel galben (amber)** — anunțuri și noutăți publicate de echipa iSoftGlass. Numărul roșu = anunțuri necitite.
2. 📖 **Manual (contur teal)** — manualul pe care îl vezi acum. Se deschide pe secțiunea relevantă pentru pagina curentă.
3. **RON / EUR** — schimbă moneda afișată în toată aplicația. Conversia folosește cursul din *Setări → Companie*.
4. **🇷🇴 RO** — selector limbă. Suportăm 9 limbi (RO, EN, IT, DE, PL, FR, ES, NL, HR).
5. **Logout** — deconectare sigură din cont.

## Sidebar — meniul stâng

- **Main** — Dashboard, Calculatoare 3D, Setări
- **Operational** — Comenzi, Producție, Scanner, Clienți, Rapoarte, Montaj
- Click pe buton **⬅** lângă logo pentru a colapsa sidebar-ul (mai mult spațiu pe ecran).
`,
    tips: [
      'Stocarea internă a prețurilor e mereu în RON — schimbarea în EUR e doar afișaj.',
      'Schimbarea limbii afectează doar interfața; datele introduse rămân în limba originală.',
    ],
  },

  // ====== Calculatoare 3D ======
  {
    id: 'calc-flow-6-steps', category: 'calculatoare', roles: ['all'], order: -1,
    title: 'Cei 6 pași într-un calculator 3D',
    image: '/manual/calc-step6-finalizare.png',
    imageAlt: 'Pasul 6 - finalizare ofertă cu date client și butoane PDF/Salvează/Adaugă în coș',
    content: `# Cei 6 pași într-un calculator 3D

Orice calculator 3D (cabină duș, ușă, balustradă, oglindă, front bucătărie, panou) urmează **același flux liniar în 6 pași**. La fiecare pas ai în dreapta vizualizarea 3D care se actualizează în timp real, iar progresul e marcat în bara de sus.

---

## Pasul 1 — Tip produs

Alegi forma sau tipologia (ex: **Colț 90°**, **Walk-in / Niche**, **Pentagon**, **Paravan cadă**, **Panou fix**). Fiecare tip preîncarcă geometria de bază și lista de profile potrivite.

![Pasul 1 - selectare tip produs](/manual/calc-step1-tip.png)

## Pasul 2 — Sistem de deschidere

Alegi modul de operare: **cu balamale** (clasic), **pivot** sus-jos (minimalist) sau **glisant** pe șină (economie de spațiu). Selecția aici determină automat ce accesorii vei putea adăuga la Pasul 5.

![Pasul 2 - sistem deschidere](/manual/calc-step2-dimensiuni.png)

## Pasul 3 — Sticlă

Setezi **grosimea** (6/8/10/12 mm), **finisajul** (transparent, gri, bronz, sablat) și opțiuni: **tratament anti-calcar**, **șlefuire margini**, **securizare**, **laminare**. Prețul sticlei se recalculează instant.

![Pasul 3 - alegere sticlă](/manual/calc-step3-sticla.png)

## Pasul 4 — Configurație ușă & dimensiuni

Stabilești **partea de deschidere** (frontal / lateral), **direcția** (interior / exterior), **partea balamalei** (stânga / dreapta) și **dimensiunile** finale (lățime × înălțime × adâncime). Click pe orice cotă din scena 3D pentru editare rapidă (Enter / Tab salvează).

![Pasul 4 - ușă și dimensiuni](/manual/calc-step4-profile.png)

## Pasul 5 — Profile & accesorii

Alegi din liste personalizate: **profile garnituri**, **profile U / perimetru**, **bare stabilizare**, **kit-uri extra**. Pentru detaliile complete despre cum funcționează acest pas, vezi secțiunea **„Cum funcționează accesoriile în calculatoare"**.

![Pasul 5 - profile și accesorii](/manual/calc-step5-accesorii.png)

---

## Pasul 6 — Finalizare ofertă (detaliat)

Aici transformi configurația în acțiune comercială. Pasul 6 are 3 zone clare: **date client**, **sumă suplimentară & total**, **butoane de acțiune**.

![Pasul 6 - finalizare](/manual/calc-step6-finalizare.png)

### Date client (Client info)

- **Tip Client** — Persoană fizică / Firmă / Distribuitor. **Foarte important**: tipul ales aici aplică automat adaosul configurat în **Setări → Adaos Clienți**, deci prețul afișat ține deja cont de marja per tip.
- **Nume client** — denumirea care apare pe ofertă și pe PDF.
- **Telefon** & **Email** — date de contact folosite în CRM și pentru trimitere ofertă.

> La salvare, dacă numele clientului nu există în baza CRM, sistemul **creează automat o fișă nouă**. Dacă există, o folosește pe cea existentă (potrivire după nume).

### Sumă suplimentară (Extra amount)

Câmpul **„Extra amount" / „Sumă suplimentară"** îți permite să adaugi o sumă liberă peste subtotalul calculat. La ce folosește în practică:

- **Transport** către client (ex: +150 RON livrare).
- **Montaj suplimentar** dincolo de pachetul standard.
- **Manoperă specială** (ex: foraj în granit, piese ne-standard).
- **Suprataxă urgență** când lucrarea trebuie executată prioritar.
- **Discount comercial** — introduci o valoare **negativă** (ex: -50 RON) și se scade din total.

Suma se adună la subtotal **înainte** de TVA și apare separat pe PDF, transparent față de client.

### Subtotal, TVA și total

Cardul afișează în timp real: **Subtotal (fără TVA)**, **TVA %** (din setări) și **Total cu TVA**. Modificarea oricărui parametru (sticlă, accesoriu, sumă suplimentară) recalculează instant.

### Cele 3 butoane de acțiune

1. **Descarcă PDF** — generează oferta PDF (logo companie, date client, listă produse cu snapshot 3D 70×47 px, accesorii agregate după cod, manoperă, total cu TVA). **Folosit pentru** trimitere rapidă pe email / WhatsApp, **fără** a salva în sistem. Util când vrei doar o cotație orientativă.

2. **Salvează ofertă** — creează în baza de date o ofertă cu număr **OFR-YYYYMMDD-HHMMSS** și o **comandă cu status „Ofertă"**. **Folosit când** oferta e fermă și vrei să o regăsești ulterior în **Comenzi**, să o re-editezi sau să o transformi în lucrare.

3. **Adaugă în coș** — adaugă produsul curent în **coșul activ** (icon dreapta-jos cu badge contor) **fără** a încheia comanda. **Folosit pentru** oferte cu mai multe produse: ex. duș + oglindă + front bucătărie pentru același client — adaugi pe rând, apoi finalizezi tot coșul ca o singură comandă.

---

## Ce se întâmplă după „Adaugă în coș"

![Coșul cu produsele adăugate](/manual/cos-flow.png)

### 1. Coșul (icon dreapta-jos)

Click pe iconul coș cu badge contor și se deschide panoul lateral **Order Products**:

- Listează toate produsele adăugate, fiecare cu **dimensiuni**, **grosime sticlă** și **preț**.
- Butoane **+ / -** pentru cantitate pe fiecare poziție.
- Iconul **coș de gunoi** roșu șterge poziția.
- Buton **„Empty" / „Golește"** elimină tot coșul.
- Jos: **Order total** (suma tuturor produselor).

### 2. Finalizează comanda

Apeși **„Finalize" / „Finalizează"** și se deschide dialogul **Create order from cart**:

![Dialog finalizare comandă](/manual/cos-finalizare.png)

- **Cart products** — recapitulare produse din coș cu total.
- **Client** — datele clientului (preluate automat din ultimul produs adăugat).
- **Delivery Address** — adresa de livrare / montaj.
- **Delivery Date** — termen estimat.
- **Notes** — observații interne.

Apeși **Create Order**: sistemul generează un număr de comandă unic și plasează comanda în **Gestionare Comenzi** cu status **„Ofertă"**.

### 3. În Gestionare Comenzi

Comanda apare imediat în listă. De aici:

- **Descarci PDF** consolidat (toate produsele agregate, accesoriile însumate după cod).
- **Trimiți în producție** — deduce automat stocul, creează fișa de producție și cardul Kanban.
- **Emiți factură** sau **proformă (avans)**.
- **Programezi montaj** către echipa de instalare.
- **Deschizi comanda** (click pe rând) pentru tab-urile **Detalii / Produse / Istoric / Previzualizare**.

### 4. Editare ulterioară

Din tab-ul **Produse** al unei comenzi, butonul **Editează** te trimite înapoi în calculatorul original cu **toată configurația restaurată** din \`full_config\` — inclusiv tip client, sumă suplimentară, accesorii. Modifici → Salvezi → comanda se actualizează automat.
`,
    tips: [
      'La Pasul 6, schimbarea **Tip Client** între Persoană / Firmă / Distribuitor recalculează instant întreg subtotalul cu adaosul corect.',
      'Folosește **Descarcă PDF** pentru cotații rapide pe email, și **Salvează ofertă** doar când oferta e fermă — eviți să umpli istoricul cu ciorne.',
      'Coșul îți permite să configurezi mai multe produse pentru același client și să le trimiți într-o **singură comandă** cu un singur PDF agregat.',
      'Toată configurația (inclusiv suma suplimentară și tipul de client) se salvează în `full_config` — la re-deschidere, totul revine exact așa cum era.',
    ],
    warnings: [
      'Suma suplimentară negativă (discount) NU verifică să nu coboare totalul sub zero — fii atent la valoare.',
      'Dacă schimbi prețurile în Setări **după** ce ai salvat o ofertă, ofertele vechi **nu** se recalculează automat — păstrează valorile inițiale.',
    ],
  },
  {
    id: 'accessory-flow', category: 'calculatoare', roles: ['all'], order: 0,
    title: 'Cum funcționează accesoriile în calculatoare',
    image: '/manual/accesorii-import.png',
    imageAlt: 'Catalog accesorii — buton Importă în lista mea',
    content: `# Cum funcționează accesoriile în calculatoare

Toate calculatoarele 3D (Cabină duș, Uși, Balustradă, Oglindă, Front bucătărie, Pereți despărțitori) folosesc **același sistem** pentru accesorii: balamale, mânere, profile U, bare stabilizare, kit-uri glisare, opritori, încuietori etc.

Logica este simplă și se face **o singură dată**:

> **Importi din catalog → se memorează în „Selectează produs" → le folosești oriunde, în orice ofertă.**

Nu trebuie să cauți accesoriul din nou la fiecare lucrare — odată importat, rămâne în lista ta personală până decizi tu să-l scoți.

---

## Pasul 1 — Deschide catalogul de accesorii

Mergi în **Setări → Prețuri → Accesorii** (sau direct **Setări → Catalog accesorii**, în funcție de varianta interfeței).

Aici vezi catalogul global al sistemului — mii de coduri grupate pe categorii: balamale, mânere, profile U, kit-uri glisare, garnituri, bare stabilizare, opritori, încuietori, suporți, capace.

![Catalog accesorii](/manual/accesorii-import.png)

- Folosește **căutarea transversală** (sus) — caută după cod, denumire sau finisaj, în toate categoriile.
- Filtrele laterale restrâng pe categorie / sub-categorie.

## Pasul 2 — Importă accesoriile de care ai nevoie

Pe rândul fiecărui accesoriu din catalog ai un buton **„Importă"** (sau „Adaugă în lista mea"). Click pe el — accesoriul intră imediat în **lista ta personală**, izolată per companie (RLS strict).

Bifează mai multe rânduri și apasă **„Importă selecție"** ca să adaugi un grup întreg (ex: tot setul de balamale pentru cabine de duș).

> **Faci asta o singură dată.** După import, accesoriul e disponibil pentru toți utilizatorii din companie, în toate calculatoarele.

## Pasul 3 — Verifică prețurile și unitățile

În lista ta locală, fiecare accesoriu îți afișează:

- **Cod** și **denumire** (preluate din catalog).
- **Preț** (poți face override propriu — nu afectează catalogul global).
- **Unitate** (buc, ml, set) — suportă și valori zecimale pentru ml.
- **Finisaj** disponibil (crom, mat, periat etc.).

Modifică prețul direct în celulă — se salvează automat și apare imediat în calculatoare.

## Pasul 4 — În calculator, deschide „Selectează produs"

Intri într-un calculator (ex: **Cabine duș**), ajungi la pasul **Accesorii** (balamale, mâner, profil U, bară etc.).

Pentru fiecare slot, dropdown-ul **„Selectează produs"** afișează **doar accesoriile pe care le-ai importat** — restrâns la tipul potrivit (ex: la slotul Mâner vezi doar mânere).

![Dropdown Selectează produs în calculator](/manual/accesorii-selecteaza-produs.png)

- Lista e curată: nu te încurci în mii de coduri irelevante.
- Search rapid în dropdown după cod sau denumire.

## Pasul 5 — Ajustează cantitatea și finisajul

După ce alegi accesoriul:

- **Cantitatea** — pentru balamale poți alege 2 sau 3 (alegerea ta e autoritativă, override pe regula automată).
- **Finisajul** — culoare/finisaj din variantele disponibile (cu fallback pe părinte dacă varianta exactă lipsește).
- **Poziția** — balamalele se măsoară top-down, mânerul bottom-up (convenția industriei, deja preconfigurată).

## Pasul 6 — Salvează configurația → accesoriile intră în ofertă

Apeși **„Salvează ca ofertă"** sau **„Adaugă în coș"**. Accesoriile selectate:

1. Se atașează la produs cu prețul lor în RON (afișaj convertibil EUR).
2. Apar în **OrderPreview** și în PDF-ul ofertei, agregate automat după cod (același cod = sumă cantități).
3. Se memorează în \`full_config\` JSON — sursa de adevăr pentru PDF, DXF și editare ulterioară.
4. La trimiterea în producție, **stocul scade automat** conform cantităților din ofertă.

![Accesoriu adăugat în ofertă](/manual/accesorii-in-oferta.png)
`,
    tips: [
      'Importi o singură dată — apoi accesoriile rămân în „Selectează produs" pentru toți colegii din companie.',
      'Prețurile pot fi suprascrise local (override per companie) fără să afecteze catalogul sistem.',
      'Foloseși același flux în TOATE calculatoarele: duș, uși, balustradă, oglindă, front bucătărie, pereți.',
    ],
    warnings: [
      'Dacă scoți un accesoriu din lista personală, ofertele vechi rămân valide (configurația e salvată în `full_config`), dar nu îl mai poți selecta în lucrări noi până nu îl re-imporți.',
    ],
  },
  {
    id: 'calc-shower', category: 'calculatoare', roles: ['all'], order: 1,
    title: 'Calculator Cabină de Duș',
    image: '/manual/calc-dus.png',
    imageAlt: 'Configurator 3D cabină de duș',
    content: `# Calculator Cabină de Duș

Configurează vizual în 3D orice tip de cabină: colț 90°, walk-in, pentagon, cadă, panou fix.

## Cei 6 pași

1. **Tip cabină** — alegi forma (colț 90°, niche, pentagon, paravan cadă, fix).
2. **Dimensiuni** — click pe cota din scena 3D pentru a o edita (Enter / Tab salvează).
3. **Sticlă** — grosime (8/10/12 mm), finisaj (clar, gri, bronz), securizare opțională.
4. **Profile** — U, perete, colț 90°, kit glisare (când e cazul).
5. **Accesorii** — balamale (2 sau 3), mâner, bară stabilizare, garnituri.
6. **Salvează** — ca ofertă sau direct ca lucrare nouă.
`,
    tips: [
      'Balamalele se măsoară de **sus în jos**, iar mânerul de **jos în sus** — convenția industriei.',
      'Panoul fix NU are deducere implicită de 10 mm — doar profilele + garniturile cumulate.',
      'Sistemul glisant nu necesită balamale și calculează automat suprapunerea din kit.',
    ],
    warnings: [
      'La colț 90°, profilele U sunt forțate ascunse la intersecție pentru a evita dublarea.',
    ],
  },
  {
    id: 'calc-door', category: 'calculatoare', roles: ['all'], order: 2,
    title: 'Calculator Uși de Sticlă',
    image: '/manual/calc-usa.png',
    imageAlt: 'Configurator 3D ușă de sticlă',
    content: `# Calculator Uși

Pentru uși interioare cu balamale, pivot sau glisare pe șină.

## Pași

1. **Sistem** — Cu balamale, Pivot top-bottom, Glisare pe șină.
2. **Dimensiuni** — lățime, înălțime, golul ușii.
3. **Sticlă** — grosime și finisaj.
4. **Garnituri laterale** — array \`lateralSelections\` cu opțiuni separate stânga/dreapta/sus/jos.
5. **Decupări** — pentru mâner sau încuietoare (prag >50 mm = mare, ≤50 mm = mic).
6. **Accesorii** — balamale, mâner, opritor, încuietoare.
`,
    tips: [
      'Pivotul se calculează automat în funcție de greutatea sticlei.',
      'La sistem glisant, șina și ghidajul sunt incluse în kit — nu adăuga separat.',
    ],
  },
  {
    id: 'calc-balustrade', category: 'calculatoare', roles: ['all'], order: 3,
    title: 'Calculator Balustrade',
    image: '/manual/calc-balustrada.png',
    imageAlt: 'Configurator 3D balustradă',
    content: `# Calculator Balustrade

Configurare balustrade din sticlă: interior, exterior (laminat obligatoriu), scări (panouri înclinate).

## Pași

1. **Tip** — Interior, Exterior, Scări.
2. **Lungime totală** și **înălțime** — în mm.
3. **Sticlă** — laminat 8+8, 10+10 sau securizată simplă (doar interior).
4. **Fixare** — profil U continuu, clipsuri spot, baluștri.
5. **Mână curentă** — opțională (lemn, inox, aluminiu).
6. **Capacele** — pentru profil U.
`,
    warnings: [
      'Pentru exterior, sticla TREBUIE laminată — normă de siguranță obligatorie.',
    ],
  },
  {
    id: 'calc-mirror', category: 'calculatoare', roles: ['all'], order: 4,
    title: 'Calculator Oglinzi',
    image: '/manual/calc-oglinda.png',
    imageAlt: 'Configurator 3D oglindă',
    content: `# Calculator Oglinzi

Pentru oglinzi simple sau cu prelucrări speciale.

## Pași

1. **Formă** — Dreptunghi, Pătrat, Cerc, Oval, Personalizată.
2. **Dimensiuni** — în mm; pentru formă personalizată desenezi în CAD editor.
3. **Tip oglindă** — argintată standard, antichizată, fumurie, bronz.
4. **Margine** — șlefuită, fațetată, polizată.
5. **Decupări** — pentru întrerupătoare, prize, suporturi.
6. **Iluminare LED** — opțional, perimetrală sau spate.
`,
  },
  {
    id: 'calc-kitchen', category: 'calculatoare', roles: ['all'], order: 5,
    title: 'Calculator Fronturi Bucătărie',
    image: '/manual/calc-front-bucatarie.png',
    imageAlt: 'Configurator 3D front bucătărie',
    content: `# Calculator Fronturi Bucătărie

Fronturi de mobilier din sticlă lăcuită, print digital sau sablat mat.

## Pași

1. **Finisaj** — Lăcuit RAL, Print digital, Sablat mat.
2. **Dimensiuni** — lățime × înălțime per front; multiplici câte fronturi.
3. **Culoare / Print** — selectezi RAL sau încarci fișier print.
4. **Decupări** — pentru mânere sau push-to-open.
5. **Sistem prindere** — adeziv pe MDF, șuruburi spate, profil aluminiu.
6. **Salvare** — agregare automată pentru bucătării întregi.
`,
    tips: [
      'Pentru print digital, rezoluția recomandată minimă este 150 dpi la dimensiunea finală.',
    ],
  },
  {
    id: 'calc-panels', category: 'calculatoare', roles: ['all'], order: 6,
    title: 'Panouri & Pereți Despărțitori',
    image: '/manual/calc-panouri.png',
    imageAlt: 'Configurator 3D panou și perete despărțitor',
    content: `# Panouri și Pereți Despărțitori

Două sub-module:

- **Panou simplu** — sticlă fără prelucrări (geam la dimensiune).
- **Perete despărțitor** — grilă configurabilă cu uși integrate.

## Pereți despărțitori — pași cheie

1. **Grilă** — definești câte coloane × rânduri; redimensionezi cu drag interlock (suma lățimii rămâne constantă).
2. **Profile perimetrale** — sus, jos, lateral; se întrerup automat unde sunt uși.
3. **Profile interioare** — verticale și orizontale; \`usableWidth/Height\` asigură panourile potrivite.
4. **Uși integrate** — în orice celulă; deduc automat din profilul perimetral.
5. **Panouri laterale 90°** — înălțimea se sincronizează cu cea a ușii.
6. **Sticlă & finisaje** — per celulă sau global.
`,
    warnings: [
      'La redimensionarea unei coloane, vecinele se ajustează automat pentru a păstra lățimea totală.',
    ],
  },

  // ====== Vânzări ======
  {
    id: 'orders', category: 'vanzari', roles: ['all'], order: 1,
    title: 'Gestionare Comenzi',
    image: '/manual/comenzi-deschide.png',
    imageAlt: 'Lista comenzilor cu statusuri',
    content: `# Comenzi

Toate ofertele și comenzile, cu filtre rapide pe status: Ofertă → Confirmată → În producție → Finalizată → Livrată → Anulată.

## Acțiuni rapide pe rândul comenzii

1. **Schimbă status** — butoane colorate direct pe rând (Confirmă, Finalizează, Livrează).
2. **Trimite în producție** — deduce automat stocul și creează fișa de producție.
3. **Generează DXF** — pentru CNC, pe fiecare panou.
4. **Editează** — re-deschide oferta în calculatorul original (toate datele restaurate).
5. **Șterge** — doar dacă nu e încă în producție.

## Deschiderea unei comenzi în detaliu

Click pe numărul comenzii (sau pe rândul ei) din **Lista Comenzi** și se deschide o casetă cu antetul comenzii (nr., status, buton **Descarcă PDF**) și 4 tab-uri:

![Casetă comandă deschisă](/manual/comenzi-detalii.png)

### 1. Detalii
Date client, dată creare, subtotal, TVA, total. Aici verifici rapid datele comerciale și ai butoanele pentru **Programează montaj**, **Emite factură** și **Proformă (avans)**.

### 2. Produse
Lista produselor configurate, cu cantitate, preț unitar și sumă suplimentară (dacă există). Buton **Editează** pe fiecare produs te trimite înapoi în calculator pentru ajustări.

![Tab Produse](/manual/comenzi-produse.png)

### 3. Istoric
Log de modificări: schimbări de status, editări, plăți, generări de documente. Util pentru trasabilitate și audit — vezi cine și când a făcut fiecare modificare.

![Tab Istoric](/manual/comenzi-istoric.png)

### 4. Previzualizare
Randare detaliată a ofertei exact așa cum apare pe **PDF-ul trimis clientului**: pentru fiecare produs vezi tipul de configurație, dimensiuni și suprafață sticlă, prelucrările aplicate, lista de accesorii cu cod și preț unitar, manopera și totalul. **Folosit pentru verificarea finală** înainte de trimiterea ofertei către client sau a comenzii în producție — confirmi că prețurile produselor, accesoriilor și manoperei sunt corecte.

![Tab Previzualizare](/manual/comenzi-previzualizare.png)

## Card-urile de sus

Sumar instant: total comenzi, valoare RON, distribuție pe statusuri.
`,
    tips: [
      'Configurația completă (\`full_config\`) e păstrată intactă din coș până în comandă — nu se pierd date.',
      'Accesoriile identice se agregă automat pe PDF-ul final (sumă cantități, cod unic).',
      'Tab-ul Previzualizare reflectă întotdeauna valorile curente — dacă schimbi un preț în Setări, se actualizează aici.',
    ],
  },

  {
    id: 'invoicing', category: 'vanzari', roles: ['all'], order: 2,
    title: 'Facturare',
    image: '/manual/facturare.png',
    imageAlt: 'Modul facturare cu KPI și grafice',
    content: `# Facturare

Emitere facturi din comenzi confirmate, cu serii personalizate și export e-Factura (CIUS-RO și FatturaPA pentru IT).

## Pași

1. **Configurează seriile** în *Setări → Facturare → Serii* (prefix, an, contor).
2. **Generează factură** din comandă: buton **€** pe rândul comenzii.
3. **Editează linii** — adaugi/scoți, ajustezi prețuri, TVA per linie.
4. **Emite** — număr atribuit automat, status devine "Issued".
5. **Înregistrează plată** — dialog parțial sau integral.
6. **Export XML** — pentru ANAF (RO) sau SDI (IT).

## KPI

Card-urile de sus: facturat, încasat, restant, anulat.
`,
    warnings: [
      'O factură emisă nu poate fi ștearsă — doar anulată cu motiv și înlocuită cu storno.',
    ],
  },
  {
    id: 'clients-crm', category: 'vanzari', roles: ['all'], order: 3,
    title: 'Clienți & CRM',
    image: '/manual/clienti-crm.png',
    imageAlt: 'Listă clienți CRM cu tipuri',
    content: `# Clienți

Baza de date completă a clienților: persoane fizice, companii, distribuitori.

## Pași

1. **Adaugă client** — buton "Client nou" sau automat când salvezi o ofertă pentru un email nou.
2. **Tip client** — Persoană / Companie / Distribuitor (cu discount global).
3. **Date contact** — telefon, email, adresă, CUI (dacă e companie).
4. **Pipeline CRM** (admin) — lead-uri, stadii, conversii.
5. **Istoric** — toate ofertele și comenzile clientului într-un loc.
6. **Markup specific** — în *Setări → Markup Client* setezi adaos diferit pentru tipuri.

## Filtrele de sus

Search după nume/email, filtru pe tip client.
`,
    tips: [
      'Clienții se creează automat din calculatoarele 3D când salvezi prima ofertă cu un email nou.',
    ],
  },

  // ====== Producție ======
  {
    id: 'production-kanban', category: 'productie', roles: ['all'], order: 1,
    title: 'Flux Producție Kanban',
    image: '/manual/productie-kanban.png',
    imageAlt: 'Board Kanban cu coloane Tăiere, Prelucrare, Securizare',
    content: `# Producție Kanban

Fluxul vizual pe etape: **Tăiere → Prelucrare → Securizare → Acoperire/Print → Asamblare → Pregătit pentru livrare**.

## Pași zilnici

1. **Verifică KPI-urile** de sus: total active, în lucru, în așteptare, gata de livrare.
2. **Drag & drop** un card între coloane pentru a avansa manual.
3. **Click pe card** — deschide fișa de producție cu desene tehnice, materiale, accesorii.
4. **Asignare operator** — pre-planificat în *Comenzi → Planificare operator*; se salvează în \`operator_name\` pentru trasabilitate.
5. **Vedere Calendar** — tab alternativ pentru planificare pe dată.

## Etichete cu cod de bare

Din fișa fiecărei comenzi de producție (și din pagina **Scanner**) ai butonul **„Printează Eticheta"**:

- Codul de bare este **CODE128**, generat automat din numărul fișei (cu librăria JsBarcode).
- Eticheta conține: **nr. fișă**, **nr. comandă**, **client**, **termen de livrare** și **etapa curentă**.
- Se deschide direct dialogul de printare al browserului — poți folosi imprimante normale A4 sau imprimante dedicate de etichete (Zebra, Brother etc.).
- Lipești eticheta pe geam / cadru / colet și o reutilizezi la fiecare etapă din flux.

## Scanare în atelier

Pagina **Producție → Scanner** este optimizată pentru ritmul atelierului:

1. **Auto-focus** pe câmpul de scanare — nu trebuie să dai click înainte de fiecare scanare.
2. **Cititoare HID** — orice scanner USB tip „tastatură" merge plug-and-play (nu necesită drivere).
3. **Scanezi codul** de pe etichetă → comanda **avansează automat** la etapa următoare din flux.
4. **Confirmare vizuală** instant: cardul afișează noul status, iar Kanban-ul se actualizează.

Astfel operatorii nu mai pierd timp cu drag & drop manual și nu există greșeli de tipul „am uitat să marchez că am terminat".

## Urmărire în timp real

Tabla Kanban se **reîmprospătează automat** în background:

- Scanările făcute în atelier apar **imediat** pe ecranele de birou — fără refresh manual.
- KPI-urile de sus (active, în lucru, gata de livrare) se recalculează live.
- Mai mulți operatori pot lucra simultan pe etape diferite, fără să se calce pe picioare.
- Managerul vede în orice moment **unde se află fiecare comandă** și **cine lucrează la ea**.

## Dată estimată de livrare

Se calculează automat când o comandă intră în producție, în funcție de încărcarea coloanelor.
`,
    tips: [
      'Printează eticheta cu cod de bare imediat după ce comanda intră în producție și lipește-o pe colet — devine sursa de adevăr pentru tot fluxul.',
      'Lasă pagina Scanner deschisă pe un tablet/laptop în atelier; auto-focus-ul asigură că orice scanare e captată chiar dacă nu e cineva la tastatură.',
      'Pentru flux 24/7 deschide Kanban-ul pe un TV mare — vezi în timp real progresul fără să atingi nimic.',
    ],
  },
  {
    id: 'inventory', category: 'productie', roles: ['all'], order: 2,
    title: 'Stoc & Inventar',
    image: '/manual/stoc.png',
    imageAlt: 'Modul inventar cu liste materiale',
    content: `# Stoc

Gestionare materiale: sticlă, accesorii (hardware), consumabile. Deducere automată la intrarea în producție.

## Pași

1. **Adaugă material** — buton "Material nou" (cod, tip, preț, stoc minim).
2. **Ajustare stoc** — buton per rând pentru intrări/ieșiri manuale.
3. **Mișcări stoc** — tab cu istoricul tranzacțiilor (intrări, ieșiri, motiv).
4. **Raport consum lunar** — buton de sus, export CSV/Excel.
5. **Alerte stoc minim** — KPI roșu "Min. Stock" pe card-ul superior.
6. **Locație** — opțional, pentru depozite multiple.

## Auto-deducere

Când o comandă intră în status **"În producție"**, stocul scade automat conform listei de materiale a fiecărui produs.
`,
    warnings: [
      'Stocul negativ e permis dar marcat roșu — gestionar trebuie să facă inventar fizic și ajustare.',
    ],
  },
  {
    id: 'cutting', category: 'productie', roles: ['all'], order: 3,
    title: 'Optimizare Debitare',
    image: '/manual/optimizare-debitare.png',
    imageAlt: 'Modul optimizare debitare cu selecție foi',
    content: `# Optimizare Debitare

Algoritm guillotine nesting pentru până la 50 de comenzi simultan — minimizează deșeul de sticlă.

## Pași

1. **Tip foaie** — selectezi din catalog (ex: 3210×2250 mm).
2. **Grosime lamă** — implicit 3 mm, ajustabil.
3. **Selectează comenzi** — din lista cu căutare și filtru status (poți "Selectează tot 26").
4. **Apasă Optimize** — algoritmul rulează și afișează foile cu panourile nested.
5. **Vizualizează SVG** — fiecare foaie cu cote, etichete panou, deșeu colorat.
6. **Export DXF/PDF** — pentru a trimite la mașina de tăiat.

## Gestionează colile de sticlă

![Dialog Gestionează colile cu cotele standard de sticlă în pagina Optimizare Debitare](/manual/manage-glass-sheets.png)

Cotele standard (2550×3210, 2250×3210, Jumbo 6000×3210) sunt încărcate automat la prima accesare. Le poți edita oricând fără să părăsești pagina de debitare — apasă pe butonul **⚙ Gestionează colile** de lângă selectorul *Tip foaie*.

1. **Adaugă o coală nouă** — completezi *Denumire* (ex: „Custom 2000×3000"), *Lățime (mm)* și *Înălțime (mm)*, apoi apeși **+ Adaugă**.
2. **Activează / dezactivează** — comutatorul din dreptul fiecărei cote o ascunde din selectorul *Tip foaie* fără să o șteargă (utilă pentru cote sezoniere).
3. **Șterge** — butonul roșu (coș) elimină definitiv o cotă; folosește-l doar dacă ești sigur că nu o vei mai debita.
4. **Închide dialogul** — modificările se aplică imediat, iar selectorul *Tip foaie* se reîmprospătează automat cu noile dimensiuni și suprafața în m².

> Cotele sunt salvate per companie — toți utilizatorii echipei tale văd aceeași listă, dar nu interferează cu alte conturi.

## Stats

Procent utilizare, suprafață deșeu, număr foi.
`,
    tips: [
      'Limit 50 de comenzi per sesiune pentru a păstra timp de calcul rezonabil.',
    ],
  },

  // ====== Operațional ======
  {
    id: 'service', category: 'operational', roles: ['all'], order: 1,
    title: 'Reclamații & Intervenții Service',
    image: '/manual/service.png',
    imageAlt: 'Modul reclamații cu grafice și listă tickete',
    content: `# Reclamații & Service

Gestionare incidente post-livrare: reclamații client, defecte fabrică, intervenții planificate.

## Pași

1. **Reclamație nouă** — buton dreapta sus.
2. **Asociază comandă** — opțional, pentru trasabilitate.
3. **Prioritate** — Low / Medium / High / Critical.
4. **Tip defect** — Reclamație client, Defect fabrică, Daune transport, Garanție.
5. **Programează intervenție** — alegi dată și echipă de montaj.
6. **Închide ticket** — cu rezoluție și costuri.

## Grafice

Frecvență defecte, distribuție priorități, status tickete.
`,
  },
  {
    id: 'installation', category: 'operational', roles: ['all'], order: 2,
    title: 'Montaj & Echipe',
    image: '/manual/montaj.png',
    imageAlt: 'Calendar montaj cu tab-uri Echipe, Vehicule, Checklist',
    content: `# Montaj

Planificare montaje, echipe, vehicule, checklist-uri și optimizare rută.

## Tab-uri

1. **Calendar Montaj** — vedere lunară cu drag & drop.
2. **Echipe Montaj** — adaugi membri, alocați la echipe.
3. **Checklist** — șabloane clonate pe fiecare job la creare.
4. **Optimizare Rută** — calculează ordinea optimă a montajelor zilei.
5. **Vehicule** — flotă cu alerte 30 zile pentru ITP și RCA.

## Pași planificare

1. Buton **"Programează montaj"** dreapta sus.
2. Selectezi comanda, echipa, vehiculul, data.
3. Atașezi checklist (default sau personalizat).
4. Salvezi — apare în calendar.
5. **Amânare** — închide jobul curent și pre-completează unul nou.
`,
    tips: [
      'Vehiculele cu ITP/RCA expirate sub 30 zile primesc alertă automată.',
    ],
  },

  // ====== Setări ======
  {
    id: 'settings-company', category: 'setari', roles: ['all'], order: 1,
    title: 'Setări Companie & Branding',
    image: '/manual/setari-companie.png',
    imageAlt: 'Setări companie — informații generale',
    content: `# Setări → Companie

Datele care apar pe TOATE documentele generate (oferte, comenzi, facturi, fișe producție).

## Câmpuri esențiale

1. **Nume Companie** — apare în antet PDF.
2. **CUI / CIF** — cu prefix RO pentru România.
3. **Adresă completă** — Strada, Nr., Oraș, Județ, Cod Poștal.
4. **Telefon și Email** — pentru contact pe documente.
5. **Cont Bancar și BIC/SWIFT** — pentru facturi.
6. **Logo Companie** — PNG/JPG/WebP/SVG, max 2 MB.

## Personalizare PDF

- **Dimensiune logo** și **poziție** — pentru oferte și facturi.
- **Texte personalizate** — termeni, condiții, footer (rich-text via Tiptap).
- **Curs EUR/RON** — folosit pentru conversie globală.

## White label

Aboanții pot personaliza complet PDF-urile cu logo și texte HTML proprii.
`,
    tips: [
      'Logo-ul ideal e PNG transparent, ratio 3:1 sau pătrat, min 400×400 px pentru calitate la print.',
    ],
  },
  {
    id: 'settings-pricing', category: 'setari', roles: ['all'], order: 2,
    title: 'Setări Prețuri & Catalog',
    content: `# Setări → Prețuri

Catalogul tău local de prețuri: materiale, accesorii, kituri, finisaje.

## Pași

1. **Tab Materiale** — sticlă, profile, accesorii grupate.
2. **Caută** — search transversal pe categorii.
3. **Editează preț** — click pe celulă, salvare automată.
4. **Reset la sistem** — buton pentru a renunța la override și reveni la prețul de bază.
5. **Variante private** — adaugi materiale proprii cu cod unic per companie.
6. **Import / Export** — Excel + ZIP pentru poze, mapping automat la categoriile sistem.

## Ierarhia prețurilor

Companie (override propriu) > Global utilizator > Sistem (default catalog).
`,
    tips: [
      'Override-urile companiei nu sunt vizibile pentru alte companii — strict izolat prin RLS.',
      'Imaginile materialelor au cachebusting cu timestamp pentru a vedea imediat noua versiune.',
    ],
    warnings: [
      'Resetarea unui preț șterge override-ul și nu se poate undo — verifică înainte.',
    ],
  },
  {
    id: 'settings-team', category: 'setari', roles: ['all'], order: 3,
    title: 'Setări Echipă & Permisiuni',
    content: `# Setări → Echipă

Invită membri echipei și gestionează permisiunile pe module.

## Pași

1. **Invită membru** — email; primește link de înregistrare.
2. **Rol** — Abonat (vânzări), Producție, Montaj, Admin companie.
3. **Module permise** — bifezi accesul: Comenzi, Producție, Stoc, Facturare, Service, etc.
4. **Activare/Dezactivare** — păstrezi istoricul, doar blochezi login.
5. **Transfer admin** — într-un singur click, către un alt membru.
6. **Trasabilitate** — toate acțiunile sunt înregistrate cu \`created_by\`.

## Tiere de acces

- **Basic (60)** — Comenzi + 1-2 calculatoare.
- **Plus (100)** — Toate calculatoarele + Stoc.
- **Operational (150)** — Tot, inclusiv Service, Montaj, Optimizare.

## Facturare

Abonamentul e legat de **proprietarul companiei** — angajații sunt gratis.
`,
    tips: [
      'Reparare cont orfan (admin) — utilizatorii fără companie pot fi atribuiți manual.',
    ],
  },
  {
    id: 'pricing-client-types', category: 'setari', roles: ['all'], order: 9,
    title: 'Adaos pe tip de client (Persoană / Firmă / Distribuitor)',
    image: '/manual/setari-adaos-tip-client.png',
    imageAlt: 'Setări → Adaos Clienți — Persoană Fizică, Firmă, Distribuitor',
    content: `# Adaos procentual per tip de client

În **Setări → Adaos Clienți** poți defini **3 liste de preț diferențiate** plecând de la același catalog, fără să dublezi articolele.

## Cele 3 tipuri

- **Persoană Fizică** — clienți finali (retail). Tipic aici pui adaos pozitiv (ex.: +10% … +20%) pentru că nu beneficiază de discount comercial.
- **Firmă** — companii și firme partenere. De obicei se lasă **0%** (preț de bază).
- **Distribuitor** — parteneri de revânzare. Aici pui de regulă **valoare negativă** (ex.: −10% … −25%) ca să le oferi prețul preferențial.

## Cum funcționează

- Procentul se aplică **automat** peste prețul de bază al fiecărui articol din ofertă (sticlă, accesorii, manoperă, kituri).
- Valori **pozitive** = adaos peste prețul standard. Valori **negative** = discount.
- Câmpul acceptă valori între **−100% și +500%**, cu pas de 0,5%.
- Modificările devin active după ce apeși **„Salvează Adaosuri"** (butonul jos-dreapta). Cardul evidențiază rândurile modificate cu badge-ul „modificat".

## Unde se aplică

În fiecare **calculator 3D**, la cardul **Informații Client**, există selectorul **Tip Client** (Persoană / Firmă / Distribuitor). Când îl schimbi:

1. Calculatorul detectează tipul ales.
2. Aplică automat procentul setat aici peste subtotal.
3. Prețul afișat în ofertă (și mai târziu în PDF) reflectă deja noul tip.

## La ce ajută

- **O singură listă de catalog**, dar prețuri diferite per categorie de client — fără să duplici manual articolele.
- Poți acorda **rapid un discount distribuitorilor** fără să modifici cataloagele de bază.
- Persoanele fizice pot fi facturate cu un adaos comercial standard, fără calcule manuale în fiecare ofertă.
- Modificările sunt **retroactive doar pentru oferte noi** — comenzile deja salvate își păstrează prețurile inițiale (\`full_config\` este sursa de adevăr).
`,
    tips: [
      'Poți seta valori negative (ex.: −15%) pentru a oferi rabat permanent unei categorii fără să atingi catalogul.',
      'Dacă ai dubii, începe cu Firmă = 0% (preț de referință) și ajustează celelalte două relativ la ea.',
      'Selectorul Tip Client din calculator se reține în ofertă, deci o ofertă re-deschisă păstrează tipul ales inițial.',
    ],
    warnings: [
      'Schimbarea procentului afectează doar ofertele noi. Comenzile existente trebuie reeditate dacă vrei să le recalculezi.',
    ],
  },
  {
    id: 'pricing-overview', category: 'setari', roles: ['all'], order: 10,
    title: 'Prețuri — prezentare generală',
    image: '/manual/setari-preturi.png',
    imageAlt: 'Setări → Prețuri — listă categorii',
    content: `# Setări → Prețuri

Aici controlezi **toate prețurile** folosite în calculatoarele 3D, oferte și PDF-uri.

## Categorii disponibile

- **Accesorii** — balamale, mânere, bare, role, opritori, garnituri, conectori
- **Sticlă** — pe grosime și tip (clar, mat, fumuriu, oglindă)
- **Manoperă** — montaj, debitare, lustruire, găurire, decupare
- **Profile** — U, perete, colț 90°, profile glisante
- **Kituri** — grupuri de accesorii vândute ca o singură poziție
- **Mecanisme glisante** — sisteme complete (cu profil + role + opritori)

## Catalog global vs override personal

- **Catalogul global** (gestionat de admin) este punctul de plecare — îl vezi automat.
- Când modifici un preț sau o deducere, se salvează un **override personal** în spațiul tău (\`pricing_config\`). Catalogul global rămâne neatins.
- Poți oricând reseta override-ul cu butonul **„Resetează la valoarea de catalog"** (vezi secțiunea dedicată).

## Moneda

Prețurile sunt stocate intern în **RON**. Comutatorul **RON / EUR** din bara de sus convertește doar afișarea — nu se face nicio conversie în baza de date.
`,
    tips: [
      'Filtrul de căutare merge pe toate categoriile simultan (cod, denumire, finisaj).',
      'Dacă nu vezi un articol, verifică dacă l-ai dezactivat din meniul de pe rând (clopoțel tăiat).',
    ],
  },
  {
    id: 'pricing-add-accessory', category: 'setari', roles: ['all'], order: 11,
    title: 'Adăugare accesoriu nou',
    image: '/manual/setari-adauga-accesoriu.png',
    imageAlt: 'Dialog Adaugă element — accesoriu',
    content: `# Cum adaugi un accesoriu nou

1. Intră în **Setări → Prețuri** și selectează tab-ul **Accesorii**.
2. Apasă **„Adaugă element"** (sus-dreapta).
3. Completează:
   - **Cod** — unic; folosit pentru deduplicare, scanare cod de bare și agregare în PDF.
   - **Denumire** — afișată în calculator și PDF.
   - **Categorie / Tip** — balama, mâner, bară stabilizare, role, opritor, garnitură etc.
   - **Preț** — în moneda activă (se stochează în RON).
   - **U.M.** — \`pcs\` pentru bucăți, \`ml\` pentru metri liniari, \`m²\` pentru suprafață, \`kg\` pentru greutate.
   - **Finisaj & culoare** — alegi din presetări sau introduci hex personalizat; este folosit și în randarea 3D.
   - **Imagine** — încărcată în storage; apare în selectorul de accesorii și în PDF.
4. Bifează **„Tipuri de produs"** unde apare accesoriul (duș, ușă, balustradă, oglindă, panouri, front bucătărie).
5. Bifează **„Tipuri de procesare"** compatibile (laminat, securizat, mat).
6. **Salvează** — accesoriul devine imediat disponibil în calculatoarele bifate.
`,
    tips: [
      'Pentru U.M. diferite de pcs poți folosi zecimale (ex: 2.5 ml).',
      'Dacă nu setezi imaginea, se moștenește automat de la categoria părinte.',
    ],
    warnings: [
      'Codul trebuie să fie unic. Dacă există deja, sistemul actualizează articolul existent în loc să creeze unul nou.',
    ],
  },
  {
    id: 'pricing-edit-fields', category: 'setari', roles: ['all'], order: 12,
    title: 'Editare element — câmpuri avansate',
    image: '/manual/setari-editare-element.png',
    imageAlt: 'Dialog Editare element cu deduceri sticlă',
    content: `# Editare element — câmp cu câmp

Click pe creionul de pe rând (sau dublu-click) pentru a deschide **Editare element**. Pe lângă preț și U.M., ai aceste câmpuri tehnice:

## Preț & U.M.

- Prețul se introduce în moneda activă din header (RON sau EUR) și se stochează intern în RON.
- U.M. determină cum se înmulțește prețul în calculator: \`pcs\` × cantitate, \`ml\` × lungime, \`m²\` × suprafață.

## Finisaj & culoare

- **Hex color** + **roughness** sunt folosite atât în lista de prețuri cât și în randarea 3D — sincronizate prin \`MetalMaterial\`.
- Dacă lași gol, se moștenește de la elementul părinte (ex: variantă de profil moștenește culoarea profilului de bază).

## Deducere sticlă pe latură (\`glass_deduction\`)

Câți **mm** intră profilul în sticlă pe fiecare latură unde este montat. Calculatorul scade automat această valoare din dimensiunea brută pentru a obține sticla reală de tăiat.

> Exemplu: profil U 8 mm pe sticlă 8 mm laminată → \`8 + 0.38 + 8 = 16.38 mm\` deducere totală (profile + folie + profile, cumulativ).

## Deduceri detaliate per latură (\`glass_deductions\`)

JSON cu \`top\`, \`bottom\`, \`left\`, \`right\` separate. Folosit când profilul are valori diferite pe fiecare margine (ex: profil de pardoseală adânc + profil de perete subțire). **Se cumulează** cu garniturile.

- **\`profile_height\`** (în același JSON) — suprascrie suma \`top + bottom\` pentru profilul U, dacă vrei o singură valoare totală.

## Suprapunere (\`width_overlap\`)

Câți mm se **suprapun** panourile glisante peste celălalt panou sau perete. Sistemul scade această valoare din **lățimea utilă** a kit-ului glisant.

> Exemplu: kit glisant 1200 mm cu suprapunere 40 mm → lățime utilă efectivă 1160 mm.

## Deducere înălțime ușă (\`door_height_deduction\`)

mm scăzuți din înălțimea totală pentru **ușa pe balamale** (spațiu balama sus + prag jos). Tipic 5–20 mm în funcție de balama.

## Deducere înălțime panou fix (\`fixed_panel_height_deduction\`)

Identic, dar pentru panoul fix. **Implicit 0** — panoul fix nu are deducere automată de 10 mm.

## Tipuri produs / procesare

Bifează unde apare accesoriul (duș, ușă, balustradă...) și ce procesări suportă (laminat, securizat). Necbifate = nu apare în calculatorul respectiv.
`,
    tips: [
      'Deducerile sunt **cumulative**: profil + garnitură + folie laminată se adună pe aceeași latură.',
      'Balamalele se măsoară de **sus în jos**, mânerul de **jos în sus** — este o convenție păstrată în toate calculatoarele.',
      'Sistemul glisant **nu folosește balamale** — câmpul cantitate balamale rămâne 0 automat.',
    ],
    warnings: [
      'Orice modificare a deducerilor afectează imediat **toate calculele 3D viitoare**, inclusiv ofertele neconfirmate. Comenzile deja salvate au datele înghețate în `full_config` și nu se modifică.',
    ],
  },
  {
    id: 'pricing-add-glass', category: 'setari', roles: ['all'], order: 13,
    title: 'Adăugare tip de sticlă',
    image: '/manual/setari-sticla.png',
    imageAlt: 'Setări → Prețuri → Sticlă',
    content: `# Sticla

1. Tab **Sticlă** → **„Adaugă element"**.
2. Alege **grosimea**: 4 / 6 / 8 / 10 / 12 mm.
3. Alege **tipul**: clar, fumuriu, mat (sablat), oglindă, bronz, gri.
4. Setează **prețul / m²** (în moneda activă).
5. Bifează **procesările** disponibile pentru această sticlă: securizat, laminat, lustruit, mat.

## Securizare

Pentru securizare prețul se calculează cu formula:

\`\`\`text
Preț securizare = Preț_securizare × Grosime_mm × Suprafață_m²
\`\`\`

Setezi un singur preț de bază; sistemul aplică automat formula în funcție de grosimea și aria sticlei.

## Laminat

La sticla laminată, deducerile pe laturi se cumulează cu **grosimea foliei** (implicit 0.38 mm) pe fiecare margine. Vezi exemplul din secțiunea „Editare element".
`,
    tips: [
      'Sticla mat (sablată) are de obicei adaos procentual față de cea clară — îl configurezi ca multiplicator în câmpul de procesare.',
    ],
  },
  {
    id: 'pricing-add-labor', category: 'setari', roles: ['all'], order: 14,
    title: 'Adăugare manoperă',
    image: '/manual/setari-manopera.png',
    imageAlt: 'Setări → Prețuri → Manoperă',
    content: `# Manopera

1. Tab **Manoperă** → **„Adaugă element"**.
2. Alege **tipul**: montaj, debitare, lustruire muchii, găurire, decupare, transport.
3. Setează **U.M.**:
   - \`oră\` — pentru montaj
   - \`ml\` — pentru lustruire muchii
   - \`buc\` — pentru găuri, decupări
   - \`m²\` — pentru manopera de suprafață
4. **Preț** per unitate.
5. **Procent vs valoare fixă** — bifează dacă este multiplicator (ex: 15% peste valoarea sticlei) sau sumă fixă.
6. Asociezi cu **tipurile de produs** unde se aplică automat.
`,
    tips: [
      'Manopera procentuală nu este afectată de comutatorul EUR/RON — rămâne aceeași în orice monedă.',
    ],
  },
  {
    id: 'pricing-add-kit', category: 'setari', roles: ['all'], order: 15,
    title: 'Kituri de accesorii',
    image: '/manual/setari-kituri.png',
    imageAlt: 'Setări → Kituri',
    content: `# Kituri

Un **kit** este un grup de accesorii vândut ca o singură poziție. Util pentru sisteme glisante de duș: kit-ul include profil, role, opritori, ghidaj.

## Creare kit

1. Intră în **Setări → Kituri** (sau tab-ul Kituri din Prețuri).
2. **„Adaugă kit"** → cod, denumire, **preț kit** (final), **lățime utilă** acoperită.
3. Adaugă **componente** — selectezi din lista de accesorii și pui cantitatea.
4. Componentele sunt **deduplicate după cod** — dacă același cod apare de două ori, se însumează cantitățile.

## Utilizare în calculator

În calculatorul de **duș glisant**, alegi kit-ul din dropdown. Sistemul calculează:

\`\`\`text
Lățime utilă efectivă = Lățime_kit - width_overlap
\`\`\`

și aplică automat **0 balamale** (sistemul glisant nu are balamale).
`,
    tips: [
      'Prețurile componentelor sunt informative — **prețul kit-ului prevalează** în ofertă.',
      'Imaginea kit-ului apare în PDF; dacă lipsește, se folosește imaginea profilului principal.',
    ],
  },
  {
    id: 'pricing-reset', category: 'setari', roles: ['all'], order: 16,
    title: 'Reset la valoarea de catalog',
    image: '/manual/setari-reset.png',
    imageAlt: 'Buton Resetează la valoarea de catalog',
    content: `# Reset override personal

Dacă ai modificat un preț sau o deducere și vrei să revii la **valoarea standard din catalogul global**:

1. Deschide **Editare element**.
2. Apasă **„Resetează la valoarea de catalog"** (jos-stânga în dialog).
3. Override-ul tău din \`pricing_config\` este șters și articolul afișează din nou valoarea admin-ului.

> Resetarea afectează **doar articolul respectiv**. Restul override-urilor tale rămân intacte.
`,
    warnings: [
      'Acțiunea este imediată și nu poate fi anulată. Dacă ai nevoie de un istoric, exportă prețurile (Setări → Export date) înainte de reset.',
    ],
  },

  // ====== Secțiuni noi — pentru abonați ======
  {
    id: 'dashboard-home', category: 'introducere', roles: ['all'], order: 0,
    title: 'Dashboard principal',
    image: '/manual/dashboard-home.png',
    imageAlt: 'Dashboard principal',
    content: `# Dashboard principal

După autentificare ajungi pe **pagina de start (\`/\`)** — un panou de control cu indicatorii cheie ai afacerii tale, actualizați în timp real.

## Ce vezi

- **KPI-uri sus**: cifră de afaceri, comenzi în lucru, comenzi livrate luna curentă, valoare medie comandă.
- **Grafic vânzări** pe ultimele 12 luni (bare, cu comparație an precedent).
- **Grafic venituri** pe categorii de produse (duș, uși, balustrade, oglinzi, bucătărie, panouri).
- **Top produse** vândute în perioada selectată.
- **Stoc critic** — materiale cu cantitate sub pragul minim configurat.
- **Comenzi recente** — ultimele 10 comenzi cu status și client, cu click direct pe comandă.

## Filtre

Comutatorul **RON / EUR** din bara de sus afectează toate valorile afișate aici (conversie dinamică, fără TVA).
`,
    tips: [
      'Dashboard-ul se reîncarcă automat la fiecare schimbare de monedă sau limbă.',
      'Pentru o privire operațională (producție, montaj, service) folosește meniul *Dashboard Operațional*.',
    ],
  },
  {
    id: 'announcements', category: 'introducere', roles: ['all'], order: 3,
    title: 'Anunțuri și notificări',
    image: '/manual/announcements.png',
    imageAlt: 'Anunțuri și notificări',
    content: `# Anunțuri și notificări

Iconul 🔔 **clopoțel galben** din bara de sus afișează anunțurile publicate de echipa iSoftGlass: actualizări, funcționalități noi, mentenanță planificată.

## Cum funcționează

- Numărul roșu de pe clopoțel = anunțuri **necitite**.
- Click pe clopoțel deschide lista — fiecare anunț are titlu, categorie (**Update** sau **Info**), data și conținutul complet.
- Anunțurile sunt marcate automat ca citite când le deschizi.
- Anunțurile importante de tip **Update** apar și ca **notificare în partea de sus a paginii** la lansarea unei versiuni noi.

## Categorii

- **Update** — versiune nouă, funcționalități adăugate, corectări.
- **Info** — informații generale, sfaturi, evenimente.

Anunțurile sunt traduse automat în limba interfeței tale.
`,
    tips: [
      'Verifică periodic anunțurile pentru a afla despre funcționalități noi care îți pot economisi timp.',
    ],
  },
  {
    id: 'currency-language', category: 'introducere', roles: ['all'], order: 4,
    title: 'Monedă și limbă',
    image: '/manual/currency-language.png',
    imageAlt: 'Monedă și limbă',
    content: `# Monedă și limbă

## Comutator RON / EUR

Butonul **RON / EUR** din bara de sus schimbă moneda afișată în toată aplicația — calculatoare 3D, oferte, comenzi, rapoarte, dashboard.

- **Stocarea internă** se face **întotdeauna în RON**. EUR este doar afișaj, calculat dinamic la cursul setat în *Setări → Companie*.
- **Toate valorile sunt fără TVA** în calculele interne; TVA-ul se aplică doar la generarea facturii.
- Poți introduce valori în EUR — se convertesc automat în RON la salvare.

## Selector limbă

Butonul **🇷🇴 RO** deschide lista cu **9 limbi disponibile**: Română, English, Italiano, Deutsch, Polski, Français, Español, Nederlands, Hrvatski.

- Schimbarea limbii afectează **doar interfața** (meniuri, butoane, etichete, manual).
- Datele introduse de tine (denumiri clienți, descrieri, note) rămân în limba originală.
- Setarea se păstrează pentru contul tău între sesiuni.
`,
    tips: [
      'Cursul EUR se actualizează doar când îl modifici manual în Setări → Companie.',
      'Manualul de utilizare este tradus integral în toate cele 9 limbi.',
    ],
  },
  {
    id: 'working-in-eur', category: 'introducere', roles: ['all'], order: 5,
    title: 'Lucrul exclusiv în EUR (recomandat pentru abonații non-RO)',
    image: '/manual/working-in-eur.png',
    imageAlt: 'Setări → Prețuri — Curs EUR',
    content: `# Lucrul exclusiv în EUR

Acest ghid este pentru abonații care lucrează **100% în EUR** — cumpără de la furnizori în EUR și vând clienților în EUR, fără să amestece RON în catalog.

## Cum funcționează stocarea internă

- Toate prețurile se păstrează în baza de date ca un singur număr.
- Eticheta tehnică internă este „RON", dar este **irelevantă pentru tine** — nu o vezi nicăieri în interfață.
- Comutatorul **EUR** din bara de sus face conversie de afișare folosind cursul setat în *Setări → Prețuri*.

## Problema pe care o eviți

Dacă lași cursul implicit (ex: \`Curs EUR = 4,97\`) și introduci o coadă-de-rândunică la **100 EUR**, sistemul stochează intern \`497\`. Mâine, dacă cursul se schimbă la \`5,02\`, același produs apare ca **99,00 EUR** în catalog — fără să fi modificat nimic.

Acest „drift" este corect matematic, dar creează disconfort și pare un bug.

## Soluția recomandată — 3 pași

1. **Setări → Prețuri** → setează **Curs EUR = 1**.
2. În bara de sus, selectează **EUR** ca monedă activă.
3. Introdu toate prețurile direct în EUR în *Setări → Prețuri* (și în comenzile noi).

## Ce câștigi

- Prețurile rămân **absolut stabile** — 100 EUR azi = 100 EUR peste un an.
- Zero conversie la salvare, **zero drift**.
- PDF-urile de ofertă, comenzile și rapoartele ies natural în EUR.
- Comenzile istorice nu se mai „mișcă" în timp.

## Ce NU se schimbă

- Eticheta tehnică „RON" rămâne în baza de date (invizibilă în UI).
- Toată logica aplicației funcționează identic — nicio funcționalitate pierdută.

## Limitări — când NU folosi această configurare

- Dacă ai **furnizori în RON** și clienți în EUR (flux mixt) → ai nevoie de cursul real.
- Dacă lucrezi în altă monedă (PLN, HRK etc.) → contactează echipa iSoftGlass pentru extensie.
`,
    tips: [
      'Schimbarea Curs EUR = 1 afectează doar conversia de afișare — nu modifică nicio valoare deja salvată.',
      'Recomandat să faci această configurare înainte de a introduce primele prețuri în catalog.',
    ],
  },
  {
    id: 'production-scanner', category: 'productie', roles: ['all'], order: 2,
    title: 'Scanner producție (coduri de bare)',
    image: '/manual/production-scanner.png',
    imageAlt: 'Scanner producție (coduri de bare)',
    content: `# Scanner producție

Pagina **Producție → Scanner** (\`/productie/scanner\`) îți permite să avansezi rapid comenzi între etapele Kanban folosind un **scanner de coduri de bare CODE128** conectat ca tastatură HID.

## Cum funcționează

1. Deschide pagina **Scanner**. Câmpul de input are auto-focus permanent.
2. **Scanează codul de bare** de pe fișa de producție sau eticheta produsului.
3. Aplicația identifică automat comanda și o **avansează în etapa următoare** din Kanban (ex: *Debitare* → *Șlefuire*, *Șlefuire* → *Securizare*).
4. Confirmarea apare pe ecran cu sunet și culoare verde; eroarea (cod necunoscut) cu roșu.

## Cerințe

- Scanner CODE128 configurat ca **HID keyboard** (modul standard, fără drivere).
- Suffix **Enter (\\r)** după fiecare scanare (setare implicită pe majoritatea modelelor).

## Avantaje

- Operatorul nu mai trebuie să caute comenzi manual în Kanban.
- Trasabilitate completă: timpul fiecărei etape este salvat automat.
- Funcționează și pe tabletă cu scanner Bluetooth.
`,
    tips: [
      'Dacă pierzi focus pe input (click în altă parte), simpla scanare îl readuce automat.',
      'Câmpul ignoră tastarea manuală mai lentă de 50ms — doar scanner-ul declanșează avansarea.',
    ],
    warnings: [
      'Scanarea unui cod deja la ultima etapă nu produce niciun efect — comanda rămâne acolo.',
    ],
  },
  {
    id: 'processing-cad', category: 'productie', roles: ['all'], order: 3,
    title: 'Prelucrări și Editor CAD',
    image: '/manual/processing-cad.png',
    imageAlt: 'Prelucrări și Editor CAD',
    content: `# Prelucrări și Editor CAD

Pagina **Prelucrări** (\`/prelucrari\`) este atelierul tehnic pentru fișele de producție: găuri, balamale, mânere, decupaje, prelucrări de margine — toate vizualizate pe geam într-un editor CAD interactiv.

## Fișa de prelucrare

- Listă completă a panourilor din comandă (cu dimensiuni și tip sticlă).
- Pentru fiecare panou: lista de prelucrări (cod șablon + parametri: distanță, diametru, offset).
- Multe prelucrări se **completează automat** din configurația 3D (balamale, mânere, încuietori) — editezi doar excepțiile.

## Editor CAD — comenzi rapide

| Tastă | Acțiune |
|---|---|
| **J** | JOIN — unește două prelucrări apropiate (toleranță 10mm) |
| **Ctrl + D** | Duplică prelucrarea selectată |
| **Ctrl + Shift + D** | Duplică **toate** prelucrările pe alt panou (oglindire automată pe X) |
| **Delete** | Șterge prelucrarea selectată |
| **Click stânga + drag** | Mută prelucrarea |
| **Roată mouse** | Zoom |

## Șabloane

Catalogul **Șabloane prelucrare** (categorii: **30. balamale & cutout-uri**, **51. găuri pentru mânere**) se sincronizează automat cu accesoriile alese în 3D. Adăugarea unei balamale noi în catalog generează cutout-ul corect pe geam.

## Export

- **DXF** (R9 → R2010) — pentru CNC industrial, cu mapare layere.
- **PDF** — pentru atelier, cu cote și legendă prelucrări.
- Butonul **„Trimite la CNC"** generează DXF + listă de tăiere combinate.
`,
    tips: [
      'Pasul de poziționare este 0.5mm; folosește virgula pentru zecimale.',
      'Elementele neselectate sunt afișate negru — selectează pentru a vedea cotele și parametrii.',
    ],
    warnings: [
      'Modificările pe panou se salvează doar când apeși **Salvează prelucrare** — schimbarea de pagină fără salvare le pierde.',
    ],
  },
  {
    id: 'operational-dashboard', category: 'operational', roles: ['all'], order: 0,
    title: 'Dashboard Operațional',
    image: '/manual/operational-dashboard.png',
    imageAlt: 'Dashboard Operațional',
    content: `# Dashboard Operațional

Pagina **Dashboard Operațional** (\`/operational\`) este panoul unic pentru atelier și logistică: vezi în timp real ce se întâmplă pe producție, montaj, service și debitare.

## Carduri sintetice

- **Producție**: număr de comenzi în fiecare etapă Kanban (debitare, șlefuire, securizare, asamblare, ambalare).
- **Montaj**: lucrări programate azi / săptămâna aceasta, întârzieri.
- **Service**: intervenții deschise, prioritate, SLA.
- **Debitare**: panouri în coada de optimizare, sticlă alocată per planșă.

## Auto-refresh

Pagina se reîncarcă **automat la fiecare 60 de secunde** — poți lăsa un ecran TV în atelier afișând-o permanent.

## Acțiuni rapide

- Click pe orice card te duce direct la pagina detaliată (Kanban producție, listă montaj, etc.).
- Butonul **„Reîmprospătează acum"** forțează actualizarea imediată.
`,
    tips: [
      'Folosește această pagină pe un ecran mare în atelier pentru vizibilitate la nivel de echipă.',
      'Pentru indicatori financiari (cifră de afaceri, marje) folosește Dashboard-ul principal.',
    ],
  },
  {
    id: 'reports', category: 'operational', roles: ['all'], order: 3,
    title: 'Rapoarte',
    image: '/manual/reports.png',
    imageAlt: 'Rapoarte',
    content: `# Rapoarte

Pagina **Rapoarte** (\`/rapoarte\`) îți oferă vizibilitate completă asupra vânzărilor și consumului de materiale.

## Rapoarte disponibile

1. **Vânzări lunare** — cifră de afaceri pe lună, defalcat pe categorii (duș, uși, balustrade etc.) și pe operator de vânzări.
2. **Consum materiale** — cantitățile de sticlă, profile și accesorii consumate într-un interval, agregat pe cod produs.
3. **Top clienți** — clasament după valoare comenzi în perioada selectată.
4. **Marje** — diferență cost producție vs preț vânzare, pe comandă.

## Filtre

- **Interval de date** (calendar de la / până la).
- **Categorie produs**.
- **Operator** (vânzător).
- **Status comandă** (ofertă, confirmată, în producție, livrată).

## Export

Toate rapoartele se exportă în **CSV** cu **BOM UTF-8** (Excel deschide corect diacriticele românești).

Valorile respectă comutatorul global **RON / EUR**.
`,
    tips: [
      'Pentru analiză externă în Excel, folosește export CSV — BOM-ul garantează că diacriticele apar corect.',
      'Filtrele se păstrează între sesiuni pentru contul tău.',
    ],
  },
  {
    id: 'installation-reports', category: 'operational', roles: ['all'], order: 4,
    title: 'Rapoarte montaj',
    image: '/manual/installation-reports.png',
    imageAlt: 'Rapoarte montaj',
    content: `# Rapoarte montaj

Pagina **Rapoarte montaj** (\`/rapoarte-montaj\`) urmărește performanța echipelor de instalare și optimizează planificarea.

## Ce vezi

- **Performanță pe echipă**: număr de montaje finalizate, timp mediu pe lucrare, distanță parcursă.
- **Hartă cu rute optimizate** — sistemul propune ordinea optimă a lucrărilor zilei pentru fiecare echipă (algoritm de minimizare distanță).
- **Checklist finalizare** — procent de checklist-uri completate corect, semnături client.
- **Incidente** — lucrări amânate, reclamații, retururi.

## Filtre

- **Interval** (zi / săptămână / lună).
- **Echipă** sau **vehicul**.
- **Zonă geografică**.

## Acțiuni rapide

- Click pe o lucrare deschide detaliile complete: client, adresă, produse, fotografii înainte/după, semnătură.
- Butonul **„Reprogramează"** mută lucrarea în calendar fără a pierde checklistul completat.
`,
    tips: [
      'Ruta optimizată ține cont de programul fiecărei echipe și de ferestrele orare confirmate cu clienții.',
      'Alertele ITP/RCA pentru vehicule apar cu 30 de zile înainte de expirare.',
    ],
  },
  {
    id: 'data-export', category: 'setari', roles: ['all'], order: 17,
    title: 'Export & Import date',
    image: '/manual/export-date.png',
    imageAlt: 'Setări › Date — export și import',
    accent: 'green',
    content: `# Export & Import date

În **Setări → Date** ai control complet asupra datelor introduse în platformă. Toate datele aparțin abonatului, sunt izolate strict pe companie (RLS pe \`company_id\`) și **pot fi exportate sau reimportate oricând, fără nicio restricție**.

---

## 1. Export date

![Zona de export date](/manual/export-date.png)

Cardul **Export date** îți pune la dispoziție 5 butoane:

- **Clienți (CSV)** — listă completă cu nume, tip, firmă, contact, adresă, CUI, discount, observații.
- **Oferte (CSV)** — toate ofertele cu nr. referință, produs, client, preț, TVA, adaos, status, dată.
- **Comenzi (CSV)** — comenzi cu nr., status, subtotal, discount, total, plătit, livrare, observații.
- **Materiale (CSV)** — catalogul propriu cu cod, nume, tip, unitate, preț, stoc, furnizor, locație.
- **Export complet (JSON)** — un singur fișier cu toate cele 4 tabele de mai sus + marcaj de timp (\`exported_at\`).

### Cum exporți

1. Mergi la **Setări → tab Date**.
2. Apasă butonul corespunzător categoriei dorite (sau **Export complet** pentru tot).
3. Fișierul se descarcă automat în folderul tău de Descărcări. Numele conține data: \`clienti_2026-05-22.csv\`, \`export_complet_2026-05-22.json\`.
4. Deschide CSV-ul direct în Excel / LibreOffice (BOM UTF-8 garantează diacriticele corecte) sau JSON-ul în orice editor de text.

> **Important pentru abonați:** ai dreptul GDPR la **portabilitatea datelor**. Poți exporta și păstra local toate datele tale, oricând și de oricâte ori dorești, fără limită.

---

## 2. Import date

![Zona de import date](/manual/export-date-import.png)

Cardul **Import date** îți permite să încarci înapoi în platformă fișiere CSV (pe categorie) sau un JSON complet salvat anterior. Util pentru:

- **migrare** de pe alt sistem (pregătești CSV-ul cu aceleași headere ca exportul),
- **restaurare** după o ștergere greșită (folosind ultimul export complet),
- **încărcare în masă** a unei liste de clienți, materiale sau oferte.

### Cum imporți

1. În cardul **Import date** apasă butonul categoriei (Clienți / Oferte / Comenzi / Materiale) pentru CSV, sau **Import complet** pentru JSON.
2. Selectează fișierul de pe calculator.
3. Se deschide un **dialog de previzualizare** care îți arată: tabelul vizat, numărul de înregistrări detectate și primele coloane găsite.
4. Verifică datele și apasă **Confirmă import** (sau Anulează dacă fișierul nu arată corect).
5. La final apare un toast cu numărul de rânduri importate cu succes / erori.

### Chei de conflict (duplicate)

Importul folosește o cheie unică per tabel ca să decidă dacă un rând e nou sau existent:

| Tabel | Cheie de conflict |
|---|---|
| Clienți | \`name\` |
| Oferte | \`ref_number\` |
| Comenzi | \`order_number\` |
| Materiale | \`code\` |

Rândurile cu o cheie deja existentă pot fi **suprascrise** — fă un export înainte de import dacă vrei o copie de siguranță.

### Format așteptat

- **CSV** — același set de headere ca în exportul corespunzător (în română), encoding UTF-8.
- **JSON** — exact structura produsă de **Export complet** (\`clients\`, \`quotes\`, \`orders\`, \`materials\` + \`exported_at\`).

---

## Detalii tehnice

- Exportul descarcă **toate înregistrările**, cu paginare automată câte 1000 în spate.
- Importul procesează loturi de 100 de rânduri și injectează automat contextul de companie (RLS).
- Tot ce exporți / imporți este izolat pe compania ta — niciun alt abonat nu vede sau scrie peste datele tale.
`,
    tips: [
      'Fă un export complet (JSON) lunar — este cea mai sigură formă de backup local.',
      'Înainte de orice import în masă, exportă tabelul vizat ca să ai versiunea anterioară la îndemână.',
      'Pentru CSV cu diacritice, deschide în Excel via *Date → Din text/CSV* cu encoding UTF-8.',
    ],
  },
  {
    id: 'data-protection', category: 'setari', roles: ['all'], order: 18,
    title: 'Protecția datelor',
    image: '/manual/protectia-datelor.png',
    imageAlt: 'Carduri Backup / Recuperare / Securitate',
    content: `# Protecția datelor

Securitatea și disponibilitatea datelor tale sunt o prioritate ridicată. Platforma beneficiază de protecție multi-strat și conformitate GDPR.

## Backup automat

- **Backup zilnic automat**, fără intervenție din partea ta.
- Retenție în istoric pe minim 7 zile (Point-in-Time Recovery).
- Backup-urile sunt criptate și stocate redundant pe centre de date europene.

## Recuperare

- În cazul unei pierderi accidentale (ștergere greșită, import eronat), datele pot fi recuperate la cerere prin echipa de support.
- Recomandăm și **export periodic local** (vezi secțiunea *Export date*) ca strat suplimentar de siguranță aflat 100% sub controlul tău.

## Securitate

- **Izolare multi-tenant strictă** prin Row-Level Security pe \`company_id\` — niciun alt abonat nu poate accesa datele tale.
- **Criptare în tranzit** (HTTPS/TLS) și **la repaus** pe disc.
- **JWT** pentru sesiuni, **hashing puternic** pentru parole.
- Verificare **HIBP (Have I Been Pwned)** la crearea contului și la schimbarea parolei — împiedică folosirea parolelor compromise public.
- Centre de date europene, conformitate **GDPR**.

## Drepturile tale GDPR

| Drept | Cum îl exerciți |
|---|---|
| Portabilitate | Export oricând din Setări → Date |
| Acces | Vezi toate datele tale direct în platformă |
| Rectificare | Editezi orice câmp în interfețele dedicate |
| Ștergere | La cerere prin support (\`isoftplustech@gmail.com\`) |

## Recomandări utilizator

- Folosește o **parolă puternică** și unică pentru contul tău.
- Nu partaja contul — pentru colegi creează utilizatori dedicați (Setări → Echipă).
- **Logout** pe dispozitive publice sau partajate.
- Fă **export lunar** și păstrează fișierul într-o locație sigură (cloud personal, hard extern).
- Consultă [Politica de confidențialitate](/privacy-policy) și [Politica de cookie-uri](/cookie-policy) pentru detalii complete.
`,
    tips: [
      'Datele tale rămân ale tale: la orice moment le poți exporta integral în format deschis (CSV/JSON).',
      'Stratul cel mai sigur este combinația: backup automat platformă + export local lunar.',
    ],
    warnings: [
      'Niciodată nu transmite parola contului prin email, chat sau telefon — echipa de support nu îți va cere niciodată parola.',
    ],
  },
];
