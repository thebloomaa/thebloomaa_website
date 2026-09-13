'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    formattedAddress?: string;
    pincode?: string;
    neighborhood?: string;
  }) => void;
  className?: string;
}

interface PlaceSuggestion {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    residential?: string;
    city?: string;
    postcode?: string;
  };
}

// Patna Central Coordinates & Neighborhood Presets
const PATNA_PRESETS = [
  { name: 'Boring Road', lat: 25.6133, lng: 85.1147, pincode: '800001' },
  { name: 'Patliputra Colony', lat: 25.6263, lng: 85.1092, pincode: '800013' },
  { name: 'Kankarbagh', lat: 25.5973, lng: 85.1585, pincode: '800020' },
  { name: 'Bailey Road', lat: 25.6111, lng: 85.0934, pincode: '800014' },
  { name: 'Fraser Road', lat: 25.6083, lng: 85.1384, pincode: '800001' },
  { name: 'Rajendra Nagar', lat: 25.6012, lng: 85.1578, pincode: '800016' },
];

export default function LocationPickerMap({
  initialLat = 25.6133,
  initialLng = 85.1147,
  onLocationSelect,
  className = '',
}: LocationPickerProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activePinLabel, setActivePinLabel] = useState('Boring Road, Patna');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [reverseAddress, setReverseAddress] = useState<string | null>(null);

  // Autocomplete Suggestions State
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reverse geocoding helper
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (res.ok) {
          const data = await res.json();
          const building = data.address?.building || data.address?.amenity || '';
          const road =
            data.address?.road ||
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.residential ||
            '';
          const locality = data.address?.city || data.address?.state_district || 'Patna';
          const postcode = data.address?.postcode || '';

          const detectedLabel = [building, road, locality].filter(Boolean).join(', ');
          if (detectedLabel) {
            setReverseAddress(detectedLabel);
            setActivePinLabel(detectedLabel);
          }

          onLocationSelect({
            lat,
            lng,
            formattedAddress: detectedLabel,
            pincode: postcode.length === 6 ? postcode : undefined,
            neighborhood: data.address?.suburb || data.address?.neighbourhood,
          });
        } else {
          onLocationSelect({ lat, lng });
        }
      } catch {
        onLocationSelect({ lat, lng });
      }
    },
    [onLocationSelect]
  );

  // Debounced search for Patna apartments, buildings, and landmarks
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            `${searchQuery.trim()}, Patna`
          )}&format=json&addressdetails=1&limit=6&countrycodes=in`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (res.ok) {
          const data: PlaceSuggestion[] = await res.json();
          setSuggestions(data);
          setShowDropdown(data.length > 0);
        }
      } catch {
        // Fallback: user can still press Enter to query Google Maps directly
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle selecting an apartment or place suggestion
  const handleSelectSuggestion = (place: PlaceSuggestion) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setCoords({ lat, lng });

    const cleanName = place.name || place.display_name.split(',')[0];
    const road = place.address?.road || place.address?.suburb || '';
    const formatted = [cleanName, road, 'Patna'].filter(Boolean).join(', ');

    setSearchQuery(cleanName);
    setActivePinLabel(formatted);
    setReverseAddress(place.display_name);
    setShowDropdown(false);

    onLocationSelect({
      lat,
      lng,
      formattedAddress: formatted,
      pincode: place.address?.postcode?.length === 6 ? place.address.postcode : undefined,
      neighborhood: place.address?.suburb || place.address?.neighbourhood,
    });
  };

  // 1-Tap Browser GPS Location Detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setActivePinLabel('My Exact GPS Location');
        setIsDetectingGps(false);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setIsDetectingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please allow location access or search your apartment/area below.');
        } else {
          setGpsError('Could not retrieve GPS position. Please search your apartment or pick an area below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Switch to Preset Hub
  const handleSelectPreset = (preset: (typeof PATNA_PRESETS)[0]) => {
    setCoords({ lat: preset.lat, lng: preset.lng });
    setActivePinLabel(`${preset.name}, Patna`);
    setSearchQuery('');
    setGpsError(null);
    setReverseAddress(`${preset.name}, Patna`);
    setShowDropdown(false);
    onLocationSelect({
      lat: preset.lat,
      lng: preset.lng,
      formattedAddress: `${preset.name}, Patna`,
      pincode: preset.pincode,
      neighborhood: preset.name,
    });
  };

  // Custom Place Search Submit (Direct Google Maps search)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setShowDropdown(false);
    setActivePinLabel(`${searchQuery.trim()}, Patna`);
    setReverseAddress(`${searchQuery.trim()}, Patna`);

    // Geocode to get coordinates for rider
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        `${searchQuery.trim()}, Patna`
      )}&format=json&limit=1&countrycodes=in`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setCoords({ lat, lng });
          onLocationSelect({
            lat,
            lng,
            formattedAddress: `${searchQuery.trim()}, Patna`,
          });
        } else {
          onLocationSelect({
            lat: coords.lat,
            lng: coords.lng,
            formattedAddress: `${searchQuery.trim()}, Patna`,
          });
        }
      })
      .catch(() => {
        onLocationSelect({
          lat: coords.lat,
          lng: coords.lng,
          formattedAddress: `${searchQuery.trim()}, Patna`,
        });
      });
  };

  // Google Maps embed URL
  // If search query is active, Google Maps pins the searched apartment/building directly!
  const mapEmbedUrl = searchQuery.trim()
    ? `https://maps.google.com/maps?q=${encodeURIComponent(`${searchQuery.trim()}, Patna, Bihar`)}&t=&z=17&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=&z=17&ie=UTF8&iwloc=&output=embed`;

  const googleMapsDirectLink = searchQuery.trim()
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${searchQuery.trim()}, Patna, Bihar`)}`
    : `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;

  return (
    <div className={`space-y-3.5 rounded-2xl p-4 sm:p-5 bg-slate-950/85 border border-slate-800 shadow-2xl backdrop-blur-md ${className}`}>
      {/* Header & GPS Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🗺️</span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-100">
              Pin Exact Morning Delivery Gate
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Search your apartment or detect GPS so your 6 AM – 9 AM driver drops your box at your exact gate.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetectingGps}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer active:scale-95"
        >
          {isDetectingGps ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Locking GPS...</span>
            </>
          ) : (
            <>
              <span>📍</span>
              <span>Detect My Location</span>
            </>
          )}
        </button>
      </div>

      {/* GPS Error notice */}
      {gpsError && (
        <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[11px] flex items-center gap-2">
          <span>⚠️</span>
          <span>{gpsError}</span>
        </div>
      )}

      {/* Apartment & Place Search Bar with Live Autocomplete */}
      <div ref={searchContainerRef} className="relative">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search apartment, building, society, or hospital in Patna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowDropdown(true);
              }}
              className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs cursor-pointer p-1"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            {isSearchingPlaces ? (
              <span className="w-3 h-3 border-2 border-slate-200 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Pin on Map</span>
            )}
          </button>
        </form>

        {/* Live Autocomplete Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-800/80">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/70">
              Matching Patna Places &amp; Apartments
            </div>
            {suggestions.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/90 transition-colors flex items-start gap-2.5 cursor-pointer text-xs group"
              >
                <span className="text-emerald-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform">🏢</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                    {item.name || item.display_name.split(',')[0]}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.display_name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Patna Neighborhood Chips */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Popular Patna Service Hubs:
          </span>
          <span className="text-[10px] text-emerald-400/80 font-medium">6 AM Fleet Active</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PATNA_PRESETS.map((preset) => {
            const isSelected = activePinLabel.toLowerCase().includes(preset.name.toLowerCase());
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                📍 {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Google Map Embed View */}
      <div className="relative w-full h-52 sm:h-64 rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
        <iframe
          key={mapEmbedUrl}
          title="Google Map Exact Delivery Location"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapEmbedUrl}
          className="filter contrast-[1.05] opacity-90 group-hover:opacity-100 transition-opacity"
        />

        {/* Live Overlay Pin Badge */}
        <div className="absolute top-2.5 left-2.5 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 backdrop-blur-md pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>📍 Gate Drop Location: {activePinLabel.split(',')[0]}</span>
        </div>

        {/* Satellite / External verification button */}
        <div className="absolute bottom-2.5 right-2.5">
          <a
            href={googleMapsDirectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-950/95 hover:bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-100 hover:text-emerald-400 transition-all flex items-center gap-1.5 shadow-xl"
            title="Open in full Google Maps"
          >
            <span>View on Google Maps</span>
            <span className="text-emerald-400">↗</span>
          </a>
        </div>
      </div>

      {/* Coordinates & Reverse Geocoded Confirmation */}
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-2 truncate">
          <span className="text-emerald-400 shrink-0">✓</span>
          <span className="truncate">
            <strong className="text-slate-200">Active Gate Pin:</strong>{' '}
            {activePinLabel || reverseAddress || `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E`}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2 hidden sm:inline">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
