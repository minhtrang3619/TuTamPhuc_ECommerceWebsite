import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, Map as MapIcon, RotateCcw, Truck, Clock } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Store {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

const STORES: Store[] = [
  { name: 'Từ Tâm Phục - Hà Nội', lat: 21.0285, lng: 105.8542, address: 'Số 10 Tràng Tiền, Hoàn Kiếm, Hà Nội' },
  { name: 'Từ Tâm Phục - TP. Hồ Chí Minh', lat: 10.7769, lng: 106.7009, address: 'Số 88 Đồng Khởi, Quận 1, TP. Hồ Chí Minh' },
];

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export default function MapDistance({ 
  customerAddress = '', 
  onAddressResolved 
}: { 
  customerAddress?: string;
  onAddressResolved?: (distance: number, nearestStore: Store) => void;
}) {
  const [apiKey] = useState(() => (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''));
  const [customerLoc, setCustomerLoc] = useState<Location | null>(null);
  const [nearestStore, setNearestStore] = useState<Store>(STORES[0]);
  const [distance, setDistance] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Default coordinate: Ba Dinh, Hanoi
  const defaultLoc: Location = { lat: 21.0360, lng: 105.8340, address: 'Quận Ba Đình, Hà Nội' };

  // Calculate nearest store
  const updateNearestStore = (lat: number, lng: number) => {
    let minD = Infinity;
    let closest = STORES[0];
    STORES.forEach(s => {
      const d = haversineDistance(lat, lng, s.lat, s.lng);
      if (d < minD) {
        minD = d;
        closest = s;
      }
    });
    setNearestStore(closest);
    setDistance(minD);
    if (onAddressResolved) {
      onAddressResolved(minD, closest);
    }
  };

  // Get current browser position
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = { 
          lat: latitude, 
          lng: longitude, 
          address: 'Vị trí hiện tại của bạn' 
        };
        setCustomerLoc(newLoc);
        updateNearestStore(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error('Lỗi định vị:', error);
        setIsLocating(false);
        // Set fallback
        if (!customerLoc) {
          setCustomerLoc(defaultLoc);
          updateNearestStore(defaultLoc.lat, defaultLoc.lng);
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) {
      setMapLoaded(false);
      // Automatically load local location
      if (!customerLoc) {
        setCustomerLoc(defaultLoc);
        updateNearestStore(defaultLoc.lat, defaultLoc.lng);
      }
      return;
    }

    const scriptId = 'google-maps-api-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initMap = () => {
      setMapLoaded(true);
      if (!customerLoc) {
        setCustomerLoc(defaultLoc);
        updateNearestStore(defaultLoc.lat, defaultLoc.lng);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        setMapError(true);
        setMapLoaded(false);
      };
      document.head.appendChild(script);
    } else if (window.google && window.google.maps) {
      initMap();
    }
  }, [apiKey]);

  // Render Google Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google || !customerLoc) return;

    try {
      const { maps } = window.google;
      
      // Clean previous markers
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      const mapOptions = {
        center: { lat: (customerLoc.lat + nearestStore.lat) / 2, lng: (customerLoc.lng + nearestStore.lng) / 2 },
        zoom: distance && distance < 20 ? 12 : 6,
        styles: [
          {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{ "color": "#f5f5f5" }]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#616161" }]
          },
          {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#e9e9e9" }]
          }
        ],
        disableDefaultUI: true,
        zoomControl: true,
      };

      const map = new maps.Map(mapRef.current, mapOptions);
      googleMapInstance.current = map;

      // Customer Marker
      const customerMarker = new maps.Marker({
        position: { lat: customerLoc.lat, lng: customerLoc.lng },
        map,
        title: 'Vị trí của bạn',
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#5D4037',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        }
      });
      markersRef.current.push(customerMarker);

      // Store Marker
      const storeMarker = new maps.Marker({
        position: { lat: nearestStore.lat, lng: nearestStore.lng },
        map,
        title: nearestStore.name,
        icon: {
          path: maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#A78BFA',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        }
      });
      markersRef.current.push(storeMarker);

      // Draw path line
      const pathLine = new maps.Polyline({
        path: [
          { lat: customerLoc.lat, lng: customerLoc.lng },
          { lat: nearestStore.lat, lng: nearestStore.lng }
        ],
        geodesic: true,
        strokeColor: '#8B5CF6',
        strokeOpacity: 0.6,
        strokeWeight: 3,
        map
      });

      // Fit bounds to show both
      const bounds = new maps.LatLngBounds();
      bounds.extend(customerMarker.getPosition());
      bounds.extend(storeMarker.getPosition());
      map.fitBounds(bounds);

    } catch (e) {
      console.error('Lỗi dựng bản đồ Google:', e);
      setMapError(true);
    }
  }, [mapLoaded, customerLoc, nearestStore, distance]);

  // Geocode address when customer enters it
  useEffect(() => {
    if (!customerAddress || !customerAddress.trim()) return;

    const delayDebounceFn = setTimeout(() => {
      // If Google Maps Geocoding is available
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: customerAddress }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            const newLoc = {
              lat: loc.lat(),
              lng: loc.lng(),
              address: results[0].formatted_address
            };
            setCustomerLoc(newLoc);
            updateNearestStore(newLoc.lat, newLoc.lng);
          }
        });
      } else {
        // Fallback geocoding simulator: randomize location offset slightly from Hanoi
        // to represent distance dynamically on the custom vector map.
        const hash = customerAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        // HCMC check
        const isSouth = /hồ chí minh|sài gòn|hcm|bình dương|đồng nai|vũng tàu|long an|cần thơ/i.test(customerAddress);
        const baseLat = isSouth ? 10.7769 : 21.0285;
        const baseLng = isSouth ? 106.7009 : 105.8542;
        
        // Add random but stable offset based on text hash
        const offsetLat = ((hash % 100) / 500) * (hash % 2 === 0 ? 1 : -1);
        const offsetLng = (((hash * 13) % 100) / 500) * (hash % 3 === 0 ? 1 : -1);
        
        const newLoc = {
          lat: baseLat + offsetLat,
          lng: baseLng + offsetLng,
          address: customerAddress
        };
        setCustomerLoc(newLoc);
        updateNearestStore(newLoc.lat, newLoc.lng);
      }
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [customerAddress]);

  // Calculate pricing & delivery info
  const shippingFee = distance ? Math.min(30000 + Math.floor(distance) * 2000, 150000) : 30000;
  const deliveryTime = distance 
    ? distance < 10 
      ? 'Trong ngày (2h-4h)' 
      : distance < 50 
        ? '1 ngày' 
        : '2-4 ngày'
    : '2-4 ngày';

  return (
    <div className="border border-[#d4c3be]/40 rounded-md bg-[#faf6f0]/40 p-4 font-sans space-y-4">
      {/* Header Info */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <MapIcon size={14} /> Bản đồ khoảng cách & Vận chuyển
          </h4>
          <p className="text-[10px] text-on-surface-variant/80 mt-1">
            Hệ thống tự động tìm cửa hàng gần nhất để giao hàng và tối ưu phí vận chuyển.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={isLocating}
          className="p-1.5 px-2 bg-white hover:bg-[#ece0dc]/30 border border-[#d4c3be]/70 rounded-xs text-[10px] font-bold text-primary flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
        >
          <Navigation size={10} className={isLocating ? 'animate-spin' : ''} />
          {isLocating ? 'Đang định vị...' : 'Định vị GPS'}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[200px] bg-[#eeeeee]/60 border border-[#d4c3be]/40 rounded-sm overflow-hidden flex items-center justify-center">
        {apiKey && !mapError ? (
          <div ref={mapRef} className="w-full h-full" />
        ) : (
          /* Custom interactive Zen Mock Map (Vector Graphics) */
          <div className="absolute inset-0 bg-[#fbfaf8] flex flex-col justify-between p-4 overflow-hidden select-none">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#e6ded9_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
            
            {/* Map Art SVG */}
            <svg className="absolute inset-0 w-full h-full z-0 opacity-80" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Decorative mountains/islands outline for Zen style */}
              <path d="M-20,180 C50,150 90,210 160,170 C220,130 290,190 420,150" stroke="#ece0dc" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M-50,195 C60,170 120,230 200,190 C280,150 320,210 450,180" stroke="#f0e9e4" strokeWidth="1" />
              
              {/* Animating connection line */}
              {customerLoc && (
                <>
                  <line 
                    x1="120" y1="120" 
                    x2="280" y2="80" 
                    stroke="#8b726b" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                    className="animate-[dash_10s_linear_infinite]" 
                  />
                  <style>{`
                    @keyframes dash {
                      to {
                        stroke-dashoffset: -40;
                      }
                    }
                  `}</style>
                </>
              )}
            </svg>

            {/* Pins placement */}
            {customerLoc && (
              <>
                {/* Store Pin */}
                <div className="absolute z-10 flex flex-col items-center" style={{ left: '280px', top: '65px', transform: 'translate(-50%, -100%)' }}>
                  <div className="px-2 py-0.5 bg-primary text-white text-[8px] font-bold uppercase rounded-sm shadow-xs border border-white">
                    Cửa Hàng
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow-md animate-pulse mt-0.5" />
                </div>

                {/* Customer Pin */}
                <div className="absolute z-10 flex flex-col items-center" style={{ left: '120px', top: '105px', transform: 'translate(-50%, -100%)' }}>
                  <div className="px-2 py-0.5 bg-[#8b726b] text-white text-[8px] font-bold uppercase rounded-sm shadow-xs border border-white">
                    Bạn
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8b726b] border-2 border-white shadow-md mt-0.5" />
                </div>
              </>
            )}

            {/* Zoom indicator info */}
            <div className="relative z-10 self-end bg-white/80 backdrop-blur-xs px-2 py-1 rounded-sm border border-[#d4c3be]/40 text-[9px] font-bold font-mono text-[#8b726b] flex items-center gap-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-ping" />
              Zen Map Offline Mode
            </div>
          </div>
        )}
      </div>

      {/* Calculations Breakdown */}
      {customerLoc && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 border border-[#d4c3be]/30 rounded-sm">
          {/* Distance */}
          <div className="space-y-1">
            <span className="block text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Khoảng cách</span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif font-bold text-base text-primary">
                {distance !== null ? `${distance} km` : 'Chưa định vị'}
              </span>
            </div>
            <span className="block text-[9px] text-[#8b726b] truncate">
              Tới: {nearestStore.name}
            </span>
          </div>

          {/* Shipping fee */}
          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[#eeeeee] pt-2 sm:pt-0 sm:pl-3">
            <span className="block text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Ước tính phí giao</span>
            <div className="flex items-baseline gap-1">
              <Truck size={12} className="text-[#8b726b] self-center" />
              <span className="font-serif font-bold text-base text-primary">
                {distance !== null ? `${shippingFee.toLocaleString('vi-VN')}đ` : '--'}
              </span>
            </div>
            <span className="block text-[9px] text-[#8b726b]">Dựa trên vị trí thực tế</span>
          </div>

          {/* Time */}
          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[#eeeeee] pt-2 sm:pt-0 sm:pl-3">
            <span className="block text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">Thời gian nhận hàng</span>
            <div className="flex items-baseline gap-1">
              <Clock size={12} className="text-[#8b726b] self-center" />
              <span className="font-serif font-bold text-base text-primary">{deliveryTime}</span>
            </div>
            <span className="block text-[9px] text-[#8b726b]">Vận chuyển tối ưu</span>
          </div>
        </div>
      )}
    </div>
  );
}
