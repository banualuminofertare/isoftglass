import type { ManualSection, ManualCategory } from './types';

export const categoriesIT: ManualCategory[] = [
  { id: 'introducere', label: 'Primi passi', order: 1 },
  { id: 'calculatoare', label: 'Calcolatori 3D', order: 2 },
  { id: 'vanzari', label: 'Vendite', order: 3 },
  { id: 'productie', label: 'Produzione', order: 4 },
  { id: 'operational', label: 'Operativo', order: 5 },
  { id: 'setari', label: 'Impostazioni', order: 6 },
];

export const sectionsIT: ManualSection[] = [
  {
    id: 'getting-started', category: 'introducere', roles: ['all'], order: 1,
    title: 'Benvenuto in iSoftGlass',
    image: '/manual/setari-companie.png',
    imageAlt: 'Schermata iSoftGlass — Informazioni azienda',
    content: `# Benvenuto in iSoftGlass

iSoftGlass è la piattaforma **SaaS** per produttori e distributori di vetro. Copre l'intero flusso: configurazione 3D → offerta → ordine → produzione → consegna → assistenza.

## Cosa puoi fare in 5 minuti

1. **Completa i dati dell'azienda** in *Impostazioni → Azienda* (Partita IVA (CUI), indirizzo, IBAN, logo).
2. **Verifica i prezzi** in *Impostazioni → Prezzi* — il catalogo standard è caricato automaticamente, devi solo modificare ciò che è diverso.
3. **Aggiungi il primo cliente** in *Clienti → Nuovo cliente* (o lascia che venga creato automaticamente quando salvi la prima offerta).
4. **Apri un calcolatore 3D** dal menu laterale (es. *Box doccia*) e configuralo in 6 passaggi.
5. **Salva come offerta** — appare in *Ordini* con il PDF pronto da inviare.
6. **Invia in produzione** quando il cliente conferma — lo stock viene dedotto automaticamente.`,
    tips: [
      'La barra in alto ha un selettore RON / EUR — i prezzi interni sono sempre in RON, è solo una visualizzazione.',
      'Clicca sull\'icona 📖 (azzurro) in qualsiasi momento per riaprire questo manuale esattamente alla sezione corrente.',
    ],
  },
  {
    id: 'header-icons', category: 'introducere', roles: ['all'], order: 2,
    title: 'Barra superiore e comandi rapidi',
    content: `# Barra superiore

Nell'angolo in alto a destra hai tutti i comandi globali:

1. 🔔 **Campanella gialla (amber)** — annunci e novità pubblicati dal team iSoftGlass. Il numero rosso indica gli annunci non letti.
2. 📖 **Manuale (contorno azzurro)** — il manuale che stai visualizzando. Si apre sulla sezione pertinente alla pagina corrente.
3. **RON / EUR** — cambia la valuta visualizzata in tutta l'applicazione. La conversione utilizza il tasso di cambio da *Impostazioni → Azienda*.
4. **🇷🇴 RO** — selettore di lingua. Supportiamo 9 lingue (RO, EN, IT, DE, PL, FR, ES, NL, HR).
5. **Logout** — disconnessione sicura dall'account.

## Sidebar — menu a sinistra

- **Main** — Dashboard, Calcolatori 3D, Impostazioni
- **Operational** — Ordini, Produzione, Scanner, Clienti, Report, Montaggio
- Clicca sul pulsante **⬅** accanto al logo per comprimere la sidebar (più spazio sullo schermo).`,
    tips: [
      'La memorizzazione interna dei prezzi è sempre in RON — il cambio in EUR è solo una visualizzazione.',
      'Il cambio della lingua influisce solo sull\'interfaccia; i dati inseriti rimangono nella lingua originale.',
    ],
  },
  {
    id: 'calc-flow-6-steps', category: 'calculatoare', roles: ['all'], order: -1,
    title: 'I 6 passaggi in un calcolatore 3D',
    image: '/manual/calc-step6-finalizare.png',
    imageAlt: 'Passaggio 6 - finalizzazione offerta con dati cliente e pulsanti PDF/Salva/Aggiungi al carrello',
    content: `# I 6 passaggi in un calcolatore 3D

Qualsiasi calcolatore 3D (box doccia, porta, balaustra, specchio, anta cucina, pannello) segue **lo stesso flusso lineare in 6 passaggi**. Ad ogni passaggio, sulla destra hai la visualizzazione 3D che si aggiorna in tempo reale, e l'avanzamento è indicato nella barra superiore.

---

## Passaggio 1 — Tipo prodotto

Scegli la forma o la tipologia (es: **Angolo 90°**, **Walk-in / In nicchia**, **Pentagonale**, **Sopravasca**, **Pannello fisso**). Ogni tipo precarica la geometria di base e l'elenco dei profili adatti.

![Passaggio 1 - selezione tipo prodotto](/manual/calc-step1-tip.png)

## Passaggio 2 — Sistema di apertura

Scegli la modalità di funzionamento: **con cerniere** (classico), **pivot** alto-basso (minimalista) o **scorrevole** su binario (risparmio di spazio). La selezione qui determina automaticamente quali accessori potrai aggiungere al Passaggio 5.

![Passaggio 2 - sistema di apertura](/manual/calc-step2-dimensiuni.png)

## Passaggio 3 — Vetro

Imposti lo **spessore** (6/8/10/12 mm), la **finitura** (trasparente, grigio, bronzo, sabbiato) e le opzioni: **trattamento anticalcare**, **levigatura bordi**, **tempera**, **laminazione**. Il prezzo del vetro si ricalcola istantaneamente.

![Passaggio 3 - scelta vetro](/manual/calc-step3-sticla.png)

## Passaggio 4 — Configurazione porta & dimensioni

Stabilisci il **lato di apertura** (frontale / laterale), la **direzione** (interno / esterno), il **lato della cerniera** (sinistra / destra) e le **dimensioni** finali (larghezza × altezza × profondità). Clicca su qualsiasi quota nella scena 3D per una modifica rapida (Invio / Tab salva).

![Passaggio 4 - porta e dimensioni](/manual/calc-step4-profile.png)

## Passaggio 5 — Profili & accessori

Scegli da elenchi personalizzati: **profili guarnizione**, **profili a U / perimetrali**, **barre stabilizzatrici**, **kit extra**. Per i dettagli completi su come funziona questo passaggio, vedi la sezione **„Come funzionano gli accessori nei calcolatori"**.

![Passaggio 5 - profili e accessori](/manual/calc-step5-accesorii.png)

---

## Passaggio 6 — Finalizzazione offerta (dettagliato)

Qui trasformi la configurazione in un'azione commerciale. Il Passaggio 6 ha 3 aree chiare: **dati cliente**, **importo aggiuntivo & totale**, **pulsanti di azione**.

![Passaggio 6 - finalizzazione](/manual/calc-step6-finalizare.png)

### Dati cliente (Client info)

- **Tipo Cliente** — Privato / Azienda / Distributore. **Molto importante**: il tipo scelto qui applica automaticamente il ricarico configurato in **Impostazioni → Ricarico Clienti**, quindi il prezzo visualizzato tiene già conto del margine per tipo.
- **Nome cliente** — il nome che appare sull'offerta e sul PDF.
- **Telefono** & **Email** — dati di contatto utilizzati nel CRM e per l'invio dell'offerta.

> Al salvataggio, se il nome del cliente non esiste nel database CRM, il sistema **crea automaticamente una nuova scheda**. Se esiste, utilizza quella esistente (corrispondenza per nome).

### Importo aggiuntivo (Extra amount)

Il campo **„Extra amount" / „Importo aggiuntivo"** ti permette di aggiungere una somma libera al subtotale calcolato. A cosa serve in pratica:

- **Trasporto** al cliente (es: +150 RON per la consegna).
- **Montaggio aggiuntivo** oltre al pacchetto standard.
- **Manodopera speciale** (es: foratura in granito, pezzi non standard).
- **Sovrapprezzo per urgenza** quando il lavoro deve essere eseguito con priorità.
- **Sconto commerciale** — inserisci un valore **negativo** (es: -50 RON) e viene detratto dal totale.

L'importo si aggiunge al subtotale **prima** dell'IVA e appare separatamente sul PDF, in modo trasparente per il cliente.

### Subtotale, IVA e totale

La scheda mostra in tempo reale: **Subtotale (IVA esclusa)**, **IVA %** (dalle impostazioni) e **Totale IVA inclusa**. La modifica di qualsiasi parametro (vetro, accessorio, importo aggiuntivo) ricalcola istantaneamente.

### I 3 pulsanti di azione

1. **Scarica PDF** — genera l'offerta in PDF (logo aziendale, dati cliente, elenco prodotti con snapshot 3D 70×47 px, accessori aggregati per codice, manodopera, totale IVA inclusa). **Utilizzato per** invio rapido via email / WhatsApp, **senza** salvare nel sistema. Utile quando si desidera solo un preventivo di massima.

2. **Salva offerta** — crea nel database un'offerta con numero **OFR-YYYYMMDD-HHMMSS** e un **ordine con stato „Offerta"**. **Utilizzato quando** l'offerta è definitiva e si vuole ritrovarla in seguito in **Ordini**, per modificarla o trasformarla in un lavoro.

3. **Aggiungi al carrello** — aggiunge il prodotto corrente al **carrello attivo** (icona in basso a destra con contatore) **senza** concludere l'ordine. **Utilizzato per** offerte con più prodotti: es. doccia + specchio + anta cucina per lo stesso cliente — aggiungi uno per uno, poi finalizzi l'intero carrello come un unico ordine.

---

## Cosa succede dopo „Aggiungi al carrello"

![Il carrello con i prodotti aggiunti](/manual/cos-flow.png)

### 1. Il carrello (icona in basso a destra)

Clicca sull'icona del carrello con contatore e si apre il pannello laterale **Order Products**:

- Elenca tutti i prodotti aggiunti, ciascuno con **dimensioni**, **spessore vetro** e **prezzo**.
- Pulsanti **+ / -** per la quantità di ogni articolo.
- L'icona del **cestino** rosso elimina l'articolo.
- Il pulsante **„Empty" / „Svuota"** svuota l'intero carrello.
- In basso: **Order total** (la somma di tutti i prodotti).

### 2. Finalizza l'ordine

Premi **„Finalize" / „Finalizza"** e si apre la finestra di dialogo **Create order from cart**:

![Finestra di finalizzazione dell'ordine](/manual/cos-finalizare.png)

- **Cart products** — riepilogo dei prodotti nel carrello con il totale.
- **Client** — dati del cliente (ripresi automaticamente dall'ultimo prodotto aggiunto).
- **Delivery Address** — indirizzo di consegna / montaggio.
- **Delivery Date** — termine di consegna stimato.
- **Notes** — osservazioni interne.

Premi **Create Order**: il sistema genera un numero d'ordine univoco e inserisce l'ordine in **Gestione Ordini** con stato **„Offerta"**.

### 3. In Gestione Ordini

L'ordine appare immediatamente nell'elenco. Da qui:

- **Scarichi il PDF** consolidato (tutti i prodotti aggregati, accessori sommati per codice).
- **Invii in produzione** — deduce automaticamente lo stock, crea la scheda di produzione e la card Kanban.
- **Emetti fattura** o **proforma (acconto)**.
- **Programmi il montaggio** per il team di installazione.
- **Apri l'ordine** (cliccando sulla riga) per visualizzare le schede **Dettagli / Prodotti / Storico / Anteprima**.

### 4. Modifica successiva

Dalla scheda **Prodotti** di un ordine, il pulsante **Modifica** ti riporta al calcolatore originale con **l'intera configurazione ripristinata** da \`full_config\` — inclusi tipo di cliente, importo aggiuntivo, accessori. Modifichi → Salvi → l'ordine si aggiorna automaticamente.`,
    tips: [
      'Al Passaggio 6, cambiare il **Tipo Cliente** tra Privato / Azienda / Distributore ricalcola istantaneamente l\'intero subtotale con il ricarico corretto.',
      'Usa **Scarica PDF** per preventivi veloci via email, e **Salva offerta** solo quando l\'offerta è definitiva — eviti di riempire lo storico con bozze.',
      'Il carrello ti permette di configurare più prodotti per lo stesso cliente e di inviarli in un **unico ordine** con un solo PDF aggregato.',
      'L\'intera configurazione (incluso l\'importo aggiuntivo e il tipo di cliente) viene salvata in `full_config` — alla riapertura, tutto torna esattamente com\'era.',
    ],
    warnings: [
      'L\'importo aggiuntivo negativo (sconto) NON verifica che il totale non scenda sotto zero — fai attenzione al valore.',
      'Se modifichi i prezzi nelle Impostazioni **dopo** aver salvato un\'offerta, le offerte vecchie **non** vengono ricalcolate automaticamente — mantengono i valori iniziali.',
    ],
  },
  {
    id: 'accessory-flow', category: 'calculatoare', roles: ['all'], order: 0,
    title: 'Come funzionano gli accessori nei calcolatori',
    image: '/manual/accesorii-import.png',
    imageAlt: 'Catalogo accessori — pulsante Importa nella mia lista',
    content: `# Come funzionano gli accessori nei calcolatori

Tutti i calcolatori 3D (Box doccia, Porte, Balaustre, Specchi, Ante cucina, Pareti divisorie) utilizzano **lo stesso sistema** per gli accessori: cerniere, maniglie, profili a U, barre stabilizzatrici, kit scorrevoli, fermi, serrature, ecc.

La logica è semplice e si esegue **una sola volta**:

> **Importi dal catalogo → vengono memorizzati in „Seleziona prodotto" → li usi ovunque, in qualsiasi offerta.**

Non devi cercare l'accessorio ogni volta per ogni lavoro — una volta importato, rimane nel tuo elenco personale finché non decidi di rimuoverlo.

---

## Passaggio 1 — Apri il catalogo degli accessori

Vai in **Impostazioni → Prezzi → Accessori** (o direttamente **Impostazioni → Catalogo accessori**, a seconda della versione dell'interfaccia).

Qui vedi il catalogo globale del sistema — migliaia di codici raggruppati per categorie: cerniere, maniglie, profili a U, kit scorrevoli, guarnizioni, barre stabilizzatrici, fermi, serrature, supporti, tappi.

![Catalogo accessori](/manual/accesorii-import.png)

- Usa la **ricerca trasversale** (in alto) — cerca per codice, nome o finitura, in tutte le categorie.
- I filtri laterali restringono per categoria / sottocategoria.

## Passaggio 2 — Importa gli accessori di cui hai bisogno

Sulla riga di ogni accessorio del catalogo c'è un pulsante **„Importa"** (o „Aggiungi alla mia lista"). Cliccaci sopra — l'accessorio entra immediatamente nel **tuo elenco personale**, isolato per azienda (RLS stretto).

Seleziona più righe e premi **„Importa selezione"** per aggiungere un intero gruppo (es: tutto il set di cerniere per box doccia).

> **Lo fai una sola volta.** Dopo l'importazione, l'accessorio è disponibile per tutti gli utenti dell'azienda, in tutti i calcolatori.

## Passaggio 3 — Verifica i prezzi e le unità

Nel tuo elenco locale, ogni accessorio mostra:

- **Codice** e **nome** (presi dal catalogo).
- **Prezzo** (puoi fare un override personale — non influisce sul catalogo globale).
- **Unità** (pz, ml, set) — supporta anche valori decimali per ml.
- **Finitura** disponibile (cromo, opaco, spazzolato, ecc.).

Modifica il prezzo direttamente nella cella — si salva automaticamente e appare immediatamente nei calcolatori.

## Passaggio 4 — Nel calcolatore, apri „Seleziona prodotto"

Entri in un calcolatore (es: **Box doccia**), arrivi al passaggio **Accessori** (cerniere, maniglia, profilo a U, barra, ecc.).

Per ogni slot, il menu a tendina **„Seleziona prodotto"** mostra **solo gli accessori che hai importato** — ristretto al tipo appropriato (es: nello slot Maniglia vedi solo maniglie).

![Menu a tendina Seleziona prodotto nel calcolatore](/manual/accesorii-selecteaza-produs.png)

- L'elenco è pulito: non ti confondi tra migliaia di codici irrilevanti.
- Ricerca rapida nel menu a tendina per codice o nome.

## Passaggio 5 — Regola la quantità e la finitura

Dopo aver scelto l'accessorio:

- **Quantità** — per le cerniere puoi scegliere 2 o 3 (la tua scelta è autoritativa, fa override sulla regola automatica).
- **Finitura** — colore/finitura tra le varianti disponibili (con fallback al genitore se la variante esatta manca).
- **Posizione** — le cerniere si misurano dall'alto verso il basso, la maniglia dal basso verso l'alto (convenzione del settore, già preconfigurata).

## Passaggio 6 — Salva la configurazione → gli accessori entrano nell'offerta

Premi **„Salva come offerta"** o **„Aggiungi al carrello"**. Gli accessori selezionati:

1. Si allegano al prodotto con il loro prezzo in RON (visualizzazione convertibile in EUR).
2. Appaiono in **OrderPreview** e nel PDF dell'offerta, aggregati automaticamente per codice (stesso codice = somma delle quantità).
3. Vengono memorizzati nel JSON \`full_config\` — la fonte di verità per PDF, DXF e modifiche successive.
4. All'invio in produzione, **lo stock diminuisce automaticamente** in base alle quantità dell'offerta.

![Accessorio aggiunto all'offerta](/manual/accesorii-in-oferta.png)`,
    tips: [
      'Importi una sola volta — poi gli accessori rimangono in „Seleziona prodotto" per tutti i colleghi dell\'azienda.',
      'I prezzi possono essere sovrascritti localmente (override per azienda) senza influenzare il catalogo di sistema.',
      'Usi lo stesso flusso in TUTTI i calcolatori: doccia, porte, balaustra, specchio, anta cucina, pareti.',
    ],
    warnings: [
      'Se rimuovi un accessorio dal tuo elenco personale, le offerte vecchie rimangono valide (la configurazione è salvata in `full_config`), ma non potrai più selezionarlo nei nuovi lavori finché non lo reimporti.',
    ],
  },
  {
    id: 'calc-shower', category: 'calculatoare', roles: ['all'], order: 1,
    title: 'Calcolatore Box Doccia',
    image: '/manual/calc-dus.png',
    imageAlt: 'Configuratore 3D box doccia',
    content: `# Calcolatore Box Doccia

Configura visivamente in 3D qualsiasi tipo di cabina: angolo 90°, walk-in, pentagonale, per vasca, pannello fisso.

## I 6 passaggi

1. **Tipo cabina** — scegli la forma (angolo 90°, in nicchia, pentagonale, sopravasca, fisso).
2. **Dimensioni** — clicca sulla quota nella scena 3D per modificarla (Invio / Tab salva).
3. **Vetro** — spessore (8/10/12 mm), finitura (chiaro, grigio, bronzo), tempera opzionale.
4. **Profili** — a U, a parete, angolo 90°, kit scorrevole (se applicabile).
5. **Accessori** — cerniere (2 o 3), maniglia, barra stabilizzatrice, guarnizioni.
6. **Salva** — come offerta o direttamente come nuovo lavoro.`,
    tips: [
      'Le cerniere si misurano dall\'**alto verso il basso**, mentre la maniglia dal **basso verso l\'alto** — convenzione del settore.',
      'Il pannello fisso NON ha una deduzione implicita di 10 mm — solo la somma dei profili + guarnizioni.',
      'Il sistema scorrevole non richiede cerniere e calcola automaticamente la sovrapposizione dal kit.',
    ],
    warnings: [
      'All\'angolo di 90°, i profili a U sono forzati come nascosti all\'intersezione per evitare duplicazioni.',
    ],
  },
  {
    id: 'calc-door', category: 'calculatoare', roles: ['all'], order: 2,
    title: 'Calcolatore Porte in Vetro',
    image: '/manual/calc-usa.png',
    imageAlt: 'Configuratore 3D porta in vetro',
    content: `# Calcolatore Porte

Per porte interne con cerniere, pivot o scorrimento su binario.

## Passaggi

1. **Sistema** — Con cerniere, Pivot alto-basso, Scorrimento su binario.
2. **Dimensioni** — larghezza, altezza, vano porta.
3. **Vetro** — spessore и finitura.
4. **Guarnizioni laterali** — array \`lateralSelections\` con opzioni separate sinistra/destra/alto/basso.
5. **Intagli** — per maniglia o serratura (soglia >50 mm = grande, ≤50 mm = piccolo).
6. **Accessori** — cerniere, maniglia, fermo, serratura.`,
    tips: [
      'Il pivot viene calcolato automaticamente in base al peso del vetro.',
      'Nel sistema scorrevole, il binario e la guida sono inclusi nel kit — non aggiungerli separatamente.',
    ],
  },
  {
    id: 'calc-balustrade', category: 'calculatoare', roles: ['all'], order: 3,
    title: 'Calcolatore Balaustre',
    image: '/manual/calc-balustrada.png',
    imageAlt: 'Configuratore 3D balaustra',
    content: `# Calcolatore Balaustre

Configurazione di balaustre in vetro: interno, esterno (laminato obbligatorio), scale (pannelli inclinati).

## Passaggi

1. **Tipo** — Interno, Esterno, Scale.
2. **Lunghezza totale** e **altezza** — in mm.
3. **Vetro** — laminato 8+8, 10+10 o temperato semplice (solo per interni).
4. **Fissaggio** — profilo a U continuo, morsetti puntuali, balaustri.
5. **Corrimano** — opzionale (legno, inox, alluminio).
6. **Tappi** — per profilo a U.`,
    warnings: [
      'Per esterni, il vetro DEVE essere laminato — norma di sicurezza obbligatoria.',
    ],
  },
  {
    id: 'calc-mirror', category: 'calculatoare', roles: ['all'], order: 4,
    title: 'Calcolatore Specchi',
    image: '/manual/calc-oglinda.png',
    imageAlt: 'Configuratore 3D specchio',
    content: `# Calcolatore Specchi

Per specchi semplici o con lavorazioni speciali.

## Passaggi

1. **Forma** — Rettangolare, Quadrata, Cerchio, Ovale, Personalizzata.
2. **Dimensioni** — in mm; per la forma personalizzata disegni nell'editor CAD.
3. **Tipo di specchio** — argentato standard, anticato, fumé, bronzo.
4. **Bordo** — levigato, bisellato, lucidato.
5. **Intagli** — per interruttori, prese, supporti.
6. **Illuminazione LED** — opzionale, perimetrale o posteriore.`,
  },
  {
    id: 'calc-kitchen', category: 'calculatoare', roles: ['all'], order: 5,
    title: 'Calcolatore Ante Cucina',
    image: '/manual/calc-front-bucatarie.png',
    imageAlt: 'Configuratore 3D anta cucina',
    content: `# Calcolatore Ante Cucina

Ante per mobili in vetro laccato, con stampa digitale o sabbiato opaco.

## Passaggi

1. **Finitura** — Laccato RAL, Stampa digitale, Sabbiato opaco.
2. **Dimensioni** — larghezza × altezza per anta; moltiplica per il numero di ante.
3. **Colore / Stampa** — selezioni il RAL или carichi il file di stampa.
4. **Intagli** — per maniglie o push-to-open.
5. **Sistema di fissaggio** — adesivo su MDF, viti posteriori, profilo in alluminio.
6. **Salvataggio** — aggregazione automatica per cucine intere.`,
    tips: [
      'Per la stampa digitale, la risoluzione minima raccomandata è di 150 dpi alla dimensione finale.',
    ],
  },
  {
    id: 'calc-panels', category: 'calculatoare', roles: ['all'], order: 6,
    title: 'Pannelli & Pareti Divisorie',
    image: '/manual/calc-panouri.png',
    imageAlt: 'Configuratore 3D pannello e parete divisoria',
    content: `# Pannelli e Pareti Divisorie

Due sottomoduli:

- **Pannello semplice** — vetro senza lavorazioni (vetro a misura).
- **Parete divisoria** — griglia configurabile con porte integrate.

## Pareti divisorie — passaggi chiave

1. **Griglia** — definisci quante colonne × righe; ridimensioni con trascinamento interbloccato (la somma della larghezza rimane costante).
2. **Profili perimetrali** — alto, basso, laterale; si interrompono automaticamente dove ci sono le porte.
3. **Profili interni** — verticali e orizzontali; \`usableWidth/Height\` assicura che i pannelli si adattino.
4. **Porte integrate** — in qualsiasi cella; si deducono automaticamente dal profilo perimetrale.
5. **Pannelli laterali 90°** — l'altezza si sincronizza con quella della porta.
6. **Vetro & finiture** — per cella o globali.`,
    warnings: [
      'Quando si ridimensiona una colonna, quelle adiacenti si regolano automaticamente per mantenere la larghezza totale.',
    ],
  },
  {
    id: 'orders', category: 'vanzari', roles: ['all'], order: 1,
    title: 'Gestione Ordini',
    image: '/manual/comenzi-deschide.png',
    imageAlt: 'Elenco ordini con stati',
    content: `# Ordini

Tutte le offerte e gli ordini, con filtri rapidi per stato: Offerta → Confermato → In produzione → Completato → Consegnato → Annullato.

## Azioni rapide sulla riga dell'ordine

1. **Cambia stato** — pulsanti colorati direttamente sulla riga (Conferma, Completa, Consegna).
2. **Invia in produzione** — deduce automaticamente lo stock e crea la scheda di produzione.
3. **Genera DXF** — per CNC, su ogni pannello.
4. **Modifica** — riapre l'offerta nel calcolatore originale (tutti i dati ripristinati).
5. **Elimina** — solo se non è ancora in produzione.

## Apertura di un ordine in dettaglio

Clicca sul numero dell'ordine (o sulla sua riga) dall'**Elenco Ordini** e si apre un riquadro con l'intestazione dell'ordine (n°, stato, pulsante **Scarica PDF**) e 4 schede:

![Riquadro ordine aperto](/manual/comenzi-detalii.png)

### 1. Dettagli
Dati del cliente, data di creazione, subtotale, IVA, totale. Qui verifichi rapidamente i dati commerciali e hai i pulsanti per **Programma montaggio**, **Emetti fattura** e **Proforma (acconto)**.

### 2. Prodotti
Elenco dei prodotti configurati, con quantità, prezzo unitario e importo aggiuntivo (se presente). Il pulsante **Modifica** su ogni prodotto ti riporta al calcolatore per le regolazioni.

![Scheda Prodotti](/manual/comenzi-produse.png)

### 3. Storico
Log delle modifiche: cambi di stato, modifiche, pagamenti, generazioni di documenti. Utile per la tracciabilità e l'audit — vedi chi e quando ha effettuato ogni modifica.

![Scheda Storico](/manual/comenzi-istoric.png)

### 4. Anteprima
Render dettagliato dell'offerta esattamente come appare sul **PDF inviato al cliente**: per ogni prodotto vedi il tipo di configurazione, le dimensioni e la superficie del vetro, le lavorazioni applicate, l'elenco degli accessori con codice e prezzo unitario, la manodopera e il totale. **Utilizzato per la verifica finale** prima di inviare l'offerta al cliente o l'ordine in produzione — confermi che i prezzi dei prodotti, degli accessori e della manodopera siano corretti.

![Scheda Anteprima](/manual/comenzi-previzualizare.png)

## Le schede in alto

Riepilogo istantaneo: totale ordini, valore in RON, distribuzione per stato.`,
    tips: [
      'La configurazione completa (`full_config`) viene mantenuta intatta dal carrello all\'ordine — non si perdono dati.',
      'Gli accessori identici vengono aggregati automaticamente nel PDF finale (somma delle quantità, codice unico).',
      'La scheda Anteprima riflette sempre i valori correnti — se cambi un prezzo nelle Impostazioni, si aggiorna qui.',
    ],
  },
  {
    id: 'invoicing', category: 'vanzari', roles: ['all'], order: 2,
    title: 'Fatturazione',
    image: '/manual/facturare.png',
    imageAlt: 'Modulo fatturazione con KPI e grafici',
    content: `# Fatturazione

Emissione di fatture da ordini confermati, con serie personalizzate ed esportazione e-Fattura (CIUS-RO e FatturaPA per IT).

## Passaggi

1. **Configura le serie** in *Impostazioni → Fatturazione → Serie* (prefisso, anno, contatore).
2. **Genera fattura** dall'ordine: pulsante **€** sulla riga dell'ordine.
3. **Modifica righe** — aggiungi/rimuovi, modifica prezzi, IVA per riga.
4. **Emetti** — numero assegnato automaticamente, lo stato diventa "Emissione".
5. **Registra pagamento** — finestra per pagamento parziale o totale.
6. **Esporta XML** — per ANAF (RO) o SDI (IT).

## KPI

Schede in alto: fatturato, incassato, in sospeso, annullato.`,
    warnings: [
      'Una fattura emessa non può essere cancellata — solo annullata con motivazione e sostituita con una nota di credito (storno).',
    ],
  },
  {
    id: 'clients-crm', category: 'vanzari', roles: ['all'], order: 3,
    title: 'Clienti & CRM',
    image: '/manual/clienti-crm.png',
    imageAlt: 'Elenco clienti CRM con tipi',
    content: `# Clienti

Database completo dei clienti: privati, aziende, distributori.

## Passaggi

1. **Aggiungi cliente** — pulsante "Nuovo Cliente" o automaticamente quando salvi un'offerta per una nuova email.
2. **Tipo cliente** — Privato / Azienda / Distributore (con sconto globale).
3. **Dati di contatto** — telefono, email, indirizzo, Partita IVA (CUI) (se azienda).
4. **Pipeline CRM** (admin) — lead, fasi, conversioni.
5. **Storico** — tutte le offerte e gli ordini del cliente in un unico posto.
6. **Markup specifico** — in *Impostazioni → Markup Cliente* imposti un ricarico diverso per tipo.

## I filtri in alto

Ricerca per nome/email, filtro per tipo di cliente.`,
    tips: [
      'I clienti vengono creati automaticamente dai calcolatori 3D quando salvi la prima offerta con una nuova email.',
    ],
  },
  {
    id: 'production-kanban', category: 'productie', roles: ['all'], order: 1,
    title: 'Flusso di Produzione Kanban',
    image: '/manual/productie-kanban.png',
    imageAlt: 'Lavagna Kanban con colonne Taglio, Lavorazione, Tempera',
    content: `# Produzione Kanban

Flusso visivo per fasi: **Taglio → Lavorazione → Tempera → Rivestimento/Stampa → Assemblaggio → Pronto per la consegna**.

## Passaggi giornalieri

1. **Verifica i KPI** in alto: totale attivi, in lavorazione, in attesa, pronti per la consegna.
2. **Trascina e rilascia** una card tra le colonne per avanzare manualmente.
3. **Clicca sulla card** — apre la scheda di produzione con disegni tecnici, materiali, accessori.
4. **Assegnazione operatore** — pre-pianificato in *Ordini → Pianificazione operatore*; si salva in \`operator_name\` per la tracciabilità.
5. **Vista Calendario** — scheda alternativa per la pianificazione per data.

## Etichette con codice a barre

Dalla scheda di ogni ordine di produzione (e dalla pagina **Scanner**) hai il pulsante **„Stampa Etichetta"**:

- Il codice a barre è **CODE128**, generato automaticamente dal numero della scheda (con la libreria JsBarcode).
- L'etichetta contiene: **n. scheda**, **n. ordine**, **cliente**, **data di consegna** e **fase corrente**.
- Si apre direttamente la finestra di stampa del browser — puoi usare stampanti normali A4 o stampanti di etichette dedicate (Zebra, Brother, ecc.).
- Incolli l'etichetta sul vetro / telaio / pacco e la riutilizzi in ogni fase del flusso.

## Scansione in officina

La pagina **Produzione → Scanner** è ottimizzata per il ritmo dell'officina:

1. **Auto-focus** sul campo di scansione — non devi cliccare prima di ogni scansione.
2. **Lettori HID** — qualsiasi scanner USB di tipo „tastiera" funziona plug-and-play (non richiede driver).
3. **Scansiona il codice** sull'etichetta → l'ordine **avanza automaticamente** alla fase successiva del flusso.
4. **Conferma visiva** istantanea: la card mostra il nuovo stato, e il Kanban si aggiorna.

Così gli operatori non perdono più tempo con il drag & drop manuale e non ci sono errori del tipo „ho dimenticato di segnare che ho finito".

## Tracciamento in tempo reale

La lavagna Kanban si **aggiorna automaticamente** in background:

- Le scansioni fatte in officina appaiono **immediatamente** sugli schermi dell'ufficio — senza refresh manuale.
- I KPI in alto (attivi, in lavorazione, pronti per la consegna) si ricalcolano dal vivo.
- Più operatori possono lavorare simultaneamente su fasi diverse, senza intralciarsi.
- Il manager vede in qualsiasi momento **dove si trova ogni ordine** e **chi ci sta lavorando**.

## Data di consegna stimata

Si calcola automaticamente quando un ordine entra in produzione, in base al carico delle colonne.`,
    tips: [
      'Stampa l\'etichetta con il codice a barre subito dopo che l\'ordine entra in produzione e incollala sul pacco — diventa la fonte di verità per l\'intero flusso.',
      'Lascia la pagina Scanner aperta su un tablet/laptop in officina; l\'auto-focus assicura che ogni scansione venga catturata anche se nessuno è alla tastiera.',
      'Per un flusso 24/7 apri il Kanban su una grande TV — vedi in tempo reale l\'avanzamento senza toccare nulla.',
    ],
  },
  {
    id: 'inventory', category: 'productie', roles: ['all'], order: 2,
    title: 'Magazzino & Inventario',
    image: '/manual/stoc.png',
    imageAlt: 'Modulo inventario con elenchi materiali',
    content: `# Magazzino

Gestione materiali: vetro, accessori (hardware), consumabili. Deduzione automatica all'entrata in produzione.

## Passaggi

1. **Aggiungi materiale** — pulsante "Nuovo Materiale" (codice, tipo, prezzo, scorta minima).
2. **Aggiustamento scorte** — pulsante per riga per entrate/uscite manuali.
3. **Movimenti di magazzino** — scheda con lo storico delle transazioni (entrate, uscite, motivo).
4. **Report consumo mensile** — pulsante in alto, esportazione CSV/Excel.
5. **Avvisi scorta minima** — KPI rosso "Min. Stock" sulla scheda superiore.
6. **Ubicazione** — opzionale, per magazzini multipli.

## Deduzione automatica

Quando un ordine entra nello stato **"In produzione"**, lo stock diminuisce automaticamente secondo l'elenco dei materiali di ogni prodotto.`,
    warnings: [
      'Lo stock negativo è consentito ma contrassegnato in rosso — il responsabile del magazzino deve effettuare un inventario fisico e un aggiustamento.',
    ],
  },
  {
    id: 'cutting', category: 'productie', roles: ['all'], order: 3,
    title: 'Ottimizzazione Taglio',
    image: '/manual/optimizare-debitare.png',
    imageAlt: 'Modulo ottimizzazione taglio con selezione lastre',
    content: `# Ottimizzazione Taglio

Algoritmo di nesting a ghigliottina per fino a 50 ordini contemporaneamente — minimizza lo sfrido di vetro.

## Passaggi

1. **Tipo lastra** — selezioni dal catalogo (es: 3210×2250 mm).
2. **Spessore lama** — predefinito 3 mm, regolabile.
3. **Seleziona ordini** — dall'elenco con ricerca e filtro stato (puoi selezionare "Seleziona tutto 26").
4. **Premi Ottimizza** — l'algoritmo viene eseguito e mostra le lastre con i pannelli nidificati.
5. **Visualizza SVG** — ogni lastra con quote, etichette dei pannelli, sfrido colorato.
6. **Esporta DXF/PDF** — per inviare alla macchina da taglio.

## Gestione lastre di vetro

![Finestra Gestisci lastre con le misure standard nella pagina Ottimizzazione Taglio](/manual/manage-glass-sheets.png)

Le misure standard (2550×3210, 2250×3210, Jumbo 6000×3210) vengono caricate automaticamente al primo utilizzo. Puoi modificarle in qualsiasi momento senza uscire dalla pagina di taglio — clicca il pulsante **⚙ Gestisci lastre** accanto al selettore *Tipo lastra*.

1. **Aggiungi una nuova lastra** — compila *Nome* (es. "Custom 2000×3000"), *Larghezza (mm)* e *Altezza (mm)*, poi clicca **+ Aggiungi**.
2. **Attiva / disattiva** — l'interruttore accanto a ogni misura la nasconde dal selettore *Tipo lastra* senza eliminarla (utile per misure stagionali).
3. **Elimina** — il pulsante rosso (cestino) rimuove definitivamente una misura; usalo solo se sei sicuro di non doverla più tagliare.
4. **Chiudi la finestra** — le modifiche si applicano subito e il selettore *Tipo lastra* si aggiorna automaticamente con le nuove dimensioni e la superficie in m².

> Le lastre sono salvate per azienda — tutto il team vede la stessa lista, isolata dagli altri account.

## Statistiche

Percentuale di utilizzo, superficie di sfrido, numero di lastre.`,
    tips: [
      'Limite di 50 ordini per sessione per mantenere un tempo di calcolo ragionevole.',
    ],
  },
  {
    id: 'service', category: 'operational', roles: ['all'], order: 1,
    title: 'Reclami & Interventi di Assistenza',
    image: '/manual/service.png',
    imageAlt: 'Modulo reclami con grafici ed elenco ticket',
    content: `# Reclami & Assistenza

Gestione degli incidenti post-consegna: reclami dei clienti, difetti di fabbrica, interventi programmati.

## Passaggi

1. **Nuovo reclamo** — pulsante in alto a destra.
2. **Associa ordine** — opzionale, per la tracciabilità.
3. **Priorità** — Bassa / Media / Alta / Critica.
4. **Tipo di difetto** — Reclamo cliente, Difetto di fabbrica, Danni da trasporto, Garanzia.
5. **Programma intervento** — scegli la data e la squadra di montaggio.
6. **Chiudi ticket** — con risoluzione e costi.

## Grafici

Frequenza difetti, distribuzione priorità, stato dei ticket.`,
  },
  {
    id: 'installation', category: 'operational', roles: ['all'], order: 2,
    title: 'Montaggio & Squadre',
    image: '/manual/montaj.png',
    imageAlt: 'Calendario montaggi con tab Squadre, Veicoli, Checklist',
    content: `# Montaggio

Pianificazione montaggi, squadre, veicoli, checklist e ottimizzazione del percorso.

## Schede

1. **Calendario Montaggi** — vista mensile con drag & drop.
2. **Squadre di Montaggio** — aggiungi membri, assegnali alle squadre.
3. **Checklist** — modelli clonati su ogni lavoro alla creazione.
4. **Ottimizzazione Percorso** — calcola l'ordine ottimale dei montaggi del giorno.
5. **Veicoli** — flotta con avvisi a 30 giorni per revisione (ITP) e assicurazione RCA.

## Passaggi di pianificazione

1. Pulsante **"Programma montaggio"** in alto a destra.
2. Selezioni l'ordine, la squadra, il veicolo, la data.
3. Alleghi la checklist (predefinita o personalizzata).
4. Salvi — appare nel calendario.
5. **Rinvio** — chiude il lavoro corrente e precompila uno nuovo.`,
    tips: [
      'I veicoli con revisione (ITP)/assicurazione RCA in scadenza entro 30 giorni ricevono un avviso automatico.',
    ],
  },
  {
    id: 'settings-company', category: 'setari', roles: ['all'], order: 1,
    title: 'Impostazioni Azienda & Branding',
    image: '/manual/setari-companie.png',
    imageAlt: 'Impostazioni azienda — informazioni generali',
    content: `# Impostazioni → Azienda

I dati che appaiono su TUTTI i documenti generati (offerte, ordini, fatture, schede di produzione).

## Campi essenziali

1. **Nome Azienda** — appare nell'intestazione del PDF.
2. **Partita IVA / Codice Fiscale (CUI / CIF)** — con prefisso RO per la Romania.
3. **Indirizzo completo** — Via, N., Città, Provincia, Codice Postale.
4. **Telefono e Email** — per i contatti sui documenti.
5. **Conto Bancario e BIC/SWIFT** — per le fatture.
6. **Logo Azienda** — PNG/JPG/WebP/SVG, max 2 MB.

## Personalizzazione PDF

- **Dimensione logo** e **posizione** — per offerte e fatture.
- **Testi personalizzati** — termini, condizioni, piè di pagina (rich-text via Tiptap).
- **Tasso di cambio EUR/RON** — usato per la conversione globale.

## White label

Gli abbonati possono personalizzare completamente i PDF con il proprio logo e testi HTML.`,
    tips: [
      'Il logo ideale è un PNG trasparente, con rapporto 3:1 o quadrato, minimo 400×400 px per una buona qualità di stampa.',
    ],
  },
  {
    id: 'settings-pricing', category: 'setari', roles: ['all'], order: 2,
    title: 'Impostazioni Prezzi & Catalogo',
    content: `# Impostazioni → Prezzi

Il tuo catalogo prezzi locale: materiali, accessori, kit, finiture.

## Passaggi

1. **Scheda Materiali** — vetro, profili, accessori raggruppati.
2. **Cerca** — ricerca trasversale nelle categorie.
3. **Modifica prezzo** — clicca sulla cella, salvataggio automatico.
4. **Ripristina al sistema** — pulsante per annullare l'override e tornare al prezzo base.
5. **Varianti private** — aggiungi i tuoi materiali con un codice unico per azienda.
6. **Importa / Esporta** — Excel + ZIP per le foto, mappatura automatica alle categorie di sistema.

## Gerarchia dei prezzi

Azienda (override personale) > Utente Globale > Sistema (catalogo predefinito).`,
    tips: [
      'Gli override dell\'azienda non sono visibili ad altre aziende — strettamente isolato tramite RLS.',
      'Le immagini dei materiali hanno un cachebusting con timestamp per vedere immediatamente la nuova versione.',
    ],
    warnings: [
      'Il ripristino di un prezzo elimina l\'override e non è possibile annullarlo — verifica prima di procedere.',
    ],
  },
  {
    id: 'settings-team', category: 'setari', roles: ['all'], order: 3,
    title: 'Impostazioni Team & Permessi',
    content: `# Impostazioni → Team

Invita membri del team e gestisci i permessi per i moduli.

## Passaggi

1. **Invita membro** — email; riceve un link per la registrazione.
2. **Ruolo** — Abbonato (vendite), Produzione, Montaggio, Admin azienda.
3. **Moduli consentiti** — spunta l'accesso: Ordini, Produzione, Magazzino, Fatturazione, Assistenza, ecc.
4. **Attivazione/Disattivazione** — mantieni lo storico, blocchi solo il login.
5. **Trasferisci admin** — con un solo clic, a un altro membro.
6. **Tracciabilità** — tutte le azioni vengono registrate con \`created_by\`.

## Livelli di accesso

- **Basic (60)** — Ordini + 1-2 calcolatori.
- **Plus (100)** — Tutti i calcolatori + Magazzino.
- **Operational (150)** — Tutto, inclusi Assistenza, Montaggio, Ottimizzazione.

## Fatturazione

L'abbonamento è legato al **proprietario dell'azienda** — i dipendenti sono gratuiti.`,
    tips: [
      'Riparazione account orfano (admin) — gli utenti senza azienda possono essere assegnati manualmente.',
    ],
  },
  {
    id: 'pricing-client-types', category: 'setari', roles: ['all'], order: 9,
    title: 'Ricarico per tipo di cliente (Privato / Azienda / Distributore)',
    image: '/manual/setari-adaos-tip-client.png',
    imageAlt: 'Impostazioni → Ricarico Clienti — Privato, Azienda, Distributore',
    content: `# Ricarico percentuale per tipo di cliente

In **Impostazioni → Ricarico Clienti** puoi definire **3 listini prezzi differenziati** partendo dallo stesso catalogo, senza duplicare gli articoli.

## I 3 tipi

- **Privato** — clienti finali (retail). Tipicamente qui si imposta un ricarico positivo (es.: +10% … +20%) perché non beneficiano di sconti commerciali.
- **Azienda** — aziende e partner commerciali. Di solito si lascia **0%** (prezzo base).
- **Distributore** — partner di rivendita. Qui di solito si imposta un **valore negativo** (es.: −10% … −25%) per offrire loro un prezzo preferenziale.

## Come funziona

- La percentuale si applica **automaticamente** sul prezzo base di ogni articolo dell'offerta (vetro, accessori, manodopera, kit).
- Valori **positivi** = ricarico sul prezzo standard. Valori **negativi** = sconto.
- Il campo accetta valori tra **−100% e +500%**, con passo di 0,5%.
- Le modifiche diventano attive dopo aver premuto **„Salva Ricarichi"** (il pulsante in basso a destra). La scheda evidenzia le righe modificate con il badge „modificato".

## Dove si applica

In ogni **calcolatore 3D**, nella scheda **Informazioni Cliente**, c'è il selettore **Tipo Cliente** (Privato / Azienda / Distributore). Quando lo cambi:

1. Il calcolatore rileva il tipo scelto.
2. Applica automaticamente la percentuale impostata qui sul subtotale.
3. Il prezzo visualizzato nell'offerta (e più tardi nel PDF) riflette già il nuovo tipo.

## A cosa serve

- **Un unico listino di catalogo**, ma prezzi diversi per categoria di cliente — senza duplicare manualmente gli articoli.
- Puoi concedere **rapidamente uno sconto ai distributori** senza modificare i cataloghi di base.
- I privati possono essere fatturati con un ricarico commerciale standard, senza calcoli manuali in ogni offerta.
- Le modifiche sono **retroattive solo per le nuove offerte** — gli ordini già salvati mantengono i loro prezzi iniziali (\`full_config\` è la fonte di verità).`,
    tips: [
      'Puoi impostare valori negativi (es.: −15%) per offrire uno sconto permanente a una categoria senza toccare il catalogo.',
      'Se hai dubbi, inizia con Azienda = 0% (prezzo di riferimento) e regola gli altri due in relazione ad esso.',
      'Il selettore Tipo Cliente nel calcolatore viene memorizzato nell\'offerta, quindi un\'offerta riaperta mantiene il tipo scelto inizialmente.',
    ],
    warnings: [
      'La modifica della percentuale influisce solo sulle nuove offerte. Gli ordini esistenti devono essere modificati se si desidera ricalcolarli.',
    ],
  },
  {
    id: 'pricing-overview', category: 'setari', roles: ['all'], order: 10,
    title: 'Prezzi — Panoramica generale',
    image: '/manual/setari-preturi.png',
    imageAlt: 'Impostazioni → Prezzi — elenco categorie',
    content: `# Impostazioni → Prezzi

Qui controlli **tutti i prezzi** utilizzati nei calcolatori 3D, nelle offerte e nei PDF.

## Categorie disponibili

- **Accessori** — cerniere, maniglie, barre, rotelle, fermi, guarnizioni, connettori
- **Vetro** — per spessore e tipo (chiaro, opaco, fumé, specchio)
- **Manodopera** — montaggio, taglio, lucidatura, foratura, intaglio
- **Profili** — U, a parete, angolo 90°, profili scorrevoli
- **Kit** — gruppi di accessori venduti come un unico articolo
- **Meccanismi scorrevoli** — sistemi completi (con profilo + rotelle + fermi)

## Catalogo globale vs override personale

- Il **catalogo globale** (gestito dall'admin) è il punto di partenza — lo vedi automaticamente.
- Quando modifichi un prezzo o una deduzione, viene salvato un **override personale** nel tuo spazio (\`pricing_config\`). Il catalogo globale rimane intatto.
- Puoi sempre ripristinare l'override con il pulsante **„Ripristina al valore di catalogo"** (vedi la sezione dedicata).

## Valuta

I prezzi sono memorizzati internamente in **RON**. Il selettore **RON / EUR** nella barra superiore converte solo la visualizzazione — non viene effettuata alcuna conversione nel database.`,
    tips: [
      'Il filtro di ricerca funziona su tutte le categorie contemporaneamente (codice, nome, finitura).',
      'Se non vedi un articolo, verifica se lo hai disattivato dal menu sulla riga (campanella barrata).',
    ],
  },
  {
    id: 'pricing-add-accessory', category: 'setari', roles: ['all'], order: 11,
    title: 'Aggiunta nuovo accessorio',
    image: '/manual/setari-adauga-accesoriu.png',
    imageAlt: 'Finestra Aggiungi elemento — accessorio',
    content: `# Come aggiungere un nuovo accessorio

1. Vai in **Impostazioni → Prezzi** e seleziona la scheda **Accessori**.
2. Premi **„Aggiungi elemento"** (in alto a destra).
3. Compila:
   - **Codice** — unico; usato per la deduplicazione, la scansione di codici a barre e l'aggregazione nel PDF.
   - **Nome** — visualizzato nel calcolatore e nel PDF.
   - **Categoria / Tipo** — cerniera, maniglia, barra stabilizzatrice, rotelle, fermo, guarnizione, ecc.
   - **Prezzo** — nella valuta attiva (viene memorizzato in RON).
   - **U.M.** — \`pz\` per pezzi, \`ml\` per metri lineari, \`m²\` per superficie, \`kg\` per peso.
   - **Finitura & colore** — scegli tra i preset o inserisci un esadecimale personalizzato; viene utilizzato anche nel rendering 3D.
   - **Immagine** — caricata nello storage; appare nel selettore di accessori e nel PDF.
4. Spunta i **„Tipi di prodotto"** dove appare l'accessorio (doccia, porta, balaustra, specchio, pannelli, anta cucina).
5. Spunta i **„Tipi di lavorazione"** compatibili (laminato, temperato, opaco).
6. **Salva** — l'accessorio diventa immediatamente disponibile nei calcolatori selezionati.`,
    tips: [
      'Per U.M. diverse da pz puoi usare i decimali (es: 2.5 ml).',
      'Se non imposti l\'immagine, viene ereditata automaticamente dalla categoria genitore.',
    ],
    warnings: [
      'Il codice deve essere unico. Se esiste già, il sistema aggiorna l\'articolo esistente invece di crearne uno nuovo.',
    ],
  },
  {
    id: 'pricing-edit-fields', category: 'setari', roles: ['all'], order: 12,
    title: 'Modifica elemento — campi avanzati',
    image: '/manual/setari-editare-element.png',
    imageAlt: 'Finestra Modifica elemento con deduzioni vetro',
    content: `# Modifica elemento — campo per campo

Clicca sulla matita della riga (o doppio clic) per aprire **Modifica elemento**. Oltre al prezzo e all'U.M., hai questi campi tecnici:

## Prezzo & U.M.

- Il prezzo viene inserito nella valuta attiva dell'header (RON o EUR) e memorizzato internamente in RON.
- L'U.M. determina come viene moltiplicato il prezzo nel calcolatore: \`pz\` × quantità, \`ml\` × lunghezza, \`m²\` × superficie.

## Finitura & colore

- **Colore esadecimale** + **roughness** sono usati sia nel listino prezzi che nel rendering 3D — sincronizzati tramite \`MetalMaterial\`.
- Se lasci vuoto, viene ereditato dall'elemento genitore (es: una variante di profilo eredita il colore del profilo base).

## Deduzione vetro per lato (\`glass_deduction\`)

Quanti **mm** il profilo entra nel vetro su ogni lato in cui è montato. Il calcolatore sottrae automaticamente questo valore dalla dimensione lorda per ottenere il vetro effettivo da tagliare.

> Esempio: profilo a U 8 mm su vetro 8 mm laminato → \`8 + 0.38 + 8 = 16.38 mm\` deduzione totale (profili + pellicola + profili, cumulativo).

## Deduzioni dettagliate per lato (\`glass_deductions\`)

JSON con \`top\`, \`bottom\`, \`left\`, \`right\` separati. Usato quando il profilo ha valori diversi su ogni bordo (es: profilo da pavimento profondo + profilo da parete sottile). **Si cumula** con le guarnizioni.

- **\`profile_height\`** (nello stesso JSON) — sovrascrive la somma \`top + bottom\` per il profilo a U, se vuoi un singolo valore totale.

## Sovrapposizione (\`width_overlap\`)

Quanti mm si **sovrappongono** i pannelli scorrevoli sull'altro pannello o sulla parete. Il sistema sottrae questo valore dalla **larghezza utile** del kit scorrevole.

> Esempio: kit scorrevole 1200 mm con sovrapposizione 40 mm → larghezza utile effettiva 1160 mm.

## Deduzione altezza porta (\`door_height_deduction\`)

mm sottratti dall'altezza totale per la **porta su cerniere** (spazio cerniera superiore + soglia inferiore). Tipicamente 5–20 mm a seconda della cerniera.

## Deduzione altezza pannello fisso (\`fixed_panel_height_deduction\`)

Identico, ma per il pannello fisso. **Predefinito 0** — il pannello fisso non ha una deduzione automatica di 10 mm.

## Tipi prodotto / lavorazione

Spunta dove appare l'accessorio (doccia, porta, balaustra...) e quali lavorazioni supporta (laminato, temperato). Non spuntato = non appare nel rispettivo calcolatore.`,
    tips: [
      'Le deduzioni sono **cumulative**: profilo + guarnizione + pellicola laminata si sommano sullo stesso lato.',
      'Le cerniere si misurano dall\'**alto verso il basso**, la maniglia dal **basso verso l\'alto** — è una convenzione mantenuta in tutti i calcolatori.',
      'Il sistema scorrevole **non usa cerniere** — il campo quantità cerniere rimane automaticamente a 0.',
    ],
    warnings: [
      'Qualsiasi modifica alle deduzioni influisce immediatamente su **tutti i futuri calcoli 3D**, comprese le offerte non confermate. Gli ordini già salvati hanno i dati congelati in `full_config` e non vengono modificati.',
    ],
  },
  {
    id: 'pricing-add-glass', category: 'setari', roles: ['all'], order: 13,
    title: 'Aggiunta tipo di vetro',
    image: '/manual/setari-sticla.png',
    imageAlt: 'Impostazioni → Prezzi → Vetro',
    content: `# Vetro

1. Scheda **Vetro** → **„Aggiungi elemento"**.
2. Scegli lo **spessore**: 4 / 6 / 8 / 10 / 12 mm.
3. Scegli il **tipo**: chiaro, fumé, opaco (sabbiato), specchio, bronzo, grigio.
4. Imposta il **prezzo / m²** (nella valuta attiva).
5. Spunta le **lavorazioni** disponibili per questo vetro: temperato, laminato, lucidato, opaco.

## Tempera

Per la tempera il prezzo viene calcolato con la formula:

\`\`\`text
Prezzo tempera = Prezzo_base_tempera × Spessore_mm × Superficie_m²
\`\`\`

Imposti un unico prezzo base; il sistema applica automaticamente la formula in base allo spessore e all'area del vetro.

## Laminato

Nel vetro laminato, le deduzioni sui lati si cumulano con lo **spessore della pellicola** (predefinito 0.38 mm) su ogni bordo. Vedi l'esempio nella sezione „Modifica elemento".`,
    tips: [
      'Il vetro opaco (sabbiato) ha di solito un ricarico percentuale rispetto a quello chiaro — lo configuri come moltiplicatore nel campo della lavorazione.',
    ],
  },
  {
    id: 'pricing-add-labor', category: 'setari', roles: ['all'], order: 14,
    title: 'Aggiunta manodopera',
    image: '/manual/setari-manopera.png',
    imageAlt: 'Impostazioni → Prezzi → Manodopera',
    content: `# Manodopera

1. Scheda **Manodopera** → **„Aggiungi elemento"**.
2. Scegli il **tipo**: montaggio, taglio, lucidatura bordi, foratura, intaglio, trasporto.
3. Imposta l'**U.M.**:
   - \`ora\` — per il montaggio
   - \`ml\` — per la lucidatura dei bordi
   - \`pz\` — per fori, intagli
   - \`m²\` — per la manodopera di superficie
4. **Prezzo** per unità.
5. **Percentuale vs valore fisso** — spunta se è un moltiplicatore (es: 15% sul valore del vetro) o una somma fissa.
6. Associa ai **tipi di prodotto** dove si applica automaticamente.`,
    tips: [
      'La manodopera percentuale non è influenzata dal selettore EUR/RON — rimane la stessa in qualsiasi valuta.',
    ],
  },
  {
    id: 'pricing-add-kit', category: 'setari', roles: ['all'], order: 15,
    title: 'Kit di accessori',
    image: '/manual/setari-kituri.png',
    imageAlt: 'Impostazioni → Kit',
    content: `# Kit

Un **kit** è un gruppo di accessori venduto come un unico articolo. Utile per sistemi scorrevoli per doccia: il kit include profilo, rotelle, fermi, guida.

## Creazione del kit

1. Vai in **Impostazioni → Kit** (o la scheda Kit in Prezzi).
2. **„Aggiungi kit"** → codice, nome, **prezzo kit** (finale), **larghezza utile** coperta.
3. Aggiungi **componenti** — selezioni dall'elenco di accessori e inserisci la quantità.
4. I componenti sono **deduplicati per codice** — se lo stesso codice appare due volte, le quantità vengono sommate.

## Utilizzo nel calcolatore

Nel calcolatore per **doccia scorrevole**, scegli il kit dal menu a tendina. Il sistema calcola:

\`\`\`text
Larghezza utile effettiva = Larghezza_kit - width_overlap
\`\`\`

e applica automaticamente **0 cerniere** (il sistema scorrevole non ha cerniere).
`,
    tips: [
      'I prezzi dei componenti sono informativi — **il prezzo del kit prevale** nell\'offerta.',
      'L\'immagine del kit appare nel PDF; se manca, viene usata l\'immagine del profilo principale.',
    ],
  },
  {
    id: 'pricing-reset', category: 'setari', roles: ['all'], order: 16,
    title: 'Ripristino al valore di catalogo',
    image: '/manual/setari-reset.png',
    imageAlt: 'Pulsante Ripristina al valore di catalogo',
    content: `# Ripristino override personale

Se hai modificato un prezzo o una deduzione e vuoi tornare al **valore standard del catalogo globale**:

1. Apri **Modifica elemento**.
2. Premi **„Ripristina al valore di catalogo"** (in basso a sinistra nella finestra).
3. Il tuo override in \`pricing_config\` viene eliminato e l'articolo mostra di nuovo il valore dell'admin.

> Il ripristino influisce **solo sull'articolo in questione**. Gli altri tuoi override rimangono intatti.`,
    warnings: [
      'L\'azione è immediata e non può быть annullata. Se hai bisogno di uno storico, esporta i prezzi (Impostazioni → Esporta dati) prima del ripristino.',
    ],
  },

  // ====== New sections — for subscribers ======
// ====== Secțiuni noi — pentru abonați ======
  {
    id: 'dashboard-home', category: 'introducere', roles: ['all'], order: 0,
    title: 'Dashboard principale',
    image: '/manual/dashboard-home.png',
    imageAlt: 'Dashboard principale',
    content: `# Dashboard principale

Dopo l'accesso, arrivi alla **pagina iniziale (\`/\`)** — un pannello di controllo con gli indicatori chiave della tua attività, aggiornati in tempo reale.

## Cosa vedi

- **KPI in alto**: fatturato, ordini in lavorazione, ordini consegnati nel mese corrente, valore medio dell'ordine.
- **Grafico vendite** degli ultimi 12 mesi (barre, con confronto anno precedente).
- **Grafico ricavi** per categorie di prodotti (doccia, porte, balaustre, specchi, cucina, pannelli).
- **Prodotti più venduti** nel periodo selezionato.
- **Scorta critica** — materiali con quantità al di sotto della soglia minima configurata.
- **Ordini recenti** — gli ultimi 10 ordini con stato e cliente, con click diretto sull'ordine.

## Filtri

Il selettore **RON / EUR** nella barra superiore influisce su tutti i valori visualizzati qui (conversione dinamica, IVA esclusa).
`,
    tips: [
      'Il dashboard si ricarica automaticamente ad ogni cambio di valuta o lingua.',
      'Per una visione operativa (produzione, installazione, assistenza) utilizza il menu *Dashboard Operativo*.',
    ],
  },
  {
    id: 'announcements', category: 'introducere', roles: ['all'], order: 3,
    title: 'Annunci e notifiche',
    image: '/manual/announcements.png',
    imageAlt: 'Annunci e notifiche',
    content: `# Annunci e notifiche

L'icona 🔔 **campanella gialla** nella barra superiore mostra gli annunci pubblicati dal team di iSoftGlass: aggiornamenti, nuove funzionalità, manutenzione pianificata.

## Come funziona

- Il numero rosso sulla campanella = annunci **non letti**.
- Cliccando sulla campanella si apre l'elenco: ogni annuncio ha un titolo, una categoria (**Update** o **Info**), una data e il contenuto completo.
- Gli annunci vengono contrassegnati automaticamente come letti quando li apri.
- Gli annunci importanti di tipo **Update** appaiono anche come **notifica nella parte superiore della pagina** al rilascio di una nuova versione.

## Categorie

- **Update** — nuova versione, funzionalità aggiunte, correzioni.
- **Info** — informazioni generali, consigli, eventi.

Gli annunci vengono tradotti automaticamente nella lingua della tua interfaccia.
`,
    tips: [
      'Controlla periodicamente gli annunci per scoprire nuove funzionalità che possono farti risparmiare tempo.',
    ],
  },
  {
    id: 'currency-language', category: 'introducere', roles: ['all'], order: 4,
    title: 'Valuta e lingua',
    image: '/manual/currency-language.png',
    imageAlt: 'Valuta e lingua',
    content: `# Valuta e lingua

## Selettore RON / EUR

Il pulsante **RON / EUR** nella barra superiore cambia la valuta visualizzata in tutta l'applicazione: calcolatori 3D, offerte, ordini, report, dashboard.

- La **memorizzazione interna** avviene **sempre in RON**. L'EUR è solo una visualizzazione, calcolata dinamicamente al tasso di cambio impostato in *Impostazioni → Azienda*.
- **Tutti i valori sono IVA esclusa** nei calcoli interni; l'IVA viene applicata solo al momento della generazione della fattura.
- Puoi inserire valori in EUR — vengono convertiti automaticamente in RON al salvataggio.

## Selettore lingua

Il pulsante **🇮🇹 IT** apre l'elenco delle **9 lingue disponibili**: Rumeno, Inglese, Italiano, Tedesco, Polacco, Francese, Spagnolo, Olandese, Croato.

- Il cambio di lingua influisce **solo sull'interfaccia** (menu, pulsanti, etichette, manuale).
- I dati inseriti da te (nomi dei clienti, descrizioni, note) rimangono nella lingua originale.
- L'impostazione viene mantenuta per il tuo account tra una sessione e l'altra.
`,
    tips: [
      'Il tasso di cambio dell\'EUR si aggiorna solo quando lo modifichi manualmente in Impostazioni → Azienda.',
      'Il manuale utente è tradotto integralmente in tutte e 9 le lingue.',
    ],
  },
  {
    id: 'working-in-eur', category: 'introducere', roles: ['all'], order: 5,
    title: 'Lavorare esclusivamente in EUR (consigliato per abbonati non-RO)',
    image: '/manual/working-in-eur.png',
    imageAlt: 'Impostazioni → Prezzi — Cambio EUR',
    content: `# Lavorare esclusivamente in EUR

Questa guida è per gli abbonati che lavorano **100% in EUR** — acquistano dai fornitori in EUR e vendono ai clienti in EUR, senza mescolare RON nel catalogo.

## Come funziona la memorizzazione interna

- Tutti i prezzi sono salvati nel database come un singolo numero.
- L'etichetta tecnica interna è "RON", ma è **irrilevante per te** — non la vedi mai nell'interfaccia.
- L'interruttore **EUR** nella barra superiore esegue una conversione di visualizzazione usando il cambio impostato in *Impostazioni → Prezzi*.

## Il problema che eviti

Se lasci il cambio predefinito (es. \`Cambio EUR = 4,97\`) e inserisci una cerniera a **100 EUR**, il sistema memorizza internamente \`497\`. Domani, se il cambio diventa \`5,02\`, lo stesso prodotto appare come **99,00 EUR** nel catalogo — senza che tu abbia modificato nulla.

Questo "drift" è matematicamente corretto ma crea confusione e sembra un bug.

## Configurazione consigliata — 3 passi

1. **Impostazioni → Prezzi** → imposta **Cambio EUR = 1**.
2. Nella barra superiore, seleziona **EUR** come valuta attiva.
3. Inserisci tutti i prezzi direttamente in EUR in *Impostazioni → Prezzi* (e negli ordini nuovi).

## Cosa guadagni

- I prezzi rimangono **assolutamente stabili** — 100 EUR oggi = 100 EUR tra un anno.
- Zero conversione al salvataggio, **zero drift**.
- PDF di preventivi, ordini e report escono naturalmente in EUR.
- Gli ordini storici non si "muovono" più nel tempo.

## Cosa NON cambia

- L'etichetta tecnica "RON" rimane nel database (invisibile nell'interfaccia).
- Tutta la logica dell'app funziona in modo identico — nessuna funzionalità persa.

## Limitazioni — quando NON usare questa configurazione

- Se hai **fornitori in RON** e clienti in EUR (flusso misto) → ti serve il cambio reale.
- Se lavori in un'altra valuta (PLN, HRK, ecc.) → contatta il team iSoftGlass per un'estensione.
`,
    tips: [
      'Impostare Cambio EUR = 1 influisce solo sulla conversione di visualizzazione — non modifica alcun valore già salvato.',
      'Consigliato fare questa configurazione prima di inserire i primi prezzi nel catalogo.',
    ],
  },
  {
    id: 'production-scanner', category: 'productie', roles: ['all'], order: 2,
    title: 'Scanner di produzione (codici a barre)',
    image: '/manual/production-scanner.png',
    imageAlt: 'Scanner di produzione (codici a barre)',
    content: `# Scanner di produzione

La pagina **Produzione → Scanner** (\`/productie/scanner\`) ti permette di avanzare rapidamente gli ordini tra le fasi Kanban utilizzando uno **scanner di codici a barre CODE128** collegato come tastiera HID.

## Come funziona

1. Apri la pagina **Scanner**. Il campo di input ha l'autofocus permanente.
2. **Scansiona il codice a barre** dalla scheda di produzione o dall'etichetta del prodotto.
3. L'applicazione identifica automaticamente l'ordine e lo **fa avanzare alla fase successiva** del Kanban (es: *Taglio* → *Levigatura*, *Levigatura* → *Tempera*).
4. La conferma appare sullo schermo con un suono e un colore verde; l'errore (codice sconosciuto) con il rosso.

## Requisiti

- Scanner CODE128 configurato come **tastiera HID** (modalità standard, senza driver).
- Suffisso **Invio (\\r)** dopo ogni scansione (impostazione predefinita sulla maggior parte dei modelli).

## Vantaggi

- L'operatore non deve più cercare manualmente gli ordini nel Kanban.
- Tracciabilità completa: il tempo di ogni fase viene salvato automaticamente.
- Funziona anche su tablet con scanner Bluetooth.
`,
    tips: [
      'Se perdi il focus sul campo di input (cliccando altrove), una semplice scansione lo ripristina automaticamente.',
      'Il campo ignora la digitazione manuale più lenta di 50ms — solo lo scanner attiva l\'avanzamento.',
    ],
    warnings: [
      'La scansione di un codice che si trova già nell\'ultima fase non produce alcun effetto — l\'ordine rimane lì.',
    ],
  },
  {
    id: 'processing-cad', category: 'productie', roles: ['all'], order: 3,
    title: 'Lavorazioni ed Editor CAD',
    image: '/manual/processing-cad.png',
    imageAlt: 'Lavorazioni ed Editor CAD',
    content: `# Lavorazioni ed Editor CAD

La pagina **Lavorazioni** (\`/prelucrari\`) è l'officina tecnica per le schede di produzione: fori, cerniere, maniglie, intagli, lavorazioni del bordo — tutto visualizzato sul vetro in un editor CAD interattivo.

## Scheda di lavorazione

- Elenco completo dei pannelli dell'ordine (con dimensioni e tipo di vetro).
- Per ogni pannello: elenco delle lavorazioni (codice modello + parametri: distanza, diametro, offset).
- Molte lavorazioni si **compilano automaticamente** dalla configurazione 3D (cerniere, maniglie, serrature) — modifichi solo le eccezioni.

## Editor CAD — scorciatoie da tastiera

| Tasto | Azione |
|---|---|
| **J** | JOIN — unisce due lavorazioni vicine (tolleranza 10mm) |
| **Ctrl + D** | Duplica la lavorazione selezionata |
| **Ctrl + Shift + D** | Duplica **tutte** le lavorazioni su un altro pannello (specchiatura automatica sull'asse X) |
| **Delete** | Elimina la lavorazione selezionata |
| **Click sinistro + trascina** | Sposta la lavorazione |
| **Rotellina mouse** | Zoom |

## Modelli

Il catalogo **Modelli di lavorazione** (categorie: **30. cerniere & cutout**, **51. fori per maniglie**) si sincronizza automaticamente con gli accessori scelti nel 3D. L'aggiunta di una nuova cerniera nel catalogo genera il cutout corretto sul vetro.

## Esportazione

- **DXF** (R9 → R2010) — per CNC industriale, con mappatura dei layer.
- **PDF** — per l'officina, con quote e legenda delle lavorazioni.
- Il pulsante **"Invia al CNC"** genera DXF + lista di taglio combinata.
`,
    tips: [
      'Il passo di posizionamento è 0.5mm; usa la virgola per i decimali.',
      'Gli elementi non selezionati sono visualizzati in nero — seleziona per vedere le quote e i parametri.',
    ],
    warnings: [
      'Le modifiche al pannello si salvano solo quando premi **Salva lavorazione** — cambiare pagina senza salvare le perde.',
    ],
  },
  {
    id: 'operational-dashboard', category: 'operational', roles: ['all'], order: 0,
    title: 'Dashboard Operativo',
    image: '/manual/operational-dashboard.png',
    imageAlt: 'Dashboard Operativo',
    content: `# Dashboard Operativo

La pagina **Dashboard Operativo** (\`/operational\`) è il pannello unico per l'officina e la logistica: vedi in tempo reale cosa succede in produzione, installazione, assistenza e taglio.

## Schede riassuntive

- **Produzione**: numero di ordini in ogni fase Kanban (taglio, levigatura, tempera, assemblaggio, imballaggio).
- **Installazione**: lavori programmati oggi / questa settimana, ritardi.
- **Assistenza**: interventi aperti, priorità, SLA.
- **Taglio**: pannelli in coda di ottimizzazione, vetro allocato per lastra.

## Aggiornamento automatico

La pagina si ricarica **automaticamente ogni 60 secondi** — puoi lasciare uno schermo TV in officina che la visualizza permanentemente.

## Azioni rapide

- Cliccando su qualsiasi scheda si accede direttamente alla pagina dettagliata (Kanban di produzione, elenco installazioni, ecc.).
- Il pulsante **"Aggiorna ora"** forza l'aggiornamento immediato.
`,
    tips: [
      'Usa questa pagina su un grande schermo in officina per una visibilità a livello di team.',
      'Per gli indicatori finanziari (fatturato, margini) usa il Dashboard principale.',
    ],
  },
  {
    id: 'reports', category: 'operational', roles: ['all'], order: 3,
    title: 'Report',
    image: '/manual/reports.png',
    imageAlt: 'Report',
    content: `# Report

La pagina **Report** (\`/rapoarte\`) ti offre una visibilità completa sulle vendite e sul consumo di materiali.

## Report disponibili

1. **Vendite mensili** — fatturato mensile, suddiviso per categorie (doccia, porte, balaustre, ecc.) e per operatore di vendita.
2. **Consumo materiali** — quantità di vetro, profili e accessori consumati in un intervallo, aggregate per codice prodotto.
3. **Top clienti** — classifica per valore degli ordini nel periodo selezionato.
4. **Margini** — differenza tra costo di produzione e prezzo di vendita, per ordine.

## Filtri

- **Intervallo di date** (calendario da / a).
- **Categoria prodotto**.
- **Operatore** (venditore).
- **Stato ordine** (offerta, confermato, in produzione, consegnato).

## Esportazione

Tutti i report vengono esportati in **CSV** con **BOM UTF-8** (Excel apre correttamente i caratteri speciali italiani).

I valori rispettano il selettore globale **RON / EUR**.
`,
    tips: [
      'Per l\'analisi esterna in Excel, usa l\'esportazione CSV — il BOM garantisce che i caratteri speciali vengano visualizzati correttamente.',
      'I filtri vengono salvati per il tuo account tra le sessioni.',
    ],
  },
  {
    id: 'installation-reports', category: 'operational', roles: ['all'], order: 4,
    title: 'Report installazioni',
    image: '/manual/installation-reports.png',
    imageAlt: 'Report installazioni',
    content: `# Report installazioni

La pagina **Report installazioni** (\`/rapoarte-montaj\`) monitora le prestazioni dei team di installazione e ottimizza la pianificazione.

## Cosa vedi

- **Prestazioni per team**: numero di installazioni completate, tempo medio per lavoro, distanza percorsa.
- **Mappa con percorsi ottimizzati** — il sistema propone l'ordine ottimale dei lavori della giornata per ogni team (algoritmo di minimizzazione della distanza).
- **Checklist di completamento** — percentuale di checklist completate correttamente, firme dei clienti.
- **Incidenti** — lavori posticipati, reclami, resi.

## Filtri

- **Intervallo** (giorno / settimana / mese).
- **Team** o **veicolo**.
- **Area geografica**.

## Azioni rapide

- Cliccando su un lavoro si aprono i dettagli completi: cliente, indirizzo, prodotti, foto prima/dopo, firma.
- Il pulsante **"Ripianifica"** sposta il lavoro nel calendario senza perdere la checklist completata.
`,
    tips: [
      'Il percorso ottimizzato tiene conto del programma di ogni team e delle fasce orarie confermate con i clienti.',
      'Gli avvisi di revisione/assicurazione per i veicoli appaiono 30 giorni prima della scadenza.',
    ],
  },
  {
    id: 'data-export', category: 'setari', roles: ['all'], order: 17,
    title: 'Esportazione e importazione dati',
    image: '/manual/export-date.png',
    imageAlt: 'Impostazioni › Dati — esportazione e importazione',
    accent: 'green',
    content: `# Esportazione e importazione dati

In **Impostazioni → Dati** hai il pieno controllo sui dati inseriti nella piattaforma. Tutti i dati appartengono all'abbonato, sono strettamente isolati per azienda (RLS su \`company_id\`) e **possono essere esportati o reimportati in qualsiasi momento, senza alcuna restrizione**.

---

## 1. Esportazione dati

![Area di esportazione](/manual/export-date.png)

La card **Esportazione dati** offre 5 pulsanti:

- **Clienti (CSV)** — elenco completo con nome, tipo, azienda, contatto, indirizzo, P.IVA, sconto, note.
- **Preventivi (CSV)** — tutti i preventivi con n. ref, prodotto, cliente, prezzo, IVA, ricarico, stato, data.
- **Ordini (CSV)** — ordini con numero, stato, subtotale, sconto, totale, pagato, consegna, note.
- **Materiali (CSV)** — catalogo proprio con codice, nome, tipo, unità, prezzo, stock, fornitore, posizione.
- **Esportazione completa (JSON)** — un unico file con tutte le 4 tabelle + timestamp (\`exported_at\`).

### Come esportare

1. Vai a **Impostazioni → tab Dati**.
2. Clicca il pulsante della categoria desiderata (o **Esportazione completa** per tutto).
3. Il file viene scaricato automaticamente. Il nome contiene la data: \`clienti_2026-05-22.csv\`, \`export_completo_2026-05-22.json\`.
4. Apri CSV in Excel / LibreOffice (BOM UTF-8 garantisce i caratteri corretti) o JSON in un editor di testo.

> **Importante per gli abbonati:** hai il diritto GDPR alla **portabilità dei dati**. Puoi esportare e conservare localmente tutti i tuoi dati, sempre e quante volte vuoi, senza limiti.

---

## 2. Importazione dati

![Area di importazione](/manual/export-date-import.png)

La card **Importazione dati** ti consente di ricaricare nella piattaforma file CSV (per categoria) o un JSON completo salvato in precedenza. Utile per:

- **migrazione** da un altro sistema (prepara il CSV con gli stessi header dell'esportazione),
- **ripristino** dopo una cancellazione accidentale (con l'ultima esportazione completa),
- **caricamento massivo** di clienti, materiali o preventivi.

### Come importare

1. Nella card **Importazione dati** clicca il pulsante della categoria (Clienti / Preventivi / Ordini / Materiali) per CSV, o **Importazione completa** per JSON.
2. Seleziona il file dal computer.
3. Si apre un **dialogo di anteprima** che mostra: tabella di destinazione, numero di record rilevati e prime colonne trovate.
4. Verifica i dati e clicca **Conferma importazione** (o Annulla).
5. Alla fine appare un toast con il numero di righe importate con successo / errori.

### Chiavi di conflitto (duplicati)

L'importazione usa una chiave univoca per tabella:

| Tabella | Chiave di conflitto |
|---|---|
| Clienti | \`name\` |
| Preventivi | \`ref_number\` |
| Ordini | \`order_number\` |
| Materiali | \`code\` |

Le righe con chiave già esistente possono essere **sovrascritte** — esporta prima dell'importazione se vuoi una copia di sicurezza.

### Formato atteso

- **CSV** — stesso set di header dell'esportazione, codifica UTF-8.
- **JSON** — esattamente la struttura prodotta da **Esportazione completa** (\`clients\`, \`quotes\`, \`orders\`, \`materials\` + \`exported_at\`).

---

## Dettagli tecnici

- L'esportazione scarica **tutti i record**, con paginazione automatica da 1000 in background.
- L'importazione processa lotti di 100 righe e inietta automaticamente il contesto azienda (RLS).
- Tutto ciò che esporti/importi è isolato alla tua azienda.
`,
    tips: [
      'Fai mensilmente un esportazione completa (JSON) — è la forma più sicura di backup locale.',
      'Prima di qualsiasi importazione massiva, esporta la tabella di destinazione per avere la versione precedente a portata di mano.',
      'Per CSV con caratteri speciali, apri in Excel tramite *Dati → Da testo/CSV* con UTF-8.',
    ],
  },
  {
    id: 'data-protection', category: 'setari', roles: ['all'], order: 18,
    title: 'Protezione dei dati',
    image: '/manual/protectia-datelor.png',
    imageAlt: 'Schede Backup / Ripristino / Sicurezza',
    content: `# Protezione dei dati

La sicurezza e la disponibilità dei tuoi dati sono la massima priorità. La piattaforma gira su **infrastruttura Lovable Cloud**, con protezione multi-livello e conformità GDPR.

## Backup automatico

- **Backup automatico giornaliero**, senza interventi da parte tua.
- Storico mantenuto per almeno 7 giorni (Point-in-Time Recovery).
- I backup sono cifrati e archiviati in modo ridondante su data center europei.

## Ripristino

- In caso di perdita accidentale (cancellazione errata, importazione difettosa), i dati possono essere ripristinati su richiesta tramite il team di supporto.
- Raccomandiamo anche l\'**esportazione locale periodica** (vedi sezione *Esportazione dati*) come ulteriore livello di sicurezza sotto il tuo pieno controllo.

## Sicurezza

- **Isolamento multi-tenant rigoroso** tramite Row-Level Security su \`company_id\`.
- **Cifratura in transito** (HTTPS/TLS) e **a riposo** su disco.
- **JWT** per le sessioni, **hashing forte** per le password.
- Controllo **HIBP (Have I Been Pwned)** alla creazione account e al cambio password.
- Data center europei, conformità **GDPR**.

## I tuoi diritti GDPR

| Diritto | Come esercitarlo |
|---|---|
| Portabilità | Esporta da Impostazioni → Dati |
| Accesso | Vedi tutti i tuoi dati nella piattaforma |
| Rettifica | Modifica qualunque campo nelle interfacce dedicate |
| Cancellazione | Su richiesta via supporto (\`isoftplustech@gmail.com\`) |

## Raccomandazioni utente

- Usa una **password forte e unica** per il tuo account.
- Non condividere l\'account — per i colleghi crea utenti dedicati (Impostazioni → Team).
- **Logout** su dispositivi pubblici o condivisi.
- Esegui un\'**esportazione mensile** e conserva il file in luogo sicuro.
- Consulta la [Privacy Policy](/privacy-policy) e la [Cookie Policy](/cookie-policy) per i dettagli completi.
`,
    tips: [
      'I tuoi dati restano tuoi: puoi sempre esportarli in formato aperto (CSV/JSON).',
      'La combinazione più sicura: backup automatico piattaforma + esportazione locale mensile.',
    ],
    warnings: [
      'Non inviare mai la password via email, chat o telefono — il supporto non te la chiederà mai.',
    ],
  },
];
