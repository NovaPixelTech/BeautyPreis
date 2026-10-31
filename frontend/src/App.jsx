import React, { useState, useEffect } from 'react';
import { Button, Input, Card, List, ListItem, Avatar } from './components/ui';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch retailers on mount - using localhost:3011 where backend runs
    fetch('http://localhost:3011/api/retailers')
      .then(res => res.json())
      .then(setRetailers)
      .catch(console.error);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3011/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // German product categories and styles
  const productStyles = {
    nameColor: '#1f2937',
    nameFontWeight: '500',
    descColor: '#6b7280',
    descFontSize: '13px',
    cardBg: '#fff',
    cardShadow: '0 4px 6px rgba(0,0,0,0.05)',
    resultBg: '#fff',
    resultPadding: '24px',
    noResultsColor: '#6b7280',
    noResultsFontSize: '14px',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <nav
        style={{
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e5e5e5',
          padding: '0 16px',
          height: '64px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            maxWidth: '760',
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: '40',
              height: '40',
              borderRadius: '50',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            BP
          </div>
          <span
            style={{ fontSize: '18px', fontWeight: '600', marginLeft: '12px' }}
          >
            BeautyPreis
          </span>
          <div
            style={{
              display: 'none',
              marginLeft: 'auto'
            }}
          >
            <button
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              Account
            </button>
          </div>
        </div>
      </nav>

      <main
        style={{
          padding: '20px'
        }}
      >
        <section
          style={{
            maxWidth: '600',
            margin: '40px auto'
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '8',
              padding: '24',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}
          >
            <h1
              style={{
                fontSize: '20',
                fontWeight: '600',
                marginBottom: '16',
                color: '#1f2937'
              }}
            >
              Suche nach Beauty-Produkten
            </h1>
            <input
              style={{
                width: '100%',
                padding: '12 16',
                marginBottom: '16',
                border: '1px solid #d1d5db',
                borderRadius: '6',
                fontSize: '16',
                boxSizing: 'border-box',
                '&:focus': {
                  outline: 'none',
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.1)'
                }
              }}
              placeholder="Produktname, Marke oder Kategorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
            <button
              style={{
                width: '100%',
                padding: '12 16',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '6',
                fontSize: '16',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Suche...' : 'Vergleichen'}
            </button>
          </div>

          {/* Suggestions */}
          {results.length > 0 && (
            <div
              style={{
                background: '#fff',
                borderRadius: '8',
                padding: '24',
                marginTop: '24',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}
            >
              <h2
                style={{
                  fontSize: '16',
                  fontWeight: '500',
                  marginBottom: '12',
                  color: '#1f2937'
                }}
              >
                Ergebnisse für "{searchQuery}"
              </h2>
              {results.length > 0 ? (
                <ul
                  style={{
                    listStyle: 'none',
                    padding: '0'
                  }}
                >
                  {results.map((product, index) => (
                    <li
                      key={product.id || index}
                      style={{
                        padding: '12 0',
                        borderBottom: '1px solid #e5e5e5',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12'
                      }}
                    >
                      <div
                        style={{
                          width: '60',
                          height: '80',
                          backgroundColor: '#e5e5e5',
                          borderRadius: '4',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          fontSize: '12'
                        }}
                      >
                        Produktbild
                      </div>
                      <div
                        style={{ flex: '1' }}
                      >
                        <p
                          style={{
                            fontWeight: '500',
                            marginBottom: '4',
                            color: '#1f2937'
                          }}
                        >
                          {product.name || 'Produktname'}
                        </p>
                        <p
                          style={{
                            fontSize: '13',
                            color: '#6b7280',
                            marginBottom: '0'
                          }}
                        >
                          {product.brand || ''} • {product.size || ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p
                  style={{
                    color: '#6b7280',
                    fontSize: '14',
                    margin: '0'
                  }}
                >
                  Keine Ergebnisse gefunden.
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}