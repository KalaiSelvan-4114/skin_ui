import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import custom icons
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for Leaflet default icon path issue in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

function MapDisplay({ userLocation, places, searchType }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(
      [userLocation.latitude, userLocation.longitude],
      14
    );

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add user location marker
    const userIcon = L.divIcon({
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3B82F6 0%, #6366F1 100%);
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        ">
          📍
        </div>
      `,
      iconSize: [40, 40],
      className: 'user-marker',
    });

    L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
      .bindPopup('<b>Your Location</b>')
      .addTo(map);

    // Add place markers
    if (places && places.length > 0) {
      places.forEach((place) => {
        const icon = L.divIcon({
          html: `
            <div style="
              width: 45px;
              height: 45px;
              background: linear-gradient(135deg, ${searchType === 'hospital' ? '#F97316' : '#EF4444'} 0%, ${searchType === 'hospital' ? '#FB923C' : '#DC2626'} 100%);
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              cursor: pointer;
            ">
              ${searchType === 'hospital' ? '🏥' : '👨‍⚕️'}
            </div>
          `,
          iconSize: [45, 45],
          className: 'place-marker',
        });

        const popup = `
          <div style="min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937;">${place.name}</h3>
            ${place.address ? `<p style="margin: 6px 0; font-size: 12px; color: #6B7280;">📍 ${place.address}</p>` : ''}
            ${place.phone ? `<p style="margin: 6px 0; font-size: 12px; color: #6B7280;">📞 ${place.phone}</p>` : ''}
            <p style="margin: 6px 0; font-size: 12px; color: #3B82F6; font-weight: bold;">📏 ${
              place.distance < 1
                ? `${Math.round(place.distance * 1000)} m`
                : `${place.distance.toFixed(1)} km`
            }</p>
            <a href="${place.googleMapsUrl}" target="_blank" rel="noopener noreferrer" style="
              display: inline-block;
              margin-top: 8px;
              padding: 6px 12px;
              background: #10B981;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-size: 12px;
              font-weight: bold;
              cursor: pointer;
            ">
              Get Directions →
            </a>
          </div>
        `;

        L.marker([place.lat, place.lon], { icon })
          .bindPopup(popup)
          .addTo(map);
      });

      // Calculate bounds to fit all markers
      const bounds = L.latLngBounds([
        [userLocation.latitude, userLocation.longitude],
        ...places.map((p) => [p.lat, p.lon]),
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation, places, searchType]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '450px',
        borderRadius: '0.75rem',
      }}
    />
  );
}

export default MapDisplay;
