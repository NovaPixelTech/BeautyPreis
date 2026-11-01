import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Card, List, ListItem, Avatar } from './components/ui';

// Backend API URL (set VITE_API_BASE_URL at build time, e.g. for a deployed API)
const API_BASE = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3011';

// German currency formatter
const formatPrice = (price) => {
  if (price == null || price === 0) return 'n. v.';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(price);
};

// Confidence color
const confidenceColor = (confidence) => {
  switch (confidence) {
    case 'EXACT': return '#10b981';   // green
    case 'HIGH': return '#3b82f6';    // blue
    case 'POSSIBLE': return '#f59e0b'; // amber
    case 'LOW': return '#ef4444';     // red
    default: return '#6b7280';        // gray
  }
};

// Confidence label in German
const confidenceLabel = (confidence) => {
  switch (confidence) {
    case 'EXACT': return 'Exakt';
    case 'HIGH': return 'Hoch';
    case 'POSSIBLE': return 'Möglich';
    case 'LOW': return 'Gering';
    default: return 'Unbekannt';
  }
};

// Price status color
const priceStatusColor = (status) => {
  switch (status) {
    case 'VERIFIED': return '#10b981';
    case 'ESTIMATED': return '#f59e0b';
    case 'UNKNOWN': return '#6b7280';
    case 'OUTDATED': return '#ef4444';
    default: return '#6b7280';
  }
};

// Price status label in German
const priceStatusLabel = (status) => {
  switch (status) {
    case 'VERIFIED': return 'Verifiziert';
    case 'ESTIMATED': return 'Geschätzt';
    case 'UNKNOWN': return 'Unbekannt';
    case 'OUTDATED': return 'Veraltet';
    default: return 'Unbekannt';
  }
};

// Availability label
const availabilityLabel = (avail) => {
  switch (avail) {
    case 'in_stock': return 'Auf Lager';
    case 'out_of_stock': return 'Nicht verfügbar';
    case 'limited': return 'Eingeschränkt';
    default: return 'Unbekannt';
  }
};

const availabilityColor = (avail) => {
  switch (avail) {
    case 'in_stock': return '#10b981';
    case 'out_of_stock': return '#ef4444';
    case 'limited': return '#f59e0b';
    default: return '#6b7280';
  }
};

// Truncate text
const truncate = (text, len = 40) => {
  if (!text) return '';
  return text.length > len ? text.substring(0, len) + '…' : text;
};

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'product'
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [apiOffline, setApiOffline] = useState(false);

  // Fetch retailers and categories on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [retRes, catRes] = await Promise.all([
          fetch(`${API_BASE}/api/retailers`),
          fetch(`${API_BASE}/api/products`),
        ]);
        if (retRes.ok) {
          const retailData = await retRes.json();
          setRetailers(retailData);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          // Extract unique categories from products
          const catSet = new Set();
          catData.products.forEach(p => {
            if (p.category_slug) catSet.add(p.category_slug);
            if (p.categoryId) catSet.add(p.categoryId);
          });
          setCategories(Array.from(catSet));
        }
        setApiOffline(false);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setApiOffline(true);
      }
    };
    loadData();
  }, []);

  const handleSearch = useCallback(async (e, overrideQuery) => {
    if (e) e.preventDefault();
    const query = typeof overrideQuery === 'string' ? overrideQuery : searchQuery;
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error('Suche fehlgeschlagen');
      const data = await res.json();
      setProducts(data.results || []);
      setView('home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const searchByCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/products?category=${categoryId}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const viewProductOffers = (productId) => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/products/${productId}/offers`)
      .then(res => res.json())
      .then(data => {
        setSelectedProduct(data);
        setView('product');
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const getRetailerName = (retailerId) => {
    const r = retailers.find(ret => ret.id === retailerId || ret.slug === retailerId);
    return r ? r.name : retailerId;
  };

  const getRetailerColor = (retailerId) => {
    const colors = {
      yesstyle: '#ef4444',
      stylevana: '#3b82f6',
      douglas: '#10b981',
      flaconi: '#8b5cf6',
      notino: '#f59e0b',
      sephora: '#ec4899',
      lookfantastic: '#06b6d4',
      shop_apotheke: '#84cc16',
      dm: '#f97316',
      rossmann: '#6366f1',
    };
    return colors[retailerId] || '#6b7280';
  };

  // ================= NAVIGATION =================
  const Nav = () => (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', onClick: () => setView('home') }}>
          <div style={{
            width: '36px', height: '36px', backgroundColor: '#3b82f6',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: '700', fontSize: '16px',
          }}>BP</div>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827', letterSpacing: '-0.5px' }}>BeautyPreis</span>
        </div>

        <div style={{ display: 'none', alignItems: 'center', gap: '24px' }}>
          <Button variant="ghost" onClick={() => setView('home')}>Startseite</Button>
          <Button variant="ghost" onClick={() => setSelectedCategory(null) || setProducts([])}>Kategorien</Button>
          <Button variant="ghost">Händler</Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none' }}>
            ☰
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute', top: '64px', left: 0, right: 0,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <Button variant="ghost" style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start' }} onClick={() => { setMobileMenuOpen(false); setView('home'); }}>Startseite</Button>
          <Button variant="ghost" style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start' }} onClick={() => { setMobileMenuOpen(false); setSelectedCategory(null); setProducts([]); }}>Kategorien</Button>
          <Button variant="ghost" style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start' }}>Händler</Button>
          <Button variant="ghost" style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start' }}>Über uns</Button>
        </div>
      )}
    </nav>
  );

  // ================= HERO SECTION =================
  const Hero = () => (
    <section style={{ padding: '40px 20px', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: '800', color: '#111827', marginBottom: '16px', lineHeight: '1.1' }}>
            Suche einmal. Vergleiche alles.<br style={{ display: 'none' }} />Finde den besten Preis.
          </h1>
          <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            BeautyPreis vergleicht echte Kaufpreise für Beauty- & Skincare-Produkte<br />
            aus deutschen Online-Händlern – inklusive Versandkosten.
          </p>
        </div>

        {/* Search Card */}
        <Card style={{ maxWidth: '560px', margin: '0 auto', padding: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              placeholder="Produktname, Marke oder EAN (z. B. ANUA PDRN)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
              style={{ fontSize: '17px', padding: '16px 20px' }}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{ width: '100%', padding: '16px', fontSize: '17px', fontWeight: '600' }}
            >
              {loading ? 'Suchen…' : 'Jetzt vergleichen'}
            </Button>
          </form>
          {error && (
            <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '14px', backgroundColor: '#fef2f2', padding: '10px 14px', borderRadius: '6px', border: '1px solid #fee2e2' }}>
              {error}
            </div>
          )}
        </Card>

        {/* Backend status notice */}
        {apiOffline && (
          <div style={{ maxWidth: '560px', margin: '20px auto 0', fontSize: '14px', color: '#92400e', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', lineHeight: '1.5' }}>
            <strong>Hinweis:</strong> Die Preisvergleichs-API ist derzeit nicht erreichbar. Bitte starten Sie das Backend
            (<code>npm start</code> im Ordner <code>backend</code>) oder legen Sie <code>VITE_API_BASE_URL</code> beim Build fest.
          </div>
        )}

        {/* Quick Search Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '32px' }}>
          {['ANUA', 'COSRX', 'Hada Labo', 'SOME BY MI', 'INNISFREE', 'Shiseido'].map((brand) => (
            <Button key={brand} variant="outline" onClick={() => { setSearchQuery(brand); handleSearch(null, brand); }} style={{ padding: '10px 20px', fontSize: '14px' }}>
              {brand}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );

  // ================= CATEGORIES =================
  const CategorySection = () => (
    <section style={{ padding: '40px 20px', backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>Kategorien</h2>
          <Button variant="outline" onClick={() => { setSelectedCategory(null); fetch(`${API_BASE}/api/products`).then(r => r.json()).then(d => setProducts(d.products || [])); }}>Alle anzeigen</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {categories.map((cat) => (
            <Card key={cat} style={{ cursor: 'pointer', transition: 'all 0.2s', border: `1px solid ${selectedCategory === cat ? '#3b82f6' : '#e5e7eb'}` }} onClick={() => searchByCategory(cat)}>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{selectedCategory === cat ? 'Ausgewählt' : 'Produkte anzeigen'}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );

  // ================= PRODUCT GRID =================
  const ProductGrid = () => (
    <section style={{ padding: '40px 20px', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {selectedCategory ? `Kategorie: ${selectedCategory}` : 'Beliebte Produkte'}
          </h2>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{products.length} Produkte gefunden</span>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Lade Produkte…</div>
        )}

        {products.length === 0 && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Noch keine Produkte</h3>
            <p style={{ fontSize: '14px' }}>Suche nach einem Beauty-Produkt oder durchsuche die Kategorien.</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            <h3>Fehler beim Laden</h3>
            <p>{error}</p>
            <Button variant="outline" onClick={() => { setError(null); setProducts([]); }}>Erneut versuchen</Button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onClick={() => viewProductOffers(product.id)} />
          ))}
        </div>
      </div>
    </section>
  );

  const ProductCard = ({ product, onClick }) => {
    const brand = product.brand || product.name?.split(' ')[0] || '';
    const size = product.size || '';
    const ean = product.ean || '';
    const imageUrl = product.imageUrl || '';

    return (
      <Card style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', height: '100%', display: 'flex', flexDirection: 'column' }} onClick={onClick}>
        <div style={{ position: 'relative', height: '200px', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#f3f4f6' }}>
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>Kein Bild</div>
          )}
          {ean && (
            <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>EAN: {ean}</div>
          )}
        </div>
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            {brand}
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {size && <span style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>{size}</span>}
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>Match</span>
          </div>
          <Button variant="ghost" style={{ width: '100%', padding: '10px', fontSize: '14px', fontWeight: '600', justifyContent: 'center' }}>Angebote ansehen</Button>
        </div>
      </Card>
    );
  };

  // ================= PRODUCT DETAIL / OFFERS =================
  const ProductDetail = () => {
    if (!selectedProduct) return null;

    const { product, offers, matchSummary } = selectedProduct;

    const backHandler = () => { setView('home'); setSelectedProduct(null); };

    // Sort offers by total purchase cost (lowest first)
    const sortedOffers = [...offers].sort((a, b) => a.totalPurchaseCost - b.totalPurchaseCost);
    const bestOffer = sortedOffers[0];

    return (
      <section style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Back Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Button variant="ghost" onClick={backHandler} style={{ padding: '8px 16px', fontSize: '14px' }}>← Zurück</Button>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: 0 }}>{product.name}</h1>
          </div>

          {/* Product Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', marginBottom: '32px' }}>
            <div>
              <div style={{ width: '100%', height: '320px', backgroundColor: '#f3f4f6', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>Produktbild</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{product.brand || 'Marke'}</div>
              <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{product.size || 'Größe nicht angegeben'}</div>
              {product.ean && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>EAN: {product.ean}</div>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '20px' }}>
                  {matchSummary.bestConfidence} ({matchSummary.bestScore}/100)
                </span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Produktübereinstimmung</span>
              </div>
              <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                BeautyPreis vergleicht dieses Produkt über mehrere Händler und zeigt den<br />
                tatsächlichen Gesamtkaufpreis inklusive Versandkosten an.
              </p>
            </div>
          </div>

          {/* Offers Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Angebote ({offers.length})</h2>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>Sortiert nach günstigstem Gesamtpreis</span>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {sortedOffers.map((offer, idx) => (
              <OfferCard key={offer.retailerProduct?.id || idx} offer={offer} isBest={idx === 0} />
            ))}
          </div>

          {/* Best Offer Highlight */}
          {bestOffer && (
            <Card style={{ marginTop: '24px', backgroundColor: '#ecfdf5', border: '1px solid #10b981', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Beste Wahl</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                    Günstigster Gesamtpreis: {formatPrice(bestOffer.totalPurchaseCost)}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {getRetailerName(bestOffer.retailerProduct.retailerId)} • Versand: {formatPrice(bestOffer.shipping?.price || 0)}
                  </div>
                </div>
                <Button variant="primary" style={{ padding: '14px 24px', fontSize: '16px' }}>
                  Zum Händler →
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>
    );
  };

  const OfferCard = ({ offer, isBest }) => {
    const rp = offer.retailerProduct;
    const shipping = offer.shipping || { price: 0, verificationStatus: 'unknown' };
    const total = rp.price + (shipping.price || 0);
    const retailerName = getRetailerName(rp.retailerId);
    const retailerColor = getRetailerColor(rp.retailerId);
    const confidence = offer.confidence || 'LOW';
    const priceStatus = rp.priceStatus || 'ESTIMATED';

    return (
      <Card style={{
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: isBest ? '2px solid #10b981' : '1px solid #e5e7eb',
        backgroundColor: isBest ? '#fcfffd' : '#ffffff',
        display: 'flex',
        gap: '16px',
        padding: '16px',
      }}>
        <div style={{ width: '48px', height: '48px', backgroundColor: retailerColor + '20', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: retailerColor, fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
          {retailerName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{rp.productName}</span>
            {isBest && <span style={{ fontSize: '10px', fontWeight: '700', color: '#10b981', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>BESTE WAHL</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>{rp.brand || 'Marke'}</span>
            {rp.size && <span style={{ fontSize: '11px', color: '#9ca3af' }}>{rp.size}</span>}
            <span style={{ fontSize: '10px', fontWeight: '600', color: confidenceColor(confidence), backgroundColor: confidenceColor(confidence) + '15', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
              {confidenceLabel(confidence)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{formatPrice(rp.price)}</span>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>{rp.currency || 'EUR'}</span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: priceStatusColor(priceStatus), backgroundColor: priceStatusColor(priceStatus) + '15', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
              {priceStatusLabel(priceStatus)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#4b5563' }}>
            <span style={{ color: availabilityColor(rp.availability || 'unknown'), fontWeight: '600', fontSize: '11px', textTransform: 'uppercase' }}>
              • {availabilityLabel(rp.availability || 'unknown')}
            </span>
            <span>• Versand: {formatPrice(shipping.price || 0)}</span>
            <span>• {shipping.estimatedDelivery || '3–5 Tage'}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: '120px' }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#111827', lineHeight: '1.2' }}>{formatPrice(total)}</div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Gesamtkaufpreis</div>
          <Button variant="outline" style={{ width: '100%', marginTop: '10px', padding: '8px 12px', fontSize: '13px' }}>
            Zum Shop
          </Button>
        </div>
      </Card>
    );
  };

  // ================= RENDER =================
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#111827',
    }}>
      <Nav />
      <main>
        {view === 'product' ? (
          <ProductDetail />
        ) : (
          <>
            <Hero />
            <CategorySection />
            <ProductGrid />
          </>
        )}
      </main>
      <footer style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '40px 20px',
        marginTop: '40px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
          <div style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>BeautyPreis</div>
          <div style={{ marginBottom: '16px' }}>
            Preisvergleich für Beauty- & Skincare-Produkte in Deutschland.<br />
            Alle Preise sind den jeweiligen Händlern zugeordnet und nach bestem Wissen recherchiert.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', color: '#9ca3af' }}>
            <span>Impressum</span>
            <span>Datenschutz</span>
            <span>AGB</span>
          </div>
          <div style={{ marginTop: '16px', fontSize: '11px', color: '#9ca3af' }}>
            BeautyPreis – Transparenter Preisvergleich für Beauty-Produkte in Deutschland
          </div>
        </div>
      </footer>
    </div>
  );
}
