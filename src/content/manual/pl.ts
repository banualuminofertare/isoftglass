import type { ManualSection, ManualCategory } from './types';

export const categoriesPL: ManualCategory[] = [
  { id: 'introducere', label: 'Pierwsze kroki', order: 1 },
  { id: 'calculatoare', label: 'Konfiguratory 3D', order: 2 },
  { id: 'vanzari', label: 'Sprzedaż', order: 3 },
  { id: 'productie', label: 'Produkcja', order: 4 },
  { id: 'operational', label: 'Operacyjne', order: 5 },
  { id: 'setari', label: 'Ustawienia', order: 6 },
];

export const sectionsPL: ManualSection[] = [
  {
    id: 'getting-started', category: 'introducere', roles: ['all'], order: 1,
    title: 'Witaj w iSoftGlass',
    image: '/manual/setari-companie.png',
    imageAlt: 'Ekran iSoftGlass — Informacje o firmie',
    content: `# Witaj w iSoftGlass

iSoftGlass to platforma **SaaS** dla producentów i dystrybutorów szkła. Obejmuje cały proces: konfiguracja 3D → oferta → zamówienie → produkcja → dostawa → serwis.

## Co możesz zrobić w 5 minut

1. **Uzupełnij dane firmy** w *Ustawienia → Firma* (CUI, adres, IBAN, logo).
2. **Sprawdź ceny** w *Ustawienia → Cenniki* — standardowy katalog jest ładowany automatycznie, dostosowujesz tylko to, co się różni.
3. **Dodaj pierwszego klienta** w *Klienci → Nowy klient* (lub pozwól, aby utworzył się automatycznie podczas zapisywania pierwszej oferty).
4. **Otwórz konfigurator 3D** z menu bocznego (np. *Kabiny prysznicowe*) i skonfiguruj produkt w 6 krokach.
5. **Zapisz jako ofertę** — pojawi się w *Zamówieniach* z gotowym plikiem PDF do wysłania.
6. **Prześlij na produkcję**, gdy klient potwierdzi — stan magazynowy zostanie automatycznie zaktualizowany.`,
    tips: [
      'Górny pasek ma przełącznik RON / EUR — ceny wewnętrzne są zawsze w RON, zmiana waluty służy tylko do celów wyświetlania.',
      'Naciśnij ikonę 📖 (turkusowa) w dowolnym momencie, aby ponownie otworzyć tę instrukcję dokładnie na bieżącej sekcji.',
    ],
  },
  {
    id: 'header-icons', category: 'introducere', roles: ['all'], order: 2,
    title: 'Górny pasek i skróty',
    content: `# Górny pasek

W prawym górnym rogu znajdują się wszystkie polecenia globalne:

1. 🔔 **Żółty dzwonek (amber)** — ogłoszenia i nowości publikowane przez zespół iSoftGlass. Czerwona liczba = nieprzeczytane ogłoszenia.
2. 📖 **Instrukcja (turkusowy kontur)** — instrukcja, którą właśnie przeglądasz. Otwiera się na sekcji odpowiedniej dla bieżącej strony.
3. **RON / EUR** — zmienia walutę wyświetlaną w całej aplikacji. Przeliczenie wykorzystuje kurs z *Ustawienia → Firma*.
4. **🇵🇱 PL** — selektor języka. Obsługujemy 9 języków (RO, EN, IT, DE, PL, FR, ES, NL, HR).
5. **Wyloguj** — bezpieczne wylogowanie z konta.

## Panel boczny — menu lewe

- **Główne** — Pulpit, Konfiguratory 3D, Ustawienia
- **Operacyjne** — Zamówienia, Produkcja, Skaner, Klienci, Raporty, Montaż
- Kliknij przycisk **⬅** obok logo, aby zwinąć panel boczny (więcej miejsca na ekranie).`,
    tips: [
      'Wewnętrzne przechowywanie cen odbywa się zawsze w RON — zmiana na EUR ma charakter wyłącznie informacyjny.',
      'Zmiana języka wpływa tylko na interfejs; wprowadzone dane pozostają w oryginalnym języku.',
    ],
  },
  {
    id: 'calc-flow-6-steps', category: 'calculatoare', roles: ['all'], order: -1,
    title: '6 kroków w konfiguratorze 3D',
    image: '/manual/calc-step6-finalizare.png',
    imageAlt: 'Krok 6 - finalizacja oferty z danymi klienta i przyciskami PDF/Zapisz/Dodaj do koszyka',
    content: `# 6 kroków w konfiguratorze 3D

Każdy konfigurator 3D (kabina prysznicowa, drzwi, balustrada, lustro, front kuchenny, panel) przebiega według **tego samego, liniowego 6-etapowego procesu**. Na każdym kroku po prawej stronie masz podgląd 3D, który aktualizuje się w czasie rzeczywistym, a postęp jest oznaczony na górnym pasku.

---

## Krok 1 — Typ produktu

Wybierasz kształt lub typologię (np. **Narożna 90°**, **Walk-in / Wnęka**, **Pięciokątna**, **Parawan nawannowy**, **Panel stały**). Każdy typ wstępnie ładuje podstawową geometrię i listę pasujących profili.

![Krok 1 - wybór typu produktu](/manual/calc-step1-tip.png)

## Krok 2 — System otwierania

Wybierasz sposób działania: **z zawiasami** (klasyczny), **pivot** góra-dół (minimalistyczny) lub **przesuwny** na szynie (oszczędność miejsca). Wybór na tym etapie automatycznie określa, jakie akcesoria będziesz mógł dodać w Kroku 5.

![Krok 2 - system otwierania](/manual/calc-step2-dimensiuni.png)

## Krok 3 — Szkło

Ustawiasz **grubość** (6/8/10/12 mm), **wykończenie** (przezroczyste, szare, brązowe, piaskowane) oraz opcje: **powłoka hydrofobowa**, **szlifowanie krawędzi**, **hartowanie**, **laminowanie**. Cena szkła jest natychmiast przeliczana.

![Krok 3 - wybór szkła](/manual/calc-step3-sticla.png)

## Krok 4 — Konfiguracja drzwi i wymiary

Określasz **stronę otwierania** (front / bok), **kierunek** (do wewnątrz / na zewnątrz), **stronę zawiasów** (lewa / prawa) oraz **końcowe wymiary** (szerokość × wysokość × głębokość). Kliknij na dowolny wymiar w scenie 3D, aby szybko go edytować (Enter / Tab zapisuje).

![Krok 4 - drzwi i wymiary](/manual/calc-step4-profile.png)

## Krok 5 — Profile i akcesoria

Wybierasz z personalizowanych list: **profile uszczelek**, **profile U / obwodowe**, **drążki stabilizujące**, **dodatkowe zestawy**. Aby uzyskać szczegółowe informacje o działaniu tego kroku, zobacz sekcję **„Jak działają akcesoria w konfiguratorach”**.

![Krok 5 - profile i akcesoria](/manual/calc-step5-accesorii.png)

---

## Krok 6 — Finalizacja oferty (szczegółowo)

Tutaj przekształcasz konfigurację w działanie handlowe. Krok 6 ma 3 wyraźne strefy: **dane klienta**, **kwota dodatkowa i suma**, **przyciski akcji**.

![Krok 6 - finalizacja](/manual/calc-step6-finalizare.png)

### Dane klienta (Client info)

- **Typ klienta** — Osoba fizyczna / Firma / Dystrybutor. **Bardzo ważne**: wybrany tutaj typ automatycznie stosuje narzut skonfigurowany w **Ustawienia → Narzut dla Klientów**, więc wyświetlana cena uwzględnia już marżę dla danego typu.
- **Nazwa klienta** — nazwa, która pojawi się na ofercie i w pliku PDF.
- **Telefon** i **Email** — dane kontaktowe używane w CRM i do wysyłania oferty.

> Podczas zapisywania, jeśli nazwa klienta nie istnieje w bazie CRM, system **automatycznie tworzy nową kartotekę**. Jeśli istnieje, używa istniejącej (dopasowanie po nazwie).

### Kwota dodatkowa (Extra amount)

Pole **„Extra amount” / „Kwota dodatkowa”** pozwala dodać dowolną kwotę do obliczonej sumy częściowej. Do czego służy w praktyce:

- **Transport** do klienta (np. +150 RON za dostawę).
- **Dodatkowy montaż** poza standardowym pakietem.
- **Prace specjalne** (np. wiercenie w granicie, niestandardowe części).
- **Dopłata za tryb pilny**, gdy praca musi być wykonana priorytetowo.
- **Rabat handlowy** — wprowadzasz wartość **ujemną** (np. -50 RON), która zostanie odjęta od sumy.

Kwota jest dodawana do sumy częściowej **przed** VAT i pojawia się osobno w pliku PDF, w sposób transparentny dla klienta.

### Suma częściowa, VAT i suma całkowita

Karta wyświetla w czasie rzeczywistym: **Suma częściowa (bez VAT)**, **VAT %** (z ustawień) i **Suma z VAT**. Zmiana dowolnego parametru (szkło, akcesorium, kwota dodatkowa) powoduje natychmiastowe przeliczenie.

### 3 przyciski akcji

1. **Pobierz PDF** — generuje ofertę PDF (logo firmy, dane klienta, lista produktów z migawką 3D 70×47 px, akcesoria zagregowane według kodu, robocizna, suma z VAT). **Używane do** szybkiego wysłania e-mailem / WhatsApp, **bez** zapisywania w systemie. Przydatne, gdy chcesz tylko orientacyjną wycenę.

2. **Zapisz ofertę** — tworzy w bazie danych ofertę o numerze **OFR-RRRRMMDD-GGMMSS** i **zamówienie ze statusem „Oferta”**. **Używane, gdy** oferta jest wiążąca i chcesz ją później odnaleźć w **Zamówieniach**, edytować lub przekształcić w zlecenie.

3. **Dodaj do koszyka** — dodaje bieżący produkt do **aktywnego koszyka** (ikona w prawym dolnym rogu z licznikiem) **bez** finalizowania zamówienia. **Używane do** ofert z wieloma produktami: np. prysznic + lustro + front kuchenny dla tego samego klienta — dodajesz kolejno, a następnie finalizujesz cały koszyk jako jedno zamówienie.

---

## Co się dzieje po „Dodaj do koszyka”

![Koszyk z dodanymi produktami](/manual/cos-flow.png)

### 1. Koszyk (ikona w prawym dolnym rogu)

Kliknij ikonę koszyka z licznikiem, a otworzy się panel boczny **Order Products**:

- Wyświetla listę wszystkich dodanych produktów, każdy z **wymiarami**, **grubością szkła** i **ceną**.
- Przyciski **+ / -** do zmiany ilości dla każdej pozycji.
- Ikona **kosza na śmieci** (czerwona) usuwa pozycję.
- Przycisk **„Empty” / „Opróżnij”** usuwa cały koszyk.
- Na dole: **Order total** (suma wszystkich produktów).

### 2. Finalizuj zamówienie

Naciśnij **„Finalize” / „Finalizuj”**, a otworzy się okno dialogowe **Create order from cart**:

![Okno dialogowe finalizacji zamówienia](/manual/cos-finalizare.png)

- **Cart products** — podsumowanie produktów z koszyka z sumą.
- **Client** — dane klienta (pobrane automatycznie z ostatnio dodanego produktu).
- **Delivery Address** — adres dostawy / montażu.
- **Delivery Date** — szacowany termin.
- **Notes** — uwagi wewnętrzne.

Naciśnij **Create Order**: system generuje unikalny numer zamówienia i umieszcza zamówienie w **Zarządzaniu Zamówieniami** ze statusem **„Oferta”**.

### 3. W Zarządzaniu Zamówieniami

Zamówienie natychmiast pojawia się na liście. Stąd możesz:

- **Pobrać skonsolidowany PDF** (wszystkie produkty zagregowane, akcesoria zsumowane według kodu).
- **Przesłać na produkcję** — automatycznie odejmuje stan magazynowy, tworzy kartę produkcyjną i kartę Kanban.
- **Wystawić fakturę** lub **proformę (zaliczka)**.
- **Zaplanować montaż** dla ekipy instalacyjnej.
- **Otworzyć zamówienie** (klikając w wiersz), aby zobaczyć zakładki **Szczegóły / Produkty / Historia / Podgląd**.

### 4. Późniejsza edycja

Z zakładki **Produkty** danego zamówienia, przycisk **Edytuj** przenosi Cię z powrotem do oryginalnego konfiguratora z **całą konfiguracją przywróconą** z \`full_config\` — włącznie z typem klienta, kwotą dodatkową i akcesoriami. Modyfikujesz → Zapisujesz → zamówienie aktualizuje się automatycznie.`,
    tips: [
      'W Kroku 6, zmiana **Typu Klienta** między Osoba / Firma / Dystrybutor natychmiast przelicza całą sumę częściową z odpowiednim narzutem.',
      'Używaj **Pobierz PDF** do szybkich wycen e-mailowych, a **Zapisz ofertę** tylko wtedy, gdy oferta jest wiążąca — unikniesz zapełniania historii wersjami roboczymi.',
      'Koszyk pozwala skonfigurować wiele produktów dla tego samego klienta i wysłać je w **jednym zamówieniu** z jednym, zbiorczym plikiem PDF.',
      'Cała konfiguracja (włącznie z kwotą dodatkową i typem klienta) jest zapisywana w `full_config` — po ponownym otwarciu wszystko wraca do stanu, w jakim było.',
    ],
    warnings: [
      'Ujemna kwota dodatkowa (rabat) nie sprawdza, czy suma całkowita nie spadnie poniżej zera — uważaj na wprowadzaną wartość.',
      'Jeśli zmienisz ceny w Ustawieniach **po** zapisaniu oferty, stare oferty **nie** zostaną automatycznie przeliczone — zachowują pierwotne wartości.',
    ],
  },
  {
    id: 'accessory-flow', category: 'calculatoare', roles: ['all'], order: 0,
    title: 'Jak działają akcesoria w konfiguratorach',
    image: '/manual/accesorii-import.png',
    imageAlt: 'Katalog akcesoriów — przycisk Importuj do mojej listy',
    content: `# Jak działają akcesoria w konfiguratorach

Wszystkie konfiguratory 3D (Kabina prysznicowa, Drzwi, Balustrada, Lustro, Front kuchenny, Ścianki działowe) używają **tego samego systemu** dla akcesoriów: zawiasów, uchwytów, profili U, drążków stabilizujących, zestawów przesuwnych, odbojników, zamków itp.

Logika jest prosta i wykonuje się ją **tylko raz**:

> **Importujesz z katalogu → zostają zapisane w „Wybierz produkt” → używasz ich wszędzie, w każdej ofercie.**

Nie musisz szukać akcesorium na nowo przy każdym zleceniu — raz zaimportowane, pozostaje na Twojej osobistej liście, dopóki nie zdecydujesz się go usunąć.

---

## Krok 1 — Otwórz katalog akcesoriów

Przejdź do **Ustawienia → Cenniki → Akcesoria** (lub bezpośrednio **Ustawienia → Katalog akcesoriów**, w zależności od wersji interfejsu).

Tutaj widzisz globalny katalog systemu — tysiące kodów pogrupowanych według kategorii: zawiasy, uchwyty, profile U, zestawy przesuwne, uszczelki, drążki stabilizujące, odbojniki, zamki, wsporniki, zaślepki.

![Katalog akcesoriów](/manual/accesorii-import.png)

- Użyj **wyszukiwania globalnego** (na górze) — szukaj po kodzie, nazwie lub wykończeniu we wszystkich kategoriach.
- Filtry boczne zawężają wyniki do kategorii / podkategorii.

## Krok 2 — Zaimportuj potrzebne akcesoria

W wierszu każdego akcesorium z katalogu znajduje się przycisk **„Importuj”** (lub „Dodaj do mojej listy”). Kliknij go — akcesorium natychmiast trafi na **Twoją osobistą listę**, odizolowaną dla Twojej firmy (ścisłe RLS).

Zaznacz wiele wierszy i naciśnij **„Importuj zaznaczone”**, aby dodać całą grupę (np. cały zestaw zawiasów do kabin prysznicowych).

> **Robisz to tylko raz.** Po zaimportowaniu akcesorium jest dostępne dla wszystkich użytkowników w firmie, we wszystkich konfiguratorach.

## Krok 3 — Sprawdź ceny i jednostki

Na Twojej lokalnej liście każde akcesorium wyświetla:

- **Kod** i **nazwę** (pobrane z katalogu).
- **Cenę** (możesz ją nadpisać — nie wpływa to na katalog globalny).
- **Jednostkę** (szt., mb, kpl.) — obsługuje również wartości dziesiętne dla mb.
- **Dostępne wykończenie** (chrom, mat, szczotkowany itp.).

Zmień cenę bezpośrednio w komórce — zapisuje się automatycznie i natychmiast pojawia się w konfiguratorach.

## Krok 4 — W konfiguratorze otwórz „Wybierz produkt”

Wchodzisz do konfiguratora (np. **Kabiny prysznicowe**), dochodzisz do kroku **Akcesoria** (zawiasy, uchwyt, profil U, drążek itp.).

W każdym slocie, lista rozwijana **„Wybierz produkt”** wyświetla **tylko te akcesoria, które zaimportowałeś** — zawężone do odpowiedniego typu (np. w slocie Uchwyt zobaczysz tylko uchwyty).

![Lista rozwijana Wybierz produkt w konfiguratorze](/manual/accesorii-selecteaza-produs.png)

- Lista jest przejrzysta: nie gubisz się w tysiącach nieistotnych kodów.
- Szybkie wyszukiwanie na liście rozwijanej po kodzie lub nazwie.

## Krok 5 — Dostosuj ilość i wykończenie

Po wybraniu akcesorium:

- **Ilość** — dla zawiasów możesz wybrać 2 lub 3 (Twój wybór ma pierwszeństwo przed regułą automatyczną).
- **Wykończenie** — kolor/wykończenie z dostępnych wariantów (z rezerwowym odwołaniem do elementu nadrzędnego, jeśli dokładny wariant jest niedostępny).
- **Pozycja** — zawiasy mierzy się od góry do dołu, uchwyt od dołu do góry (konwencja branżowa, już skonfigurowana).

## Krok 6 — Zapisz konfigurację → akcesoria trafiają do oferty

Naciśnij **„Zapisz jako ofertę”** lub **„Dodaj do koszyka”**. Wybrane akcesoria:

1. Są dołączane do produktu z ich ceną w RON (możliwość wyświetlania w EUR).
2. Pojawiają się w **OrderPreview** i w pliku PDF oferty, automatycznie zagregowane według kodu (ten sam kod = suma ilości).
3. Są zapamiętywane w \`full_config\` JSON — źródło prawdy dla PDF, DXF i późniejszej edycji.
4. Przy przesyłaniu na produkcję, **stan magazynowy jest automatycznie pomniejszany** zgodnie z ilościami z oferty.

![Akcesorium dodane do oferty](/manual/accesorii-in-oferta.png)`,
    tips: [
      'Importujesz tylko raz — potem akcesoria pozostają w „Wybierz produkt” dla wszystkich współpracowników w firmie.',
      'Ceny można nadpisać lokalnie (dla firmy), nie wpływając na katalog systemowy.',
      'Ten sam proces stosujesz we WSZYSTKICH konfiguratorach: prysznice, drzwi, balustrady, lustra, fronty kuchenne, ścianki.',
    ],
    warnings: [
      'Jeśli usuniesz akcesorium z osobistej listy, stare oferty pozostaną ważne (konfiguracja jest zapisana w `full_config`), ale nie będziesz mógł go wybrać w nowych zleceniach, dopóki go ponownie nie zaimportujesz.',
    ],
  },
  {
    id: 'calc-shower', category: 'calculatoare', roles: ['all'], order: 1,
    title: 'Konfigurator Kabin Prysznicowych',
    image: '/manual/calc-dus.png',
    imageAlt: 'Konfigurator 3D kabiny prysznicowej',
    content: `# Konfigurator Kabin Prysznicowych

Skonfiguruj wizualnie w 3D dowolny typ kabiny: narożna 90°, walk-in, pięciokątna, nawannowa, panel stały.

## 6 kroków

1. **Typ kabiny** — wybierasz kształt (narożna 90°, wnękowa, pięciokątna, parawan nawannowy, stała).
2. **Wymiary** — kliknij na wymiar w scenie 3D, aby go edytować (Enter / Tab zapisuje).
3. **Szkło** — grubość (8/10/12 mm), wykończenie (przezroczyste, szare, brązowe), opcjonalnie hartowanie.
4. **Profile** — U, ścienny, narożny 90°, zestaw przesuwny (jeśli dotyczy).
5. **Akcesoria** — zawiasy (2 lub 3), uchwyt, drążek stabilizujący, uszczelki.
6. **Zapisz** — jako ofertę lub bezpośrednio jako nowe zlecenie.`,
    tips: [
      'Wysokość montażu zawiasów mierzy się od **góry do dołu**, a uchwytu od **dołu do góry** — to konwencja branżowa.',
      'Panel stały NIE ma domyślnie odjęcia 10 mm — odjęcia wynikają tylko ze zsumowanych profili i uszczelek.',
      'System przesuwny nie wymaga zawiasów i automatycznie oblicza zakładkę z zestawu.',
    ],
    warnings: [
      'W kabinach narożnych 90° profile U na styku są domyślnie ukrywane, aby uniknąć ich zdublowania.',
    ],
  },
  {
    id: 'calc-door', category: 'calculatoare', roles: ['all'], order: 2,
    title: 'Konfigurator Drzwi Szklanych',
    image: '/manual/calc-usa.png',
    imageAlt: 'Konfigurator 3D drzwi szklanych',
    content: `# Konfigurator Drzwi

Do drzwi wewnętrznych na zawiasach, z systemem pivot lub przesuwnych na szynie.

## Kroki

1. **System** — Na zawiasach, Pivot góra-dół, Przesuwne na szynie.
2. **Wymiary** — szerokość, wysokość, otwór drzwiowy.
3. **Szkło** — grubość i wykończenie.
4. **Uszczelki boczne** — tablica \`lateralSelections\` z osobnymi opcjami dla lewej/prawej/górnej/dolnej krawędzi.
5. **Wycięcia** — na uchwyt lub zamek (rozmiar kasety zamka >50 mm = duży, ≤50 mm = mały).
6. **Akcesoria** — zawiasy, uchwyt, odbojnik, zamek.`,
    tips: [
      'System pivot jest automatycznie dobierany w zależności od wagi szkła.',
      'W systemie przesuwnym szyna i prowadnica są zawarte w zestawie — nie dodawaj ich osobno.',
    ],
  },
  {
    id: 'calc-balustrade', category: 'calculatoare', roles: ['all'], order: 3,
    title: 'Konfigurator Balustrad',
    image: '/manual/calc-balustrada.png',
    imageAlt: 'Konfigurator 3D balustrady',
    content: `# Konfigurator Balustrad

Konfiguracja balustrad szklanych: wewnętrznych, zewnętrznych (obowiązkowo laminowane), schodowych (panele nachylone).

## Kroki

1. **Typ** — Wewnętrzna, Zewnętrzna, Schodowa.
2. **Długość całkowita** i **wysokość** — w mm.
3. **Szkło** — laminowane 8+8, 10+10 lub pojedyncze hartowane (tylko wewnętrzne).
4. **Mocowanie** — profil U ciągły, mocowania punktowe, słupki.
5. **Pochwyt** — opcjonalny (drewno, stal nierdzewna, aluminium).
6. **Zaślepki** — do profilu U.`,
    warnings: [
      'Na zewnątrz szkło MUSI być laminowane — jest to obowiązkowa norma bezpieczeństwa.',
    ],
  },
  {
    id: 'calc-mirror', category: 'calculatoare', roles: ['all'], order: 4,
    title: 'Konfigurator Luster',
    image: '/manual/calc-oglinda.png',
    imageAlt: 'Konfigurator 3D lustra',
    content: `# Konfigurator Luster

Do luster prostych lub ze specjalnymi obróbkami.

## Kroki

1. **Kształt** — Prostokąt, Kwadrat, Koło, Owal, Niestandardowy.
2. **Wymiary** — w mm; dla kształtu niestandardowego rysujesz w edytorze CAD.
3. **Typ lustra** — standardowe srebrne, antyczne, dymione, brązowe.
4. **Krawędź** — szlifowana, fazowana, polerowana.
5. **Wycięcia** — na włączniki, gniazdka, uchwyty.
6. **Oświetlenie LED** — opcjonalne, obwodowe lub z tyłu.`,
  },
  {
    id: 'calc-kitchen', category: 'calculatoare', roles: ['all'], order: 5,
    title: 'Konfigurator Frontów Kuchennych',
    image: '/manual/calc-front-bucatarie.png',
    imageAlt: 'Konfigurator 3D frontu kuchennego',
    content: `# Konfigurator Frontów Kuchennych

Fronty meblowe ze szkła lakierowanego, z nadrukiem cyfrowym lub piaskowanego matowego.

## Kroki

1. **Wykończenie** — Lakierowany RAL, Nadruk cyfrowy, Piaskowany mat.
2. **Wymiary** — szerokość × wysokość na front; mnożysz przez liczbę frontów.
3. **Kolor / Nadruk** — wybierasz RAL lub wgrywasz plik do druku.
4. **Wycięcia** — na uchwyty lub system push-to-open.
5. **System mocowania** — klej na MDF, śruby z tyłu, profil aluminiowy.
6. **Zapis** — automatyczna agregacja dla całych kuchni.`,
    tips: [
      'Dla nadruku cyfrowego zalecana minimalna rozdzielczość to 150 dpi przy ostatecznym wymiarze.',
    ],
  },
  {
    id: 'calc-panels', category: 'calculatoare', roles: ['all'], order: 6,
    title: 'Panele i Ścianki Działowe',
    image: '/manual/calc-panouri.png',
    imageAlt: 'Konfigurator 3D panela i ścianki działowej',
    content: `# Panele i Ścianki Działowe

Dwa podmoduły:

- **Panel prosty** — szkło bez obróbki (szyba na wymiar).
- **Ścianka działowa** — konfigurowalna siatka ze zintegrowanymi drzwiami.

## Ścianki działowe — kluczowe kroki

1. **Siatka** — definiujesz liczbę kolumn × rzędów; zmieniasz rozmiar, przeciągając z blokadą (suma szerokości pozostaje stała).
2. **Profile obwodowe** — góra, dół, boki; przerywają się automatycznie w miejscu drzwi.
3. **Profile wewnętrzne** — pionowe i poziome; \`usableWidth/Height\` zapewnia dopasowanie paneli.
4. **Zintegrowane drzwi** — w dowolnej komórce; automatycznie odliczają się od profilu obwodowego.
5. **Panele boczne 90°** — wysokość synchronizuje się z wysokością drzwi.
6. **Szkło i wykończenia** — dla każdej komórki lub globalnie.`,
    warnings: [
      'Przy zmianie rozmiaru jednej kolumny, sąsiednie dostosowują się automatycznie, aby zachować całkowitą szerokość.',
    ],
  },
  {
    id: 'orders', category: 'vanzari', roles: ['all'], order: 1,
    title: 'Zarządzanie Zamówieniami',
    image: '/manual/comenzi-deschide.png',
    imageAlt: 'Lista zamówień ze statusami',
    content: `# Zamówienia

Wszystkie oferty i zamówienia, z szybkimi filtrami statusów: Oferta → Potwierdzone → W produkcji → Ukończone → Dostarczone → Anulowane.

## Szybkie akcje w wierszu zamówienia

1. **Zmień status** — kolorowe przyciski bezpośrednio w wierszu (Potwierdź, Ukończ, Dostarcz).
2. **Prześlij na produkcję** — automatycznie odejmuje stan magazynowy i tworzy kartę produkcyjną.
3. **Generuj DXF** — dla CNC, dla każdego panelu.
4. **Edytuj** — ponownie otwiera ofertę w oryginalnym konfiguratorze (wszystkie dane przywrócone).
5. **Usuń** — tylko jeśli jeszcze nie jest w produkcji.

## Otwieranie szczegółów zamówienia

Kliknij numer zamówienia (lub jego wiersz) z **Listy Zamówień**, a otworzy się okno z nagłówkiem zamówienia (nr, status, przycisk **Pobierz PDF**) i 4 zakładkami:

![Otwarte okno zamówienia](/manual/comenzi-detalii.png)

### 1. Szczegóły
Dane klienta, data utworzenia, suma częściowa, VAT, suma całkowita. Tutaj szybko sprawdzisz dane handlowe i znajdziesz przyciski **Zaplanuj montaż**, **Wystaw fakturę** i **Proforma (zaliczka)**.

### 2. Produkty
Lista skonfigurowanych produktów, z ilością, ceną jednostkową i kwotą dodatkową (jeśli istnieje). Przycisk **Edytuj** przy każdym produkcie przenosi Cię z powrotem do konfiguratora w celu wprowadzenia zmian.

![Zakładka Produkty](/manual/comenzi-produse.png)

### 3. Historia
Rejestr zmian: zmiany statusu, edycje, płatności, generowanie dokumentów. Przydatne do śledzenia i audytu — widzisz, kto i kiedy dokonał każdej modyfikacji.

![Zakładka Historia](/manual/comenzi-istoric.png)

### 4. Podgląd
Szczegółowe renderowanie oferty dokładnie tak, jak pojawi się na **PDF-ie wysłanym do klienta**: dla każdego produktu widzisz typ konfiguracji, wymiary i powierzchnię szkła, zastosowane obróbki, listę akcesoriów z kodem i ceną jednostkową, robociznę i sumę. **Używane do ostatecznej weryfikacji** przed wysłaniem oferty do klienta lub zamówienia na produkcję — potwierdzasz, że ceny produktów, akcesoriów i robocizny są prawidłowe.

![Zakładka Podgląd](/manual/comenzi-previzualizare.png)

## Karty na górze

Natychmiastowe podsumowanie: suma zamówień, wartość w RON, rozkład według statusów.`,
    tips: [
      'Pełna konfiguracja (`full_config`) jest zachowywana nienaruszona od koszyka do zamówienia — żadne dane nie są tracone.',
      'Identyczne akcesoria są automatycznie agregowane na końcowym pliku PDF (suma ilości, unikalny kod).',
      'Zakładka Podgląd zawsze odzwierciedla aktualne wartości — jeśli zmienisz cenę w Ustawieniach, zaktualizuje się tutaj.',
    ],
  },
  {
    id: 'invoicing', category: 'vanzari', roles: ['all'], order: 2,
    title: 'Fakturowanie',
    image: '/manual/facturare.png',
    imageAlt: 'Moduł fakturowania z KPI i wykresami',
    content: `# Fakturowanie

Wystawianie faktur z potwierdzonych zamówień, z niestandardowymi seriami i eksportem e-Faktura (CIUS-RO i FatturaPA dla Włoch).

## Kroki

1. **Skonfiguruj serie** w *Ustawienia → Fakturowanie → Serie* (prefiks, rok, licznik).
2. **Generuj fakturę** z zamówienia: przycisk **€** w wierszu zamówienia.
3. **Edytuj pozycje** — dodawaj/usuwaj, dostosowuj ceny, VAT dla każdej pozycji.
4. **Wystaw** — numer przypisywany automatycznie, status zmienia się na „Wystawiono”.
5. **Zarejestruj płatność** — okno dialogowe dla płatności częściowej lub całkowitej.
6. **Eksport XML** — dla ANAF (RO) lub SDI (IT).

## KPI

Karty na górze: zafakturowano, otrzymano, zaległe, anulowano.`,
    warnings: [
      'Wystawionej faktury nie można usunąć — można ją tylko anulować z podaniem przyczyny i zastąpić korektą (storno).',
    ],
  },
  {
    id: 'clients-crm', category: 'vanzari', roles: ['all'], order: 3,
    title: 'Klienci i CRM',
    image: '/manual/clienti-crm.png',
    imageAlt: 'Lista klientów CRM z typami',
    content: `# Klienci

Kompletna baza danych klientów: osoby fizyczne, firmy, dystrybutorzy.

## Kroki

1. **Dodaj klienta** — przycisk „Nowy klient” lub automatycznie przy zapisywaniu oferty dla nowego adresu e-mail.
2. **Typ klienta** — Osoba / Firma / Dystrybutor (z globalnym rabatem).
3. **Dane kontaktowe** — telefon, e-mail, adres, CUI (jeśli firma).
4. **Pipeline CRM** (admin) — leady, etapy, konwersje.
5. **Historia** — wszystkie oferty i zamówienia klienta w jednym miejscu.
6. **Specyficzna marża** — w *Ustawienia → Narzut dla Klienta* ustawiasz różny narzut dla poszczególnych typów.

## Filtry na górze

Wyszukiwanie po nazwie/e-mailu, filtr według typu klienta.`,
    tips: [
      'Klienci tworzą się automatycznie z konfiguratorów 3D, gdy zapisujesz pierwszą ofertę z nowym adresem e-mail.',
    ],
  },
  {
    id: 'production-kanban', category: 'productie', roles: ['all'], order: 1,
    title: 'Przepływ produkcji Kanban',
    image: '/manual/productie-kanban.png',
    imageAlt: 'Tablica Kanban z kolumnami Cięcie, Obróbka, Hartowanie',
    content: `# Produkcja Kanban

Wizualny przepływ pracy według etapów: **Cięcie → Obróbka → Hartowanie → Powlekanie/Druk → Montaż → Gotowe do wysyłki**.

## Codzienne kroki

1. **Sprawdź wskaźniki KPI** na górze: suma aktywnych, w toku, w oczekiwaniu, gotowe do wysyłki.
2. **Przeciągnij i upuść** kartę między kolumnami, aby ręcznie przesunąć ją do przodu.
3. **Kliknij na kartę** — otwiera kartę produkcyjną z rysunkami technicznymi, materiałami, akcesoriami.
4. **Przypisanie operatora** — zaplanowane w *Zamówienia → Planowanie operatora*; zapisywane w \`operator_name\` w celu śledzenia.
5. **Widok Kalendarza** — alternatywna zakładka do planowania według daty.

## Etykiety z kodem kreskowym

Z karty każdego zlecenia produkcyjnego (oraz ze strony **Skaner**) masz przycisk **„Drukuj Etykietę”**:

- Kod kreskowy to **CODE128**, generowany automatycznie z numeru karty (za pomocą biblioteki JsBarcode).
- Etykieta zawiera: **nr karty**, **nr zamówienia**, **klienta**, **termin dostawy** i **bieżący etap**.
- Otwiera się bezpośrednio okno dialogowe drukowania przeglądarki — można używać zwykłych drukarek A4 lub dedykowanych drukarek etykiet (Zebra, Brother itp.).
- Przyklejasz etykietę na szybę / ramę / paczkę i używasz jej na każdym etapie przepływu.

## Skanowanie w warsztacie

Strona **Produkcja → Skaner** jest zoptymalizowana pod kątem rytmu pracy w warsztacie:

1. **Auto-focus** na polu skanowania — nie musisz klikać przed każdym skanowaniem.
2. **Czytniki HID** — każdy skaner USB typu „klawiatura” działa na zasadzie plug-and-play (nie wymaga sterowników).
3. **Skanujesz kod** z etykiety → zamówienie **automatycznie przechodzi** do następnego etapu w przepływie.
4. **Natychmiastowe potwierdzenie wizualne**: karta wyświetla nowy status, a tablica Kanban się aktualizuje.

W ten sposób operatorzy nie tracą czasu na ręczne przeciąganie i upuszczanie, i nie ma błędów typu „zapomniałem zaznaczyć, że skończyłem”.

## Śledzenie w czasie rzeczywistym

Tablica Kanban **odświeża się automatycznie** w tle:

- Skanowania wykonane w warsztacie pojawiają się **natychmiast** na ekranach biurowych — bez ręcznego odświeżania.
- Wskaźniki KPI na górze (aktywne, w toku, gotowe do wysyłki) przeliczają się na żywo.
- Wielu operatorów może pracować jednocześnie na różnych etapach, nie przeszkadzając sobie nawzajem.
- Menedżer w każdej chwili widzi, **gdzie znajduje się każde zamówienie** i **kto nad nim pracuje**.

## Szacowana data dostawy

Obliczana automatycznie, gdy zamówienie wchodzi do produkcji, w zależności od obciążenia kolumn.`,
    tips: [
      'Wydrukuj etykietę z kodem kreskowym zaraz po tym, jak zamówienie wejdzie do produkcji i przyklej ją na paczkę — staje się ona źródłem prawdy dla całego przepływu.',
      'Pozostaw stronę Skaner otwartą na tablecie/laptopie w warsztacie; auto-focus zapewnia, że każde skanowanie zostanie zarejestrowane, nawet jeśli nikogo nie ma przy klawiaturze.',
      'Dla przepływu 24/7 otwórz Kanban na dużym telewizorze — widzisz postępy w czasie rzeczywistym, niczego nie dotykając.',
    ],
  },
  {
    id: 'inventory', category: 'productie', roles: ['all'], order: 2,
    title: 'Magazyn i inwentaryzacja',
    image: '/manual/stoc.png',
    imageAlt: 'Moduł inwentaryzacji z listami materiałów',
    content: `# Magazyn

Zarządzanie materiałami: szkło, akcesoria (okucia), materiały eksploatacyjne. Automatyczne odliczanie przy wejściu do produkcji.

## Kroki

1. **Dodaj materiał** — przycisk „Nowy materiał” (kod, typ, cena, stan minimalny).
2. **Korekta stanu magazynowego** — przycisk w wierszu dla ręcznych przyjęć/wydań.
3. **Ruchy magazynowe** — zakładka z historią transakcji (przyjęcia, wydania, powód).
4. **Miesięczny raport zużycia** — przycisk na górze, eksport do CSV/Excel.
5. **Alerty o stanie minimalnym** — czerwone KPI „Min. Stock” na górnej karcie.
6. **Lokalizacja** — opcjonalnie, dla wielu magazynów.

## Automatyczne odliczanie

Gdy zamówienie przechodzi do statusu **„W produkcji”**, stan magazynowy jest automatycznie pomniejszany zgodnie z listą materiałów każdego produktu.`,
    warnings: [
      'Ujemny stan magazynowy jest dozwolony, ale oznaczony na czerwono — magazynier musi przeprowadzić inwentaryzację fizyczną i korektę.',
    ],
  },
  {
    id: 'cutting', category: 'productie', roles: ['all'], order: 3,
    title: 'Optymalizacja Rozkroju',
    image: '/manual/optimizare-debitare.png',
    imageAlt: 'Moduł optymalizacji rozkroju z wyborem arkuszy',
    content: `# Optymalizacja Rozkroju

Algorytm nestingu gilotynowego dla maksymalnie 50 zamówień jednocześnie — minimalizuje odpad szklany.

## Kroki

1. **Typ arkusza** — wybierasz z katalogu (np. 3210×2250 mm).
2. **Grubość ostrza** — domyślnie 3 mm, regulowana.
3. **Wybierz zamówienia** — z listy z wyszukiwaniem i filtrem statusu (możesz „Zaznacz wszystko 26”).
4. **Naciśnij Optymalizuj** — algorytm działa i wyświetla arkusze z zagnieżdżonymi panelami.
5. **Wyświetl SVG** — każdy arkusz z wymiarami, etykietami paneli, pokolorowanym odpadem.
6. **Eksportuj DXF/PDF** — aby wysłać do maszyny tnącej.

## Zarządzanie arkuszami szkła

![Okno Zarządzaj arkuszami ze standardowymi wymiarami szkła na stronie Optymalizacji Cięcia](/manual/manage-glass-sheets.png)

Standardowe wymiary (2550×3210, 2250×3210, Jumbo 6000×3210) są ładowane automatycznie przy pierwszym użyciu. Możesz je edytować w dowolnym momencie bez opuszczania strony cięcia — kliknij przycisk **⚙ Zarządzaj arkuszami** obok selektora *Typ arkusza*.

1. **Dodaj nowy arkusz** — wypełnij *Nazwę* (np. "Custom 2000×3000"), *Szerokość (mm)* i *Wysokość (mm)*, następnie kliknij **+ Dodaj**.
2. **Włącz / wyłącz** — przełącznik przy każdym rozmiarze ukrywa go w selektorze *Typ arkusza* bez usuwania (przydatne przy rozmiarach sezonowych).
3. **Usuń** — czerwony przycisk kosza trwale usuwa rozmiar; używaj tylko gdy masz pewność.
4. **Zamknij okno** — zmiany są stosowane natychmiast, a selektor *Typ arkusza* odświeża się automatycznie z nowymi wymiarami i powierzchnią w m².

> Arkusze są zapisywane na firmę — cały zespół widzi tę samą listę, odizolowaną od innych kont.

## Statystyki

Procent wykorzystania, powierzchnia odpadu, liczba arkuszy.`,
    tips: [
      'Limit 50 zamówień na sesję, aby zachować rozsądny czas obliczeń.',
    ],
  },
  {
    id: 'service', category: 'operational', roles: ['all'], order: 1,
    title: 'Reklamacje i Zgłoszenia Serwisowe',
    image: '/manual/service.png',
    imageAlt: 'Moduł reklamacji z wykresami i listą zgłoszeń',
    content: `# Reklamacje i Serwis

Zarządzanie incydentami po dostawie: reklamacje klientów, wady fabryczne, planowane interwencje.

## Kroki

1. **Nowa reklamacja** — przycisk w prawym górnym rogu.
2. **Powiąż zamówienie** — opcjonalnie, w celu śledzenia.
3. **Priorytet** — Niski / Średni / Wysoki / Krytyczny.
4. **Typ wady** — Reklamacja klienta, Wada fabryczna, Uszkodzenie w transporcie, Gwarancja.
5. **Zaplanuj interwencję** — wybierasz datę i zespół montażowy.
6. **Zamknij zgłoszenie** — z podaniem rozwiązania i kosztów.

## Wykresy

Częstotliwość wad, rozkład priorytetów, status zgłoszeń.`,
  },
  {
    id: 'installation', category: 'operational', roles: ['all'], order: 2,
    title: 'Montaż i Zespoły',
    image: '/manual/montaj.png',
    imageAlt: 'Kalendarz montażu z zakładkami Zespoły, Pojazdy, Lista kontrolna',
    content: `# Montaż

Planowanie montaży, zespołów, pojazdów, list kontrolnych i optymalizacja trasy.

## Zakładki

1. **Kalendarz Montażu** — widok miesięczny z funkcją przeciągnij i upuść.
2. **Zespoły Montażowe** — dodajesz członków, przydzielasz do zespołów.
3. **Lista kontrolna** — szablony klonowane do każdego zlecenia przy tworzeniu.
4. **Optymalizacja Trasy** — oblicza optymalną kolejność montaży na dany dzień.
5. **Pojazdy** — flota z 30-dniowymi alertami dotyczącymi badań technicznych i ubezpieczenia OC.

## Kroki planowania

1. Przycisk **„Zaplanuj montaż”** w prawym górnym rogu.
2. Wybierasz zamówienie, zespół, pojazd, datę.
3. Dołączasz listę kontrolną (domyślną lub niestandardową).
4. Zapisujesz — pojawia się w kalendarzu.
5. **Przełożenie** — zamyka bieżące zlecenie i wstępnie wypełnia nowe.`,
    tips: [
      'Pojazdy z terminem badania technicznego/ubezpieczenia OC upływającym za mniej niż 30 dni otrzymują automatyczny alert.',
    ],
  },
  {
    id: 'settings-company', category: 'setari', roles: ['all'], order: 1,
    title: 'Ustawienia Firmy i Branding',
    image: '/manual/setari-companie.png',
    imageAlt: 'Ustawienia firmy — informacje ogólne',
    content: `# Ustawienia → Firma

Dane, które pojawiają się na WSZYSTKICH generowanych dokumentach (oferty, zamówienia, faktury, karty produkcyjne).

## Kluczowe pola

1. **Nazwa Firmy** — pojawia się w nagłówku PDF.
2. **CUI / NIP** — z prefiksem PL dla Polski.
3. **Pełny adres** — Ulica, Nr, Miasto, Województwo, Kod pocztowy.
4. **Telefon i Email** — do kontaktu na dokumentach.
5. **Konto Bankowe i BIC/SWIFT** — na fakturach.
6. **Logo Firmy** — PNG/JPG/WebP/SVG, maks. 2 MB.

## Personalizacja PDF

- **Rozmiar logo** i **pozycja** — dla ofert i faktur.
- **Teksty niestandardowe** — warunki, regulamin, stopka (rich-text przez Tiptap).
- **Kurs EUR/RON** — używany do globalnej konwersji.

## White label

Subskrybenci mogą w pełni personalizować pliki PDF, dodając własne logo i teksty HTML.`,
    tips: [
      'Idealne logo to plik PNG z przezroczystym tłem, o proporcjach 3:1 lub kwadratowe, min. 400×400 px dla zapewnienia jakości druku.',
    ],
  },
  {
    id: 'settings-pricing', category: 'setari', roles: ['all'], order: 2,
    title: 'Ustawienia Cen i Katalog',
    content: `# Ustawienia → Cenniki

Twój lokalny katalog cen: materiały, akcesoria, zestawy, wykończenia.

## Kroki

1. **Zakładka Materiały** — szkło, profile, akcesoria pogrupowane.
2. **Wyszukaj** — wyszukiwanie globalne we wszystkich kategoriach.
3. **Edytuj cenę** — kliknij w komórkę, zapis automatyczny.
4. **Resetuj do wartości systemowej** — przycisk, aby zrezygnować z nadpisania i powrócić do ceny bazowej.
5. **Warianty prywatne** — dodajesz własne materiały z unikalnym kodem dla firmy.
6. **Import / Eksport** — Excel + ZIP dla zdjęć, automatyczne mapowanie do kategorii systemowych.

## Hierarchia cen

Firma (własne nadpisanie) > Globalny użytkownik > System (domyślny katalog).`,
    tips: [
      'Nadpisania firmowe nie są widoczne dla innych firm — są ściśle izolowane przez RLS.',
      'Obrazy materiałów mają mechanizm cachebusting z sygnaturą czasową, aby natychmiast zobaczyć nową wersję.',
    ],
    warnings: [
      'Zresetowanie ceny usuwa nadpisanie i nie można tego cofnąć — sprawdź przed wykonaniem.',
    ],
  },
  {
    id: 'settings-team', category: 'setari', roles: ['all'], order: 3,
    title: 'Ustawienia Zespołu i Uprawnienia',
    content: `# Ustawienia → Zespół

Zaproś członków zespołu i zarządzaj uprawnieniami do modułów.

## Kroki

1. **Zaproś członka** — e-mail; otrzyma link do rejestracji.
2. **Rola** — Subskrybent (sprzedaż), Produkcja, Montaż, Admin firmy.
3. **Dozwolone moduły** — zaznaczasz dostęp: Zamówienia, Produkcja, Magazyn, Fakturowanie, Serwis itp.
4. **Aktywuj/Dezaktywuj** — zachowujesz historię, tylko blokujesz logowanie.
5. **Przenieś admina** — jednym kliknięciem na innego członka.
6. **Śledzenie** — wszystkie działania są rejestrowane z \`created_by\`.

## Poziomy dostępu

- **Basic (60)** — Zamówienia + 1-2 konfiguratory.
- **Plus (100)** — Wszystkie konfiguratory + Magazyn.
- **Operational (150)** — Wszystko, w tym Serwis, Montaż, Optymalizacja.

## Fakturowanie

Abonament jest powiązany z **właścicielem firmy** — pracownicy są darmowi.`,
    tips: [
      'Naprawa osieroconego konta (admin) — użytkownicy bez firmy mogą być przypisani ręcznie.',
    ],
  },
  {
    id: 'pricing-client-types', category: 'setari', roles: ['all'], order: 9,
    title: 'Narzut według typu klienta (Osoba / Firma / Dystrybutor)',
    image: '/manual/setari-adaos-tip-client.png',
    imageAlt: 'Ustawienia → Narzut dla Klientów — Osoba Fizyczna, Firma, Dystrybutor',
    content: `# Narzut procentowy według typu klienta

W **Ustawienia → Narzut dla Klientów** możesz zdefiniować **3 zróżnicowane cenniki** oparte na tym samym katalogu, bez powielania artykułów.

## 3 typy

- **Osoba Fizyczna** — klienci końcowi (detal). Zazwyczaj tutaj ustawiasz dodatni narzut (np. +10% … +20%), ponieważ nie korzystają oni z rabatów handlowych.
- **Firma** — firmy i partnerzy biznesowi. Zwykle pozostawia się **0%** (cena bazowa).
- **Dystrybutor** — partnerzy odsprzedający. Tutaj zazwyczaj ustawiasz **wartość ujemną** (np. −10% … −25%), aby zaoferować im preferencyjną cenę.

## Jak to działa

- Procent jest stosowany **automatycznie** do ceny bazowej każdego artykułu w ofercie (szkło, akcesoria, robocizna, zestawy).
- Wartości **dodatnie** = narzut powyżej ceny standardowej. Wartości **ujemne** = rabat.
- Pole akceptuje wartości od **−100% do +500%**, z krokiem co 0,5%.
- Zmiany stają się aktywne po naciśnięciu **„Zapisz Narzuty”** (przycisk w prawym dolnym rogu). Karta podświetla zmodyfikowane wiersze odznaką „zmodyfikowano”.

## Gdzie jest to stosowane

W każdym **konfiguratorze 3D**, na karcie **Informacje o Kliencie**, znajduje się selektor **Typ Klienta** (Osoba / Firma / Dystrybutor). Gdy go zmieniasz:

1. Konfigurator wykrywa wybrany typ.
2. Automatycznie stosuje ustawiony tutaj procent do sumy częściowej.
3. Cena wyświetlana w ofercie (a później w PDF) odzwierciedla już nowy typ.

## Do czego to służy

- **Jeden katalog**, ale różne ceny w zależności od kategorii klienta — bez ręcznego powielania artykułów.
- Możesz **szybko udzielić rabatu dystrybutorom** bez modyfikowania bazowych katalogów.
- Osoby fizyczne mogą być fakturowane ze standardowym narzutem handlowym, bez ręcznych obliczeń w każdej ofercie.
- Zmiany są **retroaktywne tylko dla nowych ofert** — już zapisane zamówienia zachowują swoje pierwotne ceny (\`full_config\` jest źródłem prawdy).`,
    tips: [
      'Możesz ustawić wartości ujemne (np. −15%), aby zaoferować stały rabat dla danej kategorii bez dotykania katalogu.',
      'Jeśli masz wątpliwości, zacznij od Firma = 0% (cena referencyjna) i dostosuj pozostałe dwie w stosunku do niej.',
      'Selektor Typ Klienta w konfiguratorze jest zapamiętywany w ofercie, więc ponownie otwierana oferta zachowuje pierwotnie wybrany typ.',
    ],
    warnings: [
      'Zmiana procentu wpływa tylko na nowe oferty. Istniejące zamówienia muszą być ponownie edytowane, jeśli chcesz je przeliczyć.',
    ],
  },
  {
    id: 'pricing-overview', category: 'setari', roles: ['all'], order: 10,
    title: 'Cenniki — przegląd ogólny',
    image: '/manual/setari-preturi.png',
    imageAlt: 'Ustawienia → Cenniki — lista kategorii',
    content: `# Ustawienia → Cenniki

Tutaj kontrolujesz **wszystkie ceny** używane w konfiguratorach 3D, ofertach i plikach PDF.

## Dostępne kategorie

- **Akcesoria** — zawiasy, uchwyty, drążki, rolki, odbojniki, uszczelki, złączki
- **Szkło** — według grubości i typu (przezroczyste, matowe, dymione, lustro)
- **Robocizna** — montaż, cięcie, polerowanie, wiercenie, wycinanie
- **Profile** — U, ścienny, narożny 90°, profile przesuwne
- **Zestawy** — grupy akcesoriów sprzedawane jako jedna pozycja
- **Mechanizmy przesuwne** — kompletne systemy (z profilem + rolkami + odbojnikami)

## Katalog globalny vs nadpisanie osobiste

- **Katalog globalny** (zarządzany przez admina) jest punktem wyjścia — widzisz go automatycznie.
- Gdy modyfikujesz cenę lub odjęcie, zapisywane jest **nadpisanie osobiste** w Twojej przestrzeni (\`pricing_config\`). Katalog globalny pozostaje nietknięty.
- W każdej chwili możesz zresetować nadpisanie przyciskiem **„Resetuj do wartości katalogowej”** (zobacz dedykowaną sekcję).

## Waluta

Ceny są przechowywane wewnętrznie w **RON**. Przełącznik **RON / EUR** na górnym pasku przelicza tylko wyświetlanie — w bazie danych nie dokonuje się żadna konwersja.`,
    tips: [
      'Filtr wyszukiwania działa we wszystkich kategoriach jednocześnie (kod, nazwa, wykończenie).',
      'Jeśli nie widzisz artykułu, sprawdź, czy nie został wyłączony w menu wiersza (przekreślony dzwonek).',
    ],
  },
  {
    id: 'pricing-add-accessory', category: 'setari', roles: ['all'], order: 11,
    title: 'Dodawanie nowego akcesorium',
    image: '/manual/setari-adauga-accesoriu.png',
    imageAlt: 'Okno dialogowe Dodaj element — akcesorium',
    content: `# Jak dodać nowe akcesorium

1. Wejdź w **Ustawienia → Cenniki** i wybierz zakładkę **Akcesoria**.
2. Naciśnij **„Dodaj element”** (w prawym górnym rogu).
3. Wypełnij:
   - **Kod** — unikalny; używany do deduplikacji, skanowania kodów kreskowych i agregacji w PDF.
   - **Nazwa** — wyświetlana w konfiguratorze i PDF.
   - **Kategoria / Typ** — zawias, uchwyt, drążek stabilizujący, rolki, odbojnik, uszczelka itp.
   - **Cena** — w aktywnej walucie (przechowywana w RON).
   - **J.m.** — \`szt.\` dla sztuk, \`mb\` dla metrów bieżących, \`m²\` dla powierzchni, \`kg\` dla wagi.
   - **Wykończenie i kolor** — wybierasz z predefiniowanych ustawień lub wprowadzasz własny hex; używane również w renderowaniu 3D.
   - **Obraz** — wgrywany do pamięci masowej; pojawia się w selektorze akcesoriów i w PDF.
4. Zaznacz **„Typy produktów”**, w których pojawia się akcesorium (prysznic, drzwi, balustrada, lustro, panele, front kuchenny).
5. Zaznacz **„Typy obróbki”** kompatybilne (laminowane, hartowane, matowe).
6. **Zapisz** — akcesorium staje się natychmiast dostępne w zaznaczonych konfiguratorach.`,
    tips: [
      'Dla jednostek miary innych niż szt. można używać wartości dziesiętnych (np. 2.5 mb).',
      'Jeśli nie ustawisz obrazu, zostanie on automatycznie odziedziczony z kategorii nadrzędnej.',
    ],
    warnings: [
      'Kod musi być unikalny. Jeśli już istnieje, system zaktualizuje istniejący artykuł zamiast tworzyć nowy.',
    ],
  },
  {
    id: 'pricing-edit-fields', category: 'setari', roles: ['all'], order: 12,
    title: 'Edycja elementu — pola zaawansowane',
    image: '/manual/setari-editare-element.png',
    imageAlt: 'Okno dialogowe Edycja elementu z odjęciami szkła',
    content: `# Edycja elementu — pole po polu

Kliknij ołówek w wierszu (lub wykonaj podwójne kliknięcie), aby otworzyć **Edytuj element**. Oprócz ceny i J.m., masz te pola techniczne:

## Cena i J.m.

- Cena jest wprowadzana w aktywnej walucie z nagłówka (RON lub EUR) i przechowywana wewnętrznie w RON.
- J.m. określa, jak cena jest mnożona w konfiguratorze: \`szt.\` × ilość, \`mb\` × długość, \`m²\` × powierzchnia.

## Wykończenie i kolor

- **Hex color** + **roughness** są używane zarówno na liście cen, jak i w renderowaniu 3D — zsynchronizowane przez \`MetalMaterial\`.
- Jeśli pozostawisz puste, wartość jest dziedziczona z elementu nadrzędnego (np. wariant profilu dziedziczy kolor profilu bazowego).

## Odjęcie wymiaru szkła na krawędzi (\`glass_deduction\`)

Ile **mm** profil wchodzi w szkło na każdej krawędzi, na której jest montowany. Konfigurator automatycznie odejmuje tę wartość od wymiaru brutto, aby uzyskać rzeczywisty wymiar szkła do cięcia.

> Przykład: profil U 8 mm na szkle 8 mm laminowanym → \`8 + 0.38 + 8 = 16.38 mm\` całkowitego odjęcia (profile + folia + profile, sumarycznie).

## Szczegółowe odjęcia na krawędź (\`glass_deductions\`)

JSON z oddzielnymi wartościami \`top\`, \`bottom\`, \`left\`, \`right\`. Używane, gdy profil ma różne wartości na każdej krawędzi (np. głęboki profil podłogowy + cienki profil ścienny). **Sumuje się** z uszczelkami.

- **\`profile_height\`** (w tym samym JSON) — nadpisuje sumę \`top + bottom\` dla profilu U, jeśli chcesz jedną, całkowitą wartość.

## Zakładka (\`width_overlap\`)

Ile mm panele przesuwne **nachodzą** na drugi panel lub ścianę. System odejmuje tę wartość od **szerokości użytkowej** zestawu przesuwnego.

> Przykład: zestaw przesuwny 1200 mm z zakładką 40 mm → rzeczywista szerokość użytkowa 1160 mm.

## Odjęcie wysokości drzwi (\`door_height_deduction\`)

mm odejmowane od całkowitej wysokości dla **drzwi na zawiasach** (miejsce na zawias na górze + próg na dole). Zazwyczaj 5–20 mm w zależności od zawiasu.

## Odjęcie wysokości panelu stałego (\`fixed_panel_height_deduction\`)

Identycznie, ale dla panelu stałego. **Domyślnie 0** — panel stały nie ma automatycznego odjęcia 10 mm.

## Typy produktu / obróbki

Zaznacz, gdzie pojawia się akcesorium (prysznic, drzwi, balustrada...) i jakie obróbki wspiera (laminowane, hartowane). Niezaznaczone = nie pojawia się w danym konfiguratorze.`,
    tips: [
      'Odjęcia są **kumulatywne**: profil + uszczelka + folia laminowana sumują się na tej samej krawędzi.',
      'Wysokość montażu zawiasów mierzy się od **góry do dołu**, a uchwytu od **dołu do góry** — jest to konwencja zachowana we wszystkich konfiguratorach.',
      'System przesuwny **nie używa zawiasów** — pole ilości zawiasów automatycznie pozostaje 0.',
    ],
    warnings: [
      'Każda zmiana odjęć natychmiast wpływa na **wszystkie przyszłe obliczenia 3D**, w tym na niepotwierdzone oferty. Już zapisane zamówienia mają dane zamrożone w `full_config` i nie ulegają zmianie.',
    ],
  },
  {
    id: 'pricing-add-glass', category: 'setari', roles: ['all'], order: 13,
    title: 'Dodawanie typu szkła',
    image: '/manual/setari-sticla.png',
    imageAlt: 'Ustawienia → Cenniki → Szkło',
    content: `# Szkło

1. Zakładka **Szkło** → **„Dodaj element”**.
2. Wybierz **grubość**: 4 / 6 / 8 / 10 / 12 mm.
3. Wybierz **typ**: przezroczyste, dymione, matowe (piaskowane), lustro, brąz, szare.
4. Ustaw **cenę / m²** (w aktywnej walucie).
5. Zaznacz **obróbki** dostępne dla tego szkła: hartowane, laminowane, polerowane, matowe.

## Hartowanie

Dla hartowania cena jest obliczana według wzoru:

\`\`\`text
Cena hartowania = Cena_bazowa_hartowania × Grubość_mm × Powierzchnia_m²
\`\`\`

Ustawiasz jedną cenę bazową; system automatycznie stosuje wzór w zależności od grubości i powierzchni szkła.

## Laminowane

Przy szkle laminowanym, odjęcia na krawędziach sumują się z **grubością folii** (domyślnie 0.38 mm) na każdej krawędzi. Zobacz przykład w sekcji „Edycja elementu”.`,
    tips: [
      'Szkło matowe (piaskowane) ma zazwyczaj procentowy narzut w stosunku do przezroczystego — konfigurujesz go jako mnożnik w polu obróbki.',
    ],
  },
  {
    id: 'pricing-add-labor', category: 'setari', roles: ['all'], order: 14,
    title: 'Dodawanie robocizny',
    image: '/manual/setari-manopera.png',
    imageAlt: 'Ustawienia → Cenniki → Robocizna',
    content: `# Robocizna

1. Zakładka **Robocizna** → **„Dodaj element”**.
2. Wybierz **typ**: montaż, cięcie, polerowanie krawędzi, wiercenie, wycinanie, transport.
3. Ustaw **J.m.**:
   - \`godz.\` — dla montażu
   - \`mb\` — dla polerowania krawędzi
   - \`szt.\` — dla otworów, wycięć
   - \`m²\` — dla robocizny od powierzchni
4. **Cena** za jednostkę.
5. **Procent vs wartość stała** — zaznacz, jeśli jest to mnożnik (np. 15% powyżej wartości szkła) lub stała kwota.
6. Powiąż z **typami produktów**, gdzie ma być stosowana automatycznie.`,
    tips: [
      'Na robociznę procentową nie wpływa przełącznik EUR/RON — pozostaje taka sama w każdej walucie.',
    ],
  },
  {
    id: 'pricing-add-kit', category: 'setari', roles: ['all'], order: 15,
    title: 'Zestawy akcesoriów',
    image: '/manual/setari-kituri.png',
    imageAlt: 'Ustawienia → Zestawy',
    content: `# Zestawy

**Zestaw** to grupa akcesoriów sprzedawana jako jedna pozycja. Przydatne dla systemów przesuwnych do pryszniców: zestaw zawiera profil, rolki, odbojniki, prowadnicę.

## Tworzenie zestawu

1. Wejdź w **Ustawienia → Zestawy** (lub zakładkę Zestawy w Cennikach).
2. **„Dodaj zestaw”** → kod, nazwa, **cena zestawu** (końcowa), **szerokość użytkowa** pokrywana.
3. Dodaj **komponenty** — wybierasz z listy akcesoriów i podajesz ilość.
4. Komponenty są **deduplikowane według kodu** — jeśli ten sam kod pojawi się dwa razy, ilości są sumowane.

## Użycie w konfiguratorze

W konfiguratorze **prysznica przesuwnego**, wybierasz zestaw z listy rozwijanej. System oblicza:

\`\`\`text
Rzeczywista szerokość użytkowa = Szerokość_zestawu - width_overlap
\`\`\`

i automatycznie stosuje **0 zawiasów** (system przesuwny nie ma zawiasów).`,
    tips: [
      'Ceny komponentów są informacyjne — w ofercie **obowiązuje cena zestawu**.',
      'Obraz zestawu pojawia się w PDF; jeśli go brakuje, używany jest obraz głównego profilu.',
    ],
  },
  {
    id: 'pricing-reset', category: 'setari', roles: ['all'], order: 16,
    title: 'Resetuj do wartości katalogowej',
    image: '/manual/setari-reset.png',
    imageAlt: 'Przycisk Resetuj do wartości katalogowej',
    content: `# Resetowanie nadpisania osobistego

Jeśli zmodyfikowałeś cenę lub odjęcie i chcesz powrócić do **standardowej wartości z katalogu globalnego**:

1. Otwórz **Edytuj element**.
2. Naciśnij **„Resetuj do wartości katalogowej”** (na dole po lewej w oknie dialogowym).
3. Twoje nadpisanie z \`pricing_config\` jest usuwane, a artykuł ponownie wyświetla wartość administratora.

> Resetowanie dotyczy **tylko danego artykułu**. Pozostałe Twoje nadpisania pozostają nienaruszone.`,
    warnings: [
      'Działanie jest natychmiastowe i nie można go cofnąć. Jeśli potrzebujesz historii, wyeksportuj cenniki (Ustawienia → Eksportuj dane) przed zresetowaniem.',
    ],
  },

  // ====== New sections — for subscribers ======
// ====== Secțiuni noi — pentru abonați ======
  {
    id: 'dashboard-home', category: 'introducere', roles: ['all'], order: 0,
    title: 'Główny pulpit',
    image: '/manual/dashboard-home.png',
    imageAlt: 'Główny pulpit',
    content: `# Główny pulpit

Po zalogowaniu trafisz na **stronę główną (\`/\`)** — panel kontrolny z kluczowymi wskaźnikami Twojej firmy, aktualizowanymi w czasie rzeczywistym.

## Co widzisz

- **Główne wskaźniki (KPI)**: obrót, zamówienia w toku, zamówienia dostarczone w bieżącym miesiącu, średnia wartość zamówienia.
- **Wykres sprzedaży** z ostatnich 12 miesięcy (słupkowy, z porównaniem do poprzedniego roku).
- **Wykres przychodów** według kategorii produktów (prysznice, drzwi, balustrady, lustra, kuchnia, panele).
- **Najlepiej sprzedające się produkty** w wybranym okresie.
- **Stan krytyczny magazynu** — materiały, których ilość spadła poniżej skonfigurowanego progu minimalnego.
- **Ostatnie zamówienia** — ostatnie 10 zamówień ze statusem i klientem, z bezpośrednim linkiem do zamówienia.

## Filtry

Przełącznik **RON / EUR** na górnym pasku wpływa na wszystkie wyświetlane tutaj wartości (dynamiczna konwersja, bez VAT).
`,
    tips: [
      'Pulpit odświeża się automatycznie przy każdej zmianie waluty lub języka.',
      'Aby uzyskać wgląd operacyjny (produkcja, montaż, serwis), użyj menu *Pulpit Operacyjny*.',
    ],
  },
  {
    id: 'announcements', category: 'introducere', roles: ['all'], order: 3,
    title: 'Ogłoszenia i powiadomienia',
    image: '/manual/announcements.png',
    imageAlt: 'Ogłoszenia i powiadomienia',
    content: `# Ogłoszenia i powiadomienia

Ikona 🔔 **żółtego dzwonka** na górnym pasku wyświetla ogłoszenia publikowane przez zespół iSoftGlass: aktualizacje, nowe funkcje, planowane prace konserwacyjne.

## Jak to działa

- Czerwona liczba na dzwonku = **nieprzeczytane** ogłoszenia.
- Kliknięcie dzwonka otwiera listę — każde ogłoszenie ma tytuł, kategorię (**Update** lub **Info**), datę i pełną treść.
- Ogłoszenia są automatycznie oznaczane jako przeczytane po ich otwarciu.
- Ważne ogłoszenia typu **Update** pojawiają się również jako **powiadomienie na górze strony** przy wydaniu nowej wersji.

## Kategorie

- **Update** — nowa wersja, dodane funkcje, poprawki.
- **Info** — ogólne informacje, porady, wydarzenia.

Ogłoszenia są automatycznie tłumaczone na język Twojego interfejsu.
`,
    tips: [
      'Sprawdzaj regularnie ogłoszenia, aby dowiedzieć się o nowych funkcjach, które mogą zaoszczędzić Twój czas.',
    ],
  },
  {
    id: 'currency-language', category: 'introducere', roles: ['all'], order: 4,
    title: 'Waluta i język',
    image: '/manual/currency-language.png',
    imageAlt: 'Waluta i język',
    content: `# Waluta i język

## Przełącznik RON / EUR

Przycisk **RON / EUR** na górnym pasku zmienia walutę wyświetlaną w całej aplikacji — kalkulatory 3D, oferty, zamówienia, raporty, pulpit.

- **Wewnętrzne przechowywanie danych** odbywa się **zawsze w RON**. EUR jest tylko wyświetlany, obliczany dynamicznie według kursu ustawionego w *Ustawienia → Firma*.
- **Wszystkie wartości są bez VAT** w obliczeniach wewnętrznych; VAT jest doliczany tylko przy generowaniu faktury.
- Możesz wprowadzać wartości w EUR — są one automatycznie przeliczane na RON przy zapisie.

## Wybór języka

Przycisk **🇵🇱 PL** otwiera listę **9 dostępnych języków**: Română, English, Italiano, Deutsch, Polski, Français, Español, Nederlands, Hrvatski.

- Zmiana języka wpływa **tylko na interfejs** (menu, przyciski, etykiety, instrukcja).
- Dane wprowadzone przez Ciebie (nazwy klientów, opisy, notatki) pozostają w oryginalnym języku.
- Ustawienie jest zapisywane dla Twojego konta między sesjami.
`,
    tips: [
      'Kurs EUR aktualizuje się tylko wtedy, gdy zmienisz go ręcznie w Ustawienia → Firma.',
      'Instrukcja obsługi jest w pełni przetłumaczona na wszystkie 9 języków.',
    ],
  },
  {
    id: 'working-in-eur', category: 'introducere', roles: ['all'], order: 5,
    title: 'Praca wyłącznie w EUR (zalecane dla subskrybentów spoza RO)',
    image: '/manual/working-in-eur.png',
    imageAlt: 'Ustawienia → Ceny — Kurs EUR',
    content: `# Praca wyłącznie w EUR

Ten przewodnik jest dla subskrybentów pracujących **w 100% w EUR** — kupują od dostawców w EUR i sprzedają klientom w EUR, bez mieszania RON w katalogu.

## Jak działa wewnętrzne przechowywanie

- Wszystkie ceny są zapisywane w bazie danych jako jedna liczba.
- Wewnętrzna etykieta techniczna to „RON", ale jest dla Ciebie **nieistotna** — nigdzie nie widzisz jej w interfejsie.
- Przełącznik **EUR** na górnym pasku wykonuje konwersję wyświetlania używając kursu ustawionego w *Ustawienia → Ceny*.

## Problem, którego unikasz

Jeśli zostawisz domyślny kurs (np. \`Kurs EUR = 4,97\`) i wprowadzisz zawias za **100 EUR**, system zapisze wewnętrznie \`497\`. Jutro, jeśli kurs zmieni się na \`5,02\`, ten sam produkt pojawi się jako **99,00 EUR** w katalogu — bez żadnych zmian z Twojej strony.

To „dryfowanie" jest matematycznie poprawne, ale tworzy zamieszanie i wygląda jak błąd.

## Zalecana konfiguracja — 3 kroki

1. **Ustawienia → Ceny** → ustaw **Kurs EUR = 1**.
2. Na górnym pasku wybierz **EUR** jako aktywną walutę.
3. Wprowadzaj wszystkie ceny bezpośrednio w EUR w *Ustawienia → Ceny* (i w nowych zamówieniach).

## Co zyskujesz

- Ceny pozostają **absolutnie stabilne** — 100 EUR dziś = 100 EUR za rok.
- Brak konwersji przy zapisie, **brak dryfu**.
- PDF-y ofert, zamówienia i raporty wychodzą naturalnie w EUR.
- Zamówienia historyczne nie „przesuwają się" w czasie.

## Co NIE ulega zmianie

- Wewnętrzna etykieta „RON" pozostaje w bazie danych (niewidoczna w interfejsie).
- Cała logika aplikacji działa identycznie — nie tracisz żadnej funkcji.

## Ograniczenia — kiedy NIE używać tej konfiguracji

- Jeśli masz **dostawców w RON** i klientów w EUR (przepływ mieszany) → potrzebujesz rzeczywistego kursu.
- Jeśli pracujesz w innej walucie (PLN, HRK itp.) → skontaktuj się z zespołem iSoftGlass w sprawie rozszerzenia.
`,
    tips: [
      'Ustawienie Kurs EUR = 1 wpływa tylko na konwersję wyświetlania — nie modyfikuje żadnej już zapisanej wartości.',
      'Zaleca się wykonanie tej konfiguracji przed wprowadzeniem pierwszych cen w katalogu.',
    ],
  },
  {
    id: 'production-scanner', category: 'productie', roles: ['all'], order: 2,
    title: 'Skaner produkcyjny (kody kreskowe)',
    image: '/manual/production-scanner.png',
    imageAlt: 'Skaner produkcyjny (kody kreskowe)',
    content: `# Skaner produkcyjny

Strona **Produkcja → Skaner** (\`/productie/scanner\`) pozwala na szybkie przesuwanie zamówień między etapami Kanban za pomocą **skanera kodów kreskowych CODE128** podłączonego jako klawiatura HID.

## Jak to działa

1. Otwórz stronę **Skaner**. Pole wprowadzania ma stały auto-focus.
2. **Zeskanuj kod kreskowy** z karty produkcyjnej lub etykiety produktu.
3. Aplikacja automatycznie identyfikuje zamówienie i **przesuwa je do następnego etapu** w Kanban (np. *Cięcie* → *Szlifowanie*, *Szlifowanie* → *Hartowanie*).
4. Potwierdzenie pojawia się na ekranie z dźwiękiem i kolorem zielonym; błąd (nieznany kod) z kolorem czerwonym.

## Wymagania

- Skaner CODE128 skonfigurowany jako **klawiatura HID** (tryb standardowy, bez sterowników).
- Sufiks **Enter (\\r)** po każdym skanowaniu (ustawienie domyślne w większości modeli).

## Zalety

- Operator nie musi już ręcznie wyszukiwać zamówień w Kanban.
- Pełna identyfikowalność: czas każdego etapu jest zapisywany automatycznie.
- Działa również na tablecie ze skanerem Bluetooth.
`,
    tips: [
      'Jeśli pole wprowadzania straci fokus (kliknięcie w innym miejscu), ponowne skanowanie automatycznie go przywróci.',
      'Pole ignoruje ręczne wpisywanie wolniejsze niż 50 ms — tylko skaner wyzwala przejście do następnego etapu.',
    ],
    warnings: [
      'Zeskanowanie kodu, który jest już na ostatnim etapie, nie powoduje żadnego efektu — zamówienie pozostaje na swoim miejscu.',
    ],
  },
  {
    id: 'processing-cad', category: 'productie', roles: ['all'], order: 3,
    title: 'Obróbki i Edytor CAD',
    image: '/manual/processing-cad.png',
    imageAlt: 'Obróbki i Edytor CAD',
    content: `# Obróbki i Edytor CAD

Strona **Obróbki** (\`/prelucrari\`) to techniczny warsztat dla kart produkcyjnych: otwory, zawiasy, uchwyty, wycięcia, obróbki krawędzi — wszystko to wizualizowane na szkle w interaktywnym edytorze CAD.

## Karta obróbki

- Pełna lista paneli w zamówieniu (z wymiarami i typem szkła).
- Dla każdego panelu: lista obróbek (kod szablonu + parametry: odległość, średnica, offset).
- Wiele obróbek jest **wypełnianych automatycznie** z konfiguracji 3D (zawiasy, uchwyty, zamki) — edytujesz tylko wyjątki.

## Edytor CAD — skróty klawiszowe

| Klawisz | Akcja |
|---|---|
| **J** | JOIN — łączy dwie bliskie obróbki (tolerancja 10mm) |
| **Ctrl + D** | Duplikuj wybraną obróbkę |
| **Ctrl + Shift + D** | Duplikuj **wszystkie** obróbki na inny panel (automatyczne odbicie lustrzane na osi X) |
| **Delete** | Usuń wybraną obróbkę |
| **Lewy przycisk myszy + przeciągnij** | Przesuń obróbkę |
| **Kółko myszy** | Zoom |

## Szablony

Katalog **Szablony obróbki** (kategorie: **30. zawiasy i wycięcia**, **51. otwory na uchwyty**) synchronizuje się automatycznie z akcesoriami wybranymi w 3D. Dodanie nowego zawiasu do katalogu generuje prawidłowe wycięcie na szkle.

## Eksport

- **DXF** (R9 → R2010) — dla przemysłowych maszyn CNC, z mapowaniem warstw.
- **PDF** — dla warsztatu, z wymiarowaniem i legendą obróbek.
- Przycisk **„Wyślij do CNC”** generuje połączony plik DXF i listę cięć.
`,
    tips: [
      'Krok pozycjonowania wynosi 0.5mm; użyj przecinka do wartości dziesiętnych.',
      'Niezaznaczone elementy są wyświetlane na czarno — zaznacz, aby zobaczyć wymiary i parametry.',
    ],
    warnings: [
      'Zmiany na panelu zapisują się tylko po naciśnięciu **Zapisz obróbkę** — zmiana strony bez zapisywania powoduje ich utratę.',
    ],
  },
  {
    id: 'operational-dashboard', category: 'operational', roles: ['all'], order: 0,
    title: 'Pulpit Operacyjny',
    image: '/manual/operational-dashboard.png',
    imageAlt: 'Pulpit Operacyjny',
    content: `# Pulpit Operacyjny

Strona **Pulpit Operacyjny** (\`/operational\`) to centralny panel dla warsztatu i logistyki: widzisz w czasie rzeczywistym, co dzieje się na produkcji, montażu, serwisie i cięciu.

## Karty podsumowujące

- **Produkcja**: liczba zamówień na każdym etapie Kanban (cięcie, szlifowanie, hartowanie, montaż, pakowanie).
- **Montaż**: prace zaplanowane na dziś / w tym tygodniu, opóźnienia.
- **Serwis**: otwarte zlecenia serwisowe, priorytet, SLA.
- **Cięcie**: panele w kolejce do optymalizacji, szkło przydzielone na taflę.

## Automatyczne odświeżanie

Strona odświeża się **automatycznie co 60 sekund** — możesz na stałe wyświetlać ją na ekranie TV w warsztacie.

## Szybkie akcje

- Kliknięcie na dowolną kartę przenosi bezpośrednio do szczegółowej strony (Kanban produkcji, lista montaży itp.).
- Przycisk **„Odśwież teraz”** wymusza natychmiastową aktualizację.
`,
    tips: [
      'Używaj tej strony na dużym ekranie w warsztacie, aby zapewnić widoczność dla całego zespołu.',
      'Dla wskaźników finansowych (obrót, marże) użyj głównego pulpitu.',
    ],
  },
  {
    id: 'reports', category: 'operational', roles: ['all'], order: 3,
    title: 'Raporty',
    image: '/manual/reports.png',
    imageAlt: 'Raporty',
    content: `# Raporty

Strona **Raporty** (\`/rapoarte\`) zapewnia pełny wgląd w sprzedaż i zużycie materiałów.

## Dostępne raporty

1. **Sprzedaż miesięczna** — obrót miesięczny, z podziałem na kategorie (prysznice, drzwi, balustrady itp.) oraz na handlowców.
2. **Zużycie materiałów** — ilości szkła, profili i akcesoriów zużytych w danym okresie, zagregowane według kodu produktu.
3. **Najlepsi klienci** — ranking według wartości zamówień w wybranym okresie.
4. **Marże** — różnica między kosztem produkcji a ceną sprzedaży, na zamówienie.

## Filtry

- **Zakres dat** (kalendarz od / do).
- **Kategoria produktu**.
- **Operator** (handlowiec).
- **Status zamówienia** (oferta, potwierdzone, w produkcji, dostarczone).

## Eksport

Wszystkie raporty można eksportować do formatu **CSV** z **BOM UTF-8** (Excel poprawnie otwiera polskie znaki diakrytyczne).

Wartości uwzględniają globalny przełącznik **RON / EUR**.
`,
    tips: [
      'Do analizy zewnętrznej w Excelu użyj eksportu CSV — BOM gwarantuje, że znaki diakrytyczne będą wyświetlane poprawnie.',
      'Filtry są zapamiętywane dla Twojego konta między sesjami.',
    ],
  },
  {
    id: 'installation-reports', category: 'operational', roles: ['all'], order: 4,
    title: 'Raporty montażowe',
    image: '/manual/installation-reports.png',
    imageAlt: 'Raporty montażowe',
    content: `# Raporty montażowe

Strona **Raporty montażowe** (\`/rapoarte-montaj\`) śledzi wydajność zespołów montażowych i optymalizuje planowanie.

## Co widzisz

- **Wydajność zespołu**: liczba ukończonych montaży, średni czas na zlecenie, przebyty dystans.
- **Mapa zoptymalizowanych tras** — system proponuje optymalną kolejność prac na dany dzień dla każdego zespołu (algorytm minimalizacji odległości).
- **Checklista ukończenia pracy** — procent poprawnie wypełnionych checklist, podpisy klientów.
- **Incydenty** — przełożone prace, reklamacje, zwroty.

## Filtry

- **Przedział czasowy** (dzień / tydzień / miesiąc).
- **Zespół** lub **pojazd**.
- **Obszar geograficzny**.

## Szybkie akcje

- Kliknięcie na zlecenie otwiera pełne szczegóły: klient, adres, produkty, zdjęcia przed/po, podpis.
- Przycisk **„Zmień termin”** przenosi zlecenie w kalendarzu bez utraty wypełnionej checklisty.
`,
    tips: [
      'Zoptymalizowana trasa uwzględnia harmonogram każdego zespołu oraz okna czasowe potwierdzone z klientami.',
      'Powiadomienia o przeglądzie technicznym/ubezpieczeniu OC dla pojazdów pojawiają się 30 dni przed ich wygaśnięciem.',
    ],
  },
  {
    id: 'data-export', category: 'setari', roles: ['all'], order: 17,
    title: 'Eksport i import danych',
    image: '/manual/export-date.png',
    imageAlt: 'Ustawienia › Dane — eksport i import',
    accent: 'green',
    content: `# Eksport i import danych

W **Ustawienia → Dane** masz pełną kontrolę nad danymi wprowadzonymi do platformy. Wszystkie dane należą do subskrybenta, są ściśle izolowane na firmę (RLS na \`company_id\`) i **mogą być eksportowane lub ponownie importowane w dowolnym momencie, bez żadnych ograniczeń**.

---

## 1. Eksport danych

![Obszar eksportu](/manual/export-date.png)

Karta **Eksport danych** udostępnia 5 przycisków:

- **Klienci (CSV)** — pełna lista z nazwą, typem, firmą, kontaktem, adresem, NIP, rabatem, uwagami.
- **Oferty (CSV)** — wszystkie oferty z nr ref, produktem, klientem, ceną, VAT, narzutem, statusem, datą.
- **Zamówienia (CSV)** — zamówienia z numerem, statusem, sumą częściową, rabatem, sumą, zapłacone, dostawa.
- **Materiały (CSV)** — własny katalog z kodem, nazwą, typem, jednostką, ceną, stanem, dostawcą, lokalizacją.
- **Pełny eksport (JSON)** — jeden plik ze wszystkimi 4 tabelami + znacznik czasu (\`exported_at\`).

### Jak eksportować

1. Przejdź do **Ustawienia → zakładka Dane**.
2. Kliknij przycisk wybranej kategorii (lub **Pełny eksport** dla wszystkiego).
3. Plik pobiera się automatycznie. Nazwa zawiera datę: \`clients_2026-05-22.csv\`, \`full_export_2026-05-22.json\`.
4. Otwórz CSV w Excel / LibreOffice (BOM UTF-8 zapewnia poprawne znaki) lub JSON w edytorze tekstu.

> **Ważne dla subskrybentów:** masz prawo RODO do **przenoszenia danych**. Możesz eksportować i przechowywać lokalnie wszystkie swoje dane, zawsze i tyle razy ile chcesz, bez limitu.

---

## 2. Import danych

![Obszar importu](/manual/export-date-import.png)

Karta **Import danych** pozwala ponownie wczytać do platformy pliki CSV (na kategorię) lub pełny JSON zapisany wcześniej. Przydatne do:

- **migracji** z innego systemu (przygotuj CSV z tymi samymi nagłówkami co eksport),
- **przywracania** po przypadkowym usunięciu (z ostatniego pełnego eksportu),
- **masowego wczytywania** klientów, materiałów lub ofert.

### Jak importować

1. W karcie **Import danych** kliknij przycisk kategorii (Klienci / Oferty / Zamówienia / Materiały) dla CSV, lub **Pełny import** dla JSON.
2. Wybierz plik z komputera.
3. Otwiera się **dialog podglądu** pokazujący: tabelę docelową, liczbę wykrytych rekordów i pierwsze znalezione kolumny.
4. Sprawdź dane i kliknij **Potwierdź import** (lub Anuluj).
5. Na końcu pojawia się powiadomienie z liczbą wierszy zaimportowanych pomyślnie / błędów.

### Klucze konfliktu (duplikaty)

Import używa unikalnego klucza na tabelę:

| Tabela | Klucz konfliktu |
|---|---|
| Klienci | \`name\` |
| Oferty | \`ref_number\` |
| Zamówienia | \`order_number\` |
| Materiały | \`code\` |

Wiersze z już istniejącym kluczem mogą zostać **nadpisane** — zrób eksport przed importem, jeśli chcesz kopię zapasową.

### Oczekiwany format

- **CSV** — ten sam zestaw nagłówków co w odpowiednim eksporcie, kodowanie UTF-8.
- **JSON** — dokładnie struktura z **Pełnego eksportu** (\`clients\`, \`quotes\`, \`orders\`, \`materials\` + \`exported_at\`).

---

## Szczegóły techniczne

- Eksport pobiera **wszystkie rekordy**, z automatyczną paginacją po 1000 w tle.
- Import przetwarza partie po 100 wierszy i automatycznie wstrzykuje kontekst firmy (RLS).
- Wszystko co eksportujesz/importujesz jest izolowane do twojej firmy.
`,
    tips: [
      'Rób co miesiąc pełny eksport (JSON) — to najbezpieczniejsza forma lokalnej kopii zapasowej.',
      'Przed każdym masowym importem wyeksportuj tabelę docelową, aby mieć pod ręką poprzednią wersję.',
      'Dla CSV ze znakami diakrytycznymi otwórz w Excel przez *Dane → Z tekstu/CSV* z kodowaniem UTF-8.',
    ],
  },
  {
    id: 'data-protection', category: 'setari', roles: ['all'], order: 18,
    title: 'Ochrona danych',
    image: '/manual/protectia-datelor.png',
    imageAlt: 'Karty Kopia / Odzyskiwanie / Bezpieczeństwo',
    content: `# Ochrona danych

Bezpieczeństwo i dostępność Twoich danych to wysoki priorytet. Platforma działa na **infrastrukturze Lovable Cloud**, z wielowarstwową ochroną i zgodnością z RODO.

## Automatyczna kopia zapasowa

- **Codzienna automatyczna kopia**, bez interwencji z Twojej strony.
- Historia przechowywana minimum 7 dni (Point-in-Time Recovery).
- Kopie szyfrowane i redundantnie przechowywane w europejskich centrach danych.

## Odzyskiwanie

- W przypadku przypadkowej utraty dane można odzyskać na żądanie przez zespół wsparcia.
- Zalecamy także **okresowy lokalny eksport** (sekcja *Eksport danych*).

## Bezpieczeństwo

- **Ścisła izolacja multi-tenant** przez Row-Level Security na \`company_id\`.
- **Szyfrowanie w tranzycie** (HTTPS/TLS) i **w spoczynku** na dysku.
- **JWT** dla sesji, **silne hashowanie** haseł.
- Kontrola **HIBP** przy tworzeniu konta i zmianie hasła.
- Europejskie centra danych, zgodność z **RODO**.

## Twoje prawa RODO

| Prawo | Jak je realizować |
|---|---|
| Przenoszalność | Eksport w Ustawienia → Dane |
| Dostęp | Zobacz wszystkie swoje dane w platformie |
| Sprostowanie | Edytuj dowolne pole w dedykowanych interfejsach |
| Usunięcie | Na żądanie przez wsparcie (\`isoftplustech@gmail.com\`) |

## Zalecenia

- Używaj **silnego i unikalnego hasła** do konta.
- Nie udostępniaj konta — dla współpracowników twórz dedykowanych użytkowników (Ustawienia → Zespół).
- **Wyloguj się** na urządzeniach publicznych lub współdzielonych.
- Rób **miesięczny eksport** i przechowuj plik w bezpiecznym miejscu.
- Zobacz [Politykę prywatności](/privacy-policy) i [Politykę cookies](/cookie-policy).
`,
    tips: [
      'Twoje dane pozostają Twoje: zawsze możesz je w pełni wyeksportować (CSV/JSON).',
      'Najbezpieczniejsza kombinacja: automatyczna kopia platformy + miesięczny eksport lokalny.',
    ],
    warnings: [
      'Nigdy nie przekazuj hasła e-mailem, na czacie ani telefonicznie — wsparcie nigdy nie poprosi o hasło.',
    ],
  },
];
