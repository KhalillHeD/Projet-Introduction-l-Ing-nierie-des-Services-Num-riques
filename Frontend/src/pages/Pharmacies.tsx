import { useEffect, useMemo, useState } from 'react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import {
  MapPin,
  Clock,
  Phone,
  Star,
  Navigation,
  Map as MapIcon,
  List,
  Filter,
  Upload,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { pharmacies, tunisiaGovernorates, type Pharmacy } from '../data/pharmacies';

const TUNISIA_CENTER = { lat: 36.8065, lng: 10.1815 };
const NEARBY_RADIUS_KM = 5;
const GOOGLE_MAP_LIBRARIES: ('places')[] = ['places'];

function calculateDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) {
  const earthRadiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

interface PharmacyWithGeoMeta extends Pharmacy {
  distanceFromUser: number | null;
  isNearby: boolean;
}

export function Pharmacies() {
  const { t, isRTL } = useLanguage();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    open24: false,
    openNow: false,
    governorate: 'All',
  });
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useJsApiLoader({
    id: 'pharmalovo-google-map-script',
    googleMapsApiKey,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    if (filters.open24 && !pharmacy.is24Hours) return false;
    if (filters.openNow && !pharmacy.isOpen) return false;
    if (
      filters.governorate !== 'All' &&
      !pharmacy.address.toLowerCase().includes(filters.governorate.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const pharmaciesWithDistance = useMemo<PharmacyWithGeoMeta[]>(() => {
    return filteredPharmacies
      .map((pharmacy) => {
        const distanceFromUser = userLocation
          ? calculateDistanceKm(userLocation, pharmacy.location)
          : null;
        const isNearby = distanceFromUser !== null && distanceFromUser <= NEARBY_RADIUS_KM;

        return {
          ...pharmacy,
          distanceFromUser,
          isNearby,
        };
      })
      .sort((a, b) => {
        if (a.isNearby && !b.isNearby) return -1;
        if (!a.isNearby && b.isNearby) return 1;
        if (a.distanceFromUser !== null && b.distanceFromUser !== null) {
          return a.distanceFromUser - b.distanceFromUser;
        }
        return 0;
      });
  }, [filteredPharmacies, userLocation]);

  const selectedPharmacy =
    pharmaciesWithDistance.find((pharmacy) => pharmacy.id === selectedPharmacyId) ?? null;

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      () => {
        setLocationError('Location access denied. Showing all pharmacies in Tunisia.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="h-5 w-5" />
                {t.pharmacies.list}
              </Button>
              <Button
                variant={viewMode === 'map' ? 'primary' : 'outline'}
                onClick={() => setViewMode('map')}
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
                    checked={filters.open24}
                    onChange={(e) =>
                      setFilters({ ...filters, open24: e.target.checked })
                    }
                    className="w-5 h-5 text-[#007BFF] rounded"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {t.pharmacies.open24}
                  </span>
                </label>

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
                  <option value="All">All Governorates</option>
                  {tunisiaGovernorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          )}

          {viewMode === 'map' ? (
            <Card className="mb-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-medium">
                    Nearby pharmacies ({pharmaciesWithDistance.filter((p) => p.isNearby).length})
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#FFEBEE] text-[#C62828] font-medium">
                    Other pharmacies ({pharmaciesWithDistance.filter((p) => !p.isNearby).length})
                  </span>
                  {locationError && (
                    <span className="text-amber-700 dark:text-amber-400">{locationError}</span>
                  )}
                </div>

                {!googleMapsApiKey ? (
                  <div className="aspect-video bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg flex items-center justify-center p-6 text-center">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
                        Google Maps API key is missing
                      </h3>
                      <p className="text-amber-700 dark:text-amber-200 mt-2">
                        Add <code>VITE_GOOGLE_MAPS_API_KEY</code> in your Frontend <code>.env</code>{' '}
                        file to display the live map.
                      </p>
                    </div>
                  </div>
                ) : mapLoadError ? (
                  <div className="aspect-video bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center justify-center p-6 text-center text-red-700 dark:text-red-300">
                    Failed to load Google Maps. Check API key restrictions and billing settings.
                  </div>
                ) : !isMapLoaded ? (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300">
                    Loading map...
                  </div>
                ) : (
                  <GoogleMap
                    mapContainerClassName="w-full h-[520px] rounded-lg"
                    center={userLocation ?? TUNISIA_CENTER}
                    zoom={userLocation ? 12 : 10}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    {userLocation && (
                      <MarkerF
                        position={userLocation}
                        title="Your location"
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: '#0D47A1',
                          fillOpacity: 1,
                          strokeColor: '#FFFFFF',
                          strokeWeight: 3,
                        }}
                      />
                    )}

                    {pharmaciesWithDistance.map((pharmacy) => (
                      <MarkerF
                        key={pharmacy.id}
                        position={pharmacy.location}
                        title={pharmacy.name}
                        onClick={() => setSelectedPharmacyId(pharmacy.id)}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: pharmacy.isNearby ? 9 : 7,
                          fillColor: pharmacy.isNearby ? '#2E7D32' : '#D32F2F',
                          fillOpacity: pharmacy.isNearby ? 0.95 : 0.8,
                          strokeColor: '#FFFFFF',
                          strokeWeight: 2,
                        }}
                      />
                    ))}

                    {selectedPharmacy && (
                      <InfoWindowF
                        position={selectedPharmacy.location}
                        onCloseClick={() => setSelectedPharmacyId(null)}
                      >
                        <div className="text-sm max-w-[220px]">
                          <h4 className="font-semibold text-gray-900">{selectedPharmacy.name}</h4>
                          <p className="text-gray-600 mt-1">{selectedPharmacy.address}</p>
                          {selectedPharmacy.distanceFromUser !== null && (
                            <p className="mt-2 font-medium text-[#007BFF]">
                              {selectedPharmacy.distanceFromUser.toFixed(2)} km from your location
                            </p>
                          )}
                          <p className="mt-1 text-gray-700">{selectedPharmacy.phone}</p>
                        </div>
                      </InfoWindowF>
                    )}
                  </GoogleMap>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pharmaciesWithDistance.slice(0, 6).map((pharmacy) => (
                    <button
                      key={`nearby-${pharmacy.id}`}
                      type="button"
                      onClick={() => setSelectedPharmacyId(pharmacy.id)}
                      className={`text-left p-3 rounded-lg border transition-colors duration-200 ${
                        pharmacy.isNearby
                          ? 'border-[#2E7D32] bg-[#E8F5E9] dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {isRTL ? pharmacy.nameAr : pharmacy.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {isRTL ? pharmacy.addressAr : pharmacy.address}
                      </p>
                      {pharmacy.distanceFromUser !== null && (
                        <p className="text-sm text-[#007BFF] mt-1 font-medium">
                          {pharmacy.distanceFromUser.toFixed(2)} km away
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {pharmaciesWithDistance.map((pharmacy) => (
                <Card key={pharmacy.id} hover>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {isRTL ? pharmacy.nameAr : pharmacy.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-[#FFC107] fill-current" />
                          <span className="ml-1">{pharmacy.rating}</span>
                        </div>
                        <span>•</span>
                        <span>{pharmacy.reviews} reviews</span>
                      </div>
                    </div>
                    {pharmacy.is24Hours && (
                      <span className="bg-[#28A745] text-white text-xs font-semibold px-2 py-1 rounded">
                        24/7
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#007BFF]" />
                      <span>{isRTL ? pharmacy.addressAr : pharmacy.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Phone className="h-4 w-4 flex-shrink-0 text-[#007BFF]" />
                      <a href={`tel:${pharmacy.phone}`} className="hover:text-[#007BFF]">
                        {pharmacy.phone}
                      </a>
                    </div>

                    {pharmacy.hours && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Clock className="h-4 w-4 flex-shrink-0 text-[#007BFF]" />
                        <span>
                          {pharmacy.hours.open} - {pharmacy.hours.close}
                        </span>
                      </div>
                    )}

                    {pharmacy.distance && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Navigation className="h-4 w-4 flex-shrink-0 text-[#007BFF]" />
                        <span>{pharmacy.distance} km away</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {pharmacy.services.map((service) => (
                      <span
                        key={service}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={pharmacy.isOpen ? 'primary' : 'outline'}
                      fullWidth
                    >
                      {pharmacy.isOpen ? 'View Stock' : 'View Details'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
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
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Pharmacy Name" placeholder="Enter pharmacy name" />
                  <Input label="License Number" placeholder="Enter license number" />
                  <Input label="Contact Person" placeholder="Enter contact person name" />
                  <Input type="tel" label="Phone Number" placeholder="+216 XX XXX XXX" />
                  <Input type="email" label="Email" placeholder="pharmacy@example.com" />
                  <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <option value="">Select Governorate</option>
                    {tunisiaGovernorates.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <Input label="Full Address" placeholder="Enter complete address" />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-[#007BFF] transition-colors duration-200">
                    <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 rtl:space-x-reverse">
                  <input type="checkbox" className="mt-1 w-5 h-5 text-[#007BFF] rounded" />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the terms and conditions and confirm that all information provided
                    is accurate
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" fullWidth>
                    Submit Application
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowJoinForm(false)}
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
