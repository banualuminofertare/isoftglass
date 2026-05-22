import type { ManualSection, ManualCategory } from './types';

export const categoriesNL: ManualCategory[] = [
  { id: 'introducere', label: 'Eerste stappen', order: 1 },
  { id: 'calculatoare', label: '3D-configuratoren', order: 2 },
  { id: 'vanzari', label: 'Verkoop', order: 3 },
  { id: 'productie', label: 'Productie', order: 4 },
  { id: 'operational', label: 'Operationeel', order: 5 },
  { id: 'setari', label: 'Instellingen', order: 6 },
];

export const sectionsNL: ManualSection[] = [
  {
    id: 'getting-started', category: 'introducere', roles: ['all'], order: 1,
    title: 'Welkom bij iSoftGlass',
    image: '/manual/setari-companie.png',
    imageAlt: 'iSoftGlass-scherm — Bedrijfsinformatie',
    content: `# Welkom bij iSoftGlass

iSoftGlass is het **SaaS**-platform voor glasproducenten en -distributeurs. Het dekt de volledige workflow: 3D-configuratie → offerte → bestelling → productie → levering → service.

## Wat u in 5 minuten kunt doen

1. **Vul uw bedrijfsgegevens in** via *Instellingen → Bedrijf* (CUI, adres, IBAN, logo).
2. **Controleer de prijzen** in *Instellingen → Prijzen* — de standaardcatalogus wordt automatisch geladen, u past alleen aan wat verschilt.
3. **Voeg uw eerste klant toe** via *Klanten → Nieuwe klant* (of laat het automatisch aanmaken wanneer u de eerste offerte opslaat).
4. **Open een 3D-configurator** vanuit het zijmenu (bijv. *Douchecabines*) en configureer in 6 stappen.
5. **Opslaan als offerte** — deze verschijnt in *Bestellingen* met een PDF die klaar is om te verzenden.
6. **Stuur naar productie** wanneer de klant bevestigt — de voorraad wordt automatisch afgeschreven.`,
    tips: [
      'De bovenste balk heeft een RON / EUR-schakelaar — de interne prijzen zijn altijd in RON, dit is enkel voor weergave.',
      'Klik op elk moment op het 📖-icoon (blauwgroen) om deze handleiding opnieuw te openen op de huidige sectie.',
    ],
  },
  {
    id: 'header-icons', category: 'introducere', roles: ['all'], order: 2,
    title: 'Bovenbalk en snelkoppelingen',
    content: `# Bovenbalk

In de rechterbovenhoek vindt u alle algemene commando's:

1. 🔔 **Gele bel (amber)** — aankondigingen en nieuws gepubliceerd door het iSoftGlass-team. Het rode getal = ongelezen aankondigingen.
2. 📖 **Handleiding (blauwgroen kader)** — de handleiding die u nu leest. Deze opent op de sectie die relevant is voor de huidige pagina.
3. **RON / EUR** — wijzigt de weergegeven valuta in de hele applicatie. De omrekening gebruikt de wisselkoers uit *Instellingen → Bedrijf*.
4. **🇷🇴 RO** — taalkiezer. We ondersteunen 9 talen (RO, EN, IT, DE, PL, FR, ES, NL, HR).
5. **Logout** — veilig uitloggen uit uw account.

## Zijbalk — het linkermenu

- **Main** — Dashboard, 3D-configuratoren, Instellingen
- **Operational** — Bestellingen, Productie, Scanner, Klanten, Rapporten, Montage
- Klik op de **⬅**-knop naast het logo om de zijbalk in te klappen (meer schermruimte).`,
    tips: [
      'De interne opslag van prijzen is altijd in RON — de omschakeling naar EUR is puur voor weergave.',
      'Het wijzigen van de taal beïnvloedt alleen de interface; ingevoerde gegevens blijven in de originele taal.',
    ],
  },
  {
    id: 'calc-flow-6-steps', category: 'calculatoare', roles: ['all'], order: -1,
    title: 'De 6 stappen in een 3D-configurator',
    image: '/manual/calc-step6-finalizare.png',
    imageAlt: 'Stap 6 - offerte afronden met klantgegevens en knoppen PDF/Opslaan/Toevoegen aan winkelwagen',
    content: `# De 6 stappen in een 3D-configurator

Elke 3D-configurator (douchecabine, deur, balustrade, spiegel, keukenfront, paneel) volgt **dezelfde lineaire workflow in 6 stappen**. Bij elke stap ziet u rechts de 3D-visualisatie die in real-time wordt bijgewerkt, en de voortgang wordt bovenaan weergegeven.

---

## Stap 1 — Producttype

U kiest de vorm of typologie (bijv. **Hoek 90°**, **Walk-in / Niche**, **Pentagon**, **Badwandscherm**, **Vast paneel**). Elk type laadt vooraf de basisgeometrie en de lijst met geschikte profielen.

![Stap 1 - selectie producttype](/manual/calc-step1-tip.png)

## Stap 2 — Openingssysteem

U kiest de werking: **met scharnieren** (klassiek), **pivot** boven-onder (minimalistisch) of **schuivend** op een rail (ruimtebesparend). Uw selectie hier bepaalt automatisch welke accessoires u in Stap 5 kunt toevoegen.

![Stap 2 - openingssysteem](/manual/calc-step2-dimensiuni.png)

## Stap 3 — Glas

U stelt de **dikte** (6/8/10/12 mm), **afwerking** (transparant, grijs, brons, gezandstraald) en opties in: **antikalkbehandeling**, **randafwerking**, **harden**, **lamineren**. De prijs van het glas wordt direct herberekend.

![Stap 3 - glaskeuze](/manual/calc-step3-sticla.png)

## Stap 4 — Deurconfiguratie & afmetingen

U bepaalt de **openingszijde** (frontaal / lateraal), de **draairichting** (naar binnen / naar buiten), de **scharnierzijde** (links / rechts) en de uiteindelijke **afmetingen** (breedte × hoogte × diepte). Klik op een maatlijn in de 3D-scène voor snelle bewerking (Enter / Tab slaat op).

![Stap 4 - deur en afmetingen](/manual/calc-step4-profile.png)

## Stap 5 — Profielen & accessoires

U kiest uit gepersonaliseerde lijsten: **dichtingsprofielen**, **U- / randprofielen**, **stabilisatiestangen**, **extra kits**. Voor volledige details over hoe deze stap werkt, zie de sectie **„Hoe accessoires werken in de configuratoren”**.

![Stap 5 - profielen en accessoires](/manual/calc-step5-accesorii.png)

---

## Stap 6 — Offerte afronden (gedetailleerd)

Hier zet u de configuratie om in een commerciële actie. Stap 6 heeft 3 duidelijke zones: **klantgegevens**, **extra bedrag & totaal**, en **actieknoppen**.

![Stap 6 - afronden](/manual/calc-step6-finalizare.png)

### Klantgegevens (Client info)

- **Klanttype** — Particulier / Bedrijf / Distributeur. **Zeer belangrijk**: het type dat u hier kiest, past automatisch de marge toe die is geconfigureerd in **Instellingen → Klantmarges**, dus de weergegeven prijs houdt al rekening met de marge per type.
- **Klantnaam** — de naam die op de offerte en de PDF verschijnt.
- **Telefoon** & **E-mail** — contactgegevens die worden gebruikt in de CRM en voor het verzenden van de offerte.

> Bij het opslaan zal het systeem, als de klantnaam niet in de CRM-database bestaat, **automatisch een nieuwe fiche aanmaken**. Als de klant wel bestaat, wordt de bestaande fiche gebruikt (matching op naam).

### Extra bedrag (Extra amount)

Het veld **„Extra amount” / „Extra bedrag”** stelt u in staat om een vrij bedrag toe te voegen bovenop het berekende subtotaal. Waarvoor is dit in de praktijk handig:

- **Transport** naar de klant (bijv. +150 RON voor levering).
- **Extra montage** buiten het standaardpakket.
- **Speciaal werk** (bijv. boren in graniet, niet-standaard onderdelen).
- **Spoedtoeslag** wanneer de klus met voorrang moet worden uitgevoerd.
- **Commerciële korting** — voer een **negatieve** waarde in (bijv. -50 RON) en deze wordt van het totaal afgetrokken.

Het bedrag wordt opgeteld bij het subtotaal **vóór** btw en verschijnt apart op de PDF, transparant voor de klant.

### Subtotaal, btw en totaal

De kaart toont in real-time: **Subtotaal (excl. btw)**, **Btw %** (uit instellingen) en **Totaal incl. btw**. Het wijzigen van een parameter (glas, accessoire, extra bedrag) zorgt voor een onmiddellijke herberekening.

### De 3 actieknoppen

1. **PDF downloaden** — genereert de offerte-PDF (bedrijfslogo, klantgegevens, productlijst met 3D-snapshot 70×47 px, accessoires gegroepeerd per code, werkuren, totaal incl. btw). **Gebruikt voor** snelle verzending via e-mail / WhatsApp, **zonder** op te slaan in het systeem. Handig wanneer u alleen een indicatieve prijsopgave wilt.

2. **Offerte opslaan** — creëert in de database een offerte met nummer **OFR-YYYYMMDD-HHMMSS** en een **bestelling met status „Offerte”**. **Gebruikt wanneer** de offerte definitief is en u deze later wilt terugvinden in **Bestellingen**, opnieuw wilt bewerken of omzetten in een werkorder.

3. **Aan winkelwagen toevoegen** — voegt het huidige product toe aan de **actieve winkelwagen** (icoon rechtsonder met tellerbadge) **zonder** de bestelling af te ronden. **Gebruikt voor** offertes met meerdere producten: bijv. douche + spiegel + keukenfront voor dezelfde klant — u voegt ze één voor één toe, en rondt vervolgens de hele winkelwagen af als één enkele bestelling.

---

## Wat gebeurt er na „Aan winkelwagen toevoegen”

![Winkelwagen met toegevoegde producten](/manual/cos-flow.png)

### 1. De winkelwagen (icoon rechtsonder)

Klik op het winkelwagenicoon met de tellerbadge en het zijpaneel **Order Products** opent:

- Toont alle toegevoegde producten, elk met **afmetingen**, **glasdikte** en **prijs**.
- **+ / -** knoppen voor de hoeveelheid per item.
- Het rode **prullenbak**-icoon verwijdert het item.
- De knop **„Empty” / „Legen”** verwijdert de hele winkelwagen.
- Onderaan: **Order total** (de som van alle producten).

### 2. Bestelling afronden

U klikt op **„Finalize” / „Afronden”** en het dialoogvenster **Create order from cart** opent:

![Dialoogvenster bestelling afronden](/manual/cos-finalizare.png)

- **Cart products** — overzicht van de producten in de winkelwagen met het totaalbedrag.
- **Client** — klantgegevens (automatisch overgenomen van het laatst toegevoegde product).
- **Delivery Address** — leverings- / montageadres.
- **Delivery Date** — geschatte levertermijn.
- **Notes** — interne opmerkingen.

U klikt op **Create Order**: het systeem genereert een uniek bestelnummer en plaatst de bestelling in **Bestelbeheer** met de status **„Offerte”**.

### 3. In Bestelbeheer

De bestelling verschijnt onmiddellijk in de lijst. Vanaf hier kunt u:

- De geconsolideerde **PDF downloaden** (alle producten samengevoegd, accessoires gesommeerd per code).
- **Naar productie sturen** — de voorraad wordt automatisch afgeschreven, de productiebon en de Kanban-kaart worden aangemaakt.
- Een **factuur** of **proforma (voorschot)** uitreiken.
- De **montage inplannen** voor het installatieteam.
- De **bestelling openen** (klik op de rij) voor de tabbladen **Details / Producten / Geschiedenis / Voorbeeld**.

### 4. Latere bewerking

Vanuit het tabblad **Producten** van een bestelling brengt de knop **Bewerken** u terug naar de oorspronkelijke configurator met de **volledige configuratie hersteld** uit \`full_config\` — inclusief klanttype, extra bedrag en accessoires. U wijzigt → slaat op → de bestelling wordt automatisch bijgewerkt.`,
    tips: [
      'Bij Stap 6, het wijzigen van het **Klanttype** tussen Particulier / Bedrijf / Distributeur herberekent onmiddellijk het hele subtotaal met de juiste marge.',
      'Gebruik **PDF downloaden** voor snelle prijsopgaven via e-mail, en **Offerte opslaan** alleen als de offerte definitief is — zo vermijdt u dat de geschiedenis vol komt te staan met concepten.',
      'Met de winkelwagen kunt u meerdere producten voor dezelfde klant configureren en ze in **één enkele bestelling** met één geaggregeerde PDF verzenden.',
      'De volledige configuratie (inclusief het extra bedrag en het klanttype) wordt opgeslagen in `full_config` — bij het opnieuw openen is alles precies zoals het was.',
    ],
    warnings: [
      'Een negatief extra bedrag (korting) controleert NIET of het totaal onder nul komt — let goed op de waarde.',
      'Als u de prijzen in de Instellingen wijzigt **nadat** u een offerte hebt opgeslagen, worden oude offertes **niet** automatisch herberekend — ze behouden de oorspronkelijke waarden.',
    ],
  },
  {
    id: 'accessory-flow', category: 'calculatoare', roles: ['all'], order: 0,
    title: 'Hoe accessoires werken in de configuratoren',
    image: '/manual/accesorii-import.png',
    imageAlt: 'Accessoirescatalogus — knop \'Importeren in mijn lijst\'',
    content: `# Hoe accessoires werken in de configuratoren

Alle 3D-configuratoren (Douchecabine, Deuren, Balustrade, Spiegel, Keukenfront, Scheidingswanden) gebruiken **hetzelfde systeem** voor accessoires: scharnieren, handgrepen, U-profielen, stabilisatiestangen, schuifsystemen, stoppers, sloten, enz.

De logica is eenvoudig en hoeft maar **één keer** te worden uitgevoerd:

> **Importeren uit de catalogus → wordt opgeslagen in 'Selecteer product' → overal te gebruiken, in elke offerte.**

U hoeft het accessoire niet bij elke klus opnieuw te zoeken — eenmaal geïmporteerd, blijft het in uw persoonlijke lijst totdat u besluit het te verwijderen.

---

## Stap 1 — Open de accessoirescatalogus

Ga naar **Instellingen → Prijzen → Accessoires** (of direct **Instellingen → Accessoirescatalogus**, afhankelijk van uw interfaceversie).

Hier ziet u de algemene catalogus van het systeem — duizenden codes gegroepeerd per categorie: scharnieren, handgrepen, U-profielen, schuifsystemen, dichtingen, stabilisatiestangen, stoppers, sloten, houders, afdekkappen.

![Accessoirescatalogus](/manual/accesorii-import.png)

- Gebruik de **transversale zoekfunctie** (bovenaan) — zoek op code, naam of afwerking in alle categorieën.
- De filters aan de zijkant beperken de zoekopdracht tot een categorie / subcategorie.

## Stap 2 — Importeer de benodigde accessoires

Op de rij van elk accessoire in de catalogus staat een knop **„Importeren”** (of „Toevoegen aan mijn lijst”). Klik erop — het accessoire wordt onmiddellijk toegevoegd aan **uw persoonlijke lijst**, die is geïsoleerd per bedrijf (strikte RLS).

Vink meerdere rijen aan en druk op **„Selectie importeren”** om een hele groep toe te voegen (bijv. de hele set scharnieren voor douchecabines).

> **Dit doet u maar één keer.** Na het importeren is het accessoire beschikbaar voor alle gebruikers binnen uw bedrijf, in alle configuratoren.

## Stap 3 — Controleer de prijzen en eenheden

In uw lokale lijst toont elk accessoire:

- **Code** en **naam** (overgenomen uit de catalogus).
- **Prijs** (u kunt uw eigen override instellen — dit heeft geen invloed op de algemene catalogus).
- **Eenheid** (st, lm, set) — ondersteunt ook decimale waarden voor lm.
- Beschikbare **afwerking** (chroom, mat, geborsteld, enz.).

Wijzig de prijs direct in de cel — de wijziging wordt automatisch opgeslagen en verschijnt onmiddellijk in de configuratoren.

## Stap 4 — Open in de configurator „Selecteer product”

Ga naar een configurator (bijv. **Douchecabines**), en ga naar de stap **Accessoires** (scharnieren, handgreep, U-profiel, stang, enz.).

Voor elk slot toont de dropdown **„Selecteer product”** **alleen de accessoires die u hebt geïmporteerd** — beperkt tot het juiste type (bijv. bij het Handgreep-slot ziet u alleen handgrepen).

![Dropdown 'Selecteer product' in de configurator](/manual/accesorii-selecteaza-produs.png)

- De lijst is overzichtelijk: u wordt niet overweldigd door duizenden irrelevante codes.
- Snel zoeken in de dropdown op code of naam.

## Stap 5 — Pas de hoeveelheid en afwerking aan

Nadat u het accessoire hebt gekozen:

- **Hoeveelheid** — voor scharnieren kunt u 2 of 3 kiezen (uw keuze is bindend en overschrijft de automatische regel).
- **Afwerking** — kleur/afwerking uit de beschikbare varianten (met een fallback naar het moederitem als de exacte variant ontbreekt).
- **Positie** — scharnieren worden van boven naar beneden gemeten, de handgreep van beneden naar boven (een industriestandaard, al voorgeconfigureerd).

## Stap 6 — Sla de configuratie op → de accessoires worden aan de offerte toegevoegd

U klikt op **„Offerte opslaan”** of **„Aan winkelwagen toevoegen”**. De geselecteerde accessoires:

1. Worden aan het product gekoppeld met hun prijs in RON (weergave is om te rekenen naar EUR).
2. Verschijnen in de **OrderPreview** en op de offerte-PDF, automatisch gegroepeerd per code (dezelfde code = som van de hoeveelheden).
3. Worden opgeslagen in de \`full_config\` JSON — de 'single source of truth' voor de PDF, DXF en latere bewerkingen.
4. Bij het versturen naar productie, wordt de **voorraad automatisch verlaagd** conform de hoeveelheden in de offerte.

![Accessoire toegevoegd aan de offerte](/manual/accesorii-in-oferta.png)`,
    tips: [
      'U importeert maar één keer — daarna blijven de accessoires beschikbaar in „Selecteer product” voor al uw collega\'s binnen het bedrijf.',
      'Prijzen kunnen lokaal worden overschreven (override per bedrijf) zonder de systeemcatalogus te beïnvloeden.',
      'U gebruikt dezelfde workflow in ALLE configuratoren: douche, deuren, balustrade, spiegel, keukenfront, wanden.',
    ],
    warnings: [
      'Als u een accessoire uit uw persoonlijke lijst verwijdert, blijven oude offertes geldig (de configuratie is opgeslagen in `full_config`), maar u kunt het niet meer selecteren in nieuwe projecten totdat u het opnieuw importeert.',
    ],
  },
  {
    id: 'calc-shower', category: 'calculatoare', roles: ['all'], order: 1,
    title: 'Configurator Douchecabine',
    image: '/manual/calc-dus.png',
    imageAlt: '3D-configurator voor douchecabine',
    content: `# Configurator Douchecabine

Configureer visueel in 3D elk type cabine: hoek 90°, walk-in, pentagon, badwand, vast paneel.

## De 6 stappen

1. **Cabinetype** — kies de vorm (hoek 90°, niche, pentagon, badwandscherm, vast).
2. **Afmetingen** — klik op de maatlijn in de 3D-scène om deze te bewerken (Enter / Tab slaat op).
3. **Glas** — dikte (8/10/12 mm), afwerking (helder, grijs, brons), optioneel harden.
4. **Profielen** — U, muur, hoek 90°, schuifkit (indien van toepassing).
5. **Accessoires** — scharnieren (2 of 3), handgreep, stabilisatiestang, dichtingen.
6. **Opslaan** — als offerte of direct als nieuw project.`,
    tips: [
      'Scharnieren worden van **boven naar beneden** gemeten, en de handgreep van **beneden naar boven** — dit is de industriestandaard.',
      'Het vaste paneel heeft GEEN impliciete aftrek van 10 mm — alleen de gecombineerde profielen + dichtingen.',
      'Het schuifsysteem vereist geen scharnieren en berekent automatisch de overlapping uit de kit.',
    ],
    warnings: [
      'Bij een hoek van 90° worden de U-profielen op de kruising geforceerd verborgen om dubbele telling te voorkomen.',
    ],
  },
  {
    id: 'calc-door', category: 'calculatoare', roles: ['all'], order: 2,
    title: 'Configurator Glazen Deuren',
    image: '/manual/calc-usa.png',
    imageAlt: '3D-configurator voor glazen deur',
    content: `# Configurator Deuren

Voor binnendeuren met scharnieren, pivot of schuivend op een rail.

## Stappen

1. **Systeem** — Met scharnieren, Pivot top-bottom, Schuivend op rail.
2. **Afmetingen** — breedte, hoogte, deurnis.
3. **Glas** — dikte en afwerking.
4. **Zijdichtingen** — array \`lateralSelections\` met aparte opties voor links/rechts/boven/onder.
5. **Uitsparingen** — voor handgreep of slot (drempel >50 mm = groot, ≤50 mm = klein).
6. **Accessoires** — scharnieren, handgreep, stopper, slot.`,
    tips: [
      'Het pivot-systeem wordt automatisch berekend op basis van het gewicht van het glas.',
      'Bij een schuifsysteem zijn de rail en geleider in de kit inbegrepen — voeg ze niet apart toe.',
    ],
  },
  {
    id: 'calc-balustrade', category: 'calculatoare', roles: ['all'], order: 3,
    title: 'Configurator Balustrades',
    image: '/manual/calc-balustrada.png',
    imageAlt: '3D-configurator voor balustrade',
    content: `# Configurator Balustrades

Configuratie van glazen balustrades: binnen, buiten (gelaagd verplicht), trappen (schuine panelen).

## Stappen

1. **Type** — Binnen, Buiten, Trappen.
2. **Totale lengte** en **hoogte** — in mm.
3. **Glas** — gelaagd 8+8, 10+10 of enkel gehard (alleen binnen).
4. **Bevestiging** — doorlopend U-profiel, spotklemmen, balusters.
5. **Handleuning** — optioneel (hout, rvs, aluminium).
6. **Afdekkappen** — voor U-profiel.`,
    warnings: [
      'Voor buitengebruik MOET het glas gelaagd zijn — een verplichte veiligheidsnorm.',
    ],
  },
  {
    id: 'calc-mirror', category: 'calculatoare', roles: ['all'], order: 4,
    title: 'Configurator Spiegels',
    image: '/manual/calc-oglinda.png',
    imageAlt: '3D-configurator voor spiegel',
    content: `# Configurator Spiegels

Voor eenvoudige spiegels of met speciale bewerkingen.

## Stappen

1. **Vorm** — Rechthoek, Vierkant, Cirkel, Ovaal, Op maat.
2. **Afmetingen** — in mm; voor een aangepaste vorm tekent u in de CAD-editor.
3. **Spiegeltype** — standaard verzilverd, antiek, rook, brons.
4. **Rand** — geslepen, gefacetteerd, gepolijst.
5. **Uitsparingen** — voor schakelaars, stopcontacten, houders.
6. **LED-verlichting** — optioneel, perimetrisch of aan de achterkant.`,
  },
  {
    id: 'calc-kitchen', category: 'calculatoare', roles: ['all'], order: 5,
    title: 'Configurator Keukenfronten',
    image: '/manual/calc-front-bucatarie.png',
    imageAlt: '3D-configurator voor keukenfront',
    content: `# Configurator Keukenfronten

Meubelfronten van gelakt glas, met digitale print of mat gezandstraald.

## Stappen

1. **Afwerking** — Gelakt RAL, Digitale print, Mat gezandstraald.
2. **Afmetingen** — breedte × hoogte per front; vermenigvuldig met het aantal fronten.
3. **Kleur / Print** — selecteer RAL of upload een printbestand.
4. **Uitsparingen** — voor handgrepen of push-to-open.
5. **Bevestigingssysteem** — lijm op MDF, schroeven aan de achterkant, aluminium profiel.
6. **Opslaan** — automatische aggregatie voor complete keukens.`,
    tips: [
      'Voor digitale prints is de aanbevolen minimumresolutie 150 dpi bij de uiteindelijke afmeting.',
    ],
  },
  {
    id: 'calc-panels', category: 'calculatoare', roles: ['all'], order: 6,
    title: 'Panelen & Scheidingswanden',
    image: '/manual/calc-panouri.png',
    imageAlt: '3D-configurator paneel en scheidingswand',
    content: `# Panelen en Scheidingswanden

Twee sub-modules:

- **Eenvoudig paneel** — glas zonder bewerkingen (glas op maat).
- **Scheidingswand** — configureerbaar raster met geïntegreerde deuren.

## Scheidingswanden — belangrijke stappen

1. **Raster** — definieer hoeveel kolommen × rijen; pas de grootte aan met drag-interlock (de totale breedte blijft constant).
2. **Perimeterprofielen** — boven, onder, zijkanten; worden automatisch onderbroken waar deuren zijn.
3. **Binnenprofielen** — verticaal en horizontaal; \`usableWidth/Height\` zorgt voor de juiste panelen.
4. **Geïntegreerde deuren** — in elke cel; worden automatisch afgetrokken van het perimeterprofiel.
5. **Zijpanelen 90°** — de hoogte synchroniseert met die van de deur.
6. **Glas & afwerkingen** — per cel of globaal.`,
    warnings: [
      'Bij het aanpassen van de grootte van een kolom, passen de naburige kolommen zich automatisch aan om de totale breedte te behouden.',
    ],
  },
  {
    id: 'orders', category: 'vanzari', roles: ['all'], order: 1,
    title: 'Bestelbeheer',
    image: '/manual/comenzi-deschide.png',
    imageAlt: 'Lijst van bestellingen met statussen',
    content: `# Bestellingen

Alle offertes en bestellingen, met snelle filters op status: Offerte → Bevestigd → In productie → Voltooid → Geleverd → Geannuleerd.

## Snelle acties op de bestelregel

1. **Status wijzigen** — gekleurde knoppen direct op de rij (Bevestigen, Voltooien, Leveren).
2. **Naar productie sturen** — de voorraad wordt automatisch afgeschreven en de productiebon wordt aangemaakt.
3. **DXF genereren** — voor CNC, voor elk paneel.
4. **Bewerken** — heropent de offerte in de oorspronkelijke configurator (alle gegevens hersteld).
5. **Verwijderen** — alleen als het nog niet in productie is.

## Een bestelling in detail openen

Klik op het bestelnummer (of op de rij) in de **Bestellijst** en er opent een venster met de kop van de bestelling (nr., status, knop **PDF downloaden**) en 4 tabbladen:

![Open bestelvenster](/manual/comenzi-detalii.png)

### 1. Details
Klantgegevens, aanmaakdatum, subtotaal, btw, totaal. Hier controleert u snel de commerciële gegevens en vindt u de knoppen voor **Montage plannen**, **Factuur maken** en **Proforma (voorschot)**.

### 2. Producten
Lijst van geconfigureerde producten, met hoeveelheid, eenheidsprijs en extra bedrag (indien aanwezig). De knop **Bewerken** bij elk product brengt u terug naar de configurator voor aanpassingen.

![Tabblad Producten](/manual/comenzi-produse.png)

### 3. Geschiedenis
Logboek van wijzigingen: statuswijzigingen, bewerkingen, betalingen, documentgeneraties. Nuttig voor traceerbaarheid en audit — zie wie wat en wanneer heeft gewijzigd.

![Tabblad Geschiedenis](/manual/comenzi-istoric.png)

### 4. Voorbeeld
Gedetailleerde weergave van de offerte precies zoals deze op de **naar de klant verzonden PDF** verschijnt: voor elk product ziet u het configuratietype, afmetingen en glasoppervlak, de toegepaste bewerkingen, de lijst met accessoires met code en eenheidsprijs, de arbeidskosten en het totaal. **Wordt gebruikt voor de laatste controle** voordat de offerte naar de klant of de bestelling naar de productie wordt gestuurd — u bevestigt dat de prijzen van producten, accessoires en arbeid correct zijn.

![Tabblad Voorbeeld](/manual/comenzi-previzualizare.png)

## De kaarten bovenaan

Direct overzicht: totaal aantal bestellingen, waarde in RON, verdeling per status.`,
    tips: [
      'De volledige configuratie (`full_config`) blijft intact van de winkelwagen tot de bestelling — er gaan geen gegevens verloren.',
      'Identieke accessoires worden automatisch samengevoegd op de definitieve PDF (som van hoeveelheden, unieke code).',
      'Het tabblad Voorbeeld geeft altijd de huidige waarden weer — als u een prijs in de Instellingen wijzigt, wordt deze hier bijgewerkt.',
    ],
  },
  {
    id: 'invoicing', category: 'vanzari', roles: ['all'], order: 2,
    title: 'Facturatie',
    image: '/manual/facturare.png',
    imageAlt: 'Facturatiemodule met KPI\'s en grafieken',
    content: `# Facturatie

Uitreiken van facturen uit bevestigde bestellingen, met aangepaste nummerreeksen en e-Factura export (CIUS-RO en FatturaPA voor IT).

## Stappen

1. **Configureer de reeksen** in *Instellingen → Facturatie → Reeksen* (prefix, jaar, teller).
2. **Genereer factuur** vanuit een bestelling: knop **€** op de bestelregel.
3. **Bewerk regels** — toevoegen/verwijderen, prijzen aanpassen, btw per regel.
4. **Uitbrengen** — nummer wordt automatisch toegewezen, status wordt "Issued".
5. **Registreer betaling** — dialoog voor gedeeltelijke of volledige betaling.
6. **Exporteer XML** — voor ANAF (RO) of SDI (IT).

## KPI

De kaarten bovenaan: gefactureerd, ontvangen, openstaand, geannuleerd.`,
    warnings: [
      'Een uitgebrachte factuur kan niet worden verwijderd — alleen geannuleerd met een reden en vervangen door een creditnota.',
    ],
  },
  {
    id: 'clients-crm', category: 'vanzari', roles: ['all'], order: 3,
    title: 'Klanten & CRM',
    image: '/manual/clienti-crm.png',
    imageAlt: 'CRM klantenlijst met types',
    content: `# Klanten

Volledige database van klanten: particulieren, bedrijven, distributeurs.

## Stappen

1. **Klant toevoegen** — knop "Nieuwe klant" of automatisch wanneer u een offerte opslaat voor een nieuw e-mailadres.
2. **Klanttype** — Particulier / Bedrijf / Distributeur (met globale korting).
3. **Contactgegevens** — telefoon, e-mail, adres, CUI (indien bedrijf).
4. **CRM Pipeline** (admin) — leads, stadia, conversies.
5. **Geschiedenis** — alle offertes en bestellingen van de klant op één plek.
6. **Specifieke markup** — in *Instellingen → Klantmarkup* stelt u een verschillende marge in voor elk type.`,
    tips: [
      'Klanten worden automatisch aangemaakt vanuit de 3D-configuratoren wanneer u de eerste offerte opslaat met een nieuw e-mailadres.',
    ],
  },
  {
    id: 'production-kanban', category: 'productie', roles: ['all'], order: 1,
    title: 'Productieflow Kanban',
    image: '/manual/productie-kanban.png',
    imageAlt: 'Kanban bord met kolommen Snijden, Bewerken, Harden',
    content: `# Productie Kanban

De visuele flow per fase: **Snijden → Bewerken → Harden → Coaten/Printen → Assemblage → Klaar voor levering**.

## Dagelijkse stappen

1. **Controleer de KPI's** bovenaan: totaal actief, in bewerking, in afwachting, klaar voor levering.
2. **Sleep en zet neer** een kaart tussen kolommen om handmatig door te schuiven.
3. **Klik op een kaart** — opent de productiebon met technische tekeningen, materialen, accessoires.
4. **Toewijzing operator** — vooraf gepland in *Bestellingen → Operatorplanning*; wordt opgeslagen in \`operator_name\` voor traceerbaarheid.
5. **Kalenderweergave** — alternatief tabblad voor planning op datum.

## Etiketten met streepjescode

Vanuit de fiche van elke productieorder (en vanaf de **Scanner**-pagina) heeft u de knop **„Etiket afdrukken”**:

- De streepjescode is **CODE128**, automatisch gegenereerd op basis van het fichenummer (met de JsBarcode-bibliotheek).
- Het etiket bevat: **fichenummer**, **bestelnummer**, **klant**, **levertermijn** en **huidige fase**.
- Het afdrukdialoogvenster van de browser opent direct — u kunt normale A4-printers of speciale etiketprinters (Zebra, Brother, enz.) gebruiken.
- Plak het etiket op het glas / frame / pakket en hergebruik het bij elke fase van de flow.

## Scannen in de werkplaats

De pagina **Productie → Scanner** is geoptimaliseerd voor het ritme van de werkplaats:

1. **Auto-focus** op het scanveld — u hoeft niet voor elke scan te klikken.
2. **HID-lezers** — elke USB-scanner van het type „toetsenbord” werkt plug-and-play (geen drivers nodig).
3. **Scan de code** op het etiket → de bestelling schuift **automatisch door** naar de volgende fase in de flow.
4. **Directe visuele bevestiging**: de kaart toont de nieuwe status en het Kanban-bord wordt bijgewerkt.

Zo verliezen operators geen tijd meer met handmatig slepen en neerzetten en zijn er geen fouten zoals „ik ben vergeten te markeren dat ik klaar ben”.

## Realtime opvolging

Het Kanban-bord wordt **automatisch op de achtergrond vernieuwd**:

- Scans die in de werkplaats worden gemaakt, verschijnen **onmiddellijk** op de kantoorschermen — zonder handmatige verversing.
- De KPI's bovenaan (actief, in bewerking, klaar voor levering) worden live herberekend.
- Meerdere operators kunnen tegelijkertijd aan verschillende fasen werken, zonder elkaar in de weg te lopen.
- De manager ziet op elk moment **waar elke bestelling zich bevindt** en **wie eraan werkt**.

## Geschatte leverdatum

Wordt automatisch berekend wanneer een bestelling in productie gaat, afhankelijk van de belasting van de kolommen.`,
    tips: [
      'Druk het etiket met de streepjescode af direct nadat de bestelling in productie gaat en plak het op het pakket — het wordt de \'single source of truth\' voor de hele flow.',
      'Laat de Scanner-pagina open op een tablet/laptop in de werkplaats; de auto-focus zorgt ervoor dat elke scan wordt vastgelegd, zelfs als er niemand bij het toetsenbord is.',
      'Voor een 24/7 flow, open het Kanban-bord op een grote tv — bekijk de voortgang in realtime zonder iets aan te raken.',
    ],
  },
  {
    id: 'inventory', category: 'productie', roles: ['all'], order: 2,
    title: 'Voorraad & Inventaris',
    image: '/manual/stoc.png',
    imageAlt: 'Voorraadmodule met materiaallijsten',
    content: `# Voorraad

Beheer van materialen: glas, accessoires (hardware), verbruiksartikelen. Automatische afschrijving bij de start van de productie.

## Stappen

1. **Materiaal toevoegen** — knop "Nieuw materiaal" (code, type, prijs, minimumvoorraad).
2. **Voorraad aanpassen** — knop per rij voor handmatige in- en uitgangen.
3. **Voorraadbewegingen** — tabblad met de geschiedenis van transacties (ingangen, uitgangen, reden).
4. **Maandelijks verbruiksrapport** — knop bovenaan, export naar CSV/Excel.
5. **Meldingen minimumvoorraad** — rode "Min. Stock" KPI op de bovenste kaart.
6. **Locatie** — optioneel, voor meerdere magazijnen.

## Automatische afschrijving

Wanneer een bestelling de status **"In productie"** krijgt, wordt de voorraad automatisch verlaagd volgens de materiaallijst van elk product.`,
    warnings: [
      'Negatieve voorraad is toegestaan maar wordt rood gemarkeerd — de beheerder moet een fysieke inventaris uitvoeren en aanpassen.',
    ],
  },
  {
    id: 'cutting', category: 'productie', roles: ['all'], order: 3,
    title: 'Snijoptimalisatie',
    image: '/manual/optimizare-debitare.png',
    imageAlt: 'Snijoptimalisatie module met selectie van platen',
    content: `# Snijoptimalisatie

Guillotine nesting-algoritme voor maximaal 50 bestellingen tegelijk — minimaliseert glasafval.

## Stappen

1. **Plaattype** — selecteer uit de catalogus (bijv. 3210×2250 mm).
2. **Snijbladdikte** — standaard 3 mm, aanpasbaar.
3. **Selecteer bestellingen** — uit de lijst met zoek- en statusfilter (u kunt "Selecteer alle 26").
4. **Druk op Optimaliseren** — het algoritme draait en toont de platen met de geneste panelen.
5. **Bekijk SVG** — elke plaat met afmetingen, paneellabels, gekleurd afval.
6. **Exporteer DXF/PDF** — om naar de snijmachine te sturen.

## Glasplaten beheren

![Dialoogvenster Platen beheren met standaard glasmaten op de pagina Snijoptimalisatie](/manual/manage-glass-sheets.png)

Standaardmaten (2550×3210, 2250×3210, Jumbo 6000×3210) worden automatisch geladen bij het eerste gebruik. Je kunt ze altijd bewerken zonder de snijpagina te verlaten — klik op **⚙ Platen beheren** naast de *Plaattype*-keuze.

1. **Voeg een nieuwe plaat toe** — vul *Naam* in (bv. "Custom 2000×3000"), *Breedte (mm)* en *Hoogte (mm)*, klik daarna op **+ Toevoegen**.
2. **In-/uitschakelen** — de schakelaar naast elke maat verbergt deze in de *Plaattype*-keuze zonder te verwijderen (handig voor seizoensmaten).
3. **Verwijderen** — de rode prullenbakknop verwijdert een maat definitief; gebruik alleen als je zeker bent.
4. **Sluit het dialoogvenster** — wijzigingen zijn direct actief en de *Plaattype*-keuze vernieuwt automatisch met de nieuwe afmetingen en m²-oppervlakte.

> Platen worden per bedrijf opgeslagen — je hele team ziet dezelfde lijst, gescheiden van andere accounts.

## Stats

Gebruikspercentage, afvaloppervlakte, aantal platen.`,
    tips: [
      'Limiet van 50 bestellingen per sessie om een redelijke rekentijd te behouden.',
    ],
  },
  {
    id: 'service', category: 'operational', roles: ['all'], order: 1,
    title: 'Klachten & Service-interventies',
    image: '/manual/service.png',
    imageAlt: 'Klachtenmodule met grafieken en ticketlijst',
    content: `# Klachten & Service

Beheer van incidenten na levering: klachten van klanten, fabrieksfouten, geplande interventies.

## Stappen

1. **Nieuwe klacht** — knop rechtsboven.
2. **Koppel bestelling** — optioneel, voor traceerbaarheid.
3. **Prioriteit** — Laag / Gemiddeld / Hoog / Kritiek.
4. **Type defect** — Klantklacht, Fabrieksfout, Transportschade, Garantie.
5. **Plan interventie** — kies datum en montageteam.
6. **Sluit ticket** — met oplossing en kosten.

## Grafieken

Frequentie van defecten, verdeling van prioriteiten, ticketstatus.`,
  },
  {
    id: 'installation', category: 'operational', roles: ['all'], order: 2,
    title: 'Montage & Teams',
    image: '/manual/montaj.png',
    imageAlt: 'Montagekalender met tabbladen Teams, Voertuigen, Checklist',
    content: `# Montage

Planning van montages, teams, voertuigen, checklists en route-optimalisatie.

## Tabbladen

1. **Montagekalender** — maandweergave met drag & drop.
2. **Montageteams** — voeg leden toe, wijs toe aan teams.
3. **Checklist** — sjablonen die bij het aanmaken van elke klus worden gekloond.
4. **Route-optimalisatie** — berekent de optimale volgorde van de montages voor de dag.
5. **Voertuigen** — vloot met 30-dagen waarschuwingen voor ITP en RCA.

## Planningsstappen

1. Knop **"Montage plannen"** rechtsboven.
2. Selecteer de bestelling, het team, het voertuig, de datum.
3. Voeg checklist toe (standaard of aangepast).
4. Opslaan — verschijnt in de kalender.
5. **Uitstellen** — sluit de huidige klus en vult een nieuwe vooraf in.`,
    tips: [
      'Voertuigen met een ITP/RCA die binnen 30 dagen verloopt, ontvangen een automatische waarschuwing.',
    ],
  },
  {
    id: 'settings-company', category: 'setari', roles: ['all'], order: 1,
    title: 'Bedrijfsinstellingen & Branding',
    image: '/manual/setari-companie.png',
    imageAlt: 'Bedrijfsinstellingen — algemene informatie',
    content: `# Instellingen → Bedrijf

De gegevens die op ALLE gegenereerde documenten verschijnen (offertes, bestellingen, facturen, productiebonnen).

## Essentiële velden

1. **Bedrijfsnaam** — verschijnt in de PDF-koptekst.
2. **CUI / CIF** — met prefix RO voor Roemenië.
3. **Volledig adres** — Straat, nr., Stad, Provincie, Postcode.
4. **Telefoon en E-mail** — voor contact op documenten.
5. **Bankrekening en BIC/SWIFT** — voor facturen.
6. **Bedrijfslogo** — PNG/JPG/WebP/SVG, max 2 MB.

## PDF-personalisatie

- **Logogrootte** en **positie** — voor offertes en facturen.
- **Aangepaste teksten** — voorwaarden, condities, voettekst (rich-text via Tiptap).
- **EUR/RON-wisselkoers** — gebruikt voor globale conversie.

## White label

Abonnees kunnen de PDF's volledig personaliseren met hun eigen logo en HTML-teksten.`,
    tips: [
      'Het ideale logo is een transparante PNG, verhouding 3:1 of vierkant, min 400×400 px voor afdrukkwaliteit.',
    ],
  },
  {
    id: 'settings-pricing', category: 'setari', roles: ['all'], order: 2,
    title: 'Prijsinstellingen & Catalogus',
    content: `# Instellingen → Prijzen

Uw lokale prijscatalogus: materialen, accessoires, kits, afwerkingen.

## Stappen

1. **Tabblad Materialen** — glas, profielen, accessoires gegroepeerd.
2. **Zoeken** — transversale zoekopdracht over categorieën.
3. **Prijs bewerken** — klik op de cel, wordt automatisch opgeslagen.
4. **Reset naar systeem** — knop om de override ongedaan te maken en terug te keren naar de basisprijs.
5. **Privévarianten** — voeg uw eigen materialen toe met een unieke code per bedrijf.
6. **Import / Export** — Excel + ZIP voor foto's, automatische mapping naar de systeemcategorieën.

## Prijshiërarchie

Bedrijf (eigen override) > Globale gebruiker > Systeem (standaardcatalogus).`,
    tips: [
      'Bedrijfsoverrides zijn niet zichtbaar voor andere bedrijven — strikt geïsoleerd via RLS.',
      'Afbeeldingen van materialen hebben cachebusting met een timestamp om de nieuwe versie onmiddellijk te zien.',
    ],
    warnings: [
      'Het resetten van een prijs verwijdert de override en kan niet ongedaan worden gemaakt — controleer dit van tevoren.',
    ],
  },
  {
    id: 'settings-team', category: 'setari', roles: ['all'], order: 3,
    title: 'Teaminstellingen & Machtigingen',
    content: `# Instellingen → Team

Nodig teamleden uit en beheer hun machtigingen per module.

## Stappen

1. **Lid uitnodigen** — e-mail; ontvangt een registratielink.
2. **Rol** — Abonnee (verkoop), Productie, Montage, Bedrijfsadmin.
3. **Toegestane modules** — vink de toegang aan: Bestellingen, Productie, Voorraad, Facturatie, Service, etc.
4. **Activeren/Deactiveren** — bewaart de geschiedenis, blokkeert alleen de login.
5. **Admin overdragen** — met één klik naar een ander lid.
6. **Traceerbaarheid** — alle acties worden geregistreerd met \`created_by\`.

## Toegangsniveaus

- **Basic (60)** — Bestellingen + 1-2 configuratoren.
- **Plus (100)** — Alle configuratoren + Voorraad.
- **Operational (150)** — Alles, inclusief Service, Montage, Optimalisatie.

## Facturering

Het abonnement is gekoppeld aan de **bedrijfseigenaar** — medewerkers zijn gratis.`,
    tips: [
      'Weesaccount repareren (admin) — gebruikers zonder bedrijf kunnen handmatig worden toegewezen.',
    ],
  },
  {
    id: 'pricing-client-types', category: 'setari', roles: ['all'], order: 9,
    title: 'Marge per klanttype (Particulier / Bedrijf / Distributeur)',
    image: '/manual/setari-adaos-tip-client.png',
    imageAlt: 'Instellingen → Klantmarges — Particulier, Bedrijf, Distributeur',
    content: `# Procentuele marge per klanttype

In **Instellingen → Klantmarges** kunt u **3 gedifferentieerde prijslijsten** definiëren op basis van dezelfde catalogus, zonder artikelen te dupliceren.

## De 3 types

- **Particulier** — eindklanten (retail). Hier stelt u doorgaans een positieve marge in (bijv. +10% ... +20%), omdat zij niet profiteren van commerciële kortingen.
- **Bedrijf** — bedrijven en partnerfirma's. Meestal wordt dit op **0%** gelaten (basisprijs).
- **Distributeur** — wederverkooppartners. Hier stelt u meestal een **negatieve waarde** in (bijv. −10% ... −25%) om hen een voorkeursprijs te bieden.

## Hoe het werkt

- Het percentage wordt **automatisch** toegepast op de basisprijs van elk artikel in de offerte (glas, accessoires, arbeid, kits).
- **Positieve** waarden = opslag bovenop de standaardprijs. **Negatieve** waarden = korting.
- Het veld accepteert waarden tussen **−100% en +500%**, met stappen van 0,5%.
- Wijzigingen worden actief nadat u op **„Marges opslaan”** klikt (knop rechtsonder). De kaart markeert gewijzigde rijen met de badge „gewijzigd”.

## Waar het wordt toegepast

In elke **3D-configurator**, op de kaart **Klantinformatie**, is er de selector **Klanttype** (Particulier / Bedrijf / Distributeur). Wanneer u dit wijzigt:

1. De configurator detecteert het gekozen type.
2. Past automatisch het hier ingestelde percentage toe op het subtotaal.
3. De prijs die in de offerte (en later in de PDF) wordt weergegeven, weerspiegelt al het nieuwe type.

## Waarom is dit nuttig

- **Eén enkele cataloguslijst**, maar verschillende prijzen per klantcategorie — zonder handmatig artikelen te dupliceren.
- U kunt **snel een korting toekennen aan distributeurs** zonder de basiscatalogi te wijzigen.
- Particulieren kunnen worden gefactureerd met een standaard commerciële marge, zonder handmatige berekeningen in elke offerte.
- Wijzigingen zijn **alleen met terugwerkende kracht voor nieuwe offertes** — reeds opgeslagen bestellingen behouden hun oorspronkelijke prijzen (\`full_config\` is de 'single source of truth').`,
    tips: [
      'U kunt negatieve waarden instellen (bijv. −15%) om een permanente korting te geven aan een categorie zonder de catalogus aan te passen.',
      'Bij twijfel, begin met Bedrijf = 0% (referentieprijs) en pas de andere twee relatief hieraan aan.',
      'De Klanttype-selector in de configurator wordt onthouden in de offerte, dus een heropende offerte behoudt het oorspronkelijk gekozen type.',
    ],
    warnings: [
      'Het wijzigen van het percentage heeft alleen invloed op nieuwe offertes. Bestaande bestellingen moeten opnieuw worden bewerkt als u ze wilt herberekenen.',
    ],
  },
  {
    id: 'pricing-overview', category: 'setari', roles: ['all'], order: 10,
    title: 'Prijzen — algemeen overzicht',
    image: '/manual/setari-preturi.png',
    imageAlt: 'Instellingen → Prijzen — lijst met categorieën',
    content: `# Instellingen → Prijzen

Hier beheert u **alle prijzen** die worden gebruikt in de 3D-configuratoren, offertes en PDF's.

## Beschikbare categorieën

- **Accessoires** — scharnieren, handgrepen, stangen, rollen, stoppers, dichtingen, connectoren
- **Glas** — per dikte en type (helder, mat, rook, spiegel)
- **Arbeid** — montage, snijden, polijsten, boren, uitsnijden
- **Profielen** — U, muur, hoek 90°, schuifprofielen
- **Kits** — groepen accessoires die als één item worden verkocht
- **Schuifmechanismen** — complete systemen (met profiel + rollen + stoppers)

## Globale catalogus vs. persoonlijke override

- De **globale catalogus** (beheerd door de admin) is het uitgangspunt — u ziet deze automatisch.
- Wanneer u een prijs of een aftrek wijzigt, wordt een **persoonlijke override** opgeslagen in uw ruimte (\`pricing_config\`). De globale catalogus blijft onaangetast.
- U kunt de override altijd resetten met de knop **„Resetten naar cataloguswaarde”** (zie de desbetreffende sectie).

## Valuta

Prijzen worden intern opgeslagen in **RON**. De **RON / EUR**-schakelaar in de bovenbalk converteert alleen de weergave — er vindt geen conversie plaats in de database.`,
    tips: [
      'Het zoekfilter werkt voor alle categorieën tegelijk (code, naam, afwerking).',
      'Als u een artikel niet ziet, controleer dan of u het niet hebt uitgeschakeld via het menu op de rij (doorgestreepte bel).',
    ],
  },
  {
    id: 'pricing-add-accessory', category: 'setari', roles: ['all'], order: 11,
    title: 'Nieuw accessoire toevoegen',
    image: '/manual/setari-adauga-accesoriu.png',
    imageAlt: 'Dialoogvenster Item toevoegen - accessoire',
    content: `# Hoe u een nieuw accessoire toevoegt

1. Ga naar **Instellingen → Prijzen** en selecteer het tabblad **Accessoires**.
2. Druk op **„Item toevoegen”** (rechtsboven).
3. Vul in:
   - **Code** — uniek; gebruikt voor deduplicatie, scannen van streepjescodes en aggregatie in PDF.
   - **Naam** — weergegeven in de configurator en PDF.
   - **Categorie / Type** — scharnier, handgreep, stabilisatiestang, rollen, stopper, dichting, enz.
   - **Prijs** — in de actieve valuta (wordt opgeslagen in RON).
   - **E.H.** — \`pcs\` voor stuks, \`ml\` voor lineaire meters, \`m²\` voor oppervlakte, \`kg\` voor gewicht.
   - **Afwerking & kleur** — kies uit voorinstellingen of voer een aangepaste hex in; wordt ook gebruikt in de 3D-rendering.
   - **Afbeelding** — geüpload naar de opslag; verschijnt in de accessoires-selector en in de PDF.
4. Vink de **„Producttypes”** aan waar het accessoire verschijnt (douche, deur, balustrade, spiegel, panelen, keukenfront).
5. Vink de compatibele **„Bewerkingstypes”** aan (gelaagd, gehard, mat).
6. **Opslaan** — het accessoire wordt onmiddellijk beschikbaar in de aangevinkte configuratoren.`,
    tips: [
      'Voor andere E.H. dan pcs kunt u decimalen gebruiken (bijv. 2.5 ml).',
      'Als u geen afbeelding instelt, wordt deze automatisch overgenomen van de bovenliggende categorie.',
    ],
    warnings: [
      'De code moet uniek zijn. Als deze al bestaat, werkt het systeem het bestaande artikel bij in plaats van een nieuw aan te maken.',
    ],
  },
  {
    id: 'pricing-edit-fields', category: 'setari', roles: ['all'], order: 12,
    title: 'Item bewerken — geavanceerde velden',
    image: '/manual/setari-editare-element.png',
    imageAlt: 'Dialoogvenster Item bewerken met glasaftrek',
    content: `# Item bewerken — veld voor veld

Klik op het potlood op de rij (of dubbelklik) om **Item bewerken** te openen. Naast prijs en E.H. heeft u deze technische velden:

## Prijs & E.H.

- De prijs wordt ingevoerd in de actieve valuta in de header (RON of EUR) en wordt intern opgeslagen in RON.
- De E.H. bepaalt hoe de prijs wordt vermenigvuldigd in de configurator: \`pcs\` × hoeveelheid, \`ml\` × lengte, \`m²\` × oppervlakte.

## Afwerking & kleur

- **Hex color** + **roughness** worden zowel in de prijslijst als in de 3D-rendering gebruikt — gesynchroniseerd via \`MetalMaterial\`.
- Als u het leeg laat, wordt het overgenomen van het bovenliggende element (bijv. een profielvariant erft de kleur van het basisprofiel).

## Glasaftrek per zijde (\`glass_deduction\`)

Hoeveel **mm** het profiel in het glas steekt aan elke zijde waar het is gemonteerd. De configurator trekt deze waarde automatisch af van de bruto-afmeting om het daadwerkelijke te snijden glas te verkrijgen.

> Voorbeeld: U-profiel 8 mm op gelamineerd glas 8 mm → \`8 + 0.38 + 8 = 16.38 mm\` totale aftrek (profielen + folie + profielen, cumulatief).

## Gedetailleerde aftrek per zijde (\`glass_deductions\`)

JSON met aparte \`top\`, \`bottom\`, \`left\`, \`right\`. Wordt gebruikt wanneer het profiel verschillende waarden heeft aan elke rand (bijv. diep vloerprofiel + dun muurprofiel). Wordt **gecumuleerd** met de dichtingen.

- **\`profile_height\`** (in dezelfde JSON) — overschrijft de som van \`top + bottom\` voor het U-profiel, als u één totale waarde wilt.

## Overlapping (\`width_overlap\`)

Hoeveel mm de schuifpanelen **overlappen** met het andere paneel of de muur. Het systeem trekt deze waarde af van de **nuttige breedte** van de schuifkit.

> Voorbeeld: schuifkit 1200 mm met overlapping 40 mm → effectieve nuttige breedte 1160 mm.

## Aftrek deurhoogte (\`door_height_deduction\`)

mm die van de totale hoogte worden afgetrokken voor de **scharnierdeur** (ruimte voor scharnier boven + drempel onder). Meestal 5–20 mm, afhankelijk van het scharnier.

## Aftrek hoogte vast paneel (\`fixed_panel_height_deduction\`)

Idem, maar voor het vaste paneel. **Standaard 0** — het vaste paneel heeft geen automatische aftrek van 10 mm.

## Product-/Bewerkingstypes

Vink aan waar het accessoire verschijnt (douche, deur, balustrade...) en welke bewerkingen het ondersteunt (gelaagd, gehard). Indien niet aangevinkt = verschijnt niet in de betreffende configurator.`,
    tips: [
      'Aftrekposten zijn **cumulatief**: profiel + dichting + gelamineerde folie worden aan dezelfde kant opgeteld.',
      'Scharnieren worden van **boven naar beneden** gemeten, de handgreep van **beneden naar boven** — dit is een conventie die in alle configuratoren wordt gehandhaafd.',
      'Het schuifsysteem **gebruikt geen scharnieren** — het veld voor de hoeveelheid scharnieren blijft automatisch op 0 staan.',
    ],
    warnings: [
      'Elke wijziging aan de aftrekposten heeft onmiddellijk invloed op **alle toekomstige 3D-berekeningen**, inclusief onbevestigde offertes. Reeds opgeslagen bestellingen hebben de gegevens bevroren in `full_config` en worden niet gewijzigd.',
    ],
  },
  {
    id: 'pricing-add-glass', category: 'setari', roles: ['all'], order: 13,
    title: 'Glastype toevoegen',
    image: '/manual/setari-sticla.png',
    imageAlt: 'Instellingen → Prijzen → Glas',
    content: `# Glas

1. Tabblad **Glas** → **„Item toevoegen”**.
2. Kies de **dikte**: 4 / 6 / 8 / 10 / 12 mm.
3. Kies het **type**: helder, rook, mat (gezandstraald), spiegel, brons, grijs.
4. Stel de **prijs / m²** in (in de actieve valuta).
5. Vink de beschikbare **bewerkingen** aan voor dit glas: gehard, gelaagd, gepolijst, mat.

## Harden

Voor harden wordt de prijs berekend met de formule:

\`\`\`text
Prijs harden = Prijs_harden × Dikte_mm × Oppervlakte_m²
\`\`\`

U stelt één basisprijs in; het systeem past de formule automatisch toe op basis van de dikte en oppervlakte van het glas.

## Gelaagd

Bij gelaagd glas wordt de aftrek aan de zijkanten opgeteld bij de **dikte van de folie** (standaard 0.38 mm) aan elke rand. Zie het voorbeeld in de sectie „Item bewerken”.`,
    tips: [
      'Mat (gezandstraald) glas heeft meestal een procentuele opslag ten opzichte van helder glas — u configureert dit als een vermenigvuldiger in het bewerkingsveld.',
    ],
  },
  {
    id: 'pricing-add-labor', category: 'setari', roles: ['all'], order: 14,
    title: 'Arbeid toevoegen',
    image: '/manual/setari-manopera.png',
    imageAlt: 'Instellingen → Prijzen → Arbeid',
    content: `# Arbeid

1. Tabblad **Arbeid** → **„Item toevoegen”**.
2. Kies het **type**: montage, snijden, randen polijsten, boren, uitsnijden, transport.
3. Stel de **E.H.** in:
   - \`uur\` — voor montage
   - \`ml\` — voor randen polijsten
   - \`st\` — voor gaten, uitsnijdingen
   - \`m²\` — voor oppervlakte-arbeid
4. **Prijs** per eenheid.
5. **Percentage vs. vaste waarde** — vink aan als het een vermenigvuldiger is (bijv. 15% bovenop de glaswaarde) of een vast bedrag.
6. Koppel met **producttypes** waar het automatisch wordt toegepast.`,
    tips: [
      'Procentuele arbeidskosten worden niet beïnvloed door de EUR/RON-schakelaar — ze blijven hetzelfde in elke valuta.',
    ],
  },
  {
    id: 'pricing-add-kit', category: 'setari', roles: ['all'], order: 15,
    title: 'Accessoirekits',
    image: '/manual/setari-kituri.png',
    imageAlt: 'Instellingen → Kits',
    content: `# Kits

Een **kit** is een groep accessoires die als één item wordt verkocht. Handig voor schuifdouchesystemen: de kit bevat profiel, rollen, stoppers, geleider.

## Kit aanmaken

1. Ga naar **Instellingen → Kits** (of het tabblad Kits in Prijzen).
2. **„Kit toevoegen”** → code, naam, **kitprijs** (definitief), bedekte **nuttige breedte**.
3. Voeg **componenten** toe — selecteer uit de lijst met accessoires en voer de hoeveelheid in.
4. Componenten worden **gededupliceerd op code** — als dezelfde code twee keer voorkomt, worden de hoeveelheden opgeteld.

## Gebruik in de configurator

In de configurator voor een **schuifdouche** kiest u de kit uit de dropdown. Het systeem berekent:

\`\`\`text
Effectieve nuttige breedte = Breedte_kit - width_overlap
\`\`\`

en past automatisch **0 scharnieren** toe (het schuifsysteem heeft geen scharnieren).

`,
    tips: [
      'De prijzen van de componenten zijn informatief — de **kitprijs heeft voorrang** in de offerte.',
      'De afbeelding van de kit verschijnt in de PDF; als deze ontbreekt, wordt de afbeelding van het hoofdprofiel gebruikt.',
    ],
  },
  {
    id: 'pricing-reset', category: 'setari', roles: ['all'], order: 16,
    title: 'Resetten naar cataloguswaarde',
    image: '/manual/setari-reset.png',
    imageAlt: 'Knop \'Resetten naar cataloguswaarde\'',
    content: `# Persoonlijke override resetten

Als u een prijs of een aftrek hebt gewijzigd en u wilt terugkeren naar de **standaardwaarde uit de globale catalogus**:

1. Open **Item bewerken**.
2. Druk op **„Resetten naar cataloguswaarde”** (linksonder in het dialoogvenster).
3. Uw override in \`pricing_config\` wordt verwijderd en het artikel toont weer de waarde van de admin.

> De reset heeft **alleen invloed op het betreffende artikel**. De rest van uw overrides blijft intact.`,
    warnings: [
      'De actie is onmiddellijk en kan niet ongedaan worden gemaakt. Als u een geschiedenis nodig heeft, exporteer dan de prijzen (Instellingen → Gegevens exporteren) voordat u reset.',
    ],
  },

  // ====== New sections — for subscribers ======
// ====== Secțiuni noi — pentru abonați ======
  {
    id: 'dashboard-home', category: 'introducere', roles: ['all'], order: 0,
    title: 'Hoofddashboard',
    image: '/manual/dashboard-home.png',
    imageAlt: 'Hoofddashboard',
    content: `# Hoofddashboard

Na het inloggen kom je op de **startpagina (\`/\`)** — een controlepaneel met de belangrijkste prestatie-indicatoren (KPI's) van je bedrijf, in realtime bijgewerkt.

## Wat je ziet

- **KPI's bovenaan**: omzet, bestellingen in uitvoering, geleverde bestellingen deze maand, gemiddelde bestelwaarde.
- **Verkoopgrafiek** van de laatste 12 maanden (balken, met vergelijking vorig jaar).
- **Inkomstengrafiek** per productcategorie (douche, deuren, balustrades, spiegels, keuken, panelen).
- **Top verkochte producten** in de geselecteerde periode.
- **Kritieke voorraad** — materialen met een hoeveelheid onder de ingestelde minimumdrempel.
- **Recente bestellingen** — de laatste 10 bestellingen met status en klant, met een directe link naar de bestelling.

## Filters

De schakelaar **RON / EUR** in de bovenste balk beïnvloedt alle hier getoonde waarden (dynamische conversie, exclusief btw).
`,
    tips: [
      'Het dashboard wordt automatisch vernieuwd bij elke wijziging van valuta of taal.',
      'Gebruik voor een operationeel overzicht (productie, montage, service) het menu *Operationeel Dashboard*.',
    ],
  },
  {
    id: 'announcements', category: 'introducere', roles: ['all'], order: 3,
    title: 'Aankondigingen en meldingen',
    image: '/manual/announcements.png',
    imageAlt: 'Aankondigingen en meldingen',
    content: `# Aankondigingen en meldingen

Het 🔔 **gele bel-icoon** in de bovenste balk toont de aankondigingen die door het iSoftGlass-team zijn gepubliceerd: updates, nieuwe functionaliteiten, gepland onderhoud.

## Hoe het werkt

- Het rode getal op de bel = **ongelezen** aankondigingen.
- Klik op de bel om de lijst te openen — elke aankondiging heeft een titel, categorie (**Update** of **Info**), datum en de volledige inhoud.
- Aankondigingen worden automatisch als gelezen gemarkeerd wanneer je ze opent.
- Belangrijke aankondigingen van het type **Update** verschijnen ook als een **melding bovenaan de pagina** bij de lancering van een nieuwe versie.

## Categorieën

- **Update** — nieuwe versie, toegevoegde functionaliteiten, correcties.
- **Info** — algemene informatie, tips, evenementen.

Aankondigingen worden automatisch vertaald naar de taal van je interface.
`,
    tips: [
      'Controleer periodiek de aankondigingen om op de hoogte te blijven van nieuwe functionaliteiten die je tijd kunnen besparen.',
    ],
  },
  {
    id: 'currency-language', category: 'introducere', roles: ['all'], order: 4,
    title: 'Valuta en taal',
    image: '/manual/currency-language.png',
    imageAlt: 'Valuta en taal',
    content: `# Valuta en taal

## RON / EUR Schakelaar

De **RON / EUR** knop in de bovenste balk verandert de weergegeven valuta in de hele applicatie — 3D-calculators, offertes, bestellingen, rapporten, dashboard.

- **Interne opslag** gebeurt **altijd in RON**. EUR is alleen voor weergave, dynamisch berekend tegen de wisselkoers die is ingesteld in *Instellingen → Bedrijf*.
- **Alle waarden zijn exclusief btw** in interne berekeningen; btw wordt alleen toegepast bij het genereren van de factuur.
- Je kunt waarden in EUR invoeren — deze worden bij het opslaan automatisch naar RON geconverteerd.

## Taalkiezer

De **🇷🇴 RO** knop opent de lijst met **9 beschikbare talen**: Română, English, Italiano, Deutsch, Polski, Français, Español, Nederlands, Hrvatski.

- Het wijzigen van de taal beïnvloedt **alleen de interface** (menu's, knoppen, labels, handleiding).
- De door jou ingevoerde gegevens (klantnamen, beschrijvingen, notities) blijven in de oorspronkelijke taal.
- De instelling wordt voor jouw account bewaard tussen sessies.
`,
    tips: [
      'De EUR-wisselkoers wordt alleen bijgewerkt wanneer je deze handmatig wijzigt in Instellingen → Bedrijf.',
      'De gebruikershandleiding is volledig vertaald in alle 9 talen.',
    ],
  },
  {
    id: 'working-in-eur', category: 'introducere', roles: ['all'], order: 5,
    title: 'Uitsluitend in EUR werken (aanbevolen voor niet-RO abonnees)',
    image: '/manual/working-in-eur.png',
    imageAlt: 'Instellingen → Prijzen — EUR-koers',
    content: `# Uitsluitend in EUR werken

Deze gids is voor abonnees die **100% in EUR** werken — ze kopen van leveranciers in EUR en verkopen aan klanten in EUR, zonder RON in hun catalogus te mengen.

## Hoe interne opslag werkt

- Alle prijzen worden in de database opgeslagen als één enkel getal.
- Het interne technische label is "RON", maar is voor jou **irrelevant** — je ziet het nergens in de interface.
- De **EUR**-schakelaar in de bovenste balk voert een weergaveconversie uit met de koers ingesteld in *Instellingen → Prijzen*.

## Het probleem dat je vermijdt

Als je de standaardkoers behoudt (bv. \`EUR-koers = 4,97\`) en een scharnier op **100 EUR** invoert, slaat het systeem intern \`497\` op. Morgen, als de koers verandert naar \`5,02\`, verschijnt hetzelfde product als **99,00 EUR** in de catalogus — zonder dat je iets hebt gewijzigd.

Deze "drift" is wiskundig correct maar veroorzaakt verwarring en lijkt op een bug.

## Aanbevolen configuratie — 3 stappen

1. **Instellingen → Prijzen** → stel **EUR-koers = 1** in.
2. Selecteer in de bovenste balk **EUR** als actieve valuta.
3. Voer alle prijzen direct in EUR in onder *Instellingen → Prijzen* (en in nieuwe bestellingen).

## Wat je wint

- Prijzen blijven **absoluut stabiel** — 100 EUR vandaag = 100 EUR over een jaar.
- Geen conversie bij opslaan, **geen drift**.
- Offerte-PDF's, bestellingen en rapporten komen natuurlijk in EUR uit.
- Historische bestellingen "bewegen" niet meer in de tijd.

## Wat NIET verandert

- Het interne "RON"-label blijft in de database (onzichtbaar in de interface).
- Alle app-logica werkt identiek — geen functionaliteit verloren.

## Beperkingen — wanneer deze configuratie NIET gebruiken

- Als je **leveranciers in RON** en klanten in EUR hebt (gemengde stroom) → heb je de echte wisselkoers nodig.
- Als je in een andere valuta werkt (PLN, HRK, enz.) → neem contact op met het iSoftGlass-team voor een uitbreiding.
`,
    tips: [
      'EUR-koers = 1 instellen beïnvloedt alleen de weergaveconversie — het wijzigt geen al opgeslagen waarde.',
      'Aanbevolen om deze configuratie te doen voordat je de eerste prijzen in de catalogus invoert.',
    ],
  },
  {
    id: 'production-scanner', category: 'productie', roles: ['all'], order: 2,
    title: 'Productiescanner (barcodes)',
    image: '/manual/production-scanner.png',
    imageAlt: 'Productiescanner (barcodes)',
    content: `# Productiescanner

De pagina **Productie → Scanner** (\`/productie/scanner\`) stelt je in staat om bestellingen snel door de Kanban-fasen te verplaatsen met behulp van een **CODE128 barcodescanner** die is aangesloten als een HID-toetsenbord.

## Hoe het werkt

1. Open de **Scanner** pagina. Het invoerveld heeft permanente autofocus.
2. **Scan de barcode** van het productieblad of het productlabel.
3. De applicatie identificeert automatisch de bestelling en **verplaatst deze naar de volgende fase** in het Kanban-bord (bijv.: *Snijden* → *Slijpen*, *Slijpen* → *Harden*).
4. De bevestiging verschijnt op het scherm met een geluid en een groene kleur; een fout (onbekende code) wordt in het rood weergegeven.

## Vereisten

- CODE128-scanner geconfigureerd als **HID-toetsenbord** (standaardmodus, zonder drivers).
- **Enter (\\r)** achtervoegsel na elke scan (standaardinstelling op de meeste modellen).

## Voordelen

- De operator hoeft niet langer handmatig naar bestellingen te zoeken op het Kanban-bord.
- Volledige traceerbaarheid: de tijd van elke fase wordt automatisch opgeslagen.
- Werkt ook op een tablet met een Bluetooth-scanner.
`,
    tips: [
      'Als de focus van het invoerveld verloren gaat (doordat je ergens anders klikt), wordt deze door simpelweg te scannen automatisch hersteld.',
      'Het veld negeert handmatige invoer die langzamer is dan 50ms — alleen de scanner activeert de voortgang.',
    ],
    warnings: [
      'Het scannen van een code die zich al in de laatste fase bevindt, heeft geen effect — de bestelling blijft daar.',
    ],
  },
  {
    id: 'processing-cad', category: 'productie', roles: ['all'], order: 3,
    title: 'Bewerkingen en CAD Editor',
    image: '/manual/processing-cad.png',
    imageAlt: 'Bewerkingen en CAD Editor',
    content: `# Bewerkingen en CAD Editor

De pagina **Bewerkingen** (\`/prelucrari\`) is de technische werkplaats voor productiebladen: gaten, scharnieren, handgrepen, uitsparingen, randafwerkingen — allemaal gevisualiseerd op het glas in een interactieve CAD-editor.

## Bewerkingsblad

- Volledige lijst van panelen in de bestelling (met afmetingen en glastype).
- Voor elk paneel: de lijst met bewerkingen (sjablooncode + parameters: afstand, diameter, offset).
- Veel bewerkingen worden **automatisch ingevuld** vanuit de 3D-configuratie (scharnieren, handgrepen, sloten) — je bewerkt alleen de uitzonderingen.

## CAD Editor — sneltoetsen

| Toets | Actie |
|---|---|
| **J** | JOIN — voegt twee nabijgelegen bewerkingen samen (tolerantie 10mm) |
| **Ctrl + D** | Dupliceer de geselecteerde bewerking |
| **Ctrl + Shift + D** | Dupliceer **alle** bewerkingen naar een ander paneel (automatisch gespiegeld op de X-as) |
| **Delete** | Verwijder de geselecteerde bewerking |
| **Linkermuisknop + slepen** | Verplaats de bewerking |
| **Muiswiel** | Zoom |

## Sjablonen

De catalogus **Bewerkingssjablonen** (categorieën: **30. scharnieren & cutouts**, **51. gaten voor handgrepen**) synchroniseert automatisch met de accessoires die in 3D zijn gekozen. Het toevoegen van een nieuw scharnier aan de catalogus genereert de juiste cutout op het glas.

## Exporteren

- **DXF** (R9 → R2010) — voor industriële CNC, met laag-mapping.
- **PDF** — voor de werkplaats, met afmetingen en een legenda van de bewerkingen.
- De knop **"Stuur naar CNC"** genereert een gecombineerd DXF-bestand + snijlijst.
`,
    tips: [
      'De positioneringsstap is 0.5mm; gebruik een komma voor decimalen.',
      'Niet-geselecteerde elementen worden in het zwart weergegeven — selecteer een element om de afmetingen en parameters te zien.',
    ],
    warnings: [
      'Wijzigingen aan het paneel worden alleen opgeslagen als je op **Bewerking opslaan** drukt — als je de pagina verlaat zonder op te slaan, gaan de wijzigingen verloren.',
    ],
  },
  {
    id: 'operational-dashboard', category: 'operational', roles: ['all'], order: 0,
    title: 'Operationeel Dashboard',
    image: '/manual/operational-dashboard.png',
    imageAlt: 'Operationeel Dashboard',
    content: `# Operationeel Dashboard

De pagina **Operationeel Dashboard** (\`/operational\`) is het centrale paneel voor de werkplaats en logistiek: zie in realtime wat er gebeurt in de productie, montage, service en bij het snijden.

## Overzichtskaarten

- **Productie**: aantal bestellingen in elke Kanban-fase (snijden, slijpen, harden, assemblage, verpakken).
- **Montage**: geplande werkzaamheden voor vandaag / deze week, vertragingen.
- **Service**: openstaande interventies, prioriteit, SLA.
- **Snijden**: panelen in de optimalisatiewachtrij, toegewezen glas per plaat.

## Automatisch vernieuwen

De pagina wordt **automatisch elke 60 seconden vernieuwd** — je kunt een tv-scherm in de werkplaats permanent deze pagina laten weergeven.

## Snelle acties

- Een klik op een kaart brengt je rechtstreeks naar de gedetailleerde pagina (productie-Kanban, montagelijst, enz.).
- De knop **"Nu vernieuwen"** forceert een onmiddellijke update.
`,
    tips: [
      'Gebruik deze pagina op een groot scherm in de werkplaats voor zichtbaarheid voor het hele team.',
      'Gebruik het Hoofddashboard voor financiële indicatoren (omzet, marges).',
    ],
  },
  {
    id: 'reports', category: 'operational', roles: ['all'], order: 3,
    title: 'Rapporten',
    image: '/manual/reports.png',
    imageAlt: 'Rapporten',
    content: `# Rapporten

De pagina **Rapporten** (\`/rapoarte\`) geeft je volledig inzicht in de verkoop en het materiaalverbruik.

## Beschikbare rapporten

1. **Maandelijkse verkoop** — omzet per maand, uitgesplitst per categorie (douche, deuren, balustrades, enz.) en per verkoopmedewerker.
2. **Materiaalverbruik** — de hoeveelheden glas, profielen en accessoires die in een bepaalde periode zijn verbruikt, gegroepeerd per productcode.
3. **Topklanten** — ranglijst op basis van bestelwaarde in de geselecteerde periode.
4. **Marges** — verschil tussen productiekosten en verkoopprijs, per bestelling.

## Filters

- **Datumbereik** (kalender van / tot).
- **Productcategorie**.
- **Medewerker** (verkoper).
- **Bestelstatus** (offerte, bevestigd, in productie, geleverd).

## Exporteren

Alle rapporten kunnen worden geëxporteerd als **CSV** met **UTF-8 BOM** (zodat Excel speciale tekens correct opent).

De waarden respecteren de algemene **RON / EUR** schakelaar.
`,
    tips: [
      'Gebruik voor externe analyse in Excel de CSV-export — de BOM zorgt ervoor dat speciale tekens correct worden weergegeven.',
      'De filters worden voor jouw account bewaard tussen sessies.',
    ],
  },
  {
    id: 'installation-reports', category: 'operational', roles: ['all'], order: 4,
    title: 'Montagerapporten',
    image: '/manual/installation-reports.png',
    imageAlt: 'Montagerapporten',
    content: `# Montagerapporten

De pagina **Montagerapporten** (\`/rapoarte-montaj\`) volgt de prestaties van de montageteams en optimaliseert de planning.

## Wat je ziet

- **Prestaties per team**: aantal voltooide montages, gemiddelde tijd per klus, afgelegde afstand.
- **Kaart met geoptimaliseerde routes** — het systeem stelt de optimale volgorde van de dagelijkse werkzaamheden voor elk team voor (algoritme voor afstandsminimalisatie).
- **Voltooiingschecklist** — percentage correct ingevulde checklists, handtekeningen van klanten.
- **Incidenten** — uitgestelde werkzaamheden, klachten, retouren.

## Filters

- **Periode** (dag / week / maand).
- **Team** of **voertuig**.
- **Geografisch gebied**.

## Snelle acties

- Een klik op een klus opent de volledige details: klant, adres, producten, foto's voor/na, handtekening.
- De knop **"Herplannen"** verplaatst de klus in de kalender zonder de ingevulde checklist te verliezen.
`,
    tips: [
      'De geoptimaliseerde route houdt rekening met het schema van elk team en de met de klanten bevestigde tijdvensters.',
      'Meldingen voor APK/verzekering voor voertuigen verschijnen 30 dagen voor de vervaldatum.',
    ],
  },
  {
    id: 'data-export', category: 'setari', roles: ['all'], order: 17,
    title: 'Gegevens exporteren en importeren',
    image: '/manual/export-date.png',
    imageAlt: 'Instellingen › Gegevens — export en import',
    accent: 'green',
    content: `# Gegevens exporteren en importeren

In **Instellingen → Gegevens** heb je volledige controle over de gegevens die in het platform zijn ingevoerd. Alle gegevens behoren toe aan de abonnee, zijn strikt geïsoleerd per bedrijf (RLS op \`company_id\`) en **kunnen op elk moment worden geëxporteerd of opnieuw geïmporteerd, zonder enige beperking**.

---

## 1. Gegevens exporteren

![Exportgebied](/manual/export-date.png)

De kaart **Gegevens exporteren** biedt 5 knoppen:

- **Klanten (CSV)** — volledige lijst met naam, type, bedrijf, contact, adres, BTW, korting, notities.
- **Offertes (CSV)** — alle offertes met ref nr, product, klant, prijs, BTW, marge, status, datum.
- **Bestellingen (CSV)** — bestellingen met nummer, status, subtotaal, korting, totaal, betaald, levering.
- **Materialen (CSV)** — eigen catalogus met code, naam, type, eenheid, prijs, voorraad, leverancier.
- **Volledige export (JSON)** — één bestand met alle 4 tabellen + tijdstempel (\`exported_at\`).

### Hoe exporteren

1. Ga naar **Instellingen → tab Gegevens**.
2. Klik op de knop van de gewenste categorie (of **Volledige export** voor alles).
3. Het bestand wordt automatisch gedownload. De naam bevat de datum: \`clients_2026-05-22.csv\`, \`full_export_2026-05-22.json\`.
4. Open CSV's direct in Excel / LibreOffice (UTF-8 BOM garandeert correcte tekens) of JSON in een tekstverwerker.

> **Belangrijk voor abonnees:** je hebt het AVG-recht op **gegevensoverdraagbaarheid**. Je kunt al je gegevens altijd en zo vaak je wilt lokaal exporteren en bewaren, zonder limiet.

---

## 2. Gegevens importeren

![Importgebied](/manual/export-date-import.png)

De kaart **Gegevens importeren** stelt je in staat om CSV-bestanden (per categorie) of een eerder opgeslagen volledige JSON terug te laden in het platform. Handig voor:

- **migratie** vanaf een ander systeem (CSV voorbereiden met dezelfde headers als de export),
- **herstel** na een per ongeluk verwijderen (met de laatste volledige export),
- **bulkupload** van klanten, materialen of offertes.

### Hoe importeren

1. In de kaart **Gegevens importeren** klik op de categorie-knop (Klanten / Offertes / Bestellingen / Materialen) voor CSV, of **Volledige import** voor JSON.
2. Selecteer het bestand vanaf je computer.
3. Een **voorbeelddialoog** opent met: doeltabel, aantal gedetecteerde records en eerste gevonden kolommen.
4. Controleer de gegevens en klik op **Import bevestigen** (of Annuleren).
5. Aan het einde toont een melding het aantal succesvol geïmporteerde rijen / fouten.

### Conflictsleutels (duplicaten)

De import gebruikt een unieke sleutel per tabel:

| Tabel | Conflictsleutel |
|---|---|
| Klanten | \`name\` |
| Offertes | \`ref_number\` |
| Bestellingen | \`order_number\` |
| Materialen | \`code\` |

Rijen met een reeds bestaande sleutel kunnen worden **overschreven** — maak vooraf een export als je een back-up wilt.

### Verwacht formaat

- **CSV** — zelfde set headers als in de bijbehorende export, UTF-8 codering.
- **JSON** — exact de structuur van **Volledige export** (\`clients\`, \`quotes\`, \`orders\`, \`materials\` + \`exported_at\`).

---

## Technische details

- De export downloadt **alle records**, met automatische paginering van 1000 op de achtergrond.
- De import verwerkt batches van 100 rijen en injecteert automatisch de bedrijfscontext (RLS).
- Alles wat je exporteert/importeert is geïsoleerd tot je bedrijf.
`,
    tips: [
      'Maak maandelijks een volledige (JSON) export — de veiligste vorm van lokale back-up.',
      'Exporteer vóór elke bulkimport de doeltabel zodat je de vorige versie bij de hand hebt.',
      'Voor CSV met speciale tekens, open in Excel via *Gegevens → Uit tekst/CSV* met UTF-8.',
    ],
  },
  {
    id: 'data-protection', category: 'setari', roles: ['all'], order: 18,
    title: 'Gegevensbescherming',
    image: '/manual/protectia-datelor.png',
    imageAlt: 'Kaarten Back-up / Herstel / Beveiliging',
    content: `# Gegevensbescherming

De veiligheid en beschikbaarheid van je gegevens hebben de hoogste prioriteit. Het platform draait op **Lovable Cloud-infrastructuur**, met meerlaagse bescherming en AVG-naleving.

## Automatische back-up

- **Dagelijkse automatische back-up**, zonder ingrijpen van jou.
- Geschiedenis minimaal 7 dagen bewaard (Point-in-Time Recovery).
- Back-ups zijn versleuteld en redundant opgeslagen in Europese datacenters.

## Herstel

- Bij accidenteel verlies kunnen gegevens op verzoek hersteld worden via het supportteam.
- We raden ook **periodieke lokale export** aan (zie *Gegevensexport*).

## Beveiliging

- **Strikte multi-tenant-isolatie** via Row-Level Security op \`company_id\`.
- **Versleuteling in transit** (HTTPS/TLS) en **in rust** op schijf.
- **JWT** voor sessies, **sterke hashing** voor wachtwoorden.
- **HIBP**-controle bij accountaanmaak en wachtwoordwijziging.
- Europese datacenters, **AVG**-conformiteit.

## Jouw AVG-rechten

| Recht | Hoe uit te oefenen |
|---|---|
| Overdraagbaarheid | Export vanuit Instellingen → Gegevens |
| Inzage | Zie al je gegevens direct in het platform |
| Rectificatie | Bewerk elk veld in de speciale interfaces |
| Wissing | Op verzoek via support (\`isoftplustech@gmail.com\`) |

## Aanbevelingen

- Gebruik een **sterk en uniek wachtwoord**.
- Deel het account niet — maak dedicated gebruikers voor collega\'s (Instellingen → Team).
- **Uitloggen** op openbare of gedeelde apparaten.
- Doe een **maandelijkse export** en bewaar op een veilige plek.
- Zie [Privacybeleid](/privacy-policy) en [Cookiebeleid](/cookie-policy).
`,
    tips: [
      'Je gegevens blijven van jou: altijd exporteerbaar in open formaten (CSV/JSON).',
      'Veiligste combinatie: automatische platform-back-up + maandelijkse lokale export.',
    ],
    warnings: [
      'Stuur het wachtwoord nooit per e-mail, chat of telefoon — support vraagt er nooit om.',
    ],
  },
];
