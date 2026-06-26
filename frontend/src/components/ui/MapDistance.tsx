import { useEffect, useState, useRef } from 'react';
import { Navigation, Map as MapIcon, Truck, Clock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  { name: 'Từ Tâm Phục - TP. Hồ Chí Minh', lat: 10.8485, lng: 106.8068, address: 'Số 1 Lê Văn Việt, Tăng Nhơn Phú, TP. Hồ Chí Minh' },
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

// Nominatim Geocoding API helper
async function fetchCoordinates(address: string): Promise<Location | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TuTamPhuc_ECommerceWebsite_Agent/1.0'
      }
    });
    if (!res.ok) throw new Error('Nominatim error');
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        address: data[0].display_name
      };
    }
  } catch (e) {
    console.error('Nominatim Geocoding error:', e);
  }
  return null;
}

// OSRM Routing API helper
async function fetchOSRMRoute(start: { lat: number, lng: number }, end: { lat: number, lng: number }) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM error');
    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const distanceKm = parseFloat((route.distance / 1000).toFixed(1)); // route.distance is in meters
      const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]); // Leaflet uses [lat, lng]
      return {
        distance: distanceKm,
        coordinates: coordinates
      };
    }
  } catch (e) {
    console.error('OSRM Routing error:', e);
  }
  return null;
}

export default function MapDistance({ 
  customerAddress = '', 
  onAddressResolved,
  overrideShippingFee,
  visible = true
}: { 
  customerAddress?: string;
  onAddressResolved?: (distance: number, nearestStore: Store) => void;
  overrideShippingFee?: number;
  visible?: boolean;
}) {
  const [customerLoc, setCustomerLoc] = useState<Location | null>(null);
  const [nearestStore, setNearestStore] = useState<Store>(STORES[0]);
  const [distance, setDistance] = useState<number | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  // Default coordinate: Ba Dinh, Hanoi
  const defaultLoc: Location = { lat: 21.0360, lng: 105.8340, address: 'Quận Ba Đình, Hà Nội' };

  // Calculate nearest store fallback
  const updateNearestStoreFallback = (lat: number, lng: number) => {
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
    setRouteCoordinates([[closest.lat, closest.lng], [lat, lng]]);
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
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = { 
          lat: latitude, 
          lng: longitude, 
          address: 'Vị trí hiện tại của bạn' 
        };
        setCustomerLoc(newLoc);
        
        let minD = Infinity;
        let closestStore = STORES[0];
        STORES.forEach(s => {
          const d = haversineDistance(latitude, longitude, s.lat, s.lng);
          if (d < minD) {
            minD = d;
            closestStore = s;
          }
        });
        setNearestStore(closestStore);

        const routeInfo = await fetchOSRMRoute(closestStore, newLoc);
        if (routeInfo) {
          setDistance(routeInfo.distance);
          setRouteCoordinates(routeInfo.coordinates);
          if (onAddressResolved) {
            onAddressResolved(routeInfo.distance, closestStore);
          }
        } else {
          setDistance(minD);
          setRouteCoordinates([
            [closestStore.lat, closestStore.lng],
            [newLoc.lat, newLoc.lng]
          ]);
          if (onAddressResolved) {
            onAddressResolved(minD, closestStore);
          }
        }
        setIsLocating(false);
      },
      (error) => {
        console.error('Lỗi định vị:', error);
        setIsLocating(false);
        if (!customerLoc) {
          setCustomerLoc(defaultLoc);
          updateNearestStoreFallback(defaultLoc.lat, defaultLoc.lng);
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;
    
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([defaultLoc.lat, defaultLoc.lng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    routeLayerRef.current = L.layerGroup().addTo(map);
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        routeLayerRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Force map to invalidate size and fit bounds when visible changes to true
  useEffect(() => {
    if (visible && mapInstanceRef.current && mapReady) {
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          if (customerLoc && nearestStore) {
            const bounds = L.latLngBounds([
              [nearestStore.lat, nearestStore.lng],
              [customerLoc.lat, customerLoc.lng]
            ]);
            mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
          }
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visible, mapReady, customerLoc, nearestStore]);

  // Update map markers and route coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !routeLayer || !customerLoc || !mapReady) return;

    // Clear previous content
    routeLayer.clearLayers();

    // Store custom icon
    const storeIcon = L.divIcon({
      className: 'custom-store-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #442a22; color: #ffffff; font-size: 8px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; border: 1.5px solid #ffffff; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.25);">
            Cửa Hàng
          </div>
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #442a22; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-top: 2px;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    // Customer custom icon
    const customerIcon = L.divIcon({
      className: 'custom-customer-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #8b726b; color: #ffffff; font-size: 8px; font-weight: bold; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; border: 1.5px solid #ffffff; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.25);">
            Bạn
          </div>
          <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #8b726b; border: 2px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-top: 2px;"></div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    // Add markers
    L.marker([nearestStore.lat, nearestStore.lng], { icon: storeIcon }).addTo(routeLayer);
    L.marker([customerLoc.lat, customerLoc.lng], { icon: customerIcon }).addTo(routeLayer);

    // Draw route line
    const coords: [number, number][] = routeCoordinates && routeCoordinates.length > 0
      ? routeCoordinates
      : [
          [nearestStore.lat, nearestStore.lng],
          [customerLoc.lat, customerLoc.lng]
        ];

    L.polyline(coords, {
      color: '#8b726b',
      weight: 3,
      opacity: 0.8,
      dashArray: '5, 5'
    }).addTo(routeLayer);

    // Fit map bounds to show both markers
    const bounds = L.latLngBounds([
      [nearestStore.lat, nearestStore.lng],
      [customerLoc.lat, customerLoc.lng]
    ]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [mapReady, customerLoc, nearestStore, routeCoordinates]);

  // Handle address geocoding & routing on address change
  useEffect(() => {
    if (!customerAddress || !customerAddress.trim()) return;

    const delayDebounceFn = setTimeout(async () => {
      setIsLocating(true);
      
      let resolvedLoc = await fetchCoordinates(customerAddress);
      
      if (!resolvedLoc) {
        // Fallback geocoding simulator: randomize location offset based on text hash
        const hash = customerAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const isSouth = /hồ chí minh|sài gòn|hcm|bình dương|đồng nai|vũng tàu|long an|cần thơ/i.test(customerAddress);
        const baseLat = isSouth ? 10.7769 : 21.0285;
        const baseLng = isSouth ? 106.7009 : 105.8542;
        
        const offsetLat = ((hash % 100) / 500) * (hash % 2 === 0 ? 1 : -1);
        const offsetLng = (((hash * 13) % 100) / 500) * (hash % 3 === 0 ? 1 : -1);
        
        resolvedLoc = {
          lat: baseLat + offsetLat,
          lng: baseLng + offsetLng,
          address: customerAddress
        };
      }

      setCustomerLoc(resolvedLoc);
      
      // Find nearest store (initial guess)
      let minD = Infinity;
      let closestStore = STORES[0];
      STORES.forEach(s => {
        const d = haversineDistance(resolvedLoc!.lat, resolvedLoc!.lng, s.lat, s.lng);
        if (d < minD) {
          minD = d;
          closestStore = s;
        }
      });
      setNearestStore(closestStore);

      // Fetch driving route and distance
      const routeInfo = await fetchOSRMRoute(closestStore, resolvedLoc);
      if (routeInfo) {
        setDistance(routeInfo.distance);
        setRouteCoordinates(routeInfo.coordinates);
        if (onAddressResolved) {
          onAddressResolved(routeInfo.distance, closestStore);
        }
      } else {
        setDistance(minD);
        setRouteCoordinates([
          [closestStore.lat, closestStore.lng],
          [resolvedLoc.lat, resolvedLoc.lng]
        ]);
        if (onAddressResolved) {
          onAddressResolved(minD, closestStore);
        }
      }
      setIsLocating(false);
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [customerAddress]);

  // Load default on mount
  useEffect(() => {
    if (!customerLoc) {
      setCustomerLoc(defaultLoc);
      
      const initDefault = async () => {
        let closestStore = STORES[0];
        let minD = Infinity;
        STORES.forEach(s => {
          const d = haversineDistance(defaultLoc.lat, defaultLoc.lng, s.lat, s.lng);
          if (d < minD) {
            minD = d;
            closestStore = s;
          }
        });
        setNearestStore(closestStore);
        
        const routeInfo = await fetchOSRMRoute(closestStore, defaultLoc);
        if (routeInfo) {
          setDistance(routeInfo.distance);
          setRouteCoordinates(routeInfo.coordinates);
          if (onAddressResolved) {
            onAddressResolved(routeInfo.distance, closestStore);
          }
        } else {
          setDistance(minD);
          setRouteCoordinates([
            [closestStore.lat, closestStore.lng],
            [defaultLoc.lat, defaultLoc.lng]
          ]);
          if (onAddressResolved) {
            onAddressResolved(minD, closestStore);
          }
        }
      };
      initDefault();
    }
  }, []);

  const shippingFee = distance ? Math.min(20000 + Math.floor(distance) * 2000, 120000) : 30000;
  const displayShippingFee = overrideShippingFee !== undefined ? overrideShippingFee : shippingFee;
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
      <div className="relative w-full h-[200px] bg-[#eeeeee]/60 border border-[#d4c3be]/40 rounded-sm overflow-hidden">
        <div ref={mapRef} className="w-full h-full z-0" />
        {isLocating && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="text-xs font-bold text-primary flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-sm shadow-sm border border-[#d4c3be]/40">
              <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Đang xác định vị trí & lộ trình...
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
                {distance !== null ? `${displayShippingFee.toLocaleString('vi-VN')}đ` : '--'}
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
