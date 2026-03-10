import {
  Filter,
  List,
  Map as MapIcon,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useLanguage } from "../contexts/LanguageContext";
import { tunisiaGovernorates } from "../data/pharmacies";
import { Pharmacy, pharmacyAPI, PharmacyRequest } from "../lib/api";

export function Pharmacies() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"map" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    open24: false,
    openNow: false,
    governorate: "All",
  });
  const [formData, setFormData] = useState<PharmacyRequest>({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    isOpen: true,
  });

  // Fetch pharmacies on component mount
  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching pharmacies from API...");
      const data = await pharmacyAPI.getAll();
      console.log("Received pharmacies data:", data);
      setPharmacies(data);
    } catch (err) {
      setError("Failed to load pharmacies. Please try again later.");
      console.error("Error fetching pharmacies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await pharmacyAPI.create(formData);
      alert("Pharmacy application submitted successfully!");
      setShowJoinForm(false);
      // Reset form
      setFormData({
        name: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        website: "",
        description: "",
        isOpen: true,
      });
      // Refresh pharmacies list
      fetchPharmacies();
    } catch (err) {
      setError("Failed to submit application. Please try again.");
      console.error("Error creating pharmacy:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    if (filters.openNow && !pharmacy.isOpen) return false;
    if (filters.governorate !== "All" && pharmacy.city !== filters.governorate)
      return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-[#007BFF] to-[#0056b3] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-6">
            {t.pharmacies.title}
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto opacity-90">
            Find medications at nearby pharmacies with real-time availability
          </p>
        </div>
      </section>

      <section className="py-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {loading && !pharmacies.length ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF]"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading pharmacies...
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "list" ? "primary" : "outline"}
                    onClick={() => setViewMode("list")}
                    className="flex items-center gap-2"
                  >
                    <List className="h-5 w-5" />
                    {t.pharmacies.list}
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "primary" : "outline"}
                    onClick={() => setViewMode("map")}
                    className="flex items-center gap-2"
                  >
                    <MapIcon className="h-5 w-5" />
                    {t.pharmacies.map}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-5 w-5" />
                  {t.pharmacies.filters}
                </Button>
              </div>

              {showFilters && (
                <Card className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.openNow}
                        onChange={(e) =>
                          setFilters({ ...filters, openNow: e.target.checked })
                        }
                        className="w-5 h-5 text-[#007BFF] rounded"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {t.pharmacies.openNow}
                      </span>
                    </label>

                    <select
                      value={filters.governorate}
                      onChange={(e) =>
                        setFilters({ ...filters, governorate: e.target.value })
                      }
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="All">All Cities</option>
                      {tunisiaGovernorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>
                </Card>
              )}

              {viewMode === "map" ? (
                <Card className="mb-6">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center p-8">
                      <MapPin className="h-16 w-16 mx-auto mb-4 text-[#007BFF]" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Interactive Map
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Tunisia-centered map showing all pharmacies
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        (Google Maps integration ready for backend)
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {filteredPharmacies.length > 0 ? (
                    filteredPharmacies.map((pharmacy) => (
                      <Card key={pharmacy.id} hover>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                              {pharmacy.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>{pharmacy.city}</span>
                            </div>
                          </div>
                          {pharmacy.isOpen && (
                            <span className="bg-[#28A745] text-white text-xs font-semibold px-2 py-1 rounded">
                              Open
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#007BFF]" />
                            <span>{pharmacy.address}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <Phone className="h-4 w-4 flex-shrink-0 text-[#007BFF]" />
                            <a
                              href={`tel:${pharmacy.phone}`}
                              className="hover:text-[#007BFF]"
                            >
                              {pharmacy.phone}
                            </a>
                          </div>

                          {pharmacy.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <span className="text-[#007BFF]">📧</span>
                              <a
                                href={`mailto:${pharmacy.email}`}
                                className="hover:text-[#007BFF]"
                              >
                                {pharmacy.email}
                              </a>
                            </div>
                          )}
                        </div>

                        {pharmacy.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {pharmacy.description}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={pharmacy.isOpen ? "primary" : "outline"}
                            fullWidth
                          >
                            {pharmacy.isOpen ? "View Stock" : "View Details"}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Navigation className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400">
                        No pharmacies found
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <Card className="bg-gradient-to-br from-[#007BFF] to-[#0056b3] text-white">
            <div className="text-center py-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                {t.pharmacies.joinTitle}
              </h2>
              <p className="text-lg mb-6 opacity-90">{t.pharmacies.joinDesc}</p>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowJoinForm(!showJoinForm)}
              >
                Join Now
              </Button>
            </div>
          </Card>

          {showJoinForm && (
            <Card className="mt-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Pharmacy Registration Form
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Pharmacy Name"
                    placeholder="Enter pharmacy name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <Input
                    type="tel"
                    label="Phone Number"
                    placeholder="+216 XX XXX XXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                  <Input
                    type="email"
                    label="Email"
                    placeholder="pharmacy@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City/Governorate
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                    >
                      <option value="">Select City</option>
                      {tunisiaGovernorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Full Address"
                  placeholder="Enter complete address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />

                <Input
                  label="Website (optional)"
                  placeholder="https://yourpharmacy.com"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Brief description of your pharmacy"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" fullWidth disabled={loading}>
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowJoinForm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
