'use client';

import React, { useState, useEffect, useCallback } from 'react';

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

// Patna Central Coordinates & Neighborhood Presets
const PATNA_PRESETS = [
  { name: 'Boring Road', lat: 25.6133, lng: 85.1147, pincode: '800001' },
  { name: 'Patliputra', lat: 25.6263, lng: 85.1092, pincode: '800013' },
  { name: 'Kankarbagh', lat: 25.5973, lng: 85.1585, pincode: '800020' },
  { name: 'Bailey Road', lat: 25.6111, lng: 85.0934, pincode: '800014' },
  { name: 'Fraser Road', lat: 25.6083, lng: 85.1384, pincode: '800001' },
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
  const [activePreset, setActivePreset] = useState('Boring Road');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [reverseAddress, setReverseAddress] = useState<string | null>(null);

  // Reverse geocoding helper using free Nominatim API
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (res.ok) {
          const data = await res.json();
          const road =
            data.address?.road ||
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.residential ||
            '';
          const locality = data.address?.city || data.address?.state_district || 'Patna';
          const postcode = data.address?.postcode || '';

          const detectedLabel = [road, locality].filter(Boolean).join(', ');
          if (detectedLabel) {
            setReverseAddress(detectedLabel);
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
        setActivePreset('My Exact GPS Location');
        setIsDetectingGps(false);
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setIsDetectingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please allow location access or choose your Patna area below.');
        } else {
          setGpsError('Could not retrieve GPS position. Please pick an area below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Switch to Preset
  const handleSelectPreset = (preset: (typeof PATNA_PRESETS)[0]) => {
    setCoords({ lat: preset.lat, lng: preset.lng });
    setActivePreset(preset.name);
    setGpsError(null);
    setReverseAddress(`${preset.name}, Patna`);
    onLocationSelect({
      lat: preset.lat,
      lng: preset.lng,
      formattedAddress: `${preset.name}, Patna`,
      pincode: preset.pincode,
      neighborhood: preset.name,
    });
  };

  // Custom Place Search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActivePreset(searchQuery.trim());
    setReverseAddress(searchQuery.trim());
  };

  // Google Maps embed URL
  const mapEmbedUrl = searchQuery.trim()
    ? `https://maps.google.com/maps?q=${encodeURIComponent(`${searchQuery}, Patna, Bihar`)}&t=&z=16&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const googleMapsDirectLink = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;

  return (
    <div className={`space-y-3.5 rounded-2xl p-4 bg-slate-950/80 border border-slate-800 shadow-xl backdrop-blur-md ${className}`}>
      {/* Header & GPS Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🗺️</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Pin Exact Morning Delivery Gate
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ensures your 6 AM – 9 AM driver drops your living food box right at your apartment gate.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetectingGps}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
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

      {/* Quick Patna Neighborhood Chips */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
          Quick Service Hubs (Patna):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PATNA_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.name;
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
                📍 {preset.name} ({preset.pincode})
              </button>
            );
          })}
        </div>
      </div>

      {/* Place search input */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Or search apartment, street, landmark in Patna..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0 cursor-pointer"
        >
          Pin on Map
        </button>
      </form>

      {/* Interactive Google Map Embed View */}
      <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-900">
        <iframe
          title="Google Map Exact Delivery Location"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapEmbedUrl}
          className="filter contrast-[1.05] opacity-90 hover:opacity-100 transition-opacity"
        />

        {/* Live Overlay Pin Badge */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 backdrop-blur-md pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>📍 Gate Drop Location</span>
        </div>

        {/* Satellite / External verification button */}
        <div className="absolute bottom-2 right-2">
          <a
            href={googleMapsDirectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-200 transition-all flex items-center gap-1 shadow-md hover:text-emerald-400"
          >
            <span>Open in Google Maps</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      {/* Coordinates & Reverse Geocoded Confirmation */}
      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-2 truncate">
          <span className="text-emerald-400 shrink-0">✓</span>
          <span className="truncate">
            <strong className="text-slate-200">Selected Pin:</strong>{' '}
            {reverseAddress || `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E`}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2 hidden sm:inline">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
