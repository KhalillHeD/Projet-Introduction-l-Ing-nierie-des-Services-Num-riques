import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, MapPin, Bell, ShoppingCart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { medicationCategories } from '../data/medications';

export function Search() {
  const { t, isRTL } = useLanguage();
  const { user, getAuthHeaders } = useAuth();
  const [orderingId, setOrderingId] = useState<string | null>(null);

  const handleOrder = async (medicationId: string) => {
    if (!user) {
      alert('Please login to order');
      return;
    }

    setOrderingId(medicationId);
    try {
      const response = await fetch('/api/orders?medicationId=' + medicationId + '&quantity=1', {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        alert('Order placed successfully!');
      } else {
        const error = await response.text();
        alert('Order failed: ' + error);
      }
    } catch (error) {
      alert('Order failed: ' + error);
    } finally {
      setOrderingId(null);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    availability: 'all',
    sortBy: 'relevance',
    maxDistance: 10,
  });
  const [medications, setMedications] = useState<any[]>([]);

  // load medications from backend and normalize availability field
  useEffect(() => {
    fetch('/api/medications', { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data: any[]) => {
        const normalized = data.map((m) => {
          let availability: string = 'out-of-stock';
          if (m.isAvailable) {
            availability = m.stockQuantity <= 5 ? 'low-stock' : 'in-stock';
          }
          return { ...m, availability };
        });
        setMedications(normalized);
      })
      .catch((err) => console.error('Failed to fetch medications', err));
  }, [getAuthHeaders]);

  const filteredMedications = medications.filter((med) => {
    const matchesSearch =
      searchQuery === '' ||
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filters.category === 'All' || med.category === filters.category;

    const matchesAvailability =
      filters.availability === 'all' || med.availability === filters.availability;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const sortedMedications = [...filteredMedications].sort((a, b) => {
    if (filters.sortBy === 'price') return a.price - b.price;
    if (filters.sortBy === 'distance') return (a.distance || 0) - (b.distance || 0);
    return 0;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in-stock':
        return 'bg-[#28A745] text-white';
      case 'low-stock':
        return 'bg-[#FFC107] text-gray-900';
      case 'out-of-stock':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-[#007BFF] to-[#0056b3] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
            {t.search.title}
          </h1>
          <div className="max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder={t.search.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<SearchIcon className="h-5 w-5 text-gray-400" />}
              className="h-14 text-lg"
            />
          </div>
        </div>
      </section>

      <section className="py-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              Found <span className="font-semibold">{sortedMedications.length}</span> medications
            </p>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              {t.search.filters}
            </Button>
          </div>

          {showFilters && (
            <Card className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    {medicationCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.search.availability}
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.search.sortBy}
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price">Price: Low to High</option>
                    <option value="distance">Distance: Near to Far</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Distance (km)
                  </label>
                  <input
                    type="number"
                    value={filters.maxDistance}
                    onChange={(e) =>
                      setFilters({ ...filters, maxDistance: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </Card>
          )}

          {sortedMedications.length === 0 ? (
            <Card className="text-center py-12">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t.search.noResults}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedMedications.map((medication) => (
                <Card key={medication.id} hover>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {isRTL ? medication.nameAr : medication.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {medication.genericName}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${getAvailabilityColor(
                            medication.availability
                          )}`}
                        >
                          {medication.availability === 'in-stock' && t.search.inStock}
                          {medication.availability === 'low-stock' && 'Low Stock'}
                          {medication.availability === 'out-of-stock' && 'Out of Stock'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <MapPin className="h-4 w-4 text-[#007BFF]" />
                          <span>{medication.pharmacyName}</span>
                          {medication.distance && (
                            <span className="text-gray-500">• {medication.distance} km</span>
                          )}
                        </div>

                        {medication.dosage && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {medication.dosage}
                          </p>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Category:
                          </span>
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                            {medication.category}
                          </span>
                          {medication.requires_prescription && (
                            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded">
                              Prescription Required
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-[#007BFF]">
                            {medication.price.toFixed(2)} {t.common.currency}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {medication.availability === 'in-stock' ? (
                            <Button
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => handleOrder(medication.id)}
                              disabled={orderingId === medication.id}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              {orderingId === medication.id ? 'Ordering...' : t.search.order}
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="flex items-center gap-2">
                              <Bell className="h-4 w-4" />
                              {t.search.notify}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
