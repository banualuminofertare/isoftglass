import type { ManualSection, ManualCategory } from './types';

export const categoriesDE: ManualCategory[] = [
  { id: 'introducere', label: 'Erste Schritte', order: 1 },
  { id: 'calculatoare', label: '3D-Konfiguratoren', order: 2 },
  { id: 'vanzari', label: 'Verkauf', order: 3 },
  { id: 'productie', label: 'Produktion', order: 4 },
  { id: 'operational', label: 'Betrieb', order: 5 },
  { id: 'setari', label: 'Einstellungen', order: 6 },
];

export const sectionsDE: ManualSection[] = [
  {
    id: 'getting-started', category: 'introducere', roles: ['all'], order: 1,
    title: 'Willkommen bei iSoftGlass',
    image: '/manual/setari-companie.png',
    imageAlt: 'iSoftGlass Bildschirm – Unternehmensinformationen',
    content: `# Willkommen bei iSoftGlass

iSoftGlass ist die **SaaS**-Plattform für Glashersteller und -händler. Sie deckt den gesamten Workflow ab: 3D-Konfiguration → Angebot → Bestellung → Produktion → Lieferung → Service.

## Was Sie in 5 Minuten tun können

1. **Vervollständigen Sie die Unternehmensdaten** unter *Einstellungen → Unternehmen* (CUI, Adresse, IBAN, Logo).
2. **Überprüfen Sie die Preise** unter *Einstellungen → Preise* – der Standardkatalog wird automatisch geladen, Sie passen nur an, was abweicht.
3. **Fügen Sie den ersten Kunden hinzu** unter *Kunden → Neuer Kunde* (oder lassen Sie ihn automatisch erstellen, wenn Sie das erste Angebot speichern).
4. **Öffnen Sie einen 3D-Konfigurator** aus dem Seitenmenü (z. B. *Duschkabinen*) und konfigurieren Sie ihn in 6 Schritten.
5. **Als Angebot speichern** – es erscheint unter *Bestellungen* mit einem versandfertigen PDF.
6. **In Produktion geben**, wenn der Kunde bestätigt – der Lagerbestand wird automatisch abgebucht.`,
    tips: [
      'Die obere Leiste hat einen RON / EUR-Schalter – die internen Preise sind immer in RON, es handelt sich nur um eine Anzeige.',
      'Klicken Sie jederzeit auf das 📖-Symbol (türkis), um dieses Handbuch genau im aktuellen Abschnitt erneut zu öffnen.',
    ],
  },
  {
    id: 'header-icons', category: 'introducere', roles: ['all'], order: 2,
    title: 'Obere Leiste und Schnellzugriffe',
    content: `# Obere Leiste

In der oberen rechten Ecke finden Sie alle globalen Befehle:

1. 🔔 **Gelbe Glocke (amber)** – Ankündigungen und Neuigkeiten, die vom iSoftGlass-Team veröffentlicht werden. Die rote Zahl = ungelesene Ankündigungen.
2. 📖 **Handbuch (türkiser Umriss)** – das Handbuch, das Sie gerade sehen. Es öffnet sich im für die aktuelle Seite relevanten Abschnitt.
3. **RON / EUR** – ändert die angezeigte Währung in der gesamten Anwendung. Die Umrechnung verwendet den Wechselkurs aus *Einstellungen → Unternehmen*.
4. **🇷🇴 RO** – Sprachauswahl. Wir unterstützen 9 Sprachen (RO, EN, IT, DE, PL, FR, ES, NL, HR).
5. **Logout** – sicheres Abmelden vom Konto.

## Seitenleiste – linkes Menü

- **Main** – Dashboard, 3D-Konfiguratoren, Einstellungen
- **Operational** – Bestellungen, Produktion, Scanner, Kunden, Berichte, Montage
- Klicken Sie auf die **⬅**-Schaltfläche neben dem Logo, um die Seitenleiste einzuklappen (mehr Platz auf dem Bildschirm).`,
    tips: [
      'Die interne Speicherung der Preise erfolgt immer in RON – die Umstellung auf EUR ist nur eine Anzeige.',
      'Die Änderung der Sprache betrifft nur die Benutzeroberfläche; die eingegebenen Daten bleiben in der Originalsprache.',
    ],
  },
  {
    id: 'calc-flow-6-steps', category: 'calculatoare', roles: ['all'], order: -1,
    title: 'Die 6 Schritte in einem 3D-Konfigurator',
    image: '/manual/calc-step6-finalizare.png',
    imageAlt: 'Schritt 6 - Angebotsabschluss mit Kundendaten und den Schaltflächen PDF/Speichern/In den Warenkorb',
    content: `# Die 6 Schritte in einem 3D-Konfigurator

Jeder 3D-Konfigurator (Duschkabine, Tür, Geländer, Spiegel, Küchenrückwand, Trennwand) folgt **demselben linearen 6-Schritte-Ablauf**. Bei jedem Schritt sehen Sie rechts die 3D-Visualisierung, die sich in Echtzeit aktualisiert, und der Fortschritt wird in der oberen Leiste markiert.

---

## Schritt 1 – Produkttyp

Sie wählen die Form oder Typologie (z. B. **Ecke 90°**, **Walk-in / Nische**, **Fünfeck**, **Badewannenabtrennung**, **Festteil**). Jeder Typ lädt die grundlegende Geometrie und die Liste der passenden Profile vor.

![Schritt 1 - Produkttyp auswählen](/manual/calc-step1-tip.png)

## Schritt 2 – Öffnungssystem

Sie wählen die Funktionsweise: **mit Scharnieren** (klassisch), **Pivot** oben-unten (minimalistisch) oder **Schiebesystem** auf Schiene (platzsparend). Ihre Auswahl hier bestimmt automatisch, welche Zubehörteile Sie in Schritt 5 hinzufügen können.

![Schritt 2 - Öffnungssystem](/manual/calc-step2-dimensiuni.png)

## Schritt 3 – Glas

Sie stellen die **Dicke** (6/8/10/12 mm), die **Oberfläche** (transparent, grau, bronze, sandgestrahlt) und Optionen ein: **Anti-Kalk-Behandlung**, **Kanten schleifen**, **Vorspannen**, **Laminieren**. Der Glaspreis wird sofort neu berechnet.

![Schritt 3 - Glasauswahl](/manual/calc-step3-sticla.png)

## Schritt 4 – Türkonfiguration & Abmessungen

Sie legen die **Öffnungsseite** (frontal / seitlich), die **Richtung** (innen / außen), die **Scharnierseite** (links / rechts) und die endgültigen **Abmessungen** (Breite × Höhe × Tiefe) fest. Klicken Sie auf ein beliebiges Maß in der 3D-Szene zur schnellen Bearbeitung (Enter / Tab speichert).

![Schritt 4 - Tür und Abmessungen](/manual/calc-step4-profile.png)

## Schritt 5 – Profile & Zubehör

Sie wählen aus personalisierten Listen: **Dichtungsprofile**, **U- / Umfangsprofile**, **Stabilisierungsstangen**, **Extra-Kits**. Für vollständige Details zur Funktionsweise dieses Schrittes, siehe den Abschnitt **„Wie Zubehörteile in den Konfiguratoren funktionieren“**.

![Schritt 5 - Profile und Zubehör](/manual/calc-step5-accesorii.png)

---

## Schritt 6 – Angebotsabschluss (detailliert)

Hier wandeln Sie die Konfiguration in eine kommerzielle Aktion um. Schritt 6 hat 3 klare Bereiche: **Kundendaten**, **Zusatzbetrag & Gesamtbetrag**, **Aktionsschaltflächen**.

![Schritt 6 - Abschluss](/manual/calc-step6-finalizare.png)

### Kundendaten (Client info)

- **Kundentyp** – Privatperson / Firma / Händler. **Sehr wichtig**: Der hier gewählte Typ wendet automatisch den in **Einstellungen → Kundenaufschläge** konfigurierten Aufschlag an, sodass der angezeigte Preis bereits die Marge pro Typ berücksichtigt.
- **Kundenname** – der Name, der auf dem Angebot und im PDF erscheint.
- **Telefon** & **E-Mail** – Kontaktdaten, die im CRM und für den Angebotsversand verwendet werden.

> Beim Speichern **erstellt das System automatisch einen neuen Datensatz**, wenn der Kundenname nicht in der CRM-Datenbank vorhanden ist. Wenn er existiert, wird der vorhandene Datensatz verwendet (Übereinstimmung nach Name).

### Zusatzbetrag (Extra amount)

Das Feld **„Extra amount“ / „Zusatzbetrag“** ermöglicht es Ihnen, einen freien Betrag zur berechneten Zwischensumme hinzuzufügen. Wofür dies in der Praxis nützlich ist:

- **Transport** zum Kunden (z.B. +150 RON für die Lieferung).
- **Zusätzliche Montage** über das Standardpaket hinaus.
- **Spezielle Arbeitsleistung** (z.B. Bohrung in Granit, nicht standardmäßige Teile).
- **Dringlichkeitszuschlag**, wenn der Auftrag vorrangig ausgeführt werden muss.
- **Handelsrabatt** – geben Sie einen **negativen** Wert ein (z.B. -50 RON) und er wird von der Gesamtsumme abgezogen.

Der Betrag wird zur Zwischensumme **vor** der Mehrwertsteuer addiert und erscheint separat und transparent für den Kunden im PDF.

### Zwischensumme, MwSt. und Gesamtbetrag

Die Karte zeigt in Echtzeit an: **Zwischensumme (ohne MwSt.)**, **MwSt. %** (aus den Einstellungen) und **Gesamtbetrag mit MwSt.** Jede Änderung eines Parameters (Glas, Zubehör, Zusatzbetrag) führt zu einer sofortigen Neuberechnung.

### Die 3 Aktionsschaltflächen

1. **PDF herunterladen** – generiert das Angebots-PDF (Firmenlogo, Kundendaten, Produktliste mit 3D-Snapshot 70×47 px, nach Code aggregiertes Zubehör, Arbeitsleistung, Gesamtbetrag mit MwSt.). **Wird verwendet für** den schnellen Versand per E-Mail / WhatsApp, **ohne** im System zu speichern. Nützlich, wenn Sie nur ein Richtangebot wünschen.

2. **Angebot speichern** – erstellt in der Datenbank ein Angebot mit der Nummer **OFR-JJJJMMTT-HHMMSS** und eine **Bestellung mit dem Status „Angebot“**. **Wird verwendet, wenn** das Angebot verbindlich ist und Sie es später unter **Bestellungen** wiederfinden, bearbeiten oder in einen Auftrag umwandeln möchten.

3. **In den Warenkorb** – fügt das aktuelle Produkt dem **aktiven Warenkorb** (Symbol unten rechts mit Zähler-Badge) hinzu, **ohne** die Bestellung abzuschließen. **Wird verwendet für** Angebote mit mehreren Produkten: z.B. Dusche + Spiegel + Küchenrückwand für denselben Kunden – Sie fügen sie nacheinander hinzu und schließen dann den gesamten Warenkorb als eine einzige Bestellung ab.

---

## Was passiert nach „In den Warenkorb“

![Warenkorb mit den hinzugefügten Produkten](/manual/cos-flow.png)

### 1. Der Warenkorb (Symbol unten rechts)

Ein Klick auf das Warenkorbsymbol mit Zähler-Badge öffnet die Seitenleiste **Order Products**:

- Listet alle hinzugefügten Produkte auf, jedes mit **Abmessungen**, **Glasdicke** und **Preis**.
- **+ / -** Schaltflächen für die Menge bei jeder Position.
- Das rote **Papierkorb**-Symbol löscht die Position.
- Die Schaltfläche **„Empty“ / „Leeren“** löscht den gesamten Warenkorb.
- Unten: **Order total** (Gesamtsumme aller Produkte).

### 2. Bestellung abschließen

Sie drücken auf **„Finalize“ / „Abschließen“** und das Dialogfeld **Create order from cart** öffnet sich:

![Dialog Bestellung abschließen](/manual/cos-finalizare.png)

- **Cart products** – Zusammenfassung der Produkte im Warenkorb mit Gesamtsumme.
- **Client** – Kundendaten (automatisch vom zuletzt hinzugefügten Produkt übernommen).
- **Delivery Address** – Liefer- / Montageadresse.
- **Delivery Date** – voraussichtlicher Termin.
- **Notes** – interne Anmerkungen.

Sie drücken auf **Create Order**: Das System generiert eine eindeutige Bestellnummer und legt die Bestellung in der **Bestellungsverwaltung** mit dem Status **„Angebot“** ab.

### 3. In der Bestellungsverwaltung

Die Bestellung erscheint sofort in der Liste. Von hier aus können Sie:

- Das konsolidierte **PDF herunterladen** (alle Produkte aggregiert, Zubehör nach Code summiert).
- **In Produktion geben** – bucht automatisch den Lagerbestand ab, erstellt den Produktionsauftrag und die Kanban-Karte.
- **Rechnung** oder **Proforma-Rechnung (Anzahlung)** ausstellen.
- **Montage** an das Installationsteam planen.
- **Die Bestellung öffnen** (Klick auf die Zeile) für die Tabs **Details / Produkte / Verlauf / Vorschau**.

### 4. Nachträgliche Bearbeitung

Im Tab **Produkte** einer Bestellung führt Sie die Schaltfläche **Bearbeiten** zurück zum ursprünglichen Konfigurator, wobei die **gesamte Konfiguration** aus \`full_config\` wiederhergestellt wird – einschließlich Kundentyp, Zusatzbetrag, Zubehör. Sie ändern → speichern → die Bestellung wird automatisch aktualisiert.`,
    tips: [
      'In Schritt 6 berechnet die Änderung des **Kundentyps** zwischen Privatperson / Firma / Händler sofort die gesamte Zwischensumme mit dem korrekten Aufschlag neu.',
      'Verwenden Sie **PDF herunterladen** für schnelle Angebote per E-Mail und **Angebot speichern** nur dann, wenn das Angebot verbindlich ist – so vermeiden Sie, den Verlauf mit Entwürfen zu füllen.',
      'Der Warenkorb ermöglicht es Ihnen, mehrere Produkte für denselben Kunden zu konfigurieren und sie in einer **einzigen Bestellung** mit einem einzigen, zusammengefassten PDF zu senden.',
      'Die gesamte Konfiguration (einschließlich des Zusatzbetrags und des Kundentyps) wird in `full_config` gespeichert – beim erneuten Öffnen ist alles wieder genau so wie es war.',
    ],
    warnings: [
      'Der negative Zusatzbetrag (Rabatt) prüft NICHT, ob die Gesamtsumme unter Null fällt – achten Sie auf den Wert.',
      'Wenn Sie die Preise in den Einstellungen ändern, **nachdem** Sie ein Angebot gespeichert haben, werden alte Angebote **nicht** automatisch neu berechnet – sie behalten die ursprünglichen Werte bei.',
    ],
  },
  {
    id: 'accessory-flow', category: 'calculatoare', roles: ['all'], order: 0,
    title: 'Wie Zubehörteile in den Konfiguratoren funktionieren',
    image: '/manual/accesorii-import.png',
    imageAlt: 'Zubehörkatalog – Schaltfläche \'In meine Liste importieren\'',
    content: `# Wie Zubehörteile in den Konfiguratoren funktionieren

Alle 3D-Konfiguratoren (Duschkabine, Türen, Geländer, Spiegel, Küchenrückwand, Trennwände) verwenden **dasselbe System** für Zubehörteile: Scharniere, Griffe, U-Profile, Stabilisierungsstangen, Schiebe-Kits, Stopper, Schlösser usw.

Die Logik ist einfach und wird **nur einmal** durchgeführt:

> **Aus dem Katalog importieren → wird in „Produkt auswählen“ gespeichert → überall und in jedem Angebot verwenden.**

Sie müssen das Zubehörteil nicht bei jedem Auftrag erneut suchen – einmal importiert, bleibt es in Ihrer persönlichen Liste, bis Sie entscheiden, es zu entfernen.

---

## Schritt 1 – Zubehörkatalog öffnen

Gehen Sie zu **Einstellungen → Preise → Zubehör** (oder direkt **Einstellungen → Zubehörkatalog**, je nach Interface-Version).

Hier sehen Sie den globalen Katalog des Systems – Tausende von Codes, gruppiert nach Kategorien: Scharniere, Griffe, U-Profile, Schiebe-Kits, Dichtungen, Stabilisierungsstangen, Stopper, Schlösser, Halterungen, Abdeckungen.

![Zubehörkatalog](/manual/accesorii-import.png)

- Verwenden Sie die **übergreifende Suche** (oben) – suchen Sie nach Code, Bezeichnung oder Oberfläche in allen Kategorien.
- Die seitlichen Filter grenzen nach Kategorie / Unterkategorie ein.

## Schritt 2 – Benötigte Zubehörteile importieren

In der Zeile jedes Zubehörteils im Katalog gibt es eine Schaltfläche **„Importieren“** (oder „Zu meiner Liste hinzufügen“). Klicken Sie darauf – das Zubehörteil wird sofort in Ihre **persönliche Liste** aufgenommen, die pro Unternehmen isoliert ist (strikte RLS).

Markieren Sie mehrere Zeilen und klicken Sie auf **„Auswahl importieren“**, um eine ganze Gruppe hinzuzufügen (z. B. das gesamte Set an Scharnieren für Duschkabinen).

> **Das machen Sie nur einmal.** Nach dem Import ist das Zubehörteil für alle Benutzer im Unternehmen in allen Konfiguratoren verfügbar.

## Schritt 3 – Preise und Einheiten überprüfen

In Ihrer lokalen Liste zeigt jedes Zubehörteil an:

- **Code** und **Bezeichnung** (aus dem Katalog übernommen).
- **Preis** (Sie können Ihren eigenen Preis überschreiben – dies beeinflusst nicht den globalen Katalog).
- **Einheit** (Stk, lfm, Set) – unterstützt auch Dezimalwerte für lfm.
- **Verfügbare Oberfläche** (Chrom, matt, gebürstet usw.).

Ändern Sie den Preis direkt in der Zelle – er wird automatisch gespeichert und erscheint sofort in den Konfiguratoren.

## Schritt 4 – Im Konfigurator „Produkt auswählen“ öffnen

Sie betreten einen Konfigurator (z. B. **Duschkabinen**), gelangen zum Schritt **Zubehör** (Scharniere, Griff, U-Profil, Stange usw.).

Für jeden Slot zeigt das Dropdown-Menü **„Produkt auswählen“** **nur die von Ihnen importierten Zubehörteile** an – eingeschränkt auf den passenden Typ (z. B. sehen Sie im Slot Griff nur Griffe).

![Dropdown 'Produkt auswählen' im Konfigurator](/manual/accesorii-selecteaza-produs.png)

- Die Liste ist sauber: Sie verlieren sich nicht in Tausenden von irrelevanten Codes.
- Schnelle Suche im Dropdown nach Code oder Bezeichnung.

## Schritt 5 – Menge und Oberfläche anpassen

Nachdem Sie das Zubehörteil ausgewählt haben:

- **Menge** – bei Scharnieren können Sie 2 oder 3 wählen (Ihre Wahl ist maßgebend und überschreibt die automatische Regel).
- **Oberfläche** – Farbe/Oberfläche aus den verfügbaren Varianten (mit Fallback auf das übergeordnete Element, wenn die genaue Variante fehlt).
- **Position** – Scharniere werden von oben nach unten gemessen, der Griff von unten nach oben (Branchenkonvention, bereits vorkonfiguriert).

## Schritt 6 – Konfiguration speichern → Zubehörteile gehen ins Angebot

Sie klicken auf **„Als Angebot speichern“** oder **„In den Warenkorb“**. Das ausgewählte Zubehör:

1. Wird dem Produkt mit seinem Preis in RON zugeordnet (anzeigbar in EUR konvertiert).
2. Erscheint in **OrderPreview** und im Angebots-PDF, automatisch nach Code aggregiert (gleicher Code = Summe der Mengen).
3. Wird in der \`full_config\` JSON gespeichert – die Quelle der Wahrheit für PDF, DXF und spätere Bearbeitung.
4. Bei der Übergabe an die Produktion wird der **Lagerbestand automatisch** entsprechend den Mengen im Angebot reduziert.

![Zubehörteil im Angebot hinzugefügt](/manual/accesorii-in-oferta.png)`,
    tips: [
      'Sie importieren einmal – dann bleiben die Zubehörteile für alle Kollegen im Unternehmen unter „Produkt auswählen“ verfügbar.',
      'Preise können lokal überschrieben werden (Override pro Unternehmen), ohne den Systemkatalog zu beeinflussen.',
      'Sie verwenden den gleichen Arbeitsablauf in ALLEN Konfiguratoren: Dusche, Türen, Geländer, Spiegel, Küchenrückwand, Wände.',
    ],
    warnings: [
      'Wenn Sie ein Zubehörteil aus Ihrer persönlichen Liste entfernen, bleiben alte Angebote gültig (die Konfiguration ist in `full_config` gespeichert), aber Sie können es in neuen Aufträgen erst wieder auswählen, nachdem Sie es erneut importiert haben.',
    ],
  },
  {
    id: 'calc-shower', category: 'calculatoare', roles: ['all'], order: 1,
    title: 'Konfigurator für Duschkabinen',
    image: '/manual/calc-dus.png',
    imageAlt: '3D-Konfigurator für Duschkabinen',
    content: `# Konfigurator für Duschkabinen

Konfigurieren Sie visuell in 3D jede Art von Kabine: Ecke 90°, Walk-in, Fünfeck, Badewanne, Festteil.

## Die 6 Schritte

1. **Kabinentyp** – wählen Sie die Form (Ecke 90°, Nische, Fünfeck, Badewannenabtrennung, fest).
2. **Abmessungen** – klicken Sie auf das Maß in der 3D-Szene, um es zu bearbeiten (Enter / Tab speichert).
3. **Glas** – Dicke (8/10/12 mm), Oberfläche (klar, grau, bronze), optionales Vorspannen.
4. **Profile** – U, Wand, Ecke 90°, Schiebe-Kit (falls zutreffend).
5. **Zubehör** – Scharniere (2 oder 3), Griff, Stabilisierungsstange, Dichtungen.
6. **Speichern** – als Angebot oder direkt als neuer Auftrag.`,
    tips: [
      'Scharniere werden von **oben nach unten** gemessen, der Griff von **unten nach oben** – das ist die Branchenkonvention.',
      'Das Festteil hat KEINEN impliziten Abzug von 10 mm – nur die summierten Profile + Dichtungen.',
      'Das Schiebesystem benötigt keine Scharniere und berechnet die Überlappung aus dem Kit automatisch.',
    ],
    warnings: [
      'Bei Ecke 90° werden die U-Profile an der Schnittstelle zwangsweise ausgeblendet, um eine Verdopplung zu vermeiden.',
    ],
  },
  {
    id: 'calc-door', category: 'calculatoare', roles: ['all'], order: 2,
    title: 'Konfigurator für Glastüren',
    image: '/manual/calc-usa.png',
    imageAlt: '3D-Konfigurator für eine Glastür',
    content: `# Türen-Konfigurator

Für Innentüren mit Scharnieren, Pivot oder Schiebesystem auf Schiene.

## Schritte

1. **System** – Mit Scharnieren, Pivot oben-unten, Schiebesystem auf Schiene.
2. **Abmessungen** – Breite, Höhe, Türöffnung.
3. **Glas** – Dicke und Oberfläche.
4. **Seitendichtungen** – Array \`lateralSelections\` mit separaten Optionen für links/rechts/oben/unten.
5. **Ausschnitte** – für Griff oder Schloss (Schwelle >50 mm = groß, ≤50 mm = klein).
6. **Zubehör** – Scharniere, Griff, Stopper, Schloss.`,
    tips: [
      'Der Pivot-Beschlag wird automatisch basierend auf dem Glasgewicht berechnet.',
      'Beim Schiebesystem sind Schiene und Führung im Kit enthalten – nicht separat hinzufügen.',
    ],
  },
  {
    id: 'calc-balustrade', category: 'calculatoare', roles: ['all'], order: 3,
    title: 'Geländer-Konfigurator',
    image: '/manual/calc-balustrada.png',
    imageAlt: '3D-Konfigurator für ein Geländer',
    content: `# Geländer-Konfigurator

Konfiguration von Glasgeländern: Innenbereich, Außenbereich (laminiert obligatorisch), Treppen (geneigte Paneele).

## Schritte

1. **Typ** – Innen, Außen, Treppen.
2. **Gesamtlänge** und **Höhe** – in mm.
3. **Glas** – laminiert 8+8, 10+10 oder einfach vorgespannt (nur für den Innenbereich).
4. **Befestigung** – durchgehendes U-Profil, Punktklemmen, Pfosten.
5. **Handlauf** – optional (Holz, Edelstahl, Aluminium).
6. **Abdeckungen** – für U-Profil.`,
    warnings: [
      'Im Außenbereich MUSS das Glas laminiert sein – eine zwingende Sicherheitsnorm.',
    ],
  },
  {
    id: 'calc-mirror', category: 'calculatoare', roles: ['all'], order: 4,
    title: 'Spiegel-Konfigurator',
    image: '/manual/calc-oglinda.png',
    imageAlt: '3D-Konfigurator für einen Spiegel',
    content: `# Spiegel-Konfigurator

Für einfache Spiegel oder solche mit speziellen Bearbeitungen.

## Schritte

1. **Form** – Rechteck, Quadrat, Kreis, Oval, Benutzerdefiniert.
2. **Abmessungen** – in mm; für benutzerdefinierte Formen zeichnen Sie im CAD-Editor.
3. **Spiegeltyp** – Standard versilbert, antik, rauchfarben, bronze.
4. **Kante** – geschliffen, facettiert, poliert.
5. **Ausschnitte** – für Schalter, Steckdosen, Halterungen.
6. **LED-Beleuchtung** – optional, umlaufend oder hinten.`,
  },
  {
    id: 'calc-kitchen', category: 'calculatoare', roles: ['all'], order: 5,
    title: 'Konfigurator für Küchenrückwände',
    image: '/manual/calc-front-bucatarie.png',
    imageAlt: '3D-Konfigurator für eine Küchenrückwand',
    content: `# Konfigurator für Küchenrückwände

Küchenfronten aus lackiertem, digital bedrucktem oder matt sandgestrahltem Glas.

## Schritte

1. **Oberfläche** – Lackiert nach RAL, Digitaldruck, Matt sandgestrahlt.
2. **Abmessungen** – Breite × Höhe pro Front; multiplizieren Sie die Anzahl der Fronten.
3. **Farbe / Druck** – wählen Sie RAL oder laden Sie eine Druckdatei hoch.
4. **Ausschnitte** – für Griffe oder Push-to-Open.
5. **Befestigungssystem** – Kleber auf MDF, Schrauben von hinten, Aluminiumprofil.
6. **Speichern** – automatische Aggregation für ganze Küchen.`,
    tips: [
      'Für den Digitaldruck beträgt die empfohlene Mindestauflösung 150 dpi bei der endgültigen Größe.',
    ],
  },
  {
    id: 'calc-panels', category: 'calculatoare', roles: ['all'], order: 6,
    title: 'Paneele & Trennwände',
    image: '/manual/calc-panouri.png',
    imageAlt: '3D-Konfigurator für ein Paneel und eine Trennwand',
    content: `# Paneele und Trennwände

Zwei Untermodule:

- **Einfaches Paneel** – Glas ohne Bearbeitungen (Glas nach Maß).
- **Trennwand** – konfigurierbares Raster mit integrierten Türen.

## Trennwände – Schlüsselschritte

1. **Raster** – Sie definieren, wie viele Spalten × Zeilen; Größenänderung durch Ziehen der Verriegelung (die Gesamtbreite bleibt konstant).
2. **Umfangsprofile** – oben, unten, seitlich; werden automatisch unterbrochen, wo Türen sind.
3. **Innenprofile** – vertikal und horizontal; \`usableWidth/Height\` stellt sicher, dass die Paneele passen.
4. **Integrierte Türen** – in jeder Zelle; ziehen automatisch vom Umfangsprofil ab.
5. **Seitliche 90°-Paneele** – die Höhe synchronisiert sich mit der der Tür.
6. **Glas & Oberflächen** – pro Zelle oder global.`,
    warnings: [
      'Bei der Größenänderung einer Spalte passen sich die Nachbarn automatisch an, um die Gesamtbreite zu erhalten.',
    ],
  },
  {
    id: 'orders', category: 'vanzari', roles: ['all'], order: 1,
    title: 'Bestellungsverwaltung',
    image: '/manual/comenzi-deschide.png',
    imageAlt: 'Liste der Bestellungen mit Status',
    content: `# Bestellungen

Alle Angebote und Bestellungen, mit schnellen Filtern nach Status: Angebot → Bestätigt → In Produktion → Abgeschlossen → Geliefert → Storniert.

## Schnellaktionen in der Bestellzeile

1. **Status ändern** – farbige Schaltflächen direkt in der Zeile (Bestätigen, Abschließen, Liefern).
2. **In Produktion geben** – bucht automatisch den Lagerbestand ab und erstellt den Produktionsauftrag.
3. **DXF generieren** – für CNC, für jedes Paneel.
4. **Bearbeiten** – öffnet das Angebot im ursprünglichen Konfigurator erneut (alle Daten wiederhergestellt).
5. **Löschen** – nur wenn noch nicht in Produktion.

## Eine Bestellung im Detail öffnen

Klicken Sie auf die Bestellnummer (oder auf die Zeile) in der **Bestellliste** und es öffnet sich ein Feld mit dem Bestellkopf (Nr., Status, Schaltfläche **PDF herunterladen**) und 4 Tabs:

![Geöffnete Bestelldetailansicht](/manual/comenzi-detalii.png)

### 1. Details
Kundendaten, Erstellungsdatum, Zwischensumme, MwSt., Gesamtbetrag. Hier überprüfen Sie schnell die kommerziellen Daten und haben die Schaltflächen für **Montage planen**, **Rechnung erstellen** und **Proforma-Rechnung (Anzahlung)**.

### 2. Produkte
Liste der konfigurierten Produkte mit Menge, Stückpreis und Zusatzbetrag (falls vorhanden). Die Schaltfläche **Bearbeiten** bei jedem Produkt führt Sie zur Anpassung zurück in den Konfigurator.

![Tab Produkte](/manual/comenzi-produse.png)

### 3. Verlauf
Änderungsprotokoll: Statusänderungen, Bearbeitungen, Zahlungen, Dokumentenerstellungen. Nützlich für Nachverfolgbarkeit und Audit – sehen Sie, wer wann welche Änderung vorgenommen hat.

![Tab Verlauf](/manual/comenzi-istoric.png)

### 4. Vorschau
Detaillierte Wiedergabe des Angebots genau so, wie es im **an den Kunden gesendeten PDF** erscheint: Für jedes Produkt sehen Sie den Konfigurationstyp, die Abmessungen und die Glasfläche, die angewandten Bearbeitungen, die Liste der Zubehörteile mit Code und Stückpreis, die Arbeitsleistung und den Gesamtbetrag. **Wird für die Endkontrolle verwendet**, bevor das Angebot an den Kunden gesendet oder die Bestellung in die Produktion gegeben wird – Sie bestätigen, dass die Preise für Produkte, Zubehör und Arbeitsleistung korrekt sind.

![Tab Vorschau](/manual/comenzi-previzualizare.png)

## Die oberen Karten

Sofortige Zusammenfassung: Gesamtbestellungen, Wert in RON, Verteilung nach Status.`,
    tips: [
      'Die vollständige Konfiguration (`full_config`) bleibt vom Warenkorb bis zur Bestellung intakt – es gehen keine Daten verloren.',
      'Identische Zubehörteile werden im endgültigen PDF automatisch aggregiert (Summe der Mengen, eindeutiger Code).',
      'Der Vorschau-Tab spiegelt immer die aktuellen Werte wider – wenn Sie einen Preis in den Einstellungen ändern, wird er hier aktualisiert.',
    ],
  },
  {
    id: 'invoicing', category: 'vanzari', roles: ['all'], order: 2,
    title: 'Fakturierung',
    image: '/manual/facturare.png',
    imageAlt: 'Fakturierungsmodul mit KPIs und Diagrammen',
    content: `# Fakturierung

Ausstellung von Rechnungen aus bestätigten Bestellungen, mit benutzerdefinierten Serien und Export für e-Factura (CIUS-RO und FatturaPA für IT).

## Schritte

1. **Serien konfigurieren** in *Einstellungen → Fakturierung → Serien* (Präfix, Jahr, Zähler).
2. **Rechnung generieren** aus der Bestellung: **€**-Schaltfläche in der Bestellzeile.
3. **Zeilen bearbeiten** – hinzufügen/entfernen, Preise, MwSt. pro Zeile anpassen.
4. **Ausstellen** – Nummer wird automatisch zugewiesen, Status wird zu „Issued“.
5. **Zahlung erfassen** – Dialog für teilweise oder vollständige Zahlung.
6. **XML exportieren** – für ANAF (RO) oder SDI (IT).

## KPI

Die oberen Karten: fakturiert, eingegangen, ausstehend, storniert.`,
    warnings: [
      'Eine ausgestellte Rechnung kann nicht gelöscht werden – nur mit Begründung storniert und durch eine Gutschrift ersetzt werden.',
    ],
  },
  {
    id: 'clients-crm', category: 'vanzari', roles: ['all'], order: 3,
    title: 'Kunden & CRM',
    image: '/manual/clienti-crm.png',
    imageAlt: 'CRM-Kundenliste mit Typen',
    content: `# Kunden

Vollständige Datenbank der Kunden: Privatpersonen, Unternehmen, Händler.

## Schritte

1. **Kunden hinzufügen** – Schaltfläche „Neuer Kunde“ oder automatisch, wenn Sie ein Angebot für eine neue E-Mail-Adresse speichern.
2. **Kundentyp** – Person / Unternehmen / Händler (mit globalem Rabatt).
3. **Kontaktdaten** – Telefon, E-Mail, Adresse, CUI (wenn Unternehmen).
4. **CRM-Pipeline** (Admin) – Leads, Phasen, Konversionen.
5. **Verlauf** – alle Angebote und Bestellungen des Kunden an einem Ort.
6. **Spezifischer Aufschlag** – in *Einstellungen → Kundenaufschlag* legen Sie unterschiedliche Aufschläge für Typen fest.

## Die oberen Filter

Suche nach Name/E-Mail, Filter nach Kundentyp.`,
    tips: [
      'Kunden werden automatisch aus den 3D-Konfiguratoren erstellt, wenn Sie das erste Angebot mit einer neuen E-Mail-Adresse speichern.',
    ],
  },
  {
    id: 'production-kanban', category: 'productie', roles: ['all'], order: 1,
    title: 'Kanban-Produktionsfluss',
    image: '/manual/productie-kanban.png',
    imageAlt: 'Kanban-Board mit den Spalten Zuschnitt, Bearbeitung, Vorspannen',
    content: `# Kanban-Produktion

Der visuelle Workflow in Phasen: **Zuschnitt → Bearbeitung → Vorspannen → Beschichtung/Druck → Montage → Bereit zur Lieferung**.

## Tägliche Schritte

1. **Überprüfen Sie die KPIs** oben: gesamt aktiv, in Arbeit, wartend, bereit zur Lieferung.
2. **Ziehen & Ablegen** einer Karte zwischen den Spalten, um manuell fortzufahren.
3. **Klick auf die Karte** – öffnet den Produktionsauftrag mit technischen Zeichnungen, Materialien, Zubehör.
4. **Bedienerzuweisung** – in *Bestellungen → Bedienerplanung* vorgeplant; wird in \`operator_name\` zur Nachverfolgbarkeit gespeichert.
5. **Kalenderansicht** – alternativer Tab zur Datumsplanung.

## Etiketten mit Barcode

Aus dem Produktionsauftrag jeder Bestellung (und von der Seite **Scanner**) haben Sie die Schaltfläche **„Etikett drucken“**:

- Der Barcode ist **CODE128**, automatisch aus der Auftragsnummer generiert (mit der JsBarcode-Bibliothek).
- Das Etikett enthält: **Auftragsnr.**, **Bestellnr.**, **Kunde**, **Liefertermin** und die **aktuelle Phase**.
- Es öffnet sich direkt der Druckdialog des Browsers – Sie können normale A4-Drucker oder spezielle Etikettendrucker (Zebra, Brother etc.) verwenden.
- Sie kleben das Etikett auf das Glas / den Rahmen / das Paket und verwenden es in jeder Phase des Workflows wieder.

## Scannen in der Werkstatt

Die Seite **Produktion → Scanner** ist für das Tempo der Werkstatt optimiert:

1. **Auto-Fokus** auf das Scanfeld – Sie müssen vor jedem Scan nicht klicken.
2. **HID-Lesegeräte** – jeder USB-Scanner vom Typ „Tastatur“ funktioniert Plug-and-Play (keine Treiber erforderlich).
3. **Scannen Sie den Code** vom Etikett → die Bestellung **rückt automatisch** zur nächsten Phase im Workflow vor.
4. **Sofortige visuelle Bestätigung**: Die Karte zeigt den neuen Status an und das Kanban wird aktualisiert.

So verlieren die Bediener keine Zeit mehr mit manuellem Ziehen & Ablegen und es gibt keine Fehler wie „ich habe vergessen zu markieren, dass ich fertig bin“.

## Echtzeit-Verfolgung

Das Kanban-Board wird im Hintergrund **automatisch aktualisiert**:

- Scans aus der Werkstatt erscheinen **sofort** auf den Büro-Bildschirmen – ohne manuelles Aktualisieren.
- Die oberen KPIs (aktiv, in Arbeit, bereit zur Lieferung) werden live neu berechnet.
- Mehrere Bediener können gleichzeitig an verschiedenen Phasen arbeiten, ohne sich gegenseitig in die Quere zu kommen.
- Der Manager sieht jederzeit, **wo sich jede Bestellung befindet** und **wer daran arbeitet**.

## Voraussichtliches Lieferdatum

Wird automatisch berechnet, wenn eine Bestellung in die Produktion geht, basierend auf der Auslastung der Spalten.`,
    tips: [
      'Drucken Sie das Barcode-Etikett sofort nach Eingang der Bestellung in der Produktion und kleben Sie es auf das Paket – es wird zur Wahrheitsquelle für den gesamten Workflow.',
      'Lassen Sie die Scanner-Seite auf einem Tablet/Laptop in der Werkstatt geöffnet; der Auto-Fokus stellt sicher, dass jeder Scan erfasst wird, auch wenn niemand an der Tastatur ist.',
      'Für einen 24/7-Workflow öffnen Sie das Kanban auf einem großen Fernseher – Sie sehen den Fortschritt in Echtzeit, ohne etwas zu berühren.',
    ],
  },
  {
    id: 'inventory', category: 'productie', roles: ['all'], order: 2,
    title: 'Lager & Inventar',
    image: '/manual/stoc.png',
    imageAlt: 'Inventarmodul mit Materiallisten',
    content: `# Lager

Verwaltung von Materialien: Glas, Zubehör (Hardware), Verbrauchsmaterialien. Automatische Abbuchung bei Produktionsbeginn.

## Schritte

1. **Material hinzufügen** – Schaltfläche „Neues Material“ (Code, Typ, Preis, Mindestbestand).
2. **Lagerbestand anpassen** – Schaltfläche pro Zeile für manuelle Zu- und Abgänge.
3. **Lagerbewegungen** – Tab mit dem Verlauf der Transaktionen (Zugänge, Abgänge, Grund).
4. **Monatlicher Verbrauchsbericht** – obere Schaltfläche, Export als CSV/Excel.
5. **Warnungen bei Mindestbestand** – rote KPI „Min. Stock“ auf der oberen Karte.
6. **Standort** – optional, für mehrere Lager.`,
    warnings: [
      'Negativer Lagerbestand ist erlaubt, wird aber rot markiert – der Lagerverwalter muss eine physische Inventur und Anpassung durchführen.',
    ],
  },
  {
    id: 'cutting', category: 'productie', roles: ['all'], order: 3,
    title: 'Zuschnittoptimierung',
    image: '/manual/optimizare-debitare.png',
    imageAlt: 'Zuschnittoptimierungsmodul mit Plattenauswahl',
    content: `# Zuschnittoptimierung

Guillotine-Nesting-Algorithmus für bis zu 50 Bestellungen gleichzeitig – minimiert den Glasverschnitt.

## Schritte

1. **Plattentyp** – wählen Sie aus dem Katalog (z.B. 3210×2250 mm).
2. **Klingenstärke** – standardmäßig 3 mm, einstellbar.
3. **Bestellungen auswählen** – aus der Liste mit Suche und Statusfilter (Sie können „Alle 26 auswählen“).
4. **Optimieren drücken** – der Algorithmus läuft und zeigt die Platten mit den verschachtelten Paneelen an.
5. **SVG visualisieren** – jede Platte mit Maßen, Paneel-Etiketten, farbigem Verschnitt.
6. **DXF/PDF exportieren** – zum Senden an die Schneidemaschine.

## Glasplatten verwalten

![Dialog Platten verwalten mit Standard-Glasmaßen auf der Zuschnitt-Optimierungsseite](/manual/manage-glass-sheets.png)

Standardmaße (2550×3210, 2250×3210, Jumbo 6000×3210) werden beim ersten Aufruf automatisch geladen. Du kannst sie jederzeit bearbeiten, ohne die Zuschnittseite zu verlassen — klicke auf **⚙ Platten verwalten** neben dem *Plattentyp*-Selektor.

1. **Neue Platte hinzufügen** — fülle *Name* (z. B. "Custom 2000×3000"), *Breite (mm)* und *Höhe (mm)* aus und klicke **+ Hinzufügen**.
2. **Aktivieren / Deaktivieren** — der Schalter neben jeder Größe blendet sie aus dem *Plattentyp*-Selektor aus, ohne sie zu löschen (nützlich für saisonale Größen).
3. **Löschen** — der rote Papierkorb entfernt eine Größe endgültig; nur verwenden, wenn sicher.
4. **Dialog schließen** — Änderungen werden sofort übernommen und der *Plattentyp*-Selektor aktualisiert sich automatisch mit den neuen Maßen und der Fläche in m².

> Platten werden pro Firma gespeichert — dein gesamtes Team sieht dieselbe Liste, getrennt von anderen Konten.

## Statistiken

Nutzungsprozent, Verschnittfläche, Anzahl der Platten.`,
    tips: [
      'Begrenzung auf 50 Bestellungen pro Sitzung, um eine angemessene Berechnungszeit zu gewährleisten.',
    ],
  },
  {
    id: 'service', category: 'operational', roles: ['all'], order: 1,
    title: 'Reklamationen & Serviceeinsätze',
    image: '/manual/service.png',
    imageAlt: 'Reklamationsmodul mit Diagrammen und Ticketliste',
    content: `# Reklamationen & Service

Verwaltung von Vorfällen nach der Lieferung: Kundenreklamationen, Werksfehler, geplante Einsätze.

## Schritte

1. **Neue Reklamation** – Schaltfläche oben rechts.
2. **Bestellung zuordnen** – optional, zur Nachverfolgbarkeit.
3. **Priorität** – Niedrig / Mittel / Hoch / Kritisch.
4. **Fehlertyp** – Kundenreklamation, Werksfehler, Transportschaden, Garantie.
5. **Einsatz planen** – wählen Sie Datum und Montageteam.
6. **Ticket schließen** – mit Lösung und Kosten.

## Diagramme

Fehlerhäufigkeit, Prioritätsverteilung, Ticketstatus.`,
  },
  {
    id: 'installation', category: 'operational', roles: ['all'], order: 2,
    title: 'Montage & Teams',
    image: '/manual/montaj.png',
    imageAlt: 'Montagekalender mit den Tabs Teams, Fahrzeuge, Checkliste',
    content: `# Montage

Planung von Montagen, Teams, Fahrzeugen, Checklisten und Routenoptimierung.

## Tabs

1. **Montagekalender** – Monatsansicht mit Drag & Drop.
2. **Montageteams** – Mitglieder hinzufügen, Teams zuweisen.
3. **Checkliste** – Vorlagen, die bei der Erstellung auf jeden Job geklont werden.
4. **Routenoptimierung** – berechnet die optimale Reihenfolge der Montagen des Tages.
5. **Fahrzeuge** – Fuhrpark mit 30-Tage-Warnungen für TÜV und Versicherung.

## Planungsschritte

1. Schaltfläche **„Montage planen“** oben rechts.
2. Wählen Sie Bestellung, Team, Fahrzeug, Datum.
3. Hängen Sie eine Checkliste an (Standard oder benutzerdefiniert).
4. Speichern – erscheint im Kalender.
5. **Verschieben** – schließt den aktuellen Job und füllt einen neuen vor.`,
    tips: [
      'Fahrzeuge mit TÜV/Versicherung, die in weniger als 30 Tagen ablaufen, erhalten eine automatische Warnung.',
    ],
  },
  {
    id: 'settings-company', category: 'setari', roles: ['all'], order: 1,
    title: 'Unternehmenseinstellungen & Branding',
    image: '/manual/setari-companie.png',
    imageAlt: 'Unternehmenseinstellungen – allgemeine Informationen',
    content: `# Einstellungen → Unternehmen

Die Daten, die auf ALLEN generierten Dokumenten erscheinen (Angebote, Bestellungen, Rechnungen, Produktionsaufträge).

## Wesentliche Felder

1. **Firmenname** – erscheint im PDF-Kopf.
2. **CUI / CIF** – mit dem Präfix RO für Rumänien.
3. **Vollständige Adresse** – Straße, Nr., Stadt, Landkreis, Postleitzahl.
4. **Telefon und E-Mail** – für Kontakt auf Dokumenten.
5. **Bankkonto und BIC/SWIFT** – für Rechnungen.
6. **Firmenlogo** – PNG/JPG/WebP/SVG, max. 2 MB.

## PDF-Anpassung

- **Logo-Größe** und **Position** – für Angebote und Rechnungen.
- **Benutzerdefinierte Texte** – Bedingungen, Konditionen, Fußzeile (Rich-Text über Tiptap).
- **EUR/RON-Wechselkurs** – für die globale Umrechnung verwendet.

## White-Label

Abonnenten können die PDFs vollständig mit eigenem Logo und HTML-Texten anpassen.`,
    tips: [
      'Das ideale Logo ist ein transparentes PNG, im Verhältnis 3:1 oder quadratisch, min. 400×400 px für Druckqualität.',
    ],
  },
  {
    id: 'settings-pricing', category: 'setari', roles: ['all'], order: 2,
    title: 'Preiseinstellungen & Katalog',
    content: `# Einstellungen → Preise

Ihre lokale Preisliste: Materialien, Zubehör, Kits, Oberflächen.

## Schritte

1. **Tab Materialien** – gruppiertes Glas, Profile, Zubehör.
2. **Suchen** – übergreifende Suche über Kategorien.
3. **Preis bearbeiten** – auf Zelle klicken, automatische Speicherung.
4. **Auf System zurücksetzen** – Schaltfläche, um die Überschreibung aufzugeben und zum Basispreis zurückzukehren.
5. **Private Varianten** – fügen Sie eigene Materialien mit einem eindeutigen Code pro Unternehmen hinzu.
6. **Import / Export** – Excel + ZIP für Bilder, automatische Zuordnung zu den Systemkategorien.

## Preishierarchie

Unternehmen (eigene Überschreibung) > Globaler Benutzer > System (Standardkatalog).`,
    tips: [
      'Die Überschreibungen des Unternehmens sind für andere Unternehmen nicht sichtbar – streng durch RLS isoliert.',
      'Materialbilder haben Cache-Busting mit Zeitstempel, um die neue Version sofort zu sehen.',
    ],
    warnings: [
      'Das Zurücksetzen eines Preises löscht die Überschreibung und kann nicht rückgängig gemacht werden – überprüfen Sie es vorher.',
    ],
  },
  {
    id: 'settings-team', category: 'setari', roles: ['all'], order: 3,
    title: 'Teameinstellungen & Berechtigungen',
    content: `# Einstellungen → Team

Laden Sie Teammitglieder ein und verwalten Sie die Berechtigungen für Module.

## Schritte

1. **Mitglied einladen** – per E-Mail; erhält einen Registrierungslink.
2. **Rolle** – Abonnent (Verkauf), Produktion, Montage, Unternehmens-Admin.
3. **Erlaubte Module** – kreuzen Sie den Zugriff an: Bestellungen, Produktion, Lager, Fakturierung, Service usw.
4. **Aktivieren/Deaktivieren** – behält den Verlauf bei, sperrt nur den Login.
5. **Admin übertragen** – mit einem Klick an ein anderes Mitglied.
6. **Nachverfolgbarkeit** – alle Aktionen werden mit \`created_by\` protokolliert.

## Zugangsstufen

- **Basic (60)** – Bestellungen + 1-2 Konfiguratoren.
- **Plus (100)** – Alle Konfiguratoren + Lager.
- **Operational (150)** – Alles, einschließlich Service, Montage, Optimierung.

## Abrechnung

Das Abonnement ist mit dem **Unternehmensinhaber** verknüpft – Mitarbeiter sind kostenlos.`,
    tips: [
      'Verwaistes Konto reparieren (Admin) – Benutzer ohne Unternehmen können manuell zugewiesen werden.',
    ],
  },
  {
    id: 'pricing-client-types', category: 'setari', roles: ['all'], order: 9,
    title: 'Aufschlag nach Kundentyp (Privatperson / Firma / Händler)',
    image: '/manual/setari-adaos-tip-client.png',
    imageAlt: 'Einstellungen → Kundenaufschläge — Privatperson, Firma, Händler',
    content: `# Prozentualer Aufschlag pro Kundentyp

Unter **Einstellungen → Kundenaufschläge** können Sie **3 differenzierte Preislisten** definieren, die vom selben Katalog ausgehen, ohne Artikel zu duplizieren.

## Die 3 Typen

- **Privatperson** – Endkunden (Einzelhandel). Typischerweise setzen Sie hier einen positiven Aufschlag (z.B. +10% … +20%), da sie keinen Handelsrabatt erhalten.
- **Firma** – Unternehmen und Partnerfirmen. Normalerweise wird hier **0%** (Basispreis) belassen.
- **Händler** – Wiederverkaufspartner. Hier setzen Sie in der Regel einen **negativen Wert** (z.B. −10% … −25%), um ihnen einen Vorzugspreis zu bieten.

## Wie es funktioniert

- Der Prozentsatz wird **automatisch** auf den Basispreis jedes Artikels im Angebot (Glas, Zubehör, Arbeitsleistung, Kits) angewendet.
- **Positive** Werte = Aufschlag auf den Standardpreis. **Negative** Werte = Rabatt.
- Das Feld akzeptiert Werte zwischen **−100% und +500%**, in Schritten von 0,5%.
- Die Änderungen werden aktiv, nachdem Sie auf **„Aufschläge speichern“** (Schaltfläche unten rechts) klicken. Die Karte hebt die geänderten Zeilen mit dem Badge „geändert“ hervor.

## Wo es angewendet wird

In jedem **3D-Konfigurator**, in der Karte **Kundeninformationen**, gibt es den Selektor **Kundentyp** (Privatperson / Firma / Händler). Wenn Sie ihn ändern:

1. Der Konfigurator erkennt den gewählten Typ.
2. Wendet automatisch den hier eingestellten Prozentsatz auf die Zwischensumme an.
3. Der im Angebot (und später im PDF) angezeigte Preis spiegelt bereits den neuen Typ wider.

## Was es nützt

- **Eine einzige Katalogliste**, aber unterschiedliche Preise pro Kundenkategorie – ohne manuelle Duplizierung von Artikeln.
- Sie können **Händlern schnell einen Rabatt gewähren**, ohne die Basiskataloge zu ändern.
- Privatpersonen können mit einem Standard-Handelsaufschlag fakturiert werden, ohne manuelle Berechnungen in jedem Angebot.
- Änderungen gelten **nur für neue Angebote rückwirkend** – bereits gespeicherte Bestellungen behalten ihre ursprünglichen Preise (\`full_config\` ist die Quelle der Wahrheit).`,
    tips: [
      'Sie können negative Werte (z.B. −15%) setzen, um einer Kategorie einen permanenten Rabatt zu gewähren, ohne den Katalog anzufassen.',
      'Wenn Sie Zweifel haben, beginnen Sie mit Firma = 0% (Referenzpreis) und passen Sie die beiden anderen relativ dazu an.',
      'Der Kundentyp-Selektor im Konfigurator wird im Angebot gespeichert, sodass ein erneut geöffnetes Angebot den ursprünglich gewählten Typ beibehält.',
    ],
    warnings: [
      'Die Änderung des Prozentsatzes betrifft nur neue Angebote. Bestehende Bestellungen müssen neu bearbeitet werden, wenn Sie sie neu berechnen möchten.',
    ],
  },
  {
    id: 'pricing-overview', category: 'setari', roles: ['all'], order: 10,
    title: 'Preise – Übersicht',
    image: '/manual/setari-preturi.png',
    imageAlt: 'Einstellungen → Preise — Kategorienliste',
    content: `# Einstellungen → Preise

Hier steuern Sie **alle Preise**, die in den 3D-Konfiguratoren, Angeboten und PDFs verwendet werden.

## Verfügbare Kategorien

- **Zubehör** – Scharniere, Griffe, Stangen, Rollen, Stopper, Dichtungen, Verbinder
- **Glas** – nach Dicke und Typ (klar, matt, rauchfarben, Spiegel)
- **Arbeitsleistung** – Montage, Zuschnitt, Polieren, Bohren, Ausschnitt
- **Profile** – U, Wand, Ecke 90°, Schiebeprofile
- **Kits** – Gruppen von Zubehörteilen, die als eine einzige Position verkauft werden
- **Schiebemechanismen** – komplette Systeme (mit Profil + Rollen + Stopper)

## Globaler Katalog vs. persönliche Überschreibung

- Der **globale Katalog** (vom Admin verwaltet) ist der Ausgangspunkt – Sie sehen ihn automatisch.
- Wenn Sie einen Preis oder einen Abzug ändern, wird eine **persönliche Überschreibung** in Ihrem Bereich (\`pricing_config\`) gespeichert. Der globale Katalog bleibt unberührt.
- Sie können die Überschreibung jederzeit mit der Schaltfläche **„Auf Katalogwert zurücksetzen“** zurücksetzen (siehe entsprechender Abschnitt).

## Währung

Die Preise werden intern in **RON** gespeichert. Der Schalter **RON / EUR** in der oberen Leiste konvertiert nur die Anzeige – es findet keine Umrechnung in der Datenbank statt.`,
    tips: [
      'Der Suchfilter funktioniert über alle Kategorien gleichzeitig (Code, Bezeichnung, Oberfläche).',
      'Wenn Sie einen Artikel nicht sehen, überprüfen Sie, ob Sie ihn im Zeilenmenü deaktiviert haben (durchgestrichene Glocke).',
    ],
  },
  {
    id: 'pricing-add-accessory', category: 'setari', roles: ['all'], order: 11,
    title: 'Neues Zubehörteil hinzufügen',
    image: '/manual/setari-adauga-accesoriu.png',
    imageAlt: 'Dialog \'Element hinzufügen\' — Zubehörteil',
    content: `# Wie man ein neues Zubehörteil hinzufügt

1. Gehen Sie zu **Einstellungen → Preise** und wählen Sie den Tab **Zubehör**.
2. Drücken Sie **„Element hinzufügen“** (oben rechts).
3. Füllen Sie aus:
   - **Code** – eindeutig; wird für die Deduplizierung, das Scannen von Barcodes und die Aggregation im PDF verwendet.
   - **Bezeichnung** – wird im Konfigurator und im PDF angezeigt.
   - **Kategorie / Typ** – Scharnier, Griff, Stabilisierungsstange, Rollen, Stopper, Dichtung usw.
   - **Preis** – in der aktiven Währung (wird in RON gespeichert).
   - **ME** – \`pcs\` für Stücke, \`ml\` für laufende Meter, \`m²\` für Fläche, \`kg\` für Gewicht.
   - **Oberfläche & Farbe** – wählen Sie aus Voreinstellungen oder geben Sie einen benutzerdefinierten Hex-Code ein; wird auch im 3D-Rendering verwendet.
   - **Bild** – wird im Speicher hochgeladen; erscheint im Zubehör-Selektor und im PDF.
4. Markieren Sie die **„Produkttypen“**, bei denen das Zubehör erscheint (Dusche, Tür, Geländer, Spiegel, Paneele, Küchenrückwand).
5. Markieren Sie die kompatiblen **„Bearbeitungstypen“** (laminiert, vorgespannt, matt).
6. **Speichern** – das Zubehörteil wird sofort in den markierten Konfiguratoren verfügbar.`,
    tips: [
      'Für andere MEs als \'pcs\' können Sie Dezimalzahlen verwenden (z.B. 2.5 ml).',
      'Wenn Sie kein Bild festlegen, wird es automatisch von der übergeordneten Kategorie geerbt.',
    ],
    warnings: [
      'Der Code muss eindeutig sein. Wenn er bereits existiert, aktualisiert das System den vorhandenen Artikel, anstatt einen neuen zu erstellen.',
    ],
  },
  {
    id: 'pricing-edit-fields', category: 'setari', roles: ['all'], order: 12,
    title: 'Element bearbeiten – erweiterte Felder',
    image: '/manual/setari-editare-element.png',
    imageAlt: 'Dialog \'Element bearbeiten\' mit Glasabzügen',
    content: `# Element bearbeiten – Feld für Feld

Klicken Sie auf den Stift in der Zeile (oder doppelklicken Sie), um **Element bearbeiten** zu öffnen. Neben Preis und ME haben Sie diese technischen Felder:

## Preis & ME

- Der Preis wird in der aktiven Währung im Header (RON oder EUR) eingegeben und intern in RON gespeichert.
- Die ME bestimmt, wie der Preis im Konfigurator multipliziert wird: \`pcs\` × Menge, \`ml\` × Länge, \`m²\` × Fläche.

## Oberfläche & Farbe

- **Hex-Farbe** + **Rauheit** werden sowohl in der Preisliste als auch im 3D-Rendering verwendet – synchronisiert durch \`MetalMaterial\`.
- Wenn Sie das Feld leer lassen, wird es vom übergeordneten Element geerbt (z.B. erbt eine Profilvariante die Farbe des Basisprofils).

## Glasabzug pro Seite (\`glass_deduction\`)

Wie viele **mm** das Profil auf jeder Seite, auf der es montiert ist, in das Glas eindringt. Der Konfigurator zieht diesen Wert automatisch von der Bruttoabmessung ab, um das tatsächlich zu schneidende Glas zu erhalten.

> Beispiel: 8-mm-U-Profil auf 8-mm-Verbundglas → \`8 + 0.38 + 8 = 16.38 mm\` Gesamtabzug (Profile + Folie + Profile, kumulativ).

## Detaillierte Abzüge pro Seite (\`glass_deductions\`)

JSON mit separaten \`top\`, \`bottom\`, \`left\`, \`right\`. Wird verwendet, wenn das Profil an jeder Kante unterschiedliche Werte hat (z.B. tiefes Bodenprofil + dünnes Wandprofil). **Kumuliert sich** mit den Dichtungen.

- **\`profile_height\`** (im selben JSON) – überschreibt die Summe von \`top + bottom\` für das U-Profil, wenn Sie einen einzigen Gesamtwert wünschen.

## Überlappung (\`width_overlap\`)

Wie viele mm die Schiebepaneele das andere Paneel oder die Wand **überlappen**. Das System zieht diesen Wert von der **nutzbaren Breite** des Schiebe-Kits ab.

> Beispiel: 1200 mm Schiebe-Kit mit 40 mm Überlappung → effektive nutzbare Breite 1160 mm.

## Abzug für Türhöhe (\`door_height_deduction\`)

mm, die von der Gesamthöhe für die **Tür mit Scharnieren** abgezogen werden (Platz für oberes Scharnier + untere Schwelle). Typischerweise 5–20 mm je nach Scharnier.

## Abzug für Festteilhöhe (\`fixed_panel_height_deduction\`)

Identisch, aber für das Festteil. **Standardmäßig 0** – das Festteil hat keinen automatischen Abzug von 10 mm.

## Produkt- / Bearbeitungstypen

Markieren Sie, wo das Zubehör erscheint (Dusche, Tür, Geländer...) und welche Bearbeitungen es unterstützt (laminiert, vorgespannt). Nicht markiert = erscheint nicht im entsprechenden Konfigurator.`,
    tips: [
      'Abzüge sind **kumulativ**: Profil + Dichtung + Verbundfolie werden auf derselben Seite addiert.',
      'Scharniere werden von **oben nach unten** gemessen, der Griff von **unten nach oben** – dies ist eine Konvention, die in allen Konfiguratoren beibehalten wird.',
      'Das Schiebesystem **verwendet keine Scharniere** – das Feld für die Scharniermenge bleibt automatisch auf 0.',
    ],
    warnings: [
      'Jede Änderung der Abzüge wirkt sich sofort auf **alle zukünftigen 3D-Berechnungen** aus, einschließlich unbestätigter Angebote. Bereits gespeicherte Bestellungen haben ihre Daten in `full_config` eingefroren und ändern sich nicht.',
    ],
  },
  {
    id: 'pricing-add-glass', category: 'setari', roles: ['all'], order: 13,
    title: 'Neuen Glastyp hinzufügen',
    image: '/manual/setari-sticla.png',
    imageAlt: 'Einstellungen → Preise → Glas',
    content: `# Glas

1. Tab **Glas** → **„Element hinzufügen“**.
2. Wählen Sie die **Dicke**: 4 / 6 / 8 / 10 / 12 mm.
3. Wählen Sie den **Typ**: klar, rauchfarben, matt (sandgestrahlt), Spiegel, bronze, grau.
4. Legen Sie den **Preis / m²** fest (in der aktiven Währung).
5. Markieren Sie die für dieses Glas verfügbaren **Bearbeitungen**: vorgespannt, laminiert, poliert, matt.

## Vorspannen

Für das Vorspannen wird der Preis nach der Formel berechnet:

\`\`\`text
Preis_Vorspannen = Preis_Vorspannen_Basis × Dicke_mm × Fläche_m²
\`\`\`

Sie legen einen einzigen Basispreis fest; das System wendet die Formel automatisch je nach Dicke und Fläche des Glases an.

## Laminiert

Bei Verbundglas kumulieren sich die Abzüge an den Seiten mit der **Dicke der Folie** (standardmäßig 0.38 mm) an jeder Kante. Siehe Beispiel im Abschnitt „Element bearbeiten“.`,
    tips: [
      'Mattes (sandgestrahltes) Glas hat normalerweise einen prozentualen Aufschlag gegenüber klarem Glas – Sie konfigurieren diesen als Multiplikator im Bearbeitungsfeld.',
    ],
  },
  {
    id: 'pricing-add-labor', category: 'setari', roles: ['all'], order: 14,
    title: 'Arbeitsleistung hinzufügen',
    image: '/manual/setari-manopera.png',
    imageAlt: 'Einstellungen → Preise → Arbeitsleistung',
    content: `# Arbeitsleistung

1. Tab **Arbeitsleistung** → **„Element hinzufügen“**.
2. Wählen Sie den **Typ**: Montage, Zuschnitt, Kanten polieren, Bohren, Ausschnitt, Transport.
3. Legen Sie die **ME** fest:
   - \`Stunde\` – für Montage
   - \`lfm\` – für Kanten polieren
   - \`Stk\` – für Bohrungen, Ausschnitte
   - \`m²\` – für Flächenbearbeitung
4. **Preis** pro Einheit.
5. **Prozentsatz vs. Festwert** – markieren, ob es sich um einen Multiplikator (z.B. 15% über dem Glaswert) oder einen festen Betrag handelt.
6. Weisen Sie den **Produkttypen** zu, wo es automatisch angewendet wird.`,
    tips: [
      'Die prozentuale Arbeitsleistung wird vom EUR/RON-Schalter nicht beeinflusst – sie bleibt in jeder Währung gleich.',
    ],
  },
  {
    id: 'pricing-add-kit', category: 'setari', roles: ['all'], order: 15,
    title: 'Zubehör-Kits',
    image: '/manual/setari-kituri.png',
    imageAlt: 'Einstellungen → Kits',
    content: `# Kits

Ein **Kit** ist eine Gruppe von Zubehörteilen, die als eine einzige Position verkauft wird. Nützlich für Schiebesysteme bei Duschen: Das Kit enthält Profil, Rollen, Stopper, Führung.

## Kit erstellen

1. Gehen Sie zu **Einstellungen → Kits** (oder der Tab Kits in den Preisen).
2. **„Kit hinzufügen“** → Code, Bezeichnung, **Kit-Preis** (Endpreis), abgedeckte **nutzbare Breite**.
3. Fügen Sie **Komponenten** hinzu – wählen Sie aus der Zubehörliste und geben Sie die Menge ein.
4. Die Komponenten werden **nach Code dedupliziert** – wenn derselbe Code zweimal erscheint, werden die Mengen summiert.

## Verwendung im Konfigurator

Im Konfigurator für **Schiebeduschen** wählen Sie das Kit aus dem Dropdown. Das System berechnet:

\`\`\`text
Effektive nutzbare Breite = Kit_Breite - width_overlap
\`\`\`

und wendet automatisch **0 Scharniere** an (das Schiebesystem hat keine Scharniere).`,
    tips: [
      'Die Preise der Komponenten sind informativ – der **Kit-Preis hat im Angebot Vorrang**.',
      'Das Bild des Kits erscheint im PDF; wenn es fehlt, wird das Bild des Hauptprofils verwendet.',
    ],
  },
  {
    id: 'pricing-reset', category: 'setari', roles: ['all'], order: 16,
    title: 'Auf Katalogwert zurücksetzen',
    image: '/manual/setari-reset.png',
    imageAlt: 'Schaltfläche \'Auf Katalogwert zurücksetzen\'',
    content: `# Persönliche Überschreibung zurücksetzen

Wenn Sie einen Preis oder einen Abzug geändert haben und zum **Standardwert aus dem globalen Katalog** zurückkehren möchten:

1. Öffnen Sie **Element bearbeiten**.
2. Drücken Sie **„Auf Katalogwert zurücksetzen“** (unten links im Dialog).
3. Ihre Überschreibung aus \`pricing_config\` wird gelöscht und der Artikel zeigt wieder den Wert des Admins an.

> Das Zurücksetzen betrifft **nur den jeweiligen Artikel**. Ihre restlichen Überschreibungen bleiben intakt.`,
    warnings: [
      'Die Aktion ist sofort und kann nicht rückgängig gemacht werden. Wenn Sie einen Verlauf benötigen, exportieren Sie die Preise (Einstellungen → Daten exportieren), bevor Sie zurücksetzen.',
    ],
  },

  // ====== New sections — for subscribers ======
// ====== Secțiuni noi — pentru abonați ======
  {
    id: 'dashboard-home', category: 'introducere', roles: ['all'], order: 0,
    title: 'Haupt-Dashboard',
    image: '/manual/dashboard-home.png',
    imageAlt: 'Haupt-Dashboard',
    content: `# Haupt-Dashboard

Nach der Anmeldung gelangen Sie auf die **Startseite (\`/\`)** – ein Kontrollpanel mit den wichtigsten Kennzahlen Ihres Unternehmens, die in Echtzeit aktualisiert werden.

## Was Sie sehen

- **KPIs oben**: Umsatz, Aufträge in Bearbeitung, in diesem Monat gelieferte Aufträge, durchschnittlicher Auftragswert.
- **Umsatzdiagramm** für die letzten 12 Monate (Balken, mit Vorjahresvergleich).
- **Einnahmendiagramm** nach Produktkategorien (Dusche, Türen, Geländer, Spiegel, Küche, Paneele).
- **Top-Produkte**, die im ausgewählten Zeitraum verkauft wurden.
- **Kritischer Lagerbestand** – Materialien mit einer Menge unter dem konfigurierten Mindestschwellenwert.
- **Neueste Aufträge** – die letzten 10 Aufträge mit Status und Kunde, mit direktem Klick auf den Auftrag.

## Filter

Der Schalter **RON / EUR** in der oberen Leiste beeinflusst alle hier angezeigten Werte (dynamische Umrechnung, ohne MwSt.).
`,
    tips: [
      'Das Dashboard wird bei jeder Änderung der Währung oder Sprache automatisch neu geladen.',
      'Für eine betriebliche Übersicht (Produktion, Montage, Service) verwenden Sie das Menü *Betriebs-Dashboard*.',
    ],
  },
  {
    id: 'announcements', category: 'introducere', roles: ['all'], order: 3,
    title: 'Ankündigungen und Benachrichtigungen',
    image: '/manual/announcements.png',
    imageAlt: 'Ankündigungen und Benachrichtigungen',
    content: `# Ankündigungen und Benachrichtigungen

Das 🔔 **gelbe Glockensymbol** in der oberen Leiste zeigt die vom iSoftGlass-Team veröffentlichten Ankündigungen an: Updates, neue Funktionen, geplante Wartungsarbeiten.

## Wie es funktioniert

- Die rote Zahl auf der Glocke = **ungelesene** Ankündigungen.
- Ein Klick auf die Glocke öffnet die Liste – jede Ankündigung hat einen Titel, eine Kategorie (**Update** oder **Info**), ein Datum und den vollständigen Inhalt.
- Ankündigungen werden automatisch als gelesen markiert, wenn Sie sie öffnen.
- Wichtige Ankündigungen vom Typ **Update** erscheinen bei der Veröffentlichung einer neuen Version auch als **Benachrichtigung am oberen Rand der Seite**.

## Kategorien

- **Update** – neue Version, hinzugefügte Funktionen, Korrekturen.
- **Info** – allgemeine Informationen, Tipps, Ereignisse.

Die Ankündigungen werden automatisch in die Sprache Ihrer Benutzeroberfläche übersetzt.
`,
    tips: [
      'Überprüfen Sie regelmäßig die Ankündigungen, um über neue Funktionen zu erfahren, die Ihnen Zeit sparen können.',
    ],
  },
  {
    id: 'currency-language', category: 'introducere', roles: ['all'], order: 4,
    title: 'Währung und Sprache',
    image: '/manual/currency-language.png',
    imageAlt: 'Währung und Sprache',
    content: `# Währung und Sprache

## Schalter RON / EUR

Die Schaltfläche **RON / EUR** in der oberen Leiste ändert die in der gesamten Anwendung angezeigte Währung – 3D-Kalkulatoren, Angebote, Aufträge, Berichte, Dashboard.

- Die **interne Speicherung** erfolgt **immer in RON**. EUR ist nur eine Anzeige, die dynamisch zum in *Einstellungen → Unternehmen* festgelegten Wechselkurs berechnet wird.
- **Alle Werte sind ohne MwSt.** in den internen Berechnungen; die MwSt. wird nur bei der Rechnungserstellung angewendet.
- Sie können Werte in EUR eingeben – sie werden beim Speichern automatisch in RON umgerechnet.

## Sprachauswahl

Die Schaltfläche **🇷🇴 RO** öffnet die Liste mit den **9 verfügbaren Sprachen**: Română, English, Italiano, Deutsch, Polski, Français, Español, Nederlands, Hrvatski.

- Die Sprachänderung betrifft **nur die Benutzeroberfläche** (Menüs, Schaltflächen, Beschriftungen, Handbuch).
- Die von Ihnen eingegebenen Daten (Kundennamen, Beschreibungen, Notizen) bleiben in der Originalsprache erhalten.
- Die Einstellung wird für Ihr Konto zwischen den Sitzungen gespeichert.
`,
    tips: [
      'Der EUR-Wechselkurs wird nur aktualisiert, wenn Sie ihn manuell unter Einstellungen → Unternehmen ändern.',
      'Das Benutzerhandbuch ist vollständig in alle 9 Sprachen übersetzt.',
    ],
  },
  {
    id: 'working-in-eur', category: 'introducere', roles: ['all'], order: 5,
    title: 'Ausschließlich in EUR arbeiten (empfohlen für Nicht-RO-Abonnenten)',
    image: '/manual/working-in-eur.png',
    imageAlt: 'Einstellungen → Preise — EUR-Kurs',
    content: `# Ausschließlich in EUR arbeiten

Diese Anleitung richtet sich an Abonnenten, die **zu 100% in EUR** arbeiten — sie kaufen von Lieferanten in EUR und verkaufen an Kunden in EUR, ohne RON im Katalog zu mischen.

## So funktioniert die interne Speicherung

- Alle Preise werden in der Datenbank als eine einzige Zahl gespeichert.
- Die interne technische Bezeichnung ist „RON", aber sie ist für Sie **irrelevant** — Sie sehen sie nirgendwo in der Oberfläche.
- Der **EUR**-Schalter in der oberen Leiste führt eine Anzeigeumrechnung mit dem in *Einstellungen → Preise* festgelegten Kurs durch.

## Das Problem, das Sie vermeiden

Wenn Sie den Standardkurs beibehalten (z. B. \`EUR-Kurs = 4,97\`) und ein Scharnier zu **100 EUR** eingeben, speichert das System intern \`497\`. Morgen, wenn sich der Kurs auf \`5,02\` ändert, erscheint dasselbe Produkt als **99,00 EUR** im Katalog — ohne dass Sie etwas geändert haben.

Dieses „Drift" ist mathematisch korrekt, sorgt aber für Verwirrung und wirkt wie ein Fehler.

## Empfohlene Konfiguration — 3 Schritte

1. **Einstellungen → Preise** → setzen Sie **EUR-Kurs = 1**.
2. Wählen Sie in der oberen Leiste **EUR** als aktive Währung.
3. Geben Sie alle Preise direkt in EUR in *Einstellungen → Preise* ein (und in neuen Aufträgen).

## Was Sie gewinnen

- Preise bleiben **absolut stabil** — 100 EUR heute = 100 EUR in einem Jahr.
- Keine Umrechnung beim Speichern, **kein Drift**.
- Angebots-PDFs, Aufträge und Berichte erscheinen natürlich in EUR.
- Historische Aufträge bewegen sich nicht mehr im Laufe der Zeit.

## Was sich NICHT ändert

- Die interne „RON"-Bezeichnung bleibt in der Datenbank (in der Oberfläche unsichtbar).
- Die gesamte App-Logik funktioniert identisch — keine Funktionalität geht verloren.

## Einschränkungen — wann diese Konfiguration NICHT verwenden

- Wenn Sie **Lieferanten in RON** und Kunden in EUR haben (gemischter Fluss) → benötigen Sie den echten Wechselkurs.
- Wenn Sie in einer anderen Währung arbeiten (PLN, HRK usw.) → kontaktieren Sie das iSoftGlass-Team für eine Erweiterung.
`,
    tips: [
      'EUR-Kurs = 1 zu setzen wirkt sich nur auf die Anzeigeumrechnung aus — es ändert keinen bereits gespeicherten Wert.',
      'Es wird empfohlen, diese Konfiguration vorzunehmen, bevor die ersten Preise im Katalog eingegeben werden.',
    ],
  },
  {
    id: 'production-scanner', category: 'productie', roles: ['all'], order: 2,
    title: 'Produktionsscanner (Barcodes)',
    image: '/manual/production-scanner.png',
    imageAlt: 'Produktionsscanner (Barcodes)',
    content: `# Produktionsscanner

Die Seite **Produktion → Scanner** (\`/productie/scanner\`) ermöglicht es Ihnen, Aufträge schnell zwischen den Kanban-Phasen zu bewegen, indem Sie einen als HID-Tastatur angeschlossenen **CODE128-Barcodescanner** verwenden.

## Wie es funktioniert

1. Öffnen Sie die **Scanner**-Seite. Das Eingabefeld hat permanenten Autofokus.
2. **Scannen Sie den Barcode** vom Produktionsblatt oder vom Produktetikett.
3. Die Anwendung identifiziert automatisch den Auftrag und **verschiebt ihn in die nächste Kanban-Phase** (z. B. *Zuschnitt* → *Schleifen*, *Schleifen* → *Härten*).
4. Die Bestätigung erscheint auf dem Bildschirm mit einem Ton und grüner Farbe; ein Fehler (unbekannter Code) mit roter Farbe.

## Anforderungen

- CODE128-Scanner, konfiguriert als **HID-Tastatur** (Standardmodus, ohne Treiber).
- Suffix **Enter (\\r)** nach jedem Scan (Standardeinstellung bei den meisten Modellen).

## Vorteile

- Der Bediener muss Aufträge nicht mehr manuell im Kanban suchen.
- Vollständige Rückverfolgbarkeit: Die Zeit jeder Phase wird automatisch gespeichert.
- Funktioniert auch auf einem Tablet mit einem Bluetooth-Scanner.
`,
    tips: [
      'Wenn das Eingabefeld den Fokus verliert (weil Sie woanders hingeklickt haben), wird er durch einfaches Scannen automatisch wiederhergestellt.',
      'Das Feld ignoriert manuelle Eingaben, die langsamer als 50 ms sind – nur der Scanner löst den Fortschritt aus.',
    ],
    warnings: [
      'Das Scannen eines Codes, der sich bereits in der letzten Phase befindet, hat keine Auswirkung – der Auftrag bleibt dort.',
    ],
  },
  {
    id: 'processing-cad', category: 'productie', roles: ['all'], order: 3,
    title: 'Bearbeitungen und CAD-Editor',
    image: '/manual/processing-cad.png',
    imageAlt: 'Bearbeitungen und CAD-Editor',
    content: `# Bearbeitungen und CAD-Editor

Die Seite **Bearbeitungen** (\`/prelucrari\`) ist die technische Werkstatt für Produktionsblätter: Bohrungen, Scharniere, Griffe, Ausschnitte, Kantenbearbeitungen – alles visualisiert auf dem Glas in einem interaktiven CAD-Editor.

## Bearbeitungsblatt

- Vollständige Liste der Paneele im Auftrag (mit Abmessungen und Glastyp).
- Für jedes Paneel: die Liste der Bearbeitungen (Vorlagencode + Parameter: Abstand, Durchmesser, Offset).
- Viele Bearbeitungen werden **automatisch** aus der 3D-Konfiguration übernommen (Scharniere, Griffe, Schlösser) – Sie bearbeiten nur die Ausnahmen.

## CAD-Editor — Tastenkürzel

| Taste | Aktion |
|---|---|
| **J** | JOIN – verbindet zwei nahe beieinander liegende Bearbeitungen (Toleranz 10 mm) |
| **Strg + D** | Dupliziert die ausgewählte Bearbeitung |
| **Strg + Umschalt + D** | Dupliziert **alle** Bearbeitungen auf ein anderes Paneel (automatische Spiegelung auf der X-Achse) |
| **Entf** | Löscht die ausgewählte Bearbeitung |
| **Linksklick + Ziehen** | Verschiebt die Bearbeitung |
| **Mausrad** | Zoom |

## Vorlagen

Der Katalog der **Bearbeitungsvorlagen** (Kategorien: **30. Scharniere & Ausschnitte**, **51. Bohrungen für Griffe**) synchronisiert sich automatisch mit den in 3D ausgewählten Zubehörteilen. Das Hinzufügen eines neuen Scharniers zum Katalog erzeugt den korrekten Ausschnitt auf dem Glas.

## Export

- **DXF** (R9 → R2010) – für industrielle CNC-Maschinen, mit Layer-Mapping.
- **PDF** – für die Werkstatt, mit Bemaßungen und Bearbeitungslegende.
- Die Schaltfläche **„An CNC senden“** generiert eine kombinierte DXF-Datei + Schnittliste.
`,
    tips: [
      'Der Positionierungsschritt beträgt 0,5 mm; verwenden Sie das Komma für Dezimalstellen.',
      'Nicht ausgewählte Elemente werden schwarz angezeigt – wählen Sie sie aus, um Maße und Parameter zu sehen.',
    ],
    warnings: [
      'Änderungen am Paneel werden nur gespeichert, wenn Sie auf **Bearbeitung speichern** klicken – ein Seitenwechsel ohne Speichern verwirft sie.',
    ],
  },
  {
    id: 'operational-dashboard', category: 'operational', roles: ['all'], order: 0,
    title: 'Betriebs-Dashboard',
    image: '/manual/operational-dashboard.png',
    imageAlt: 'Betriebs-Dashboard',
    content: `# Betriebs-Dashboard

Die Seite **Betriebs-Dashboard** (\`/operational\`) ist das zentrale Panel für Werkstatt und Logistik: Sehen Sie in Echtzeit, was in Produktion, Montage, Service und Zuschnitt geschieht.

## Zusammenfassende Karten

- **Produktion**: Anzahl der Aufträge in jeder Kanban-Phase (Zuschnitt, Schleifen, Härten, Montage, Verpackung).
- **Montage**: für heute / diese Woche geplante Arbeiten, Verzögerungen.
- **Service**: offene Einsätze, Priorität, SLA.
- **Zuschnitt**: Paneele in der Optimierungswarteschlange, zugewiesenes Glas pro Platte.

## Automatische Aktualisierung

Die Seite wird **alle 60 Sekunden automatisch aktualisiert** – Sie können sie dauerhaft auf einem TV-Bildschirm in der Werkstatt anzeigen lassen.

## Schnelle Aktionen

- Ein Klick auf eine beliebige Karte führt Sie direkt zur Detailseite (Produktions-Kanban, Montageliste usw.).
- Die Schaltfläche **„Jetzt aktualisieren“** erzwingt eine sofortige Aktualisierung.
`,
    tips: [
      'Verwenden Sie diese Seite auf einem großen Bildschirm in der Werkstatt, um die Sichtbarkeit für das gesamte Team zu gewährleisten.',
      'Für Finanzkennzahlen (Umsatz, Margen) verwenden Sie das Haupt-Dashboard.',
    ],
  },
  {
    id: 'reports', category: 'operational', roles: ['all'], order: 3,
    title: 'Berichte',
    image: '/manual/reports.png',
    imageAlt: 'Berichte',
    content: `# Berichte

Die Seite **Berichte** (\`/rapoarte\`) bietet Ihnen vollständige Transparenz über Verkäufe und Materialverbrauch.

## Verfügbare Berichte

1. **Monatliche Verkäufe** – monatlicher Umsatz, aufgeschlüsselt nach Kategorien (Dusche, Türen, Geländer etc.) und nach Vertriebsmitarbeiter.
2. **Materialverbrauch** – die Mengen an Glas, Profilen und Zubehör, die in einem Zeitraum verbraucht wurden, aggregiert nach Produktcode.
3. **Top-Kunden** – Rangliste nach Auftragswert im ausgewählten Zeitraum.
4. **Margen** – Differenz zwischen Produktionskosten und Verkaufspreis, pro Auftrag.

## Filter

- **Datumsbereich** (Kalender von / bis).
- **Produktkategorie**.
- **Mitarbeiter** (Verkäufer).
- **Auftragsstatus** (Angebot, bestätigt, in Produktion, geliefert).

## Export

Alle Berichte werden als **CSV** mit **UTF-8 BOM** exportiert (Excel öffnet deutsche Umlaute korrekt).

Die Werte berücksichtigen den globalen Schalter **RON / EUR**.
`,
    tips: [
      'Für die externe Analyse in Excel verwenden Sie den CSV-Export – das BOM stellt sicher, dass Umlaute korrekt angezeigt werden.',
      'Die Filter bleiben für Ihr Konto zwischen den Sitzungen erhalten.',
    ],
  },
  {
    id: 'installation-reports', category: 'operational', roles: ['all'], order: 4,
    title: 'Montageberichte',
    image: '/manual/installation-reports.png',
    imageAlt: 'Montageberichte',
    content: `# Montageberichte

Die Seite **Montageberichte** (\`/rapoarte-montaj\`) überwacht die Leistung der Montageteams und optimiert die Planung.

## Was Sie sehen

- **Leistung pro Team**: Anzahl der abgeschlossenen Montagen, durchschnittliche Zeit pro Auftrag, zurückgelegte Strecke.
- **Karte mit optimierten Routen** – das System schlägt für jedes Team die optimale Reihenfolge der täglichen Aufträge vor (Algorithmus zur Distanzminimierung).
- **Abschluss-Checkliste** – Prozentsatz der korrekt ausgefüllten Checklisten, Kundenunterschriften.
- **Vorfälle** – verschobene Arbeiten, Reklamationen, Rücksendungen.

## Filter

- **Zeitraum** (Tag / Woche / Monat).
- **Team** oder **Fahrzeug**.
- **Geografisches Gebiet**.

## Schnelle Aktionen

- Ein Klick auf einen Auftrag öffnet die vollständigen Details: Kunde, Adresse, Produkte, Vorher-/Nachher-Fotos, Unterschrift.
- Die Schaltfläche **„Neu terminieren“** verschiebt den Auftrag im Kalender, ohne die ausgefüllte Checkliste zu verlieren.
`,
    tips: [
      'Die optimierte Route berücksichtigt den Zeitplan jedes Teams und die mit den Kunden bestätigten Zeitfenster.',
      'Warnungen für HU/Versicherung für Fahrzeuge erscheinen 30 Tage vor Ablauf.',
    ],
  },
  {
    id: 'data-export', category: 'setari', roles: ['all'], order: 17,
    title: 'Datenexport & -import',
    image: '/manual/export-date.png',
    imageAlt: 'Einstellungen › Daten — Export und Import',
    accent: 'green',
    content: `# Datenexport & -import

Unter **Einstellungen → Daten** hast du die volle Kontrolle über die in die Plattform eingegebenen Daten. Alle Daten gehören dem Abonnenten, sind streng pro Unternehmen isoliert (RLS auf \`company_id\`) und **können jederzeit ohne Einschränkung exportiert oder erneut importiert werden**.

---

## 1. Datenexport

![Export-Bereich](/manual/export-date.png)

Die Karte **Datenexport** bietet 5 Schaltflächen:

- **Kunden (CSV)** — vollständige Liste mit Name, Typ, Firma, Kontakt, Adresse, USt-IdNr., Rabatt, Notizen.
- **Angebote (CSV)** — alle Angebote mit Ref.-Nr., Produkt, Kunde, Preis, MwSt., Aufschlag, Status, Datum.
- **Bestellungen (CSV)** — Bestellungen mit Nr., Status, Zwischensumme, Rabatt, Gesamt, bezahlt, Lieferung.
- **Materialien (CSV)** — eigener Katalog mit Code, Name, Typ, Einheit, Preis, Bestand, Lieferant, Lager.
- **Komplettexport (JSON)** — eine einzige Datei mit allen 4 Tabellen + Zeitstempel (\`exported_at\`).

### So exportierst du

1. Gehe zu **Einstellungen → Tab Daten**.
2. Klicke auf die Schaltfläche der gewünschten Kategorie (oder **Komplettexport** für alles).
3. Die Datei wird automatisch heruntergeladen. Der Dateiname enthält das Datum: \`clients_2026-05-22.csv\`, \`full_export_2026-05-22.json\`.
4. Öffne CSV direkt in Excel / LibreOffice (UTF-8 BOM garantiert korrekte Sonderzeichen) oder JSON in einem Texteditor.

> **Wichtig für Abonnenten:** Du hast das DSGVO-Recht auf **Datenübertragbarkeit**. Du kannst alle deine Daten jederzeit und so oft du willst lokal exportieren und speichern, ohne Limit.

---

## 2. Datenimport

![Import-Bereich](/manual/export-date-import.png)

Die Karte **Datenimport** ermöglicht das Hochladen von CSV-Dateien (pro Kategorie) oder eines zuvor gespeicherten kompletten JSON. Nützlich für:

- **Migration** von einem anderen System (CSV mit denselben Headern wie der Export vorbereiten),
- **Wiederherstellung** nach versehentlichem Löschen (mit dem letzten Komplettexport),
- **Massenimport** einer Liste von Kunden, Materialien oder Angeboten.

### So importierst du

1. In der Karte **Datenimport** klicke auf die Kategorie-Schaltfläche (Kunden / Angebote / Bestellungen / Materialien) für CSV oder **Kompletter Import** für JSON.
2. Wähle die Datei vom Computer aus.
3. Ein **Vorschaudialog** öffnet sich und zeigt: Zieltabelle, Anzahl erkannter Datensätze und erste gefundene Spalten.
4. Prüfe die Daten und klicke auf **Import bestätigen** (oder Abbrechen).
5. Am Ende erscheint ein Toast mit der Anzahl erfolgreich importierter Zeilen / Fehler.

### Konfliktschlüssel (Duplikate)

Der Import verwendet einen eindeutigen Schlüssel pro Tabelle:

| Tabelle | Konfliktschlüssel |
|---|---|
| Kunden | \`name\` |
| Angebote | \`ref_number\` |
| Bestellungen | \`order_number\` |
| Materialien | \`code\` |

Zeilen mit bereits vorhandenem Schlüssel können **überschrieben** werden — exportiere vorher, wenn du eine Sicherheitskopie willst.

### Erwartetes Format

- **CSV** — gleicher Header-Satz wie im entsprechenden Export, UTF-8.
- **JSON** — genau die Struktur des **Komplettexports** (\`clients\`, \`quotes\`, \`orders\`, \`materials\` + \`exported_at\`).

---

## Technische Details

- Der Export lädt **alle Datensätze** herunter, mit automatischer Paginierung à 1000 im Hintergrund.
- Der Import verarbeitet Stapel à 100 Zeilen und fügt automatisch den Unternehmenskontext (RLS) ein.
- Alles, was du exportierst/importierst, ist auf dein Unternehmen beschränkt.
`,
    tips: [
      'Mache monatlich einen kompletten (JSON) Export — die sicherste Form eines lokalen Backups.',
      'Vor jedem Massenimport die Zieltabelle exportieren, um die vorherige Version zur Hand zu haben.',
      'Für CSVs mit Sonderzeichen Excel über *Daten → Aus Text/CSV* mit UTF-8 verwenden.',
    ],
  },
  {
    id: 'data-protection', category: 'setari', roles: ['all'], order: 18,
    title: 'Datenschutz',
    image: '/manual/protectia-datelor.png',
    imageAlt: 'Karten Backup / Wiederherstellung / Sicherheit',
    content: `# Datenschutz

Sicherheit und Verfügbarkeit Ihrer Daten haben höchste Priorität. Die Plattform läuft auf **Lovable Cloud-Infrastruktur**, mit mehrschichtigem Schutz und DSGVO-Konformität.

## Automatisches Backup

- **Tägliches automatisches Backup**, ohne Ihr Zutun.
- Historie über mindestens 7 Tage (Point-in-Time Recovery).
- Backups sind verschlüsselt und redundant in europäischen Rechenzentren gespeichert.

## Wiederherstellung

- Bei versehentlichem Verlust können die Daten auf Anfrage über das Support-Team wiederhergestellt werden.
- Wir empfehlen zusätzlich **regelmäßigen lokalen Export** (siehe Abschnitt *Datenexport*).

## Sicherheit

- **Strikte Multi-Tenant-Isolation** durch Row-Level Security auf \`company_id\`.
- **Verschlüsselung bei Übertragung** (HTTPS/TLS) und **im Ruhezustand**.
- **JWT** für Sitzungen, **starkes Hashing** für Passwörter.
- **HIBP**-Prüfung bei Kontoerstellung und Passwortänderung.
- Europäische Rechenzentren, **DSGVO**-Konformität.

## Ihre DSGVO-Rechte

| Recht | Wahrnehmung |
|---|---|
| Portabilität | Export jederzeit aus Einstellungen → Daten |
| Auskunft | Alle Ihre Daten direkt in der Plattform |
| Berichtigung | Bearbeiten Sie jedes Feld in den dedizierten Oberflächen |
| Löschung | Auf Anfrage per Support (\`isoftplustech@gmail.com\`) |

## Empfehlungen

- Verwenden Sie ein **starkes und einzigartiges Passwort**.
- Teilen Sie das Konto nicht — erstellen Sie für Kollegen dedizierte Benutzer (Einstellungen → Team).
- **Abmelden** auf öffentlichen oder geteilten Geräten.
- Monatlicher **Export** und Aufbewahrung an einem sicheren Ort.
- Siehe [Datenschutzerklärung](/privacy-policy) und [Cookie-Richtlinie](/cookie-policy) für Details.
`,
    tips: [
      'Ihre Daten bleiben Ihre: Sie können sie jederzeit in offenen Formaten exportieren.',
      'Sicherste Kombination: automatisches Plattform-Backup + monatlicher lokaler Export.',
    ],
    warnings: [
      'Senden Sie das Passwort niemals per E-Mail, Chat oder Telefon — der Support fragt es niemals ab.',
    ],
  },
];
