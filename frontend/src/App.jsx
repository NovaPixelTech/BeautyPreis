import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FALLBACK_CATALOGUE } from './fallbackCatalogue';

/* ------------------------------------------------------------------
   Configuration
   ------------------------------------------------------------------ */

// Point this at a deployed API with VITE_API_BASE_URL at build time.
const API_BASE = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3011';

/* ------------------------------------------------------------------
   Translations (English is the default, German is selectable)
   ------------------------------------------------------------------ */

const STRINGS = {
  en: {
    'brand.tagline': 'Beauty price comparison',
    'skip': 'Skip to content',
    'nav.discover': 'Discover',
    'nav.categories': 'Categories',
    'nav.retailers': 'Retailers',
    'nav.how': 'How it works',
    'lang.label': 'Language',
    'lang.en': 'EN',
    'lang.de': 'DE',
    'lang.enFull': 'English',
    'lang.deFull': 'Deutsch',
    'menu.open': 'Open menu',
    'menu.close': 'Close menu',

    'hero.eyebrow': 'Germany · Beauty & skincare',
    'hero.titleA': 'One search.',
    'hero.titleB': 'The real total price.',
    'hero.text':
      'Compare beauty and skincare products across German online retailers. We add shipping to every offer, so you see what you actually pay at checkout.',
    'hero.searchPlaceholder': 'Try “ANUA PDRN”, “COSRX” or an EAN…',
    'hero.search': 'Compare prices',
    'hero.searching': 'Searching…',
    'hero.popular': 'Popular',
    'hero.panelKicker': 'Transparent by design',
    'hero.panelTitle': 'Every offer, fully costed',
    'hero.panelText':
      'Sticker prices hide shipping. We show the complete picture for each retailer.',
    'hero.row1': 'Product price',
    'hero.row2': 'Shipping cost',
    'hero.row3': 'Total purchase cost',
    'hero.panelNote': 'Ranked by the lowest total cost, shipping included.',
    'hero.statProducts': 'products tracked',
    'hero.statRetailers': 'retailers connected',
    'hero.statShipping': 'shipping included',
    'hero.statCurrency': 'all prices in EUR',

    'how.kicker': 'How it works',
    'how.title': 'From search to the best total price',
    'how.sub': 'A comparison is only useful when it reflects what you actually pay.',
    'how.step1': 'Step 01',
    'how.step1Title': 'Search once',
    'how.step1Text':
      'Enter a product name, a brand or the EAN. One search covers every connected retailer.',
    'how.step2': 'Step 02',
    'how.step2Title': 'We match the exact product',
    'how.step2Text':
      'Brand, model, size and EAN are compared so similar bottles are not mixed up.',
    'how.step3': 'Step 03',
    'how.step3Title': 'Compare the total cost',
    'how.step3Text':
      'Product price plus shipping, ranked from cheapest to most expensive.',

    'categories.kicker': 'Browse',
    'categories.title': 'Shop by category',
    'categories.sub': 'Start broad, then narrow down to the product you need.',
    'categories.all': 'All products',
    'categories.count': '{n} products',
    'categories.open': 'Open category',

    'products.kicker': 'Catalogue',
    'products.title': 'All products',
    'products.sub': 'Every product with at least one matched retailer offer.',
    'products.resultsFor': 'Results for “{q}”',
    'products.resultsSub': '{n} matching products across connected retailers.',
    'products.clear': 'Clear search',
    'products.emptyTitle': 'No products found',
    'products.emptyText':
      'Try a different name, brand or EAN. Spelling can differ between retailers.',
    'products.emptySearchText': 'Nothing matched “{q}”. Try a brand such as ANUA, COSRX or Shiseido.',
    'products.viewOffers': 'View offers',
    'products.offers': '{n} offers',
    'products.loading': 'Loading products…',
    'products.errorTitle': 'Products could not be loaded',
    'products.errorText':
      'The comparison API did not respond. Start the backend or configure VITE_API_BASE_URL.',
    'products.retry': 'Try again',
    'products.all': 'All products',

    'product.home': 'Home',
    'product.offersTitle': 'Offers',
    'product.offersSub': 'Sorted by total cost including shipping.',
    'product.best': 'Cheapest total: {price}',
    'product.bestTag': 'Best total',
    'product.price': 'Product price',
    'product.shipping': 'Shipping',
    'product.total': 'Total cost',
    'product.free': 'Free',
    'product.unknown': 'Unknown',
    'product.goToShop': 'Go to shop',
    'product.inStock': 'In stock',
    'product.outOfStock': 'Out of stock',
    'product.limited': 'Limited stock',
    'product.unknownAvail': 'Availability unknown',
    'product.verified': 'Verified price',
    'product.estimated': 'Estimated price',
    'product.outdated': 'Outdated price',
    'product.unknownPrice': 'Price status unknown',
    'product.exact': 'Exact match',
    'product.high': 'High confidence',
    'product.possible': 'Possible match',
    'product.low': 'Low confidence',
    'product.match': 'Match',
    'product.size': 'Size',
    'product.ean': 'EAN',
    'product.category': 'Category',
    'product.brand': 'Brand',
    'product.delivery': 'Delivery',
    'product.source': 'Source',
    'product.lastChecked': 'Last checked',
    'product.noOffersTitle': 'No offers yet',
    'product.noOffersText': 'This product has no matched retailer offers right now.',
    'product.back': 'Back to products',
    'product.summaryNote':
      'Offers are matched by brand, size and EAN. Always confirm the final amount at the retailer’s checkout.',
    'product.loading': 'Loading offers…',
    'product.errorTitle': 'Offers could not be loaded',
    'product.errorText': 'Live offers are unavailable right now. The product details come from the saved catalogue.',
    'product.retry': 'Try again',
    'product.priceStatus': 'Price status',
    'product.methodology': 'How we match',

    'retailers.kicker': 'Network',
    'retailers.title': 'Connected retailers',
    'retailers.sub': 'German beauty and skincare shops covered by BeautyPreis.',
    'retailers.active': 'Live offers',
    'retailers.soon': 'Coming soon',
    'retailers.country': 'Germany',

    'notice.offlineTitle': 'Live prices unavailable',
    'notice.offlineText':
      'Showing the saved catalogue for now. Price comparison resumes as soon as the retailer API reconnects.',

    'footer.tagline':
      'Independent price comparison for beauty and skincare in Germany. Product price, shipping and total cost — side by side.',
    'footer.product': 'Product',
    'footer.company': 'Company',
    'footer.legal': 'Legal',
    'footer.discover': 'Discover',
    'footer.categories': 'Categories',
    'footer.retailers': 'Retailers',
    'footer.how': 'How it works',
    'footer.about': 'About BeautyPreis',
    'footer.contact': 'Contact',
    'footer.imprint': 'Imprint',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.disclaimer':
      'Prices and shipping costs are collected from public retailer pages and may change at any time. BeautyPreis does not sell products and receives no commission for the ranking. Always confirm the final amount at the retailer’s checkout.',
    'footer.rights': '© {year} BeautyPreis. All rights reserved.',
    'footer.langNote': 'English (default) · Deutsch available',
  },

  de: {
    'brand.tagline': 'Beauty-Preisvergleich',
    'skip': 'Zum Inhalt springen',
    'nav.discover': 'Entdecken',
    'nav.categories': 'Kategorien',
    'nav.retailers': 'Händler',
    'nav.how': 'So funktioniert’s',
    'lang.label': 'Sprache',
    'lang.en': 'EN',
    'lang.de': 'DE',
    'lang.enFull': 'English',
    'lang.deFull': 'Deutsch',
    'menu.open': 'Menü öffnen',
    'menu.close': 'Menü schließen',

    'hero.eyebrow': 'Deutschland · Beauty & Skincare',
    'hero.titleA': 'Einmal suchen.',
    'hero.titleB': 'Der echte Gesamtpreis.',
    'hero.text':
      'Vergleiche Beauty- und Skincare-Produkte aus deutschen Online-Shops. Wir rechnen den Versand zu jedem Angebot dazu — so siehst du, was an der Kasse wirklich fällig wird.',
    'hero.searchPlaceholder': 'Zum Beispiel „ANUA PDRN“, „COSRX“ oder eine EAN…',
    'hero.search': 'Preise vergleichen',
    'hero.searching': 'Suche läuft…',
    'hero.popular': 'Beliebt',
    'hero.panelKicker': 'Transparenz als Prinzip',
    'hero.panelTitle': 'Jedes Angebot, vollständig berechnet',
    'hero.panelText':
      'Ein Produktpreis allein sagt wenig. Wir zeigen das vollständige Bild pro Händler.',
    'hero.row1': 'Produktpreis',
    'hero.row2': 'Versandkosten',
    'hero.row3': 'Gesamtkaufpreis',
    'hero.panelNote': 'Sortiert nach dem niedrigsten Gesamtpreis inklusive Versand.',
    'hero.statProducts': 'Produkte im Vergleich',
    'hero.statRetailers': 'verbundene Händler',
    'hero.statShipping': 'inklusive Versand',
    'hero.statCurrency': 'alle Preise in EUR',

    'how.kicker': 'So funktioniert’s',
    'how.title': 'Von der Suche zum besten Gesamtpreis',
    'how.sub': 'Ein Vergleich hilft nur, wenn er zeigt, was du tatsächlich zahlst.',
    'how.step1': 'Schritt 01',
    'how.step1Title': 'Einmal suchen',
    'how.step1Text':
      'Gib Produktname, Marke oder EAN ein. Eine Suche deckt alle verbundenen Händler ab.',
    'how.step2': 'Schritt 02',
    'how.step2Title': 'Wir finden das exakte Produkt',
    'how.step2Text':
      'Marke, Modell, Größe und EAN werden verglichen, damit ähnliche Flaschen nicht verwechselt werden.',
    'how.step3': 'Schritt 03',
    'how.step3Title': 'Gesamtkosten vergleichen',
    'how.step3Text':
      'Produktpreis plus Versand, sortiert vom günstigsten zum teuersten Angebot.',

    'categories.kicker': 'Stöbern',
    'categories.title': 'Nach Kategorie stöbern',
    'categories.sub': 'Erst breit starten, dann zum passenden Produkt eingrenzen.',
    'categories.all': 'Alle Produkte',
    'categories.count': '{n} Produkte',
    'categories.open': 'Kategorie öffnen',

    'products.kicker': 'Katalog',
    'products.title': 'Alle Produkte',
    'products.sub': 'Jedes Produkt mit mindestens einem passenden Händlerangebot.',
    'products.resultsFor': 'Ergebnisse für „{q}“',
    'products.resultsSub': '{n} passende Produkte bei verbundenen Händlern.',
    'products.clear': 'Suche zurücksetzen',
    'products.emptyTitle': 'Keine Produkte gefunden',
    'products.emptyText':
      'Versuche einen anderen Namen, eine Marke oder die EAN. Die Schreibweise kann bei Händlern abweichen.',
    'products.emptySearchText':
      'Kein Treffer für „{q}“. Versuche es mit einer Marke wie ANUA, COSRX oder Shiseido.',
    'products.viewOffers': 'Angebote ansehen',
    'products.offers': '{n} Angebote',
    'products.loading': 'Produkte werden geladen…',
    'products.errorTitle': 'Produkte konnten nicht geladen werden',
    'products.errorText':
      'Die Vergleichs-API hat nicht geantwortet. Starte das Backend oder setze VITE_API_BASE_URL.',
    'products.retry': 'Erneut versuchen',
    'products.all': 'Alle Produkte',

    'product.home': 'Startseite',
    'product.offersTitle': 'Angebote',
    'product.offersSub': 'Sortiert nach Gesamtkosten inklusive Versand.',
    'product.best': 'Günstigster Gesamtpreis: {price}',
    'product.bestTag': 'Bester Gesamtpreis',
    'product.price': 'Produktpreis',
    'product.shipping': 'Versand',
    'product.total': 'Gesamtkosten',
    'product.free': 'Kostenlos',
    'product.unknown': 'Unbekannt',
    'product.goToShop': 'Zum Shop',
    'product.inStock': 'Auf Lager',
    'product.outOfStock': 'Nicht verfügbar',
    'product.limited': 'Begrenzt verfügbar',
    'product.unknownAvail': 'Verfügbarkeit unbekannt',
    'product.verified': 'Bestätigter Preis',
    'product.estimated': 'Geschätzter Preis',
    'product.outdated': 'Veralteter Preis',
    'product.unknownPrice': 'Preisstatus unbekannt',
    'product.exact': 'Exakte Übereinstimmung',
    'product.high': 'Hohe Sicherheit',
    'product.possible': 'Mögliche Übereinstimmung',
    'product.low': 'Geringe Sicherheit',
    'product.match': 'Übereinstimmung',
    'product.size': 'Größe',
    'product.ean': 'EAN',
    'product.category': 'Kategorie',
    'product.brand': 'Marke',
    'product.delivery': 'Lieferung',
    'product.source': 'Quelle',
    'product.lastChecked': 'Zuletzt geprüft',
    'product.noOffersTitle': 'Noch keine Angebote',
    'product.noOffersText': 'Für dieses Produkt gibt es aktuell keine passenden Händlerangebote.',
    'product.back': 'Zurück zu den Produkten',
    'product.summaryNote':
      'Angebote werden über Marke, Größe und EAN zugeordnet. Prüfe den Endbetrag immer an der Kasse des Händlers.',
    'product.loading': 'Angebote werden geladen…',
    'product.errorTitle': 'Angebote konnten nicht geladen werden',
    'product.errorText': 'Live-Angebote sind derzeit nicht verfügbar. Die Produktdaten stammen aus dem gespeicherten Katalog.',
    'product.retry': 'Erneut versuchen',
    'product.priceStatus': 'Preisstatus',
    'product.methodology': 'So ordnen wir zu',

    'retailers.kicker': 'Netzwerk',
    'retailers.title': 'Verbundene Händler',
    'retailers.sub': 'Deutsche Beauty- und Skincare-Shops im BeautyPreis-Vergleich.',
    'retailers.active': 'Live-Angebote',
    'retailers.soon': 'Demnächst',
    'retailers.country': 'Deutschland',

    'notice.offlineTitle': 'Live-Preise nicht verfügbar',
    'notice.offlineText':
      'Angezeigt wird vorerst der gespeicherte Katalog. Der Preisvergleich ist wieder aktiv, sobald die Händler-API erreichbar ist.',

    'footer.tagline':
      'Unabhängiger Preisvergleich für Beauty und Skincare in Deutschland. Produktpreis, Versand und Gesamtkosten — direkt nebeneinander.',
    'footer.product': 'Produkt',
    'footer.company': 'Unternehmen',
    'footer.legal': 'Rechtliches',
    'footer.discover': 'Entdecken',
    'footer.categories': 'Kategorien',
    'footer.retailers': 'Händler',
    'footer.how': 'So funktioniert’s',
    'footer.about': 'Über BeautyPreis',
    'footer.contact': 'Kontakt',
    'footer.imprint': 'Impressum',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'AGB',
    'footer.disclaimer':
      'Preise und Versandkosten werden aus öffentlichen Händlerseiten erhoben und können sich jederzeit ändern. BeautyPreis verkauft keine Produkte und erhält keine Provision für das Ranking. Prüfe den Endbetrag immer an der Kasse des Händlers.',
    'footer.rights': '© {year} BeautyPreis. Alle Rechte vorbehalten.',
    'footer.langNote': 'English (Standard) · Deutsch verfügbar',
  },
};

function makeTranslator(lang) {
  return (key, vars) => {
    const table = STRINGS[lang] || STRINGS.en;
    let value = table[key];
    if (value === undefined) value = STRINGS.en[key];
    if (value === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach((name) => {
        value = value.split('{' + name + '}').join(String(vars[name]));
      });
    }
    return value;
  };
}

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

const money = (value, lang) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
  }).format(number);
};

const PRETTY_CATEGORY = {
  'k-beauty': 'K-Beauty',
  'j-beauty': 'J-Beauty',
  skincare: 'Skincare',
  makeup: 'Makeup',
  haircare: 'Hair care',
  fragrance: 'Fragrance',
  bodycare: 'Body care',
};

const prettyCategory = (slug) => {
  if (!slug) return '';
  if (PRETTY_CATEGORY[slug]) return PRETTY_CATEGORY[slug];
  return String(slug)
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const monogramFor = (text) => {
  const words = String(text || '')
    .split(/\s+/)
    .filter((word) => word && !['by', 'of', 'the', 'and', '&'].includes(word.toLowerCase()));
  if (words.length === 0) return 'BP';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const hashIndex = (text, buckets) => {
  const value = String(text || '');
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return hash % buckets;
};

const isCompleteProduct = (product) =>
  Boolean(product && product.id && !String(product.id).startsWith('test-'));

const formatDate = (value, lang) => {
  if (!value) return null;
  const iso = String(value).replace(' ', 'T');
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const localizeDelivery = (value, lang) => {
  if (!value) return null;
  if (lang !== 'de') return value;
  return String(value)
    .replace(/(\d+)\s*[–-]\s*(\d+)\s*days?/gi, '$1–$2 Tage')
    .replace(/(\d+)\s*days?/gi, '$1 Tage');
};

const normalizePriceStatus = (offer) => {
  const raw =
    (offer && offer.lastPriceObservation && offer.lastPriceObservation.priceStatus) ||
    (offer && offer.priceStatus) ||
    'UNKNOWN';
  const status = String(raw).toUpperCase();
  return ['VERIFIED', 'ESTIMATED', 'OUTDATED'].includes(status) ? status : 'UNKNOWN';
};

const availabilityInfo = (value) => {
  switch (value) {
    case 'in_stock':
      return { label: 'product.inStock', tone: 'ok' };
    case 'out_of_stock':
      return { label: 'product.outOfStock', tone: 'danger' };
    case 'limited':
      return { label: 'product.limited', tone: 'warn' };
    default:
      return { label: 'product.unknownAvail', tone: 'muted' };
  }
};

const priceStatusInfo = (status) => {
  switch (status) {
    case 'VERIFIED':
      return { label: 'product.verified', tone: 'ok' };
    case 'ESTIMATED':
      return { label: 'product.estimated', tone: 'warn' };
    case 'OUTDATED':
      return { label: 'product.outdated', tone: 'danger' };
    default:
      return { label: 'product.unknownPrice', tone: 'muted' };
  }
};

const confidenceInfo = (confidence) => {
  switch (confidence) {
    case 'EXACT':
      return { label: 'product.exact', tone: 'ok' };
    case 'HIGH':
      return { label: 'product.high', tone: 'accent' };
    case 'POSSIBLE':
      return { label: 'product.possible', tone: 'warn' };
    default:
      return { label: 'product.low', tone: 'muted' };
  }
};

const parseRoute = (hash) => {
  const clean = String(hash || '').replace(/^#/, '') || '/';
  const parts = clean.split('/').filter(Boolean);
  if (parts[0] === 'product' && parts[1]) {
    return { name: 'product', id: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'category' && parts[1]) {
    return { name: 'category', slug: decodeURIComponent(parts[1]) };
  }
  return { name: 'home' };
};

const getInitialLang = () => {
  if (typeof window === 'undefined') return 'en';
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('lang');
    if (fromQuery === 'de' || fromQuery === 'en') return fromQuery;
    const stored = window.localStorage.getItem('bp.lang');
    if (stored === 'de' || stored === 'en') return stored;
  } catch (error) {
    /* storage can be unavailable in private mode */
  }
  return 'en';
};

const scrollToSection = (id) => {
  if (typeof document === 'undefined') return;
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ------------------------------------------------------------------
   Icons
   ------------------------------------------------------------------ */

const ICON_PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.4-3.4" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  truck: (
    <>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </>
  ),
  tag: (
    <>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
      <path d="m9.5 12 2 2 3.5-4" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.5 10.4 12.2 5 10.6 10.4 9 12 3.5Z" />
      <path d="M18.5 16.5 19.2 19l2.3.7-2.3.8-.7 2.5-.7-2.5-2.3-.8 2.3-.7.7-2.5Z" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 2.8 20h18.4L12 4Z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </>
  ),
  box: (
    <>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </>
  ),
  store: (
    <>
      <path d="M4 10v10h16V10" />
      <path d="M3 10l2-6h14l2 6" />
      <path d="M3 10a3 3 0 0 0 5 2 3 3 0 0 0 4 0 3 3 0 0 0 4 0 3 3 0 0 0 5-2" />
      <path d="M9 20v-5h6v5" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 4v5h-5" />
    </>
  ),
};

function Icon({ name, size = 18, className = '', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
      focusable="false"
    >
      {ICON_PATHS[name] || null}
    </svg>
  );
}

/* ------------------------------------------------------------------
   Small building blocks
   ------------------------------------------------------------------ */

function Badge({ tone = 'muted', children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

function BrandMark({ t }) {
  return (
    <a className="brand" href="#/" aria-label="BeautyPreis">
      <span className="brand-mark" aria-hidden="true">
        <svg className="brand-rose" viewBox="0 0 40 40" width="19" height="19" focusable="false">
          <g>
            <path d="M20 32 C20 22 20 14 20 8" fill="none" stroke="#a63d5c" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="20" cy="9" r="6.2" fill="#ffffff" />
            <circle cx="20" cy="9" r="2.4" fill="#a63d5c" />
          </g>
        </svg>
      </span>
      <span className="brand-name">
        BeautyPreis
        <small>{t('brand.tagline')}</small>
      </span>
    </a>
  );
}

function LanguageSwitch({ lang, onChange, t, className = 'lang-switch' }) {
  return (
    <div className={className} role="group" aria-label={t('lang.label')}>
      <button
        type="button"
        className="lang-btn"
        aria-pressed={lang === 'en'}
        aria-label={t('lang.enFull')}
        onClick={() => onChange('en')}
      >
        {t('lang.en')}
      </button>
      <button
        type="button"
        className="lang-btn"
        aria-pressed={lang === 'de'}
        aria-label={t('lang.deFull')}
        onClick={() => onChange('de')}
      >
        {t('lang.de')}
      </button>
    </div>
  );
}

function ProductMonogram({ text, small = false }) {
  return (
    <span className={`monogram${small ? ' monogram--sm' : ''}`} aria-hidden="true">
      {monogramFor(text)}
    </span>
  );
}

function RetailerAvatar({ name, index }) {
  const variant = (index % 8) + 1;
  return (
    <span className={`retailer-avatar rb-${variant}`} aria-hidden="true">
      {monogramFor(name)}
    </span>
  );
}

function SkeletonProducts() {
  return (
    <div className="product-grid" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div className="skeleton-card" key={item}>
          <div className="skeleton skeleton-media" />
          <div className="skeleton" style={{ height: 12, width: '40%' }} />
          <div className="skeleton" style={{ height: 16, width: '90%' }} />
          <div className="skeleton" style={{ height: 16, width: '65%' }} />
        </div>
      ))}
    </div>
  );
}

function SkeletonOffers() {
  return (
    <div className="offer-list" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div className="skeleton-card" key={item} style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 13 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 14, width: '35%' }} />
              <div className="skeleton" style={{ height: 11, width: '60%', marginTop: 8 }} />
            </div>
          </div>
          <div className="skeleton" style={{ height: 44, marginTop: 16 }} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Header
   ------------------------------------------------------------------ */

function Header({ t, lang, setLang, query, onQueryChange, onSearch, onNavigate, onOpenMenu }) {
  const submit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <BrandMark t={t} />

        <nav className="nav" aria-label="Main">
          <button type="button" className="nav-link" onClick={() => onNavigate('top')}>
            {t('nav.discover')}
          </button>
          <button type="button" className="nav-link" onClick={() => onNavigate('categories')}>
            {t('nav.categories')}
          </button>
          <button type="button" className="nav-link" onClick={() => onNavigate('retailers')}>
            {t('nav.retailers')}
          </button>
          <button type="button" className="nav-link" onClick={() => onNavigate('how')}>
            {t('nav.how')}
          </button>
        </nav>

        <form className="header-search" onSubmit={submit} role="search">
          <Icon name="search" size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t('header.searchPlaceholder')}
            aria-label={t('header.searchPlaceholder')}
          />
        </form>

        <div className="header-actions">
          <LanguageSwitch lang={lang} onChange={setLang} t={t} />
          <button
            type="button"
            className="menu-btn"
            onClick={onOpenMenu}
            aria-label={t('menu.open')}
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileDrawer({ t, lang, setLang, query, onQueryChange, onSearch, onNavigate, onClose }) {
  const submit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={t('menu.open')}>
        <div className="drawer-head">
          <BrandMark t={t} />
          <button type="button" className="menu-btn" onClick={onClose} aria-label={t('menu.close')}>
            <Icon name="close" size={20} />
          </button>
        </div>

        <form className="drawer-search" onSubmit={submit} role="search">
          <div className="header-search" style={{ display: 'flex', marginLeft: 0, maxWidth: 'none' }}>
            <Icon name="search" size={16} />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={t('header.searchPlaceholder')}
              aria-label={t('header.searchPlaceholder')}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            {t('hero.search')}
          </button>
        </form>

        <nav className="drawer-nav" aria-label="Mobile">
          <button type="button" onClick={() => onNavigate('top')}>
            {t('nav.discover')}
          </button>
          <button type="button" onClick={() => onNavigate('categories')}>
            {t('nav.categories')}
          </button>
          <button type="button" onClick={() => onNavigate('products')}>
            {t('products.all')}
          </button>
          <button type="button" onClick={() => onNavigate('retailers')}>
            {t('nav.retailers')}
          </button>
          <button type="button" onClick={() => onNavigate('how')}>
            {t('nav.how')}
          </button>
        </nav>

        <div>
          <p className="popular-label" style={{ marginBottom: 8 }}>
            {t('lang.label')}
          </p>
          <LanguageSwitch lang={lang} onChange={setLang} t={t} />
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------
   Hero
   ------------------------------------------------------------------ */

function Hero({ t, query, onQueryChange, onSearch, stats }) {
  const popular = ['ANUA', 'COSRX', 'Hada Labo', 'SOME BY MI', 'Shiseido'];

  const submit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <section className="hero" id="top">
      <span className="hero-orb hero-orb--one" aria-hidden="true" />
      <span className="hero-orb hero-orb--two" aria-hidden="true" />
      <div className="container hero-grid">
        <div>
          <span className="eyebrow">
            <Icon name="sparkle" size={13} />
            {t('hero.eyebrow')}
          </span>

          <h1 className="hero-title">
            {t('hero.titleA')}
            <br />
            <em>{t('hero.titleB')}</em>
          </h1>

          <p className="hero-text">{t('hero.text')}</p>

          <form className="search-form" onSubmit={submit} role="search">
            <div className="search-field">
              <Icon name="search" size={19} />
              <input
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder={t('hero.searchPlaceholder')}
                aria-label={t('hero.searchPlaceholder')}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">
              {t('hero.search')}
              <Icon name="arrow" size={17} />
            </button>
          </form>

          <div className="popular">
            <span className="popular-label">{t('hero.popular')}</span>
            {popular.map((brand) => (
              <button
                key={brand}
                type="button"
                className="popular-chip"
                onClick={() => onSearch(brand)}
              >
                {brand}
              </button>
            ))}
          </div>

          <div className="hero-stats">
            <div className="stat">
              <strong>{stats.products}</strong>
              <span>{t('hero.statProducts')}</span>
            </div>
            <div className="stat">
              <strong>{stats.retailers}</strong>
              <span>{t('hero.statRetailers')}</span>
            </div>
            <div className="stat">
              <span>{t('hero.statCurrency')}</span>
            </div>
          </div>
        </div>

        <aside className="hero-panel" aria-label={t('hero.panelTitle')}>
          <span className="panel-kicker">{t('hero.panelKicker')}</span>
          <h2 className="panel-title">{t('hero.panelTitle')}</h2>
          <p className="panel-text">{t('hero.panelText')}</p>

          <div className="panel-rows">
            <div className="panel-row">
              <span className="icon-tile">
                <Icon name="tag" size={16} />
              </span>
              <span>{t('hero.row1')}</span>
            </div>
            <div className="panel-row">
              <span className="icon-tile">
                <Icon name="truck" size={16} />
              </span>
              <span>{t('hero.row2')}</span>
            </div>
            <div className="panel-row panel-row--total">
              <span className="icon-tile">
                <Icon name="check" size={16} />
              </span>
              <span>{t('hero.row3')}</span>
            </div>
          </div>

          <p className="panel-note">
            <Icon name="info" size={14} />
            {t('hero.panelNote')}
          </p>
        </aside>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   Home sections
   ------------------------------------------------------------------ */

function HowItWorks({ t }) {
  const steps = [
    { step: 'how.step1', title: 'how.step1Title', text: 'how.step1Text', icon: 'search' },
    { step: 'how.step2', title: 'how.step2Title', text: 'how.step2Text', icon: 'shield' },
    { step: 'how.step3', title: 'how.step3Title', text: 'how.step3Text', icon: 'truck' },
  ];

  return (
    <section className="section" id="how">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">{t('how.kicker')}</p>
            <h2 className="section-title">{t('how.title')}</h2>
            <p className="section-sub">{t('how.sub')}</p>
          </div>
        </div>

        <div className="how-grid">
          {steps.map((item) => (
            <article className="how-card" key={item.step}>
              <span className="icon-tile" style={{ marginBottom: 14 }}>
                <Icon name={item.icon} size={17} />
              </span>
              <p className="how-step">{t(item.step)}</p>
              <h3 className="how-title">{t(item.title)}</h3>
              <p className="how-text">{t(item.text)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection({ t, categories, onOpenCategory }) {
  if (categories.length === 0) return null;

  return (
    <section className="section section--tint" id="categories">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">{t('categories.kicker')}</p>
            <h2 className="section-title">{t('categories.title')}</h2>
            <p className="section-sub">{t('categories.sub')}</p>
          </div>
        </div>

        <div className="cat-grid">
          {categories.map((category) => (
            <button
              type="button"
              className="cat-card"
              key={category.slug}
              onClick={() => onOpenCategory(category.slug)}
              aria-label={`${t('categories.open')}: ${prettyCategory(category.slug)}`}
            >
              <span>
                <span className="cat-name">{prettyCategory(category.slug)}</span>
                <span className="cat-meta">{t('categories.count', { n: category.count })}</span>
              </span>
              <span className="cat-icon">
                <Icon name="arrow" size={18} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, t }) {
  const brand = product.brandName || '';
  const category = prettyCategory(product.category_slug);
  const href = `#/product/${encodeURIComponent(product.id)}`;
  const variant = (hashIndex(product.id, 6) || 0) + 1;

  return (
    <article className="product-card">
      <a className={`product-media ph-${variant}`} href={href} aria-label={product.name}>
        <ProductMonogram text={brand || product.name} />
        {category && <span className="media-tag">{category}</span>}
      </a>
      <div className="product-body">
        {brand && <p className="product-brand">{brand}</p>}
        <h3 className="product-name">
          <a href={href}>{product.name}</a>
        </h3>
        <div className="meta-row">
          {product.size && <span className="chip">{product.size}</span>}
          {product.ean && (
            <span className="chip chip--mono">
              EAN {product.ean}
            </span>
          )}
        </div>
        <div className="product-foot">
          <a className="product-link" href={href}>
            {t('products.viewOffers')}
            <Icon name="arrow" size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}

function ProductsSection({
  t,
  products,
  status,
  searchTerm,
  activeCategory,
  categories,
  offline,
  onClearSearch,
  onOpenCategory,
  onRetry,
}) {
  const heading = searchTerm
    ? t('products.resultsFor', { q: searchTerm })
    : activeCategory
      ? prettyCategory(activeCategory)
      : t('products.title');

  const sub = searchTerm
    ? t('products.resultsSub', { n: products.length })
    : t('products.sub');

  return (
    <section className="section" id="products">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">{t('products.kicker')}</p>
            <h2 className="section-title">{heading}</h2>
            <p className="section-sub">{sub}</p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {activeCategory && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => onOpenCategory(null)}>
                {t('products.all')}
              </button>
            )}
            {searchTerm && (
              <button type="button" className="btn btn-outline btn-sm" onClick={onClearSearch}>
                <Icon name="close" size={14} />
                {t('products.clear')}
              </button>
            )}
          </div>
        </div>

        {status === 'loading' && <SkeletonProducts />}

        {status === 'error' && (
          <div className="state-card">
            <span className="state-icon">
              <Icon name="alert" size={22} />
            </span>
            <h3 className="state-title">{t('products.errorTitle')}</h3>
            <p className="state-text">{t('products.errorText')}</p>
            <button type="button" className="btn btn-primary" onClick={onRetry}>
              <Icon name="refresh" size={15} />
              {t('products.retry')}
            </button>
          </div>
        )}

        {status === 'ready' && products.length === 0 && (
          <div className="state-card">
            <span className="state-icon">
              <Icon name="search" size={22} />
            </span>
            <h3 className="state-title">{t('products.emptyTitle')}</h3>
            <p className="state-text">
              {searchTerm
                ? t('products.emptySearchText', { q: searchTerm })
                : t('products.emptyText')}
            </p>
            {searchTerm && (
              <button type="button" className="btn btn-primary" onClick={onClearSearch}>
                {t('products.clear')}
              </button>
            )}
          </div>
        )}

        {status === 'ready' && offline && (
          <div className="notice" style={{ marginBottom: 18 }}>
            <Icon name="info" size={16} />
            <div style={{ flex: 1 }}>
              <strong>{t('notice.offlineTitle')}</strong>
              <div style={{ marginTop: 2 }}>{t('notice.offlineText')}</div>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>
              <Icon name="refresh" size={14} />
              {t('products.retry')}
            </button>
          </div>
        )}

        {status === 'ready' && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard product={product} t={t} key={product.id} />
            ))}
          </div>
        )}

        {activeCategory && categories.length > 1 && (
          <div className="popular" style={{ marginTop: 26 }}>
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                className="popular-chip"
                onClick={() => onOpenCategory(category.slug)}
                aria-pressed={category.slug === activeCategory}
              >
                {prettyCategory(category.slug)}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RetailersSection({ t, retailers }) {
  if (retailers.length === 0) return null;

  return (
    <section className="section section--tint" id="retailers">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">{t('retailers.kicker')}</p>
            <h2 className="section-title">{t('retailers.title')}</h2>
            <p className="section-sub">{t('retailers.sub')}</p>
          </div>
        </div>

        <div className="retailer-grid">
          {retailers.map((retailer, index) => {
            const isLive = retailer.apiType === 'scraping';
            return (
              <div className="retailer-card" key={retailer.id}>
                <RetailerAvatar name={retailer.name} index={index} />
                <div className="retailer-body">
                  <div className="retailer-name">{retailer.name}</div>
                  <div className="retailer-sub">
                    <span className={`dot ${isLive ? 'dot--ok' : ''}`} />
                    {isLive ? t('retailers.active') : t('retailers.soon')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   Product detail page
   ------------------------------------------------------------------ */

function OfferCard({ offer, isBest, t, lang, index }) {
  const retailerProduct = offer.retailerProduct || {};
  const retailer = offer.retailer || {};
  const retailerName = retailer.name || retailerProduct.retailerId || '';
  const availability = availabilityInfo(offer.availability || retailerProduct.availability);
  const priceStatus = priceStatusInfo(normalizePriceStatus(offer));
  const confidence = confidenceInfo(offer.confidence);
  const checked = formatDate(retailerProduct.lastChecked, lang);
  const delivery = localizeDelivery(offer.shipping && offer.shipping.estimatedDelivery, lang);
  const source = offer.lastPriceObservation && offer.lastPriceObservation.sourceVerification;
  const shippingPrice = offer._shippingPrice;
  const shopUrl = offer.url || retailerProduct.url || retailer.baseUrl;

  return (
    <article className={`offer-card${isBest ? ' is-best' : ''}`}>
      <div className="offer-top">
        <div className="retailer-id">
          <RetailerAvatar name={retailerName} index={index} />
          <div>
            <div className="retailer-id-name">{retailerName}</div>
            <div className="retailer-id-sub">{retailerProduct.productName || offer.productName}</div>
          </div>
        </div>

        <div className="offer-badges">
          {isBest && (
            <span className="badge badge--accent">
              <Icon name="sparkle" size={12} />
              {t('product.bestTag')}
            </span>
          )}
          <Badge tone={priceStatus.tone}>{t(priceStatus.label)}</Badge>
          <Badge tone={confidence.tone}>{t(confidence.label)}</Badge>
        </div>
      </div>

      <div className="offer-pricing">
        <div className="price-cell">
          {t('product.price')}
          <strong>{money(offer._productPrice, lang)}</strong>
        </div>
        <div className="price-cell">
          {t('product.shipping')}
          <strong>
            {shippingPrice == null
              ? t('product.unknown')
              : shippingPrice === 0
                ? t('product.free')
                : money(shippingPrice, lang)}
          </strong>
        </div>
        <div className="price-cell price-cell--total">
          {t('product.total')}
          <strong>{money(offer._total, lang)}</strong>
        </div>
        <div className="offer-action">
          {shopUrl ? (
            <a
              className="btn btn-primary btn-sm"
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('product.goToShop')}
              <Icon name="external" size={14} />
            </a>
          ) : (
            <span className="btn btn-outline btn-sm" aria-disabled="true">
              {t('product.goToShop')}
            </span>
          )}
        </div>
      </div>

      <div className="offer-meta">
        <span>
          <span className={`dot dot--${availability.tone}`} />
          {t(availability.label)}
        </span>
        {delivery && (
          <span>
            <Icon name="truck" size={13} />
            {t('product.delivery')}: {delivery}
          </span>
        )}
        {source && (
          <span>
            <Icon name="shield" size={13} />
            {t('product.source')}: {source}
          </span>
        )}
        {checked && (
          <span>
            <Icon name="refresh" size={13} />
            {t('product.lastChecked')}: {checked}
          </span>
        )}
      </div>
    </article>
  );
}

function ProductPage({ id, t, lang, retailers, onNavigate }) {
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fallbackProduct = useMemo(
    () => FALLBACK_CATALOGUE.products.find((item) => item.id === id) || null,
    [id]
  );

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setData(null);

    fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}/offers`)
      .then((response) => {
        if (!response.ok) throw new Error('Request failed');
        return response.json();
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const retailerIndex = useMemo(() => {
    const map = new Map();
    retailers.forEach((retailer, index) => map.set(retailer.id, index));
    return map;
  }, [retailers]);

  const offers = useMemo(() => {
    if (!data || !Array.isArray(data.offers)) return [];

    return data.offers
      .map((offer) => {
        const retailerProduct = offer.retailerProduct || {};
        const productPrice = Number(offer.price != null ? offer.price : retailerProduct.price) || 0;
        const rawShipping = offer.shipping && offer.shipping.price;
        const shippingPrice = rawShipping == null ? null : Number(rawShipping) || 0;
        const total =
          offer.totalPurchaseCost != null
            ? Number(offer.totalPurchaseCost)
            : productPrice + (shippingPrice || 0);
        const retailer =
          retailers.find((item) => item.id === retailerProduct.retailerId) || {
            name: retailerProduct.retailerId || '',
            id: retailerProduct.retailerId,
          };

        return {
          ...offer,
          retailer,
          retailerProduct,
          _productPrice: productPrice,
          _shippingPrice: shippingPrice,
          _total: total,
        };
      })
      .sort((a, b) => a._total - b._total);
  }, [data, retailers]);

  const product = (data && data.product) || fallbackProduct;
  const best = offers[0] || null;
  const brand =
    (product && (product.brandName || product.brand)) ||
    (offers[0] && offers[0].brand) ||
    '';
  const categorySlug = product && (product.category_slug || product.categoryId);
  const matchSummary = (data && data.matchSummary) || null;
  const bestConfidence = matchSummary ? matchSummary.bestConfidence : best && best.confidence;
  const confidence = confidenceInfo(bestConfidence);

  return (
    <div className="page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate('home')}>
            <Icon name="arrow" size={14} style={{ transform: 'rotate(180deg)' }} />
            {t('product.home')}
          </button>
          {categorySlug && (
            <>
              <span aria-hidden="true">/</span>
              <a href={`#/category/${encodeURIComponent(categorySlug)}`}>
                {prettyCategory(categorySlug)}
              </a>
            </>
          )}
          {product && (
            <>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{product.name}</span>
            </>
          )}
        </nav>

        <div className="product-layout">
          <aside className="summary">
            <div className={`summary-media ph-${(hashIndex(product ? product.id : id, 6) || 0) + 1}`}>
              <ProductMonogram text={brand || (product && product.name)} />
            </div>
            <div className="summary-body">
              <p className="summary-brand">{brand}</p>
              <h1 className="summary-title">{product ? product.name : ''}</h1>

              <div className="summary-badges">
                {bestConfidence && <Badge tone={confidence.tone}>{t(confidence.label)}</Badge>}
                {best && <Badge tone="muted">{t('products.offers', { n: offers.length })}</Badge>}
              </div>

              <dl className="spec-list">
                {product && product.size && (
                  <div className="spec-row">
                    <dt>{t('product.size')}</dt>
                    <dd>{product.size}</dd>
                  </div>
                )}
                {product && product.ean && (
                  <div className="spec-row">
                    <dt>{t('product.ean')}</dt>
                    <dd>{product.ean}</dd>
                  </div>
                )}
                {categorySlug && (
                  <div className="spec-row">
                    <dt>{t('product.category')}</dt>
                    <dd>{prettyCategory(categorySlug)}</dd>
                  </div>
                )}
                {matchSummary && bestConfidence && (
                  <div className="spec-row">
                    <dt>{t('product.match')}</dt>
                    <dd>{matchSummary.bestScore}/100</dd>
                  </div>
                )}
              </dl>

              <p className="summary-note">{t('product.summaryNote')}</p>
            </div>
          </aside>

          <div>
            <div className="offers-head">
              <div>
                <h2 className="offers-title">{t('product.offersTitle')}</h2>
                <p className="offers-sub">{t('product.offersSub')}</p>
              </div>
              {best && (
                <span className="offers-best">
                  <Icon name="sparkle" size={14} />
                  {t('product.best', { price: money(best._total, lang) })}
                </span>
              )}
            </div>

            {status === 'loading' && <SkeletonOffers />}

            {status === 'error' && (
              <div className="state-card">
                <span className="state-icon">
                  <Icon name="alert" size={22} />
                </span>
                <h3 className="state-title">{t('product.errorTitle')}</h3>
                <p className="state-text">{t('product.errorText')}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setReloadKey((value) => value + 1)}
                >
                  <Icon name="refresh" size={15} />
                  {t('product.retry')}
                </button>
              </div>
            )}

            {status === 'ready' && offers.length === 0 && (
              <div className="state-card">
                <span className="state-icon">
                  <Icon name="box" size={22} />
                </span>
                <h3 className="state-title">{t('product.noOffersTitle')}</h3>
                <p className="state-text">{t('product.noOffersText')}</p>
                <button type="button" className="btn btn-outline" onClick={() => onNavigate('home')}>
                  {t('product.back')}
                </button>
              </div>
            )}

            {status === 'ready' && offers.length > 0 && (
              <div className="offer-list">
                {offers.map((offer, index) => (
                  <OfferCard
                    key={offer.retailerProduct.id || `${offer.retailerProduct.retailerId}-${index}`}
                    offer={offer}
                    isBest={index === 0}
                    t={t}
                    lang={lang}
                    index={
                      retailerIndex.has(offer.retailerProduct.retailerId)
                        ? retailerIndex.get(offer.retailerProduct.retailerId)
                        : index
                    }
                  />
                ))}
              </div>
            )}

            <div className="notice notice--info" style={{ marginTop: 18 }}>
              <Icon name="info" size={16} />
              <div>{t('product.summaryNote')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Footer
   ------------------------------------------------------------------ */

function Footer({ t, onNavigate }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <BrandMark t={t} />
            <p className="footer-tagline">{t('footer.tagline')}</p>
          </div>

          <div className="footer-col">
            <h3>{t('footer.product')}</h3>
            <ul>
              <li>
                <button type="button" onClick={() => onNavigate('top')}>
                  {t('footer.discover')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('categories')}>
                  {t('footer.categories')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('retailers')}>
                  {t('footer.retailers')}
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>{t('footer.company')}</h3>
            <ul>
              <li>
                <button type="button" onClick={() => onNavigate('how')}>
                  {t('footer.how')}
                </button>
              </li>
              <li>
                <span className="footer-static">{t('footer.about')}</span>
              </li>
              <li>
                <span className="footer-static">{t('footer.contact')}</span>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>{t('footer.legal')}</h3>
            <ul>
              <li>
                <span className="footer-static">{t('footer.imprint')}</span>
              </li>
              <li>
                <span className="footer-static">{t('footer.privacy')}</span>
              </li>
              <li>
                <span className="footer-static">{t('footer.terms')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-disclaimer">{t('footer.disclaimer')}</p>
          <p>{t('footer.rights', { year })}</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------
   App
   ------------------------------------------------------------------ */

export default function App() {
  const [lang, setLangState] = useState(getInitialLang);
  const [route, setRoute] = useState(() =>
    parseRoute(typeof window !== 'undefined' ? window.location.hash : '')
  );
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [catalogue, setCatalogue] = useState({
    status: 'loading',
    products: [],
    retailers: [],
    offline: false,
  });
  const [search, setSearch] = useState({ status: 'idle', term: '', results: [] });

  const t = useMemo(() => makeTranslator(lang), [lang]);

  /* Language side effects */
  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      window.localStorage.setItem('bp.lang', next);
    } catch (error) {
      /* ignore storage errors */
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang;
    document.title =
      lang === 'de'
        ? 'BeautyPreis – Preisvergleich für Beauty & Skincare'
        : 'BeautyPreis – Beauty & skincare price comparison';
  }, [lang]);

  /* Hash routing */
  useEffect(() => {
    const onHashChange = () => {
      const raw = window.location.hash.replace(/^#/, '');
      // In-page anchors (skip link) must not reset the route.
      if (raw && !raw.startsWith('/') && document.getElementById(raw)) {
        document.getElementById(raw).scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      setRoute(parseRoute(window.location.hash));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route.name, route.id, route.slug]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || typeof window === 'undefined') return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const navigate = useCallback((path) => {
    if (typeof window === 'undefined') return;
    const target = path.startsWith('#') ? path : `#${path}`;
    if (window.location.hash === target) {
      setRoute(parseRoute(target));
    } else {
      window.location.hash = target;
    }
  }, []);

  const goHome = useCallback(() => {
    setMenuOpen(false);
    navigate('/');
  }, [navigate]);

  const goSection = useCallback(
    (id) => {
      setMenuOpen(false);
      if (route.name === 'product' || (route.name === 'category' && id !== 'products')) {
        navigate('/');
        window.setTimeout(() => {
          if (id === 'top') window.scrollTo({ top: 0, behavior: 'auto' });
          else scrollToSection(id);
        }, 140);
        return;
      }
      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      scrollToSection(id);
    },
    [navigate, route.name]
  );

  /* Catalogue */
  const loadCatalogue = useCallback(async () => {
    setCatalogue((current) => ({ ...current, status: 'loading' }));
    try {
      const [retailersResponse, productsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/retailers`),
        fetch(`${API_BASE}/api/products`),
      ]);
      if (!retailersResponse.ok || !productsResponse.ok) throw new Error('Request failed');
      const [retailersData, productsData] = await Promise.all([
        retailersResponse.json(),
        productsResponse.json(),
      ]);
      setCatalogue({
        status: 'ready',
        products: Array.isArray(productsData.products)
          ? productsData.products.filter(isCompleteProduct)
          : [],
        retailers: Array.isArray(retailersData) ? retailersData : [],
        offline: false,
      });
    } catch (error) {
      // Static hosting (GitHub Pages) has no API. Fall back to the bundled
      // catalogue metadata so the site stays browseable — but no prices are
      // shown anywhere until a live source answers.
      setCatalogue({
        status: 'ready',
        products: FALLBACK_CATALOGUE.products,
        retailers: FALLBACK_CATALOGUE.retailers,
        offline: true,
      });
    }
  }, []);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  /* Search */
  const runSearch = useCallback(
    async (rawTerm) => {
      const term = String(rawTerm == null ? query : rawTerm).trim();
      setMenuOpen(false);

      if (!term) {
        setSearch({ status: 'idle', term: '', results: [] });
        return;
      }

      setQuery(term);
      setSearch({ status: 'loading', term, results: [] });
      if (route.name !== 'home' && route.name !== 'category') navigate('/');

      // Offline / static build: search the saved catalogue instead of calling
      // the API. No prices are involved, so this stays truthful.
      if (catalogue.offline) {
        const needle = term.toLowerCase();
        const results = catalogue.products.filter((product) =>
          [product.name, product.brandName, product.ean, product.slug]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(needle))
        );
        setSearch({ status: 'ready', term, results });
        window.setTimeout(() => scrollToSection('products'), 140);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: term }),
        });
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        const results = Array.isArray(data.results)
          ? data.results.filter(isCompleteProduct)
          : [];
        setSearch({ status: 'ready', term, results });
      } catch (error) {
        setSearch({ status: 'error', term, results: [] });
      }

      window.setTimeout(() => scrollToSection('products'), 140);
    },
    [catalogue.offline, catalogue.products, navigate, query, route.name]
  );

  const clearSearch = useCallback(() => {
    setSearch({ status: 'idle', term: '', results: [] });
    setQuery('');
  }, []);

  /* Categories */
  const categories = useMemo(() => {
    const map = new Map();
    catalogue.products.forEach((product) => {
      const slug = product.category_slug || product.categoryId;
      if (!slug) return;
      const current = map.get(slug) || { slug, count: 0 };
      current.count += 1;
      map.set(slug, current);
    });
    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || a.slug.localeCompare(b.slug)
    );
  }, [catalogue.products]);

  const activeCategory = route.name === 'category' ? route.slug : null;

  const visibleProducts = useMemo(() => {
    if (search.term && (search.status === 'ready' || search.status === 'loading')) {
      return search.results;
    }
    if (activeCategory) {
      return catalogue.products.filter(
        (product) => (product.category_slug || product.categoryId) === activeCategory
      );
    }
    return catalogue.products;
  }, [activeCategory, catalogue.products, search.results, search.status, search.term]);

  const productsStatus =
    catalogue.status === 'loading'
      ? 'loading'
      : catalogue.status === 'error'
        ? 'error'
        : search.status === 'loading'
          ? 'loading'
          : search.status === 'error'
            ? 'error'
            : 'ready';

  const openCategory = useCallback(
    (slug) => {
      clearSearch();
      navigate(slug ? `/category/${encodeURIComponent(slug)}` : '/');
    },
    [clearSearch, navigate]
  );

  const handleSectionNavigate = useCallback(
    (id) => {
      if (id === 'products') {
        goSection('products');
        return;
      }
      goSection(id);
    },
    [goSection]
  );

  const stats = {
    products: catalogue.products.length,
    retailers: catalogue.retailers.length,
  };

  return (
    <div>
      <a className="skip-link" href="#main">
        {t('skip')}
      </a>

      <Header
        t={t}
        lang={lang}
        setLang={setLang}
        query={query}
        onQueryChange={setQuery}
        onSearch={runSearch}
        onNavigate={handleSectionNavigate}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <main id="main">
        {route.name === 'product' ? (
          <ProductPage
            id={route.id}
            t={t}
            lang={lang}
            retailers={catalogue.retailers}
            onNavigate={(target) => {
              if (target === 'home') {
                goHome();
                return;
              }
              handleSectionNavigate(target);
            }}
          />
        ) : (
          <>
            <Hero
              t={t}
              query={query}
              onQueryChange={setQuery}
              onSearch={runSearch}
              stats={stats}
            />

            <HowItWorks t={t} />

            <CategoriesSection
              t={t}
              categories={categories}
              onOpenCategory={openCategory}
            />

            <ProductsSection
              t={t}
              products={visibleProducts}
              status={productsStatus}
              searchTerm={search.term}
              activeCategory={activeCategory}
              categories={categories}
              offline={catalogue.offline}
              onClearSearch={clearSearch}
              onOpenCategory={openCategory}
              onRetry={loadCatalogue}
            />

            <RetailersSection t={t} retailers={catalogue.retailers} />
          </>
        )}
      </main>

      <Footer t={t} onNavigate={handleSectionNavigate} />

      {menuOpen && (
        <MobileDrawer
          t={t}
          lang={lang}
          setLang={setLang}
          query={query}
          onQueryChange={setQuery}
          onSearch={runSearch}
          onNavigate={handleSectionNavigate}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
