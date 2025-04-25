'use client';

import { useEffect, useRef } from 'react';
import { LanguageType } from '@/lib/ThemeLanguageContext';

interface LocationMapProps {
  locationName: string;
  latitude?: number;
  longitude?: number;
  locale: LanguageType;
}

export function LocationMap({ 
  locationName, 
  latitude = 41.0082, // Default to Istanbul coordinates if none provided
  longitude = 28.9784, 
  locale 
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  
  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMapsScript = () => {
      const scriptId = 'google-maps-script';
      
      if (document.getElementById(scriptId)) {
        // Script already loaded, initialize map
        initMap();
        return;
      }
      
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.body.appendChild(script);
    };
    
    // Initialize map once script is loaded
    const initMap = () => {
      if (!mapRef.current || typeof google === 'undefined') return;
      
      // Create map instance
      const position = { lat: latitude, lng: longitude };
      const mapOptions: google.maps.MapOptions = {
        center: position,
        zoom: 15,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      };
      
      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
      
      // Add marker
      new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: locationName,
        animation: google.maps.Animation.DROP
      });
      
      // Create info window with location name
      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2 text-sm">${locationName}</div>`
      });
      
      // Show info window on map load
      setTimeout(() => {
        if (mapInstanceRef.current) {
          infoWindow.open(mapInstanceRef.current, new google.maps.Marker({
            position,
            map: mapInstanceRef.current
          }));
        }
      }, 1000);
    };
    
    // Check if we're in a browser environment before loading the script
    if (typeof window !== 'undefined') {
      loadGoogleMapsScript();
    }
    
    // Clean up
    return () => {
      if (mapInstanceRef.current) {
        // Google Maps doesn't have an explicit destroy method
        // but we can remove the reference
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, locationName]);
  
  // If we don't have coordinates, show a message
  if (!latitude || !longitude) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="mt-4 text-gray-500">
          {locale === 'tr'
            ? 'Bu etkinlik için konum bilgisi bulunmamaktadır.'
            : 'No location information available for this event.'
          }
        </p>
      </div>
    );
  }
  
  // Show a fallback UI before map loads or if it fails to load
  return (
    <div className="rounded-lg overflow-hidden border shadow-sm">
      <div
        ref={mapRef}
        className="w-full h-[400px] bg-gray-100"
        data-testid="event-location-map"
      >
        <div className="w-full h-full flex items-center justify-center">
          <div role="status" className="inline-block">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading map...</span>
          </div>
        </div>
      </div>
      
      {/* External map link */}
      <div className="p-4 bg-background">
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white transition-colors rounded-md text-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {locale === 'tr' ? 'Google Haritalar\'da Aç' : 'Open in Google Maps'}
        </a>
      </div>
    </div>
  );
}