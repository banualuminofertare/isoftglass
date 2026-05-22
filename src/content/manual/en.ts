import type { ManualSection, ManualCategory } from './types';

export const categoriesEN: ManualCategory[] = [
  { id: 'introducere', label: 'Getting Started', order: 1 },
  { id: 'calculatoare', label: '3D Calculators', order: 2 },
  { id: 'vanzari', label: 'Sales', order: 3 },
  { id: 'productie', label: 'Production', order: 4 },
  { id: 'operational', label: 'Operations', order: 5 },
  { id: 'setari', label: 'Settings', order: 6 },
];

export const sectionsEN: ManualSection[] = [
  {
    id: 'getting-started', category: 'introducere', roles: ['all'], order: 1,
    title: 'Welcome to iSoftGlass',
    image: '/manual/setari-companie.png',
    imageAlt: 'iSoftGlass screen — Company Information',
    content: `# Welcome to iSoftGlass

iSoftGlass is the **SaaS** platform for glass manufacturers and distributors. It covers the entire workflow: 3D configuration → quote → order → production → delivery → service.

## What you can do in 5 minutes

1. **Fill in your company details** in *Settings → Company* (CUI, address, IBAN, logo).
2. **Check your prices** in *Settings → Pricing* — the standard catalog is automatically loaded; you just need to adjust what's different.
3. **Add your first customer** in *Customers → New Customer* (or let it be created automatically when you save the first quote).
4. **Open a 3D calculator** from the side menu (e.g., *Shower Enclosures*) and configure it in 6 steps.
5. **Save as a quote** — it will appear in *Orders* with a ready-to-send PDF.
6. **Send to production** when the customer confirms — the stock is automatically deducted.`,
    tips: [
      'The top bar has a RON / EUR switch — internal prices are always in RON; this is just a display setting.',
      'Click the 📖 (teal) icon anytime to reopen this manual exactly to the current section.',
    ],
  },
  {
    id: 'header-icons', category: 'introducere', roles: ['all'], order: 2,
    title: 'Top Bar and Shortcuts',
    content: `# Top Bar

In the top-right corner, you have all the global commands:

1. 🔔 **Yellow bell (amber)** — announcements and news published by the iSoftGlass team. The red number = unread announcements.
2. 📖 **Manual (teal outline)** — the manual you are reading now. It opens to the section relevant to the current page.
3. **RON / EUR** — changes the currency displayed throughout the application. The conversion uses the exchange rate from *Settings → Company*.
4. **🇷🇴 RO** — language selector. We support 9 languages (RO, EN, IT, DE, PL, FR, ES, NL, HR).
5. **Logout** — securely sign out of your account.

## Sidebar — Left Menu

- **Main** — Dashboard, 3D Calculators, Settings
- **Operational** — Orders, Production, Scanner, Customers, Reports, Installation
- Click the **⬅** button next to the logo to collapse the sidebar (for more screen space).`,
    tips: [
      'Internal price storage is always in RON — switching to EUR is for display purposes only.',
      'Changing the language only affects the interface; the data you enter remains in the original language.',
    ],
  },
  {
    id: 'calc-flow-6-steps', category: 'calculatoare', roles: ['all'], order: -1,
    title: 'The 6 Steps in a 3D Calculator',
    image: '/manual/calc-step6-finalizare.png',
    imageAlt: 'Step 6 - finalizing a quote with customer data and PDF/Save/Add to Cart buttons',
    content: `# The 6 Steps in a 3D Calculator

Any 3D calculator (shower enclosure, door, balustrade, mirror, kitchen backsplash, partition wall) follows the **same linear 6-step flow**. At each step, you have the 3D view on the right, which updates in real-time, and your progress is marked in the top bar.

---

## Step 1 — Product Type

You choose the shape or typology (e.g., **90° Corner**, **Walk-in / Niche**, **Pentagon**, **Bathtub Screen**, **Fixed Panel**). Each type preloads the basic geometry and the list of suitable profiles.

![Step 1 - product type selection](/manual/calc-step1-tip.png)

## Step 2 — Opening System

You choose the operating mode: **with hinges** (classic), top-bottom **pivot** (minimalist), or **sliding** on a track (space-saving). Your selection here automatically determines which accessories you can add in Step 5.

![Step 2 - opening system](/manual/calc-step2-dimensiuni.png)

## Step 3 — Glass

You set the **thickness** (6/8/10/12 mm), **finish** (clear, gray, bronze, frosted), and options: **anti-limescale treatment**, **edge polishing**, **tempering**, **lamination**. The glass price is instantly recalculated.

![Step 3 - glass selection](/manual/calc-step3-sticla.png)

## Step 4 — Door Configuration & Dimensions

You set the **opening side** (front / side), **direction** (inward / outward), **hinge side** (left / right), and the final **dimensions** (width × height × depth). Click on any dimension in the 3D scene for quick editing (Enter / Tab saves).

![Step 4 - door and dimensions](/manual/calc-step4-profile.png)

## Step 5 — Profiles & Accessories

You choose from custom lists: **gasket profiles**, **U-profiles / perimeter profiles**, **stabilizer bars**, **extra kits**. For complete details on how this step works, see the **“How Accessories Work in Calculators”** section.

![Step 5 - profiles and accessories](/manual/calc-step5-accesorii.png)

---

## Step 6 — Finalize Quote (Detailed)

This is where you turn the configuration into a commercial action. Step 6 has 3 clear areas: **customer data**, **extra amount & total**, and **action buttons**.

![Step 6 - finalization](/manual/calc-step6-finalizare.png)

### Customer Info

- **Customer Type** — Individual / Company / Distributor. **Very important**: the type you select here automatically applies the markup configured in **Settings → Customer Markups**, so the displayed price already includes the margin for that type.
- **Customer Name** — the name that appears on the quote and the PDF.
- **Phone** & **Email** — contact details used in the CRM and for sending the quote.

> When you save, if the customer's name doesn't exist in the CRM database, the system **automatically creates a new record**. If it exists, it uses the existing one (matching by name).

### Extra Amount

The **“Extra amount”** field allows you to add an arbitrary amount on top of the calculated subtotal. What it's used for in practice:

- **Customer transport** (e.g., +150 RON for delivery).
- **Additional installation** beyond the standard package.
- **Special labor** (e.g., drilling in granite, non-standard parts).
- **Urgency surcharge** when the job needs to be prioritized.
- **Commercial discount** — you enter a **negative** value (e.g., -50 RON) and it's subtracted from the total.

The amount is added to the subtotal **before** VAT and appears separately on the PDF, transparent to the customer.

### Subtotal, VAT, and Total

The card displays in real-time: **Subtotal (excl. VAT)**, **VAT %** (from settings), and **Total (incl. VAT)**. Changing any parameter (glass, accessory, extra amount) triggers an instant recalculation.

### The 3 Action Buttons

1. **Download PDF** — generates the PDF quote (company logo, customer data, product list with a 70×47 px 3D snapshot, accessories aggregated by code, labor, total incl. VAT). **Used for** quickly sending via email / WhatsApp **without** saving to the system. Useful when you just want a rough estimate.

2. **Save Quote** — creates a quote in the database with the number **OFR-YYYYMMDD-HHMMSS** and an **order with the status “Quote”**. **Used when** the quote is firm and you want to find it later in **Orders**, re-edit it, or turn it into a job.

3. **Add to Cart** — adds the current product to the **active cart** (bottom-right icon with a counter badge) **without** finalizing the order. **Used for** quotes with multiple products: e.g., shower + mirror + kitchen backsplash for the same customer — you add them one by one, then finalize the entire cart as a single order.

---

## What Happens After “Add to Cart”

![The cart with added products](/manual/cos-flow.png)

### 1. The Cart (bottom-right icon)

Click the cart icon with the counter badge, and the **Order Products** side panel opens:

- Lists all added products, each with **dimensions**, **glass thickness**, and **price**.
- **+ / -** buttons for quantity on each line item.
- The red **trash can** icon deletes the line item.
- The **“Empty”** button removes the entire cart.
- At the bottom: **Order total** (the sum of all products).

### 2. Finalize the Order

You press **“Finalize”** and the **Create order from cart** dialog opens:

![Finalize order dialog](/manual/cos-finalizare.png)

- **Cart products** — a summary of cart products with the total.
- **Client** — customer data (automatically pulled from the last added product).
- **Delivery Address** — delivery / installation address.
- **Delivery Date** — estimated delivery date.
- **Notes** — internal remarks.

You press **Create Order**: the system generates a unique order number and places the order in **Order Management** with the status **“Quote”**.

### 3. In Order Management

The order appears immediately in the list. From here, you can:

- **Download** the consolidated **PDF** (all products aggregated, accessories summed by code).
- **Send to production** — automatically deducts stock, creates the production sheet and Kanban card.
- **Issue invoice** or **proforma (advance payment)**.
- **Schedule installation** with the installation team.
- **Open the order** (click on the row) for the **Details / Products / History / Preview** tabs.

### 4. Subsequent Editing

From the **Products** tab of an order, the **Edit** button sends you back to the original calculator with the **entire configuration restored** from \`full_config\` — including customer type, extra amount, and accessories. You modify → Save → the order updates automatically.`,
    tips: [
      'In Step 6, changing the **Customer Type** between Individual / Company / Distributor instantly recalculates the entire subtotal with the correct markup.',
      'Use **Download PDF** for quick email quotes, and **Save Quote** only when the quote is firm — this avoids cluttering your history with drafts.',
      'The cart allows you to configure multiple products for the same customer and submit them as a **single order** with a single aggregated PDF.',
      'The entire configuration (including the extra amount and customer type) is saved in `full_config` — when you reopen it, everything is restored exactly as it was.',
    ],
    warnings: [
      'The negative extra amount (discount) does NOT check if the total drops below zero — be careful with the value.',
      'If you change prices in Settings **after** saving a quote, old quotes will **not** be recalculated automatically — they keep their initial values.',
    ],
  },
  {
    id: 'accessory-flow', category: 'calculatoare', roles: ['all'], order: 0,
    title: 'How Accessories Work in Calculators',
    image: '/manual/accesorii-import.png',
    imageAlt: 'Accessories Catalog — Import to my list button',
    content: `# How Accessories Work in Calculators

All 3D calculators (Shower Enclosure, Doors, Balustrade, Mirror, Kitchen Backsplash, Partition Walls) use the **same system** for accessories: hinges, handles, U-profiles, stabilizer bars, sliding kits, stoppers, locks, etc.

The logic is simple and is done **only once**:

> **You import from the catalog → it's saved in “Select product” → you use them anywhere, in any quote.**

You don't have to search for the accessory again for every job — once imported, it remains in your personal list until you decide to remove it.

---

## Step 1 — Open the Accessories Catalog

Go to **Settings → Pricing → Accessories** (or directly to **Settings → Accessories Catalog**, depending on the interface version).

Here you can see the system's global catalog — thousands of codes grouped by category: hinges, handles, U-profiles, sliding kits, gaskets, stabilizer bars, stoppers, locks, supports, caps.

![Accessories Catalog](/manual/accesorii-import.png)

- Use the **cross-category search** (at the top) — search by code, name, or finish, across all categories.
- The side filters narrow down by category / sub-category.

## Step 2 — Import the Accessories You Need

On each accessory's row in the catalog, you have an **“Import”** (or “Add to my list”) button. Click it — the accessory is immediately added to **your personal list**, which is isolated per company (strict RLS).

Check multiple rows and press **“Import selection”** to add a whole group (e.g., the entire set of hinges for shower enclosures).

> **You do this only once.** After importing, the accessory becomes available to all users in your company, in all calculators.

## Step 3 — Check Prices and Units

In your local list, each accessory displays:

- **Code** and **name** (pulled from the catalog).
- **Price** (you can apply your own override — it does not affect the global catalog).
- **Unit** (pcs, ml, set) — it also supports decimal values for ml.
- **Available finish** (chrome, matte, brushed, etc.).

Modify the price directly in the cell — it saves automatically and appears immediately in the calculators.

## Step 4 — In the Calculator, Open “Select product”

Enter a calculator (e.g., **Shower Enclosures**), get to the **Accessories** step (hinges, handle, U-profile, bar, etc.).

For each slot, the **“Select product”** dropdown displays **only the accessories you have imported** — narrowed down to the appropriate type (e.g., the Handle slot only shows handles).

![Select product dropdown in calculator](/manual/accesorii-selecteaza-produs.png)

- The list is clean: you won't get lost in thousands of irrelevant codes.
- Quick search within the dropdown by code or name.

## Step 5 — Adjust Quantity and Finish

After choosing the accessory:

- **Quantity** — for hinges, you can choose 2 or 3 (your choice is authoritative, overriding the automatic rule).
- **Finish** — color/finish from the available options (with a fallback to the parent if the exact variant is missing).
- **Position** — hinges are measured top-down, the handle is measured bottom-up (an industry convention, already pre-configured).

## Step 6 — Save Configuration → Accessories are Added to the Quote

You press **“Save as Quote”** or **“Add to Cart”**. The selected accessories:

1. Are attached to the product with their price in RON (display convertible to EUR).
2. Appear in the **OrderPreview** and in the quote PDF, automatically aggregated by code (same code = sum of quantities).
3. Are stored in the \`full_config\` JSON — the source of truth for the PDF, DXF, and subsequent edits.
4. When sent to production, the **stock is automatically deducted** according to the quantities in the quote.

![Accessory added to a quote](/manual/accesorii-in-oferta.png)`,
    tips: [
      'Import once — after that, the accessories remain in the “Select product” list for all colleagues in your company.',
      'Prices can be overridden locally (per-company override) without affecting the system catalog.',
      'You use the same workflow in ALL calculators: shower, doors, balustrade, mirror, kitchen backsplash, walls.',
    ],
    warnings: [
      'If you remove an accessory from your personal list, old quotes remain valid (the configuration is saved in `full_config`), but you can no longer select it in new jobs until you re-import it.',
    ],
  },
  {
    id: 'calc-shower', category: 'calculatoare', roles: ['all'], order: 1,
    title: 'Shower Enclosure Calculator',
    image: '/manual/calc-dus.png',
    imageAlt: '3D shower enclosure configurator',
    content: `# Shower Enclosure Calculator

Visually configure in 3D any type of enclosure: 90° corner, walk-in, pentagon, bathtub, fixed panel.

## The 6 Steps

1. **Enclosure type** — choose the shape (90° corner, niche, pentagon, bathtub screen, fixed).
2. **Dimensions** — click on a dimension in the 3D scene to edit it (Enter / Tab saves).
3. **Glass** — thickness (8/10/12 mm), finish (clear, gray, bronze), optional tempering.
4. **Profiles** — U-profile, wall, 90° corner, sliding kit (where applicable).
5. **Accessories** — hinges (2 or 3), handle, stabilizer bar, gaskets.
6. **Save** — as a quote or directly as a new job.`,
    tips: [
      'Hinges are measured from the **top down**, and the handle from the **bottom up** — an industry convention.',
      'The fixed panel does NOT have an implicit deduction of 10 mm — only the cumulative total of profiles + gaskets.',
      'The sliding system does not require hinges and automatically calculates the overlap from the kit.',
    ],
    warnings: [
      'For 90° corners, U-profiles are forced to be hidden at the intersection to avoid duplication.',
    ],
  },
  {
    id: 'calc-door', category: 'calculatoare', roles: ['all'], order: 2,
    title: 'Glass Door Calculator',
    image: '/manual/calc-usa.png',
    imageAlt: '3D glass door configurator',
    content: `# Door Calculator

For interior doors with hinges, pivots, or sliding on a track.

## Steps

1. **System** — With hinges, Top-bottom pivot, Sliding on a track.
2. **Dimensions** — width, height, door opening gap.
3. **Glass** — thickness and finish.
4. **Side gaskets** — \`lateralSelections\` array with separate options for left/right/top/bottom.
5. **Cutouts** — for handle or lock (threshold >50 mm = large, ≤50 mm = small).
6. **Accessories** — hinges, handle, stopper, lock.`,
    tips: [
      'The pivot is automatically calculated based on the weight of the glass.',
      'For a sliding system, the track and guide are included in the kit — do not add them separately.',
    ],
  },
  {
    id: 'calc-balustrade', category: 'calculatoare', roles: ['all'], order: 3,
    title: 'Balustrade Calculator',
    image: '/manual/calc-balustrada.png',
    imageAlt: '3D balustrade configurator',
    content: `# Balustrade Calculator

Configuration for glass balustrades: interior, exterior (laminated mandatory), stairs (sloped panels).

## Steps

1. **Type** — Interior, Exterior, Stairs.
2. **Total length** and **height** — in mm.
3. **Glass** — laminated 8+8, 10+10, or single tempered (interior only).
4. **Fixing** — continuous U-profile, spot clips, posts.
5. **Handrail** — optional (wood, stainless steel, aluminum).
6. **Caps** — for the U-profile.`,
    warnings: [
      'For exteriors, the glass MUST be laminated — a mandatory safety standard.',
    ],
  },
  {
    id: 'calc-mirror', category: 'calculatoare', roles: ['all'], order: 4,
    title: 'Mirror Calculator',
    image: '/manual/calc-oglinda.png',
    imageAlt: '3D mirror configurator',
    content: `# Mirror Calculator

For simple mirrors or those with special processing.

## Steps

1. **Shape** — Rectangle, Square, Circle, Oval, Custom.
2. **Dimensions** — in mm; for a custom shape, you draw in the CAD editor.
3. **Mirror type** — standard silvered, antiqued, smoked, bronze.
4. **Edge** — polished, beveled, ground.
5. **Cutouts** — for switches, sockets, supports.
6. **LED lighting** — optional, perimeter or back-lit.`,
  },
  {
    id: 'calc-kitchen', category: 'calculatoare', roles: ['all'], order: 5,
    title: 'Kitchen Backsplash Calculator',
    image: '/manual/calc-front-bucatarie.png',
    imageAlt: '3D kitchen backsplash configurator',
    content: `# Kitchen Backsplash Calculator

Furniture fronts made of lacquered, digitally printed, or matte sandblasted glass.

## Steps

1. **Finish** — RAL Lacquered, Digital Print, Matte Sandblasted.
2. **Dimensions** — width × height per front; multiply for multiple fronts.
3. **Color / Print** — select a RAL or upload a print file.
4. **Cutouts** — for handles or push-to-open.
5. **Fixing system** — adhesive on MDF, back screws, aluminum profile.
6. **Save** — automatic aggregation for entire kitchens.`,
    tips: [
      'For digital prints, the minimum recommended resolution is 150 dpi at the final size.',
    ],
  },
  {
    id: 'calc-panels', category: 'calculatoare', roles: ['all'], order: 6,
    title: 'Panels & Partition Walls',
    image: '/manual/calc-panouri.png',
    imageAlt: '3D panel and partition wall configurator',
    content: `# Panels and Partition Walls

Two sub-modules:

- **Simple panel** — glass without processing (cut-to-size glass pane).
- **Partition wall** — configurable grid with integrated doors.

## Partition Walls — Key Steps

1. **Grid** — define how many columns × rows; resize with interlock drag (the total width remains constant).
2. **Perimeter profiles** — top, bottom, side; they automatically break where there are doors.
3. **Interior profiles** — vertical and horizontal; \`usableWidth/Height\` ensures the panels fit.
4. **Integrated doors** — in any cell; automatically deducted from the perimeter profile.
5. **90° side panels** — the height synchronizes with the door's height.
6. **Glass & finishes** — per cell or global.`,
    warnings: [
      'When resizing a column, its neighbors automatically adjust to maintain the total width.',
    ],
  },
  {
    id: 'orders', category: 'vanzari', roles: ['all'], order: 1,
    title: 'Order Management',
    image: '/manual/comenzi-deschide.png',
    imageAlt: 'List of orders with statuses',
    content: `# Orders

All quotes and orders, with quick filters by status: Quote → Confirmed → In Production → Completed → Delivered → Canceled.

## Quick Actions on the Order Row

1. **Change status** — colored buttons directly on the row (Confirm, Complete, Deliver).
2. **Send to production** — automatically deducts stock and creates the production sheet.
3. **Generate DXF** — for CNC, for each panel.
4. **Edit** — re-opens the quote in the original calculator (all data restored).
5. **Delete** — only if it's not yet in production.

## Opening an Order in Detail

Click on the order number (or its row) in the **Order List** and a box opens with the order header (number, status, **Download PDF** button) and 4 tabs:

![Open order box](/manual/comenzi-detalii.png)

### 1. Details
Customer data, creation date, subtotal, VAT, total. Here you can quickly check the commercial data and have buttons for **Schedule Installation**, **Issue Invoice**, and **Proforma (advance payment)**.

### 2. Products
List of configured products, with quantity, unit price, and extra amount (if any). The **Edit** button on each product sends you back to the calculator for adjustments.

![Products Tab](/manual/comenzi-produse.png)

### 3. History
Log of changes: status changes, edits, payments, document generations. Useful for traceability and auditing — see who did what and when.

![History Tab](/manual/comenzi-istoric.png)

### 4. Preview
Detailed rendering of the quote exactly as it appears on the **PDF sent to the customer**: for each product, you see the configuration type, dimensions and glass area, applied processing, list of accessories with code and unit price, labor, and total. **Used for the final check** before sending the quote to the customer or the order to production — confirming that the prices of products, accessories, and labor are correct.

![Preview Tab](/manual/comenzi-previzualizare.png)

## Top Cards

Instant summary: total orders, value in RON, distribution by status.`,
    tips: [
      'The complete configuration (`full_config`) is kept intact from the cart to the order — no data is lost.',
      'Identical accessories are automatically aggregated on the final PDF (sum of quantities, unique code).',
      'The Preview tab always reflects the current values — if you change a price in Settings, it updates here.',
    ],
  },
  {
    id: 'invoicing', category: 'vanzari', roles: ['all'], order: 2,
    title: 'Invoicing',
    image: '/manual/facturare.png',
    imageAlt: 'Invoicing module with KPIs and charts',
    content: `# Invoicing

Issue invoices from confirmed orders, with custom series and e-Factura export (CIUS-RO and FatturaPA for IT).

## Steps

1. **Configure series** in *Settings → Invoicing → Series* (prefix, year, counter).
2. **Generate invoice** from an order: **€** button on the order row.
3. **Edit lines** — add/remove, adjust prices, VAT per line.
4. **Issue** — number is automatically assigned, status becomes "Issued".
5. **Record payment** — partial or full payment dialog.
6. **Export XML** — for ANAF (RO) or SDI (IT).

## KPIs

Top cards: invoiced, collected, outstanding, canceled.`,
    warnings: [
      'An issued invoice cannot be deleted — only canceled with a reason and replaced with a credit note.',
    ],
  },
  {
    id: 'clients-crm', category: 'vanzari', roles: ['all'], order: 3,
    title: 'Customers & CRM',
    image: '/manual/clienti-crm.png',
    imageAlt: 'CRM customer list with types',
    content: `# Customers

Complete database of customers: individuals, companies, distributors.

## Steps

1. **Add customer** — "New Customer" button or automatically when you save a quote for a new email.
2. **Customer type** — Individual / Company / Distributor (with a global discount).
3. **Contact details** — phone, email, address, CUI (if a company).
4. **CRM Pipeline** (admin) — leads, stages, conversions.
5. **History** — all of the customer's quotes and orders in one place.
6. **Specific Markup** — in *Settings → Customer Markup* you can set a different markup for each type.

## Top Filters

Search by name/email, filter by customer type.`,
    tips: [
      'Customers are automatically created from the 3D calculators when you save the first quote with a new email.',
    ],
  },
  {
    id: 'production-kanban', category: 'productie', roles: ['all'], order: 1,
    title: 'Kanban Production Flow',
    image: '/manual/productie-kanban.png',
    imageAlt: 'Kanban board with Cutting, Processing, Tempering columns',
    content: `# Kanban Production

The visual workflow by stages: **Cutting → Processing → Tempering → Coating/Printing → Assembly → Ready for Delivery**.

## Daily Steps

1. **Check the top KPIs**: total active, in progress, on hold, ready for delivery.
2. **Drag & drop** a card between columns to advance it manually.
3. **Click on a card** — opens the production sheet with technical drawings, materials, and accessories.
4. **Assign operator** — pre-planned in *Orders → Operator Planning*; saved in \`operator_name\` for traceability.
5. **Calendar View** — an alternative tab for date-based planning.

## Barcode Labels

From each production order sheet (and from the **Scanner** page), you have a **“Print Label”** button:

- The barcode is **CODE128**, automatically generated from the sheet number (using the JsBarcode library).
- The label contains: **sheet no.**, **order no.**, **customer**, **delivery date**, and **current stage**.
- It opens the browser's print dialog directly — you can use normal A4 printers or dedicated label printers (Zebra, Brother, etc.).
- You stick the label on the glass/frame/package and reuse it at each stage of the workflow.

## Scanning in the Workshop

The **Production → Scanner** page is optimized for the workshop's pace:

1. **Auto-focus** on the scan field — no need to click before each scan.
2. **HID Readers** — any USB 'keyboard-style' scanner works plug-and-play (no drivers required).
3. **Scan the barcode** on the label → the order **automatically advances** to the next stage in the workflow.
4. **Instant visual confirmation**: the card displays the new status, and the Kanban board updates.

This way, operators no longer waste time with manual drag & drop, and errors like “I forgot to mark it as done” are eliminated.

## Real-Time Tracking

The Kanban board **refreshes automatically** in the background:

- Scans made in the workshop appear **immediately** on office screens — no manual refresh needed.
- The top KPIs (active, in progress, ready for delivery) are recalculated live.
- Multiple operators can work simultaneously on different stages without stepping on each other's toes.
- The manager can see at any moment **where each order is** and **who is working on it**.

## Estimated Delivery Date

This is automatically calculated when an order enters production, based on the load of the columns.`,
    tips: [
      'Print the barcode label as soon as the order enters production and stick it on the package — it becomes the source of truth for the entire workflow.',
      'Leave the Scanner page open on a tablet/laptop in the workshop; the auto-focus ensures that any scan is captured even if no one is at the keyboard.',
      'For 24/7 flow, open the Kanban board on a large TV — you\'ll see progress in real-time without touching anything.',
    ],
  },
  {
    id: 'inventory', category: 'productie', roles: ['all'], order: 2,
    title: 'Stock & Inventory',
    image: '/manual/stoc.png',
    imageAlt: 'Inventory module with material lists',
    content: `# Stock

Material management: glass, accessories (hardware), consumables. Automatic deduction upon entering production.

## Steps

1. **Add material** — "New Material" button (code, type, price, minimum stock).
2. **Adjust stock** — per-row button for manual entries/exits.
3. **Stock movements** — tab with transaction history (entries, exits, reason).
4. **Monthly consumption report** — top button, CSV/Excel export.
5. **Minimum stock alerts** — red "Min. Stock" KPI on the top card.
6. **Location** — optional, for multiple warehouses.

## Auto-Deduction

When an order's status changes to **"In Production"**, the stock is automatically deducted according to the bill of materials for each product.`,
    warnings: [
      'Negative stock is allowed but marked in red — a manager must perform a physical inventory count and adjustment.',
    ],
  },
  {
    id: 'cutting', category: 'productie', roles: ['all'], order: 3,
    title: 'Cutting Optimization',
    image: '/manual/optimizare-debitare.png',
    imageAlt: 'Cutting optimization module with sheet selection',
    content: `# Cutting Optimization

A guillotine nesting algorithm for up to 50 orders simultaneously — minimizes glass waste.

## Steps

1. **Sheet type** — select from the catalog (e.g., 3210×2250 mm).
2. **Blade thickness** — default 3 mm, adjustable.
3. **Select orders** — from the list with search and status filter (you can "Select all 26").
4. **Press Optimize** — the algorithm runs and displays the sheets with the nested panels.
5. **View SVG** — each sheet with dimensions, panel labels, and colored waste.
6. **Export DXF/PDF** — to send to the cutting machine.

## Manage glass sheets

![Manage sheets dialog with standard glass sizes on the Cutting Optimization page](/manual/manage-glass-sheets.png)

Standard sizes (2550×3210, 2250×3210, Jumbo 6000×3210) are seeded automatically on first use. You can edit them anytime without leaving the cutting page — click the **⚙ Manage sheets** button next to the *Sheet type* selector.

1. **Add a new sheet** — fill in *Name* (e.g. "Custom 2000×3000"), *Width (mm)* and *Height (mm)*, then click **+ Add**.
2. **Enable / disable** — the toggle next to each size hides it from the *Sheet type* selector without deleting it (useful for seasonal sizes).
3. **Delete** — the red bin button permanently removes a size; use only if you are sure you will not cut on it again.
4. **Close the dialog** — changes apply immediately and the *Sheet type* selector refreshes automatically with the new dimensions and m² surface.

> Sheets are stored per company — your whole team sees the same list, isolated from other accounts.

## Stats

Utilization percentage, waste area, number of sheets.`,
    tips: [
      'Limit of 50 orders per session to maintain reasonable calculation times.',
    ],
  },
  {
    id: 'service', category: 'operational', roles: ['all'], order: 1,
    title: 'Complaints & Service Interventions',
    image: '/manual/service.png',
    imageAlt: 'Complaints module with charts and ticket list',
    content: `# Complaints & Service

Post-delivery incident management: customer complaints, factory defects, planned interventions.

## Steps

1. **New complaint** — top-right button.
2. **Associate order** — optional, for traceability.
3. **Priority** — Low / Medium / High / Critical.
4. **Defect type** — Customer Complaint, Factory Defect, Shipping Damage, Warranty.
5. **Schedule intervention** — choose a date and installation team.
6. **Close ticket** — with resolution and costs.

## Charts

Defect frequency, priority distribution, ticket status.`,
  },
  {
    id: 'installation', category: 'operational', roles: ['all'], order: 2,
    title: 'Installation & Teams',
    image: '/manual/montaj.png',
    imageAlt: 'Installation calendar with Teams, Vehicles, Checklist tabs',
    content: `# Installation

Planning installations, teams, vehicles, checklists, and route optimization.

## Tabs

1. **Installation Calendar** — monthly view with drag & drop.
2. **Installation Teams** — add members, assign to teams.
3. **Checklist** — templates cloned to each job upon creation.
4. **Route Optimization** — calculates the optimal order for the day's installations.
5. **Vehicles** — fleet with 30-day alerts for vehicle inspection (ITP) and compulsory insurance (RCA).

## Planning Steps

1. **"Schedule Installation"** button in the top right.
2. Select the order, team, vehicle, and date.
3. Attach a checklist (default or custom).
4. Save — it appears in the calendar.
5. **Postpone** — closes the current job and pre-fills a new one.`,
    tips: [
      'Vehicles with an inspection (ITP) or insurance (RCA) expiring in under 30 days will trigger an automatic alert.',
    ],
  },
  {
    id: 'settings-company', category: 'setari', roles: ['all'], order: 1,
    title: 'Company & Branding Settings',
    image: '/manual/setari-companie.png',
    imageAlt: 'Company settings — general information',
    content: `# Settings → Company

The data that appears on ALL generated documents (quotes, orders, invoices, production sheets).

## Essential Fields

1. **Company Name** — appears in the PDF header.
2. **CUI / CIF** — with RO prefix for Romania.
3. **Full Address** — Street, No., City, County, Postal Code.
4. **Phone and Email** — for contact on documents.
5. **Bank Account and BIC/SWIFT** — for invoices.
6. **Company Logo** — PNG/JPG/WebP/SVG, max 2 MB.

## PDF Customization

- **Logo size** and **position** — for quotes and invoices.
- **Custom texts** — terms, conditions, footer (rich-text via Tiptap).
- **EUR/RON exchange rate** — used for global conversion.

## White label

Subscribers can fully customize PDFs with their own logo and HTML texts.`,
    tips: [
      'The ideal logo is a transparent PNG, 3:1 or square ratio, min 400×400 px for print quality.',
    ],
  },
  {
    id: 'settings-pricing', category: 'setari', roles: ['all'], order: 2,
    title: 'Pricing & Catalog Settings',
    content: `# Settings → Pricing

Your local price catalog: materials, accessories, kits, finishes.

## Steps

1. **Materials Tab** — glass, profiles, accessories grouped.
2. **Search** — cross-category search.
3. **Edit price** — click on the cell, auto-save.
4. **Reset to system** — a button to discard the override and revert to the base price.
5. **Private variants** — add your own materials with a unique per-company code.
6. **Import / Export** — Excel + ZIP for pictures, automatic mapping to system categories.

## Price Hierarchy

Company (own override) > Global user > System (default catalog).`,
    tips: [
      'Company overrides are not visible to other companies — strictly isolated via RLS.',
      'Material images use cachebusting with a timestamp to immediately show the new version.',
    ],
    warnings: [
      'Resetting a price deletes the override and cannot be undone — check before you do.',
    ],
  },
  {
    id: 'settings-team', category: 'setari', roles: ['all'], order: 3,
    title: 'Team & Permissions Settings',
    content: `# Settings → Team

Invite team members and manage their module permissions.

## Steps

1. **Invite member** — by email; they receive a registration link.
2. **Role** — Subscriber (sales), Production, Installation, Company Admin.
3. **Allowed Modules** — check access for: Orders, Production, Stock, Invoicing, Service, etc.
4. **Activate/Deactivate** — keeps the history, just blocks login.
5. **Transfer admin** — in a single click, to another member.
6. **Traceability** — all actions are recorded with \`created_by\`.

## Access Tiers

- **Basic (60)** — Orders + 1-2 calculators.
- **Plus (100)** — All calculators + Stock.
- **Operational (150)** — Everything, including Service, Installation, Optimization.

## Billing

The subscription is tied to the **company owner** — employees are free.`,
    tips: [
      'Fixing an orphan account (admin) — users without a company can be manually assigned.',
    ],
  },
  {
    id: 'pricing-client-types', category: 'setari', roles: ['all'], order: 9,
    title: 'Markup by Customer Type (Individual / Company / Distributor)',
    image: '/manual/setari-adaos-tip-client.png',
    imageAlt: 'Settings → Customer Markups — Individual, Company, Distributor',
    content: `# Percentage Markup per Customer Type

In **Settings → Customer Markups**, you can define **3 differentiated price lists** starting from the same catalog, without duplicating items.

## The 3 Types

- **Individual** — end customers (retail). Typically, you add a positive markup here (e.g., +10% to +20%) because they don't get a commercial discount.
- **Company** — partner companies and firms. Usually left at **0%** (base price).
- **Distributor** — resale partners. Here, you usually set a **negative value** (e.g., -10% to -25%) to offer them a preferential price.

## How It Works

- The percentage is **automatically** applied on top of the base price of each item in the quote (glass, accessories, labor, kits).
- **Positive** values = markup on top of the standard price. **Negative** values = discount.
- The field accepts values between **-100% and +500%**, with a step of 0.5%.
- Changes become active after you press **“Save Markups”** (bottom-right button). The card highlights modified rows with a “modified” badge.

## Where It's Applied

In every **3D calculator**, in the **Customer Information** card, there is a **Customer Type** selector (Individual / Company / Distributor). When you change it:

1. The calculator detects the selected type.
2. It automatically applies the percentage set here to the subtotal.
3. The price displayed in the quote (and later in the PDF) already reflects the new type.

## What It's Good For

- **A single catalog list**, but different prices per customer category — without manually duplicating items.
- You can **quickly grant a discount to distributors** without modifying the base catalogs.
- Individuals can be invoiced with a standard commercial markup, without manual calculations in every quote.
- Changes are **retroactive only for new quotes** — already saved orders keep their initial prices (\`full_config\` is the source of truth).`,
    tips: [
      'You can set negative values (e.g., -15%) to offer a permanent discount to a category without touching the catalog.',
      'If in doubt, start with Company = 0% (reference price) and adjust the other two relative to it.',
      'The Customer Type selector in the calculator is saved in the quote, so a reopened quote retains the originally selected type.',
    ],
    warnings: [
      'Changing the percentage only affects new quotes. Existing orders must be re-edited if you want to recalculate them.',
    ],
  },
  {
    id: 'pricing-overview', category: 'setari', roles: ['all'], order: 10,
    title: 'Pricing — Overview',
    image: '/manual/setari-preturi.png',
    imageAlt: 'Settings → Pricing — category list',
    content: `# Settings → Pricing

Here you control **all prices** used in the 3D calculators, quotes, and PDFs.

## Available Categories

- **Accessories** — hinges, handles, bars, rollers, stoppers, gaskets, connectors
- **Glass** — by thickness and type (clear, matte, smoked, mirror)
- **Labor** — installation, cutting, polishing, drilling, cutouts
- **Profiles** — U-profile, wall, 90° corner, sliding profiles
- **Kits** — groups of accessories sold as a single item
- **Sliding mechanisms** — complete systems (with profile + rollers + stoppers)

## Global Catalog vs. Personal Override

- The **global catalog** (managed by the admin) is the starting point — you see it automatically.
- When you modify a price or a deduction, a **personal override** is saved in your space (\`pricing_config\`). The global catalog remains untouched.
- You can always reset the override with the **“Reset to catalog value”** button (see the dedicated section).

## Currency

Prices are stored internally in **RON**. The **RON / EUR** switch in the top bar only converts the display — no conversion is done in the database.`,
    tips: [
      'The search filter works across all categories simultaneously (code, name, finish).',
      'If you don\'t see an item, check if you have deactivated it from the row menu (crossed-out bell icon).',
    ],
  },
  {
    id: 'pricing-add-accessory', category: 'setari', roles: ['all'], order: 11,
    title: 'Adding a New Accessory',
    image: '/manual/setari-adauga-accesoriu.png',
    imageAlt: 'Add item dialog — accessory',
    content: `# How to Add a New Accessory

1. Go to **Settings → Pricing** and select the **Accessories** tab.
2. Press **“Add item”** (top-right).
3. Fill in the details:
   - **Code** — unique; used for deduplication, barcode scanning, and aggregation in the PDF.
   - **Name** — displayed in the calculator and PDF.
   - **Category / Type** — hinge, handle, stabilizer bar, rollers, stopper, gasket, etc.
   - **Price** — in the active currency (stored in RON).
   - **U.o.M.** — \`pcs\` for pieces, \`ml\` for linear meters, \`m²\` for area, \`kg\` for weight.
   - **Finish & color** — choose from presets or enter a custom hex code; this is also used in the 3D rendering.
   - **Image** — uploaded to storage; appears in the accessory selector and in the PDF.
4. Check the **“Product types”** where the accessory appears (shower, door, balustrade, mirror, panels, kitchen backsplash).
5. Check the compatible **“Processing types”** (laminated, tempered, matte).
6. **Save** — the accessory becomes immediately available in the checked calculators.`,
    tips: [
      'For U.o.M. other than pcs, you can use decimals (e.g., 2.5 ml).',
      'If you don\'t set an image, it is automatically inherited from the parent category.',
    ],
    warnings: [
      'The code must be unique. If it already exists, the system will update the existing item instead of creating a new one.',
    ],
  },
  {
    id: 'pricing-edit-fields', category: 'setari', roles: ['all'], order: 12,
    title: 'Edit Item — Advanced Fields',
    image: '/manual/setari-editare-element.png',
    imageAlt: 'Edit item dialog with glass deductions',
    content: `# Edit Item — Field by Field

Click the pencil icon on the row (or double-click) to open **Edit item**. Besides price and U.o.M., you have these technical fields:

## Price & U.o.M.

- The price is entered in the active currency from the header (RON or EUR) and is stored internally in RON.
- The U.o.M. determines how the price is multiplied in the calculator: \`pcs\` × quantity, \`ml\` × length, \`m²\` × area.

## Finish & Color

- **Hex color** + **roughness** are used both in the price list and in the 3D rendering — synchronized via \`MetalMaterial\`.
- If left empty, it is inherited from the parent element (e.g., a profile variant inherits the color from the base profile).

## Glass Deduction per Side (\`glass_deduction\`)

How many **mm** the profile inserts into the glass on each side where it is mounted. The calculator automatically subtracts this value from the raw dimension to get the actual glass size to be cut.

> Example: 8 mm U-profile on 8 mm laminated glass → \`8 + 0.38 + 8 = 16.38 mm\` total deduction (profiles + foil + profiles, cumulative).

## Detailed Deductions per Side (\`glass_deductions\`)

A JSON with separate \`top\`, \`bottom\`, \`left\`, \`right\`. Used when the profile has different values on each edge (e.g., a deep floor profile + a thin wall profile). It **accumulates** with the gaskets.

- **\`profile_height\`** (in the same JSON) — overrides the sum of \`top + bottom\` for the U-profile, if you want a single total value.

## Overlap (\`width_overlap\`)

How many mm the sliding panels **overlap** with the other panel or wall. The system subtracts this value from the **usable width** of the sliding kit.

> Example: a 1200 mm sliding kit with a 40 mm overlap → effective usable width is 1160 mm.

## Door Height Deduction (\`door_height_deduction\`)

mm subtracted from the total height for a **hinged door** (space for top hinge + bottom threshold). Typically 5–20 mm depending on the hinge.

## Fixed Panel Height Deduction (\`fixed_panel_height_deduction\`)

Identical, but for the fixed panel. **Defaults to 0** — the fixed panel has no automatic 10 mm deduction.

## Product / Processing Types

Check where the accessory appears (shower, door, balustrade...) and what processing it supports (laminated, tempered). If unchecked, it will not appear in the respective calculator.`,
    tips: [
      'Deductions are **cumulative**: profile + gasket + laminated foil are added together on the same side.',
      'Hinges are measured from the **top down**, the handle from the **bottom up** — this is a convention maintained in all calculators.',
      'A sliding system **does not use hinges** — the hinge quantity field automatically remains 0.',
    ],
    warnings: [
      'Any change to deductions immediately affects **all future 3D calculations**, including unconfirmed quotes. Already saved orders have their data frozen in `full_config` and will not change.',
    ],
  },
  {
    id: 'pricing-add-glass', category: 'setari', roles: ['all'], order: 13,
    title: 'Adding a Glass Type',
    image: '/manual/setari-sticla.png',
    imageAlt: 'Settings → Pricing → Glass',
    content: `# Glass

1. **Glass** tab → **“Add item”**.
2. Choose the **thickness**: 4 / 6 / 8 / 10 / 12 mm.
3. Choose the **type**: clear, smoked, matte (sandblasted), mirror, bronze, gray.
4. Set the **price / m²** (in the active currency).
5. Check the **processing** types available for this glass: tempered, laminated, polished, matte.

## Tempering

For tempering, the price is calculated with the formula:

\`\`\`text
Tempering price = Tempering_price × Thickness_mm × Area_m²
\`\`\`

You set a single base price; the system automatically applies the formula based on the glass thickness and area.

## Laminated

For laminated glass, side deductions accumulate with the **foil thickness** (default 0.38 mm) on each edge. See the example in the “Edit Item” section.`,
    tips: [
      'Matte (sandblasted) glass usually has a percentage markup compared to clear glass — you configure this as a multiplier in the processing field.',
    ],
  },
  {
    id: 'pricing-add-labor', category: 'setari', roles: ['all'], order: 14,
    title: 'Adding Labor',
    image: '/manual/setari-manopera.png',
    imageAlt: 'Settings → Pricing → Labor',
    content: `# Labor

1. **Labor** tab → **“Add item”**.
2. Choose the **type**: installation, cutting, edge polishing, drilling, cutout, transport.
3. Set the **U.o.M.**:
   - \`hour\` — for installation
   - \`ml\` — for edge polishing
   - \`pcs\` — for holes, cutouts
   - \`m²\` — for surface-based labor
4. **Price** per unit.
5. **Percentage vs. fixed value** — check if it is a multiplier (e.g., 15% on top of the glass value) or a fixed amount.
6. Associate with the **product types** where it is automatically applied.`,
    tips: [
      'Percentage-based labor is not affected by the EUR/RON switch — it remains the same in any currency.',
    ],
  },
  {
    id: 'pricing-add-kit', category: 'setari', roles: ['all'], order: 15,
    title: 'Accessory Kits',
    image: '/manual/setari-kituri.png',
    imageAlt: 'Settings → Kits',
    content: `# Kits

A **kit** is a group of accessories sold as a single item. Useful for sliding shower systems: the kit includes the profile, rollers, stoppers, and guide.

## Creating a Kit

1. Go to **Settings → Kits** (or the Kits tab in Pricing).
2. **“Add kit”** → code, name, **kit price** (final), covered **usable width**.
3. Add **components** — select from the accessory list and set the quantity.
4. Components are **deduplicated by code** — if the same code appears twice, the quantities are summed up.

## Usage in the Calculator

In the **sliding shower** calculator, you choose the kit from the dropdown. The system calculates:

\`\`\`text
Effective usable width = Kit_width - width_overlap
\`\`\`

and automatically applies **0 hinges** (a sliding system has no hinges).`,
    tips: [
      'The component prices are for information only — the **kit price prevails** in the quote.',
      'The kit image appears in the PDF; if it\'s missing, the main profile\'s image is used.',
    ],
  },
  {
    id: 'pricing-reset', category: 'setari', roles: ['all'], order: 16,
    title: 'Reset to Catalog Value',
    image: '/manual/setari-reset.png',
    imageAlt: 'Reset to catalog value button',
    content: `# Reset Personal Override

If you have modified a price or deduction and want to revert to the **standard value from the global catalog**:

1. Open **Edit item**.
2. Press **“Reset to catalog value”** (bottom-left in the dialog).
3. Your override from \`pricing_config\` is deleted and the item will again display the admin's value.

> Resetting affects **only that specific item**. All your other overrides remain intact.`,
    warnings: [
      'The action is immediate and cannot be undone. If you need a history, export your prices (Settings → Export data) before resetting.',
    ],
  },

  // ====== New sections — for subscribers ======
// ====== Secțiuni noi — pentru abonați ======
  {
    id: 'dashboard-home', category: 'introducere', roles: ['all'], order: 0,
    title: 'Main Dashboard',
    image: '/manual/dashboard-home.png',
    imageAlt: 'Main Dashboard',
    content: `# Main Dashboard

After logging in, you land on the **start page (\`/\`)** — a control panel with your key business indicators, updated in real time.

## What you see

- **Top KPIs**: turnover, orders in progress, orders delivered this month, average order value.
- **Sales chart** for the last 12 months (bar chart, with comparison to the previous year).
- **Revenue chart** by product categories (showers, doors, railings, mirrors, kitchen, panels).
- **Top products** sold in the selected period.
- **Critical stock** — materials with quantity below the configured minimum threshold.
- **Recent orders** — the last 10 orders with status and customer, with a direct click on the order.

## Filters

The **RON / EUR** toggle in the top bar affects all values displayed here (dynamic conversion, excluding VAT).
`,
    tips: [
      'The dashboard reloads automatically with every currency or language change.',
      'For an operational overview (production, installation, service), use the *Operational Dashboard* menu.',
    ],
  },
  {
    id: 'announcements', category: 'introducere', roles: ['all'], order: 3,
    title: 'Announcements and Notifications',
    image: '/manual/announcements.png',
    imageAlt: 'Announcements and Notifications',
    content: `# Announcements and Notifications

The 🔔 **yellow bell** icon in the top bar displays announcements published by the iSoftGlass team: updates, new features, planned maintenance.

## How it works

- The red number on the bell = **unread** announcements.
- Clicking the bell opens the list — each announcement has a title, category (**Update** or **Info**), date, and full content.
- Announcements are automatically marked as read when you open them.
- Important **Update**-type announcements also appear as a **notification at the top of the page** when a new version is released.

## Categories

- **Update** — new version, added features, fixes.
- **Info** — general information, tips, events.

Announcements are automatically translated into your interface language.
`,
    tips: [
      'Check announcements periodically to learn about new features that can save you time.',
    ],
  },
  {
    id: 'currency-language', category: 'introducere', roles: ['all'], order: 4,
    title: 'Currency and Language',
    image: '/manual/currency-language.png',
    imageAlt: 'Currency and Language',
    content: `# Currency and Language

## RON / EUR Toggle

The **RON / EUR** button in the top bar changes the display currency throughout the entire application — 3D calculators, quotes, orders, reports, dashboard.

- **Internal storage** is **always in RON**. EUR is for display only, calculated dynamically at the exchange rate set in *Settings → Company*.
- **All values are without VAT** in internal calculations; VAT is only applied when generating the invoice.
- You can enter values in EUR — they are automatically converted to RON on save.

## Language Selector

The **🇬🇧 EN** button opens the list of **9 available languages**: Română, English, Italiano, Deutsch, Polski, Français, Español, Nederlands, Hrvatski.

- Changing the language affects **only the interface** (menus, buttons, labels, manual).
- Data you enter (customer names, descriptions, notes) remains in the original language.
- The setting is saved for your account between sessions.
`,
    tips: [
      'The EUR exchange rate is updated only when you change it manually in Settings → Company.',
      'The user manual is fully translated into all 9 languages.',
    ],
  },
  {
    id: 'working-in-eur', category: 'introducere', roles: ['all'], order: 5,
    title: 'Working exclusively in EUR (recommended for non-RO subscribers)',
    image: '/manual/working-in-eur.png',
    imageAlt: 'Settings → Pricing — EUR Rate',
    content: `# Working exclusively in EUR

This guide is for subscribers who work **100% in EUR** — they buy from suppliers in EUR and sell to clients in EUR, without mixing RON into their catalog.

## How internal storage works

- All prices are stored in the database as a single number.
- The internal technical label is "RON", but it is **irrelevant to you** — you never see it in the UI.
- The **EUR** toggle in the top bar performs a display conversion using the rate set in *Settings → Pricing*.

## The problem you avoid

If you keep the default rate (e.g. \`EUR rate = 4.97\`) and enter a hinge at **100 EUR**, the system stores \`497\` internally. Tomorrow, if the rate changes to \`5.02\`, the same product shows as **99.00 EUR** in the catalog — without you changing anything.

This "drift" is mathematically correct but creates confusion and feels like a bug.

## Recommended setup — 3 steps

1. **Settings → Pricing** → set **EUR rate = 1**.
2. In the top bar, select **EUR** as the active currency.
3. Enter all prices directly in EUR in *Settings → Pricing* (and in new orders).

## What you gain

- Prices stay **absolutely stable** — 100 EUR today = 100 EUR a year from now.
- Zero conversion on save, **zero drift**.
- Quote PDFs, orders, and reports come out naturally in EUR.
- Historical orders no longer "move" over time.

## What does NOT change

- The internal "RON" label stays in the database (invisible in the UI).
- All app logic works identically — no functionality is lost.

## Limitations — when NOT to use this setup

- If you have **suppliers in RON** and clients in EUR (mixed flow) → you need the real exchange rate.
- If you work in another currency (PLN, HRK, etc.) → contact the iSoftGlass team for an extension.
`,
    tips: [
      'Setting EUR rate = 1 only affects display conversion — it does not modify any already-saved value.',
      'It is recommended to do this configuration before entering the first prices in the catalog.',
    ],
  },
  {
    id: 'production-scanner', category: 'productie', roles: ['all'], order: 2,
    title: 'Production Scanner (Barcodes)',
    image: '/manual/production-scanner.png',
    imageAlt: 'Production Scanner (Barcodes)',
    content: `# Production Scanner

The **Production → Scanner** page (\`/productie/scanner\`) allows you to quickly advance orders between Kanban stages using a **CODE128 barcode scanner** connected as an HID keyboard.

## How it works

1. Open the **Scanner** page. The input field has permanent auto-focus.
2. **Scan the barcode** from the production sheet or the product label.
3. The application automatically identifies the order and **advances it to the next stage** in the Kanban (e.g., *Cutting* → *Grinding*, *Grinding* → *Tempering*).
4. Confirmation appears on the screen with a sound and green color; an error (unknown code) appears in red.

## Requirements

- A CODE128 scanner configured as an **HID keyboard** (standard mode, no drivers required).
- **Enter (\\r)** suffix after each scan (default setting on most models).

## Advantages

- The operator no longer has to search for orders manually in the Kanban.
- Full traceability: the time for each stage is saved automatically.
- Also works on a tablet with a Bluetooth scanner.
`,
    tips: [
      'If you lose focus on the input (by clicking elsewhere), a simple scan will automatically bring it back.',
      'The field ignores manual typing slower than 50ms — only the scanner triggers the advance.',
    ],
    warnings: [
      'Scanning a code that is already in the last stage has no effect — the order remains there.',
    ],
  },
  {
    id: 'processing-cad', category: 'productie', roles: ['all'], order: 3,
    title: 'Processing and CAD Editor',
    image: '/manual/processing-cad.png',
    imageAlt: 'Processing and CAD Editor',
    content: `# Processing and CAD Editor

The **Processing** page (\`/prelucrari\`) is the technical workshop for production sheets: holes, hinges, handles, cutouts, edge processing — all visualized on the glass in an interactive CAD editor.

## Processing Sheet

- Complete list of panels in the order (with dimensions and glass type).
- For each panel: the list of processing operations (template code + parameters: distance, diameter, offset).
- Many processing operations are **filled in automatically** from the 3D configuration (hinges, handles, locks) — you only edit the exceptions.

## CAD Editor — Shortcuts

| Key | Action |
|---|---|
| **J** | JOIN — merges two nearby processing operations (10mm tolerance) |
| **Ctrl + D** | Duplicate the selected processing operation |
| **Ctrl + Shift + D** | Duplicate **all** processing operations to another panel (automatic mirroring on the X-axis) |
| **Delete** | Delete the selected processing operation |
| **Left-click + drag** | Move the processing operation |
| **Mouse wheel** | Zoom |

## Templates

The **Processing Templates** catalog (categories: **30. hinges & cutouts**, **51. holes for handles**) syncs automatically with the accessories chosen in 3D. Adding a new hinge to the catalog generates the correct cutout on the glass.

## Export

- **DXF** (R9 → R2010) — for industrial CNC, with layer mapping.
- **PDF** — for the workshop, with dimensions and a processing legend.
- The **"Send to CNC"** button generates a combined DXF + cutting list.
`,
    tips: [
      'The positioning step is 0.5mm; use a comma for decimals.',
      'Unselected elements are shown in black — select one to see its dimensions and parameters.',
    ],
    warnings: [
      'Panel modifications are only saved when you press **Save processing** — changing the page without saving will lose them.',
    ],
  },
  {
    id: 'operational-dashboard', category: 'operational', roles: ['all'], order: 0,
    title: 'Operational Dashboard',
    image: '/manual/operational-dashboard.png',
    imageAlt: 'Operational Dashboard',
    content: `# Operational Dashboard

The **Operational Dashboard** page (\`/operational\`) is the single panel for the workshop and logistics: see in real time what's happening in production, installation, service, and cutting.

## Summary Cards

- **Production**: number of orders in each Kanban stage (cutting, grinding, tempering, assembly, packaging).
- **Installation**: jobs scheduled for today / this week, delays.
- **Service**: open interventions, priority, SLA.
- **Cutting**: panels in the optimization queue, glass allocated per sheet.

## Auto-Refresh

The page reloads **automatically every 60 seconds** — you can leave it permanently displayed on a TV screen in the workshop.

## Quick Actions

- Clicking on any card takes you directly to the detailed page (Production Kanban, Installation list, etc.).
- The **"Refresh Now"** button forces an immediate update.
`,
    tips: [
      'Use this page on a large screen in the workshop for team-wide visibility.',
      'For financial indicators (turnover, margins), use the Main Dashboard.',
    ],
  },
  {
    id: 'reports', category: 'operational', roles: ['all'], order: 3,
    title: 'Reports',
    image: '/manual/reports.png',
    imageAlt: 'Reports',
    content: `# Reports

The **Reports** page (\`/rapoarte\`) gives you complete visibility over sales and material consumption.

## Available Reports

1. **Monthly Sales** — monthly turnover, broken down by categories (showers, doors, railings, etc.) and by sales operator.
2. **Material Consumption** — quantities of glass, profiles, and accessories consumed in a period, aggregated by product code.
3. **Top Customers** — ranking by order value in the selected period.
4. **Margins** — difference between production cost vs. sale price, per order.

## Filters

- **Date range** (from / to calendar).
- **Product category**.
- **Operator** (salesperson).
- **Order status** (quote, confirmed, in production, delivered).

## Export

All reports are exported to **CSV** with **UTF-8 BOM** (Excel correctly opens special characters).

The values respect the global **RON / EUR** toggle.
`,
    tips: [
      'For external analysis in Excel, use the CSV export — the BOM ensures that special characters are displayed correctly.',
      'The filters are saved for your account between sessions.',
    ],
  },
  {
    id: 'installation-reports', category: 'operational', roles: ['all'], order: 4,
    title: 'Installation Reports',
    image: '/manual/installation-reports.png',
    imageAlt: 'Installation Reports',
    content: `# Installation Reports

The **Installation Reports** page (\`/rapoarte-montaj\`) tracks the performance of installation teams and optimizes scheduling.

## What you see

- **Performance per team**: number of completed installations, average time per job, distance traveled.
- **Optimized route map** — the system suggests the optimal order of the day's jobs for each team (distance minimization algorithm).
- **Completion checklist** — percentage of correctly filled checklists, customer signatures.
- **Incidents** — postponed jobs, complaints, returns.

## Filters

- **Interval** (day / week / month).
- **Team** or **vehicle**.
- **Geographical area**.

## Quick Actions

- Clicking on a job opens the full details: customer, address, products, before/after photos, signature.
- The **"Reschedule"** button moves the job in the calendar without losing the completed checklist.
`,
    tips: [
      'The optimized route takes into account each team\'s schedule and the time windows confirmed with customers.',
      'Vehicle technical inspection and liability insurance alerts appear 30 days before expiration.',
    ],
  },
  {
    id: 'data-export', category: 'setari', roles: ['all'], order: 17,
    title: 'Data export & import',
    image: '/manual/export-date.png',
    imageAlt: 'Settings › Data — export and import',
    accent: 'green',
    content: `# Data export & import

In **Settings → Data** you have full control over the data entered in the platform. All data belongs to the subscriber, is strictly isolated per company (RLS on \`company_id\`) and **can be exported or re-imported anytime, without any restriction**.

---

## 1. Data export

![Export area](/manual/export-date.png)

The **Data export** card gives you 5 buttons:

- **Clients (CSV)** — full list with name, type, company, contact, address, VAT id, discount, notes.
- **Quotes (CSV)** — all quotes with ref number, product, client, price, VAT, markup, status, date.
- **Orders (CSV)** — orders with number, status, subtotal, discount, total, paid, delivery, notes.
- **Materials (CSV)** — your own catalog with code, name, type, unit, price, stock, supplier, location.
- **Full export (JSON)** — a single file with all 4 tables above + timestamp (\`exported_at\`).

### How to export

1. Go to **Settings → Data tab**.
2. Click the button for the desired category (or **Full export** for everything).
3. The file downloads automatically to your Downloads folder. The filename contains the date: \`clients_2026-05-22.csv\`, \`full_export_2026-05-22.json\`.
4. Open CSVs directly in Excel / LibreOffice (UTF-8 BOM ensures correct characters) or the JSON in any text editor.

> **Important for subscribers:** you have the GDPR right to **data portability**. You can export and keep locally all your data, anytime and as often as you wish, with no limit.

---

## 2. Data import

![Import area](/manual/export-date-import.png)

The **Data import** card lets you upload back into the platform CSV files (per category) or a full JSON saved previously. Useful for:

- **migration** from another system (prepare the CSV with the same headers as the export),
- **recovery** after an accidental deletion (using the last full export),
- **bulk loading** of a list of clients, materials or quotes.

### How to import

1. In the **Data import** card click the category button (Clients / Quotes / Orders / Materials) for CSV, or **Full import** for JSON.
2. Select the file from your computer.
3. A **preview dialog** opens showing: the target table, the number of detected records and the first columns found.
4. Check the data and click **Confirm import** (or Cancel if the file does not look right).
5. At the end a toast displays the number of rows imported successfully / errors.

### Conflict keys (duplicates)

The import uses a unique key per table to decide whether a row is new or existing:

| Table | Conflict key |
|---|---|
| Clients | \`name\` |
| Quotes | \`ref_number\` |
| Orders | \`order_number\` |
| Materials | \`code\` |

Rows with an already existing key may be **overwritten** — do an export before importing if you want a safety copy.

### Expected format

- **CSV** — same set of headers as in the corresponding export, UTF-8 encoding.
- **JSON** — exactly the structure produced by **Full export** (\`clients\`, \`quotes\`, \`orders\`, \`materials\` + \`exported_at\`).

---

## Technical details

- The export downloads **all records**, with automatic 1000-row pagination in the background.
- The import processes batches of 100 rows and automatically injects the company context (RLS).
- Everything you export / import is isolated to your company — no other subscriber sees or writes over your data.
`,
    tips: [
      'Do a full (JSON) export monthly — it is the safest form of local backup.',
      'Before any bulk import, export the target table so you have the previous version at hand.',
      'For CSVs with special characters, open in Excel via *Data → From Text/CSV* with UTF-8 encoding.',
    ],
  },
  {
    id: 'data-protection', category: 'setari', roles: ['all'], order: 18,
    title: 'Data protection',
    image: '/manual/protectia-datelor.png',
    imageAlt: 'Backup / Recovery / Security cards',
    content: `# Data protection

The security and availability of your data are a high priority. The platform runs on **Lovable Cloud infrastructure**, with multi-layer protection and GDPR compliance.

## Automatic backup

- **Daily automatic backup**, with no intervention from you.
- History retention for at least 7 days (Point-in-Time Recovery).
- Backups are encrypted and stored redundantly in European data centers.

## Recovery

- In case of accidental loss (wrong delete, faulty import), data can be recovered on request through the support team.
- We also recommend **periodic local export** (see the *Data export* section) as an extra safety layer fully under your control.

## Security

- **Strict multi-tenant isolation** through Row-Level Security on \`company_id\` — no other subscriber can access your data.
- **Encryption in transit** (HTTPS/TLS) and **at rest** on disk.
- **JWT** for sessions, **strong hashing** for passwords.
- **HIBP (Have I Been Pwned)** check at account creation and on password change — prevents the use of publicly compromised passwords.
- European data centers, **GDPR** compliance.

## Your GDPR rights

| Right | How to exercise it |
|---|---|
| Portability | Export anytime from Settings → Data |
| Access | See all your data directly in the platform |
| Rectification | Edit any field in the dedicated interfaces |
| Erasure | On request via support (\`isoftplustech@gmail.com\`) |

## User recommendations

- Use a **strong and unique password** for your account.
- Don\'t share the account — for colleagues create dedicated users (Settings → Team).
- **Logout** on public or shared devices.
- Do a **monthly export** and keep the file in a safe location (personal cloud, external drive).
- Consult the [Privacy Policy](/privacy-policy) and [Cookie Policy](/cookie-policy) for full details.
`,
    tips: [
      'Your data stays yours: at any moment you can export it fully in open formats (CSV/JSON).',
      'The safest layer is the combination: platform automatic backup + monthly local export.',
    ],
    warnings: [
      'Never send your account password by email, chat or phone — the support team will never ask for your password.',
    ],
  },
];
