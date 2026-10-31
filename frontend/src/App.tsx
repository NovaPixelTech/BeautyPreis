import React, { useState, useEffect } from 'react';
import { Container, Button, Input, Card, List, ListItem, Avatar } from './components/ui';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch retailers on mount
    fetch('/api/retailers')
      .then(res => res.json())
      .then(setRetailers)
      .catch(console.error);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <div className="bg-blue-500 text-white rounded flex items-center justify-center text-sm font-bold">
                  BP
                </div>
              </Avatar>
              <span className="text-xl font-semibold">BeautyPreis</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" onClick={() => alert('Login required')}>
                Account
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-4">
            <Card className="p-6 max-w-xl mx-auto">
              <h1 className="text-2xl font-bold mb-4">Suche nach Beauty-Produkten</h1>
              <Input
                placeholder="Produktname, Marke oder Kategorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Suche...' : 'Vergleichen'}
              </Button>
            </Card>

            {/* Suggestions */}
            {results.length > 0 && (
              <Card className="p-4 mt-6 space-y-2">
                <h2 className="font-medium mb-3">Ergebnisse für "{searchQuery}"</h2>
                <List>
                  {results.map((product: any) => (
                    <ListItem key={product.id} className="py-2">
                      <div className="flex items-start gap-3">
                        {/* Product image would go here */}
                        <div className="flex-1">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand || ''} • {product.size || ''}</p>
                        </div>
                      </div>
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}