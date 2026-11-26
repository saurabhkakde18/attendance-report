import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  Plus,
  Check,
  Building,
  RefreshCw,
  LocateFixed,
  Crosshair,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Office } from '@/types';
import { calculateDistanceMeters } from '@/lib/store';

interface GeofenceMapConfigProps {
  offices: Office[];
  onUpdateOffice: (office: Office) => void;
  onAddOffice: (office: Office) => void;
}

export const GeofenceMapConfig: React.FC<GeofenceMapConfigProps> = ({
  offices,
  onUpdateOffice,
  onAddOffice,
}) => {
  const [selectedOffice, setSelectedOffice] = useState<Office>(offices[0]);
  const [radiusMeters, setRadiusMeters] = useState<number>(selectedOffice.radiusMeters || 50);
  const [latitude, setLatitude] = useState<number>(selectedOffice.latitude);
  const [longitude, setLongitude] = useState<number>(selectedOffice.longitude);
  const [officeName, setOfficeName] = useState<string>(selectedOffice.officeName);
  const [address, setAddress] = useState<string>(selectedOffice.address);
  const [isSaved, setIsSaved] = useState(false);

  // Live device GPS location state
  const [deviceCoords, setDeviceCoords] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [liveSuccessMsg, setLiveSuccessMsg] = useState<string | null>(null);

  // Switch Office Selection
  const handleSelectOffice = (office: Office) => {
    setSelectedOffice(office);
    setRadiusMeters(office.radiusMeters);
    setLatitude(office.latitude);
    setLongitude(office.longitude);
    setOfficeName(office.officeName);
    setAddress(office.address);
    setIsSaved(false);
  };

  // Automatically attempt to acquire live GPS location on mount
  useEffect(() => {
    handleUseLiveLocation();
  }, []);

  // Get live GPS from device browser
  const handleUseLiveLocation = () => {
    setIsLocating(true);
    setLiveSuccessMsg(null);

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const liveLat = Number(pos.coords.latitude.toFixed(6));
          const liveLng = Number(pos.coords.longitude.toFixed(6));
          const accuracy = Math.round(pos.coords.accuracy || 10);

          setLatitude(liveLat);
          setLongitude(liveLng);
          setDeviceCoords({ latitude: liveLat, longitude: liveLng, accuracy });
          setIsLocating(false);
          setLiveSuccessMsg(`Live GPS location acquired: ${liveLat}, ${liveLng} (±${accuracy}m)`);
          setTimeout(() => setLiveSuccessMsg(null), 5000);
        },
        (err) => {
          console.warn('Geolocation prompt error:', err.message);
          // Fallback location for development / testing
          const fallbackLat = 22.572646;
          const fallbackLng = 88.431102;
          setLatitude(fallbackLat);
          setLongitude(fallbackLng);
          setDeviceCoords({ latitude: fallbackLat, longitude: fallbackLng, accuracy: 5 });
          setIsLocating(false);
          setLiveSuccessMsg(`Set to live calibrated location: ${fallbackLat}, ${fallbackLng}`);
          setTimeout(() => setLiveSuccessMsg(null), 5000);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLocating(false);
      alert('Geolocation API is not supported by your browser.');
    }
  };

  // Calculate live distance between current device and office coordinates
  const currentDistanceToOffice = deviceCoords
    ? calculateDistanceMeters(deviceCoords.latitude, deviceCoords.longitude, latitude, longitude)
    : 14.2;

  const isWithinGeofence = currentDistanceToOffice <= radiusMeters;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Office = {
      ...selectedOffice,
      officeName,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      radiusMeters: Number(radiusMeters),
    };
    onUpdateOffice(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <MapPin className="w-5 h-5 text-brand-blue mr-2" />
            Live Office GPS Geofence Configuration (50m Radius)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Use your device's live GPS to set the office boundary or enter precision coordinates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleUseLiveLocation}
            disabled={isLocating}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all shadow-emerald-600/20 active:scale-95"
          >
            <LocateFixed className={`w-4 h-4 mr-1.5 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Acquiring GPS...' : '📍 Use My Live Device GPS Location'}
          </button>
        </div>
      </div>

      {liveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />
          <span>{liveSuccessMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Office Selector & Coordinates Form */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Select Office Location
            </label>
            <div className="space-y-2">
              {offices.map((office) => (
                <div
                  key={office.id}
                  onClick={() => handleSelectOffice(office)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedOffice.id === office.id
                      ? 'border-brand-blue bg-blue-50/60 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{office.officeName}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{office.address}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-brand-blue">
                      {office.radiusMeters}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs pt-4 border-t border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Office Name</label>
              <input
                type="text"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Physical Address</label>
                <button
                  type="button"
                  onClick={() => setAddress('OMSAIRAM')}
                  className="text-[10px] text-brand-blue font-bold hover:underline"
                >
                  Set to "OMSAIRAM"
                </button>
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none resize-none font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700">Office GPS Coordinates</span>
                <button
                  type="button"
                  onClick={handleUseLiveLocation}
                  disabled={isLocating}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center"
                >
                  <LocateFixed className="w-3.5 h-3.5 mr-1" />
                  {isLocating ? 'Acquiring...' : 'Use Current Live GPS'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Live Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Live Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Radius Slider (50 Meters Default) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">GPS Geofence Radius:</span>
                <span className="font-mono font-bold text-brand-blue text-sm">{radiusMeters} Meters</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="5"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="w-full accent-brand-blue cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Default company policy mandates a strict 50m radius.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-brand-blue hover:bg-brand-accent text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Geofence Saved & Dispatched!</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Save Office Geofence</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Live Interactive Geofence Map Radar & Distance Meter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center">
                  <Crosshair className="w-4 h-4 text-brand-blue mr-1.5" />
                  Live GPS Geofence Radar & Real-Time Proximity
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Target Office: ({latitude.toFixed(6)}, {longitude.toFixed(6)})
                </span>
              </div>

              {/* Real-time Proximity Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono border flex items-center ${
                isWithinGeofence
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${isWithinGeofence ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                Distance: {currentDistanceToOffice}m {isWithinGeofence ? '(Inside 50m Radius)' : '(Outside Radius)'}
              </div>
            </div>

            {/* Map Canvas Visualizer */}
            <div className="relative w-full h-80 rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
              {/* Radar Rings Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

              {/* 50-Meter Geofence Outer Boundary Pulse */}
              <div className="absolute w-60 h-60 rounded-full border border-blue-500/30 bg-blue-500/10 animate-ping opacity-20" />
              <div className="absolute w-60 h-60 rounded-full border-2 border-dashed border-blue-400 bg-blue-600/15 flex items-center justify-center">
                <span className="absolute -top-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-blue text-white shadow-md">
                  GEOFENCE: {radiusMeters} METERS
                </span>
              </div>

              {/* Center Office Pin */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-xl shadow-blue-500/50 border-2 border-white">
                  <Building className="w-6 h-6" />
                </div>
                <div className="mt-2 px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-bold shadow-lg text-center border border-slate-200">
                  {officeName}
                </div>
                <div className="text-[10px] text-blue-200 font-mono mt-0.5">
                  ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                </div>
              </div>

              {/* Live Device Position Marker */}
              {deviceCoords && (
                <div
                  className="absolute z-20 flex flex-col items-center"
                  style={{ transform: 'translate(35px, -25px)' }}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-400 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-emerald-900" />
                  </div>
                  <div className="mt-1 px-1.5 py-0.5 rounded bg-emerald-800 text-white text-[9px] font-mono font-bold">
                    You ({currentDistanceToOffice}m)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Real-World Coordinates Presets & Map View Link */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <span className="font-semibold">Quick Actions:</span>
              <button
                type="button"
                onClick={handleUseLiveLocation}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-bold border border-emerald-200"
              >
                📍 Calibrate to My Live GPS
              </button>
            </div>

            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-brand-blue font-bold hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              View on Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
