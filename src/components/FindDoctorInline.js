import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MapDisplay from './MapDisplay';

const API_URL = process.env.REACT_APP_API_URL || 'https://kalai4114-skin-server.hf.space';

// Calculate distance between two coordinates in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const FindDoctorInline = ({ finalResult }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchType, setSearchType] = useState('dermatologist'); // 'dermatologist' or 'hospital'

  useEffect(() => {
    // Auto-trigger doctor search when finalResult is available
    if (finalResult) {
      findDoctors();
    }
  }, [finalResult]);

  const findDoctors = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        setUserLocation(coords);
        
        try {
          const backendResponse = await axios.post(`${API_URL}/api/nearby-dermatologists`, {
            latitude: coords.latitude,
            longitude: coords.longitude,
          });

          const payload = backendResponse.data || {};
          const mappedPlaces = (payload.nearby_places || []).map((place) => ({
            name: place.name,
            lat: place.lat,
            lon: place.lon,
            type: 'dermatology',
            address: [place.address, place.city].filter(Boolean).join(', '),
            phone: place.phone || '',
            distance: typeof place.distance_km === 'number'
              ? place.distance_km
              : calculateDistance(coords.latitude, coords.longitude, place.lat, place.lon),
            googleMapsUrl: place.directions_url || `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`,
          }));

          // If no dermatologists found, search for general hospitals
          if (mappedPlaces.length === 0) {
            setSearchType('hospital');
            await searchGeneralHospitals(coords);
          } else {
            setSearchType('dermatologist');
            setResults({
              success: true,
              location: coords,
              search_links: payload.search_links || {
                google_maps: `https://www.google.com/maps/search/dermatologist/@${coords.latitude},${coords.longitude},14z`,
              },
              nearby_places: mappedPlaces,
              places_found: mappedPlaces.length,
              minimum_required_met: mappedPlaces.length >= 2,
            });
          }
        } catch (overpassErr) {
          // On error, try to find general hospitals
          setSearchType('hospital');
          await searchGeneralHospitals(coords);
        }
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setError('Location access denied. Please enable location in your browser.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const searchGeneralHospitals = async (coords) => {
    try {
      const backendResponse = await axios.post(`${API_URL}/api/nearby-hospitals`, {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const payload = backendResponse.data || {};
      const mappedHospitals = (payload.nearby_places || []).map((place) => ({
        name: place.name,
        lat: place.lat,
        lon: place.lon,
        type: 'hospital',
        address: [place.address, place.city].filter(Boolean).join(', '),
        phone: place.phone || '',
        distance: typeof place.distance_km === 'number'
          ? place.distance_km
          : calculateDistance(coords.latitude, coords.longitude, place.lat, place.lon),
        googleMapsUrl: place.directions_url || `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`,
      }));

      setResults({
        success: true,
        location: coords,
        search_links: payload.search_links || {
          google_maps: `https://www.google.com/maps/search/hospital/@${coords.latitude},${coords.longitude},14z`,
        },
        nearby_places: mappedHospitals,
        places_found: mappedHospitals.length,
        minimum_required_met: mappedHospitals.length >= 1,
        noDermatologists: true,
      });
    } catch (err) {
      setResults({
        success: true,
        location: coords,
        search_links: {
          google_maps: `https://www.google.com/maps/search/hospital/@${coords.latitude},${coords.longitude},14z`,
        },
        nearby_places: [],
        places_found: 0,
        minimum_required_met: false,
        noDermatologists: true,
      });
    }
  };

  const isUrgent = false;

  // Format distance for display
  const formatDistance = (km) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  // Get icon based on place type
  const getTypeIcon = (type) => {
    switch(type) {
      case 'hospital': return '🏥';
      case 'clinic': return '⚕️';
      case 'dermatology': return '👨‍⚕️';
      default: return '🏥';
    }
  };

  if (!finalResult) return null;

  return (
    <div className={`mt-6 rounded-2xl border-2 shadow-2xl backdrop-blur-sm ${
      searchType === 'hospital' 
        ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50' 
        : 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50'
    }`}>
      {/* Header - Always visible */}
      <div className="p-6 border-b-2 border-current border-opacity-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl text-white shadow-lg ${
              searchType === 'hospital'
                ? 'bg-gradient-to-br from-orange-600 to-red-600'
                : 'bg-gradient-to-br from-blue-600 to-indigo-600'
            }`}>
              5
            </div>
            <div>
              <h4 className={`text-2xl font-bold ${
                searchType === 'hospital'
                  ? 'text-red-900'
                  : 'text-blue-900'
              }`}>
                {searchType === 'hospital' ? '🏥 General Hospital Locator' : '👨‍⚕️ Dermatologist Finder'}
              </h4>
              <p className={`text-sm mt-1 ${
                searchType === 'hospital'
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}>
                {searchType === 'hospital' 
                  ? 'No dermatologists found - here are nearby hospitals for medical consultation'
                  : 'Find specialized dermatologists near your location'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm border border-white/50 text-gray-800">
            STEP 5 of 5
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin text-4xl">⚙️</div>
            <div>
              <p className="text-lg font-semibold text-gray-800">Locating medical facilities...</p>
              <p className="text-sm text-gray-600">Please allow geolocation access</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-6 py-6 bg-red-100 border-t border-red-200">
          <p className="text-sm text-red-800 font-semibold mb-3">⚠️ {error}</p>
          <button onClick={findDoctors} className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline">
            Try Again
          </button>
        </div>
      )}

      {/* Results with List */}
      {results && (
        <div className="px-6 py-6 space-y-6">
          {/* No Dermatologists Warning */}
          {results.noDermatologists && (
            <div className="bg-amber-100 border-l-4 border-amber-600 rounded-lg p-4">
              <p className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <span>⚠️</span>
                No Dermatologists Available
              </p>
              <p className="text-sm text-amber-800 mt-2">
                Please visit a nearby general hospital for professional skin disease consultation and treatment.
              </p>
            </div>
          )}

          {/* Search All Button */}
          <a
            href={results.search_links?.google_maps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 font-bold text-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Open in Google Maps
          </a>

          {/* Results count */}
          <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
            <div className="flex items-center justify-between">
              <span className={`font-bold text-lg ${
                results.places_found > 0 ? 'text-green-700' : 'text-gray-700'
              }`}>
                {results.places_found > 0 
                  ? `✓ ${results.places_found} ${searchType === 'hospital' ? 'Hospital(s)' : 'Dermatologist(s)'} Found`
                  : 'No results found nearby'}
              </span>
              {results.places_found > 0 && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border-2 ${
                  results.minimum_required_met 
                    ? 'bg-green-100 text-green-700 border-green-300' 
                    : 'bg-amber-100 text-amber-700 border-amber-300'
                }`}>
                  {results.minimum_required_met ? '✓ Available' : 'Limited'}
                </span>
              )}
            </div>
          </div>

          {/* Nearby places list */}
          {results.nearby_places && results.nearby_places.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                <p className="font-bold text-gray-800 text-lg">
                  📍 {searchType === 'hospital' ? 'Hospitals & Medical Centers' : 'Nearby Dermatologists'}
                </p>
              </div>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {results.nearby_places.map((place, idx) => (
                  <div key={idx} className="p-5 hover:bg-blue-50 transition-all duration-300 border-l-4 border-transparent hover:border-blue-500">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getTypeIcon(place.type)}</span>
                          <span className="font-bold text-gray-900 text-lg truncate">{place.name}</span>
                        </div>
                        {place.address && (
                          <p className="text-sm text-gray-600 ml-11">📍 {place.address}</p>
                        )}
                        {place.phone && (
                          <p className="text-sm text-gray-600 ml-11">📞 {place.phone}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
                          📏 {formatDistance(place.distance)}
                        </span>
                        <a
                          href={place.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          Directions
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map Display */}
          {results.nearby_places && results.nearby_places.length > 0 && userLocation && (
            <div className="mt-6">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-200 rounded-t-xl">
                <p className="font-bold text-gray-800 text-lg">🗺️ Map View</p>
              </div>
              <div className="rounded-b-xl overflow-hidden border-2 border-t-0 border-gray-200 shadow-lg">
                <MapDisplay
                  userLocation={userLocation}
                  places={results.nearby_places}
                  searchType={searchType}
                />
              </div>
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-emerald-800">
                  <span className="font-bold">💡 Map Tip:</span> Click on markers to see details, then click "Get Directions" to navigate to the location
                </p>
              </div>
            </div>
          )}

          {/* Tips row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200 shadow-md">
              <p className="text-xs font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span>📋</span>
                Tell Your Doctor
              </p>
              <ul className="space-y-2">
                {(results.what_to_tell_doctor || []).slice(0, 3).map((tip, idx) => (
                  <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-red-200 shadow-md">
              <p className="text-xs font-bold text-red-900 mb-3 flex items-center gap-2">
                <span>🚨</span>
                Emergency Signs
              </p>
              <ul className="space-y-2">
                {(results.emergency_signs || []).slice(0, 3).map((sign, idx) => (
                  <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-red-500 font-bold flex-shrink-0">⚠</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDoctorInline;
