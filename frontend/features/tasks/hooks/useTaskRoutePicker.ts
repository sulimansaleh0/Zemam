'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  fetchDrivingRoute,
  searchPlaces,
  reverseGeocodeCoords,
  type GeocodingResult,
  type RouteData,
} from '../utils/mapHelpers';
import type { LocationPoint } from '../types/task.types';
import { getCurrentLocation } from '@/shared/lib/navigatorClient';

interface UseTaskRoutePickerProps {
  pickupLocation: LocationPoint;
  deliveryLocation: LocationPoint;
  onPickupChange: (loc: LocationPoint) => void;
  onDeliveryChange: (loc: LocationPoint) => void;
  onRouteCalculated?: (route: RouteData) => void;
}

export function useTaskRoutePicker({
  pickupLocation,
  deliveryLocation,
  onPickupChange,
  onDeliveryChange,
  onRouteCalculated,
}: UseTaskRoutePickerProps) {
  const [activeTarget, setActiveTarget] = useState<'pickup' | 'delivery'>('pickup');
  const activeTargetRef = useRef<'pickup' | 'delivery'>('pickup');

  const setTarget = (target: 'pickup' | 'delivery') => {
    activeTargetRef.current = target;
    setActiveTarget(target);
  };

  // الحالة المحلية لضمان التحديث اللحظي المباشر على الخريطة دون انتظار
  const [localPickup, setLocalPickup] = useState<LocationPoint>(pickupLocation);
  const [localDelivery, setLocalDelivery] = useState<LocationPoint>(deliveryLocation);

  useEffect(() => {
    setLocalPickup(pickupLocation);
  }, [pickupLocation?.address, pickupLocation?.lat, pickupLocation?.lng]);

  useEffect(() => {
    setLocalDelivery(deliveryLocation);
  }, [deliveryLocation?.address, deliveryLocation?.lat, deliveryLocation?.lng]);

  const effectivePickup = localPickup || pickupLocation;
  const effectiveDelivery = localDelivery || deliveryLocation;

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  const searchAbortRef = useRef<AbortController | null>(null);

  const pickupLat = parseFloat(effectivePickup.lat);
  const pickupLng = parseFloat(effectivePickup.lng);
  const hasPickup = !isNaN(pickupLat) && !isNaN(pickupLng);

  const deliveryLat = parseFloat(effectiveDelivery.lat);
  const deliveryLng = parseFloat(effectiveDelivery.lng);
  const hasDelivery = !isNaN(deliveryLat) && !isNaN(deliveryLng);

  const onRouteCalculatedRef = useRef(onRouteCalculated);
  useEffect(() => {
    onRouteCalculatedRef.current = onRouteCalculated;
  }, [onRouteCalculated]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  // Debounced search for places (triggered only when query has at least 2 chars)
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) return;

    if (searchAbortRef.current) searchAbortRef.current.abort();

    const controller = new AbortController();
    searchAbortRef.current = controller;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPlaces(trimmed, controller.signal);
      if (!controller.signal.aborted) {
        setSuggestions(results);
        setIsSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const effectiveRouteData = hasPickup && hasDelivery ? routeData : null;

  // Route calculation when both points are defined
  useEffect(() => {
    if (!hasPickup || !hasDelivery) return;

    let isMounted = true;
    const controller = new AbortController();

    // Asynchronously begin routing to avoid synchronous setState inside effect body
    const timer = setTimeout(() => {
      if (!isMounted) return;
      setIsRouting(true);
      fetchDrivingRoute(
        [pickupLat, pickupLng],
        [deliveryLat, deliveryLng],
        controller.signal
      )
        .then((data) => {
          if (isMounted) {
            setRouteData(data);
            setIsRouting(false);
            if (onRouteCalculatedRef.current) {
              onRouteCalculatedRef.current(data);
            }
          }
        })
        .catch(() => {
          if (isMounted) setIsRouting(false);
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [hasPickup, hasDelivery, pickupLat, pickupLng, deliveryLat, deliveryLng]);

  const pickupCoords = useMemo<[number, number] | null>(() => {
    return hasPickup ? [pickupLat, pickupLng] : null;
  }, [hasPickup, pickupLat, pickupLng]);

  const deliveryCoords = useMemo<[number, number] | null>(() => {
    return hasDelivery ? [deliveryLat, deliveryLng] : null;
  }, [hasDelivery, deliveryLat, deliveryLng]);

  // معالجة النقر على الخريطة: تحديث فوري (0ms) للإحداثيات ثم طلب العنوان في الخلفية
  const handleMapClick = (lat: number, lng: number) => {
    const target = activeTargetRef.current;
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const fallbackAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    // 1. تحديث الإحداثيات فوراً محلياً وعبر النموذج ليظهر الدبوس لحظياً
    if (target === 'pickup') {
      const point = { address: fallbackAddress, lat: latStr, lng: lngStr };
      setLocalPickup(point);
      onPickupChange(point);
      setTarget('delivery');
    } else {
      const point = { address: fallbackAddress, lat: latStr, lng: lngStr };
      setLocalDelivery(point);
      onDeliveryChange(point);
    }

    // 2. محاولة جلب العنوان بالاسم العربي في الخلفية وتحديثه بنعومة
    reverseGeocodeCoords(lat, lng)
      .then((resolvedAddress) => {
        if (resolvedAddress && resolvedAddress !== fallbackAddress) {
          if (target === 'pickup') {
            const point = { address: resolvedAddress, lat: latStr, lng: lngStr };
            setLocalPickup(point);
            onPickupChange(point);
          } else {
            const point = { address: resolvedAddress, lat: latStr, lng: lngStr };
            setLocalDelivery(point);
            onDeliveryChange(point);
          }
        }
      })
      .catch(() => {});
  };

  // سحب دبوس الانطلاق A: تحديث فوري للإحداثيات ثم تحديث العنوان في الخلفية
  const handlePickupDrag = (lat: number, lng: number) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const fallbackAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const point = { address: fallbackAddress, lat: latStr, lng: lngStr };
    setLocalPickup(point);
    onPickupChange(point);

    reverseGeocodeCoords(lat, lng)
      .then((resolvedAddress) => {
        if (resolvedAddress && resolvedAddress !== fallbackAddress) {
          const updated = { address: resolvedAddress, lat: latStr, lng: lngStr };
          setLocalPickup(updated);
          onPickupChange(updated);
        }
      })
      .catch(() => {});
  };

  // سحب دبوس التسليم B: تحديث فوري للإحداثيات ثم تحديث العنوان في الخلفية
  const handleDeliveryDrag = (lat: number, lng: number) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const fallbackAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const point = { address: fallbackAddress, lat: latStr, lng: lngStr };
    setLocalDelivery(point);
    onDeliveryChange(point);

    reverseGeocodeCoords(lat, lng)
      .then((resolvedAddress) => {
        if (resolvedAddress && resolvedAddress !== fallbackAddress) {
          const updated = { address: resolvedAddress, lat: latStr, lng: lngStr };
          setLocalDelivery(updated);
          onDeliveryChange(updated);
        }
      })
      .catch(() => {});
  };

  const handleSelectPlace = (place: GeocodingResult) => {
    const target = activeTargetRef.current;
    const latStr = place.lat.toFixed(6);
    const lngStr = place.lng.toFixed(6);
    const point = { address: place.address, lat: latStr, lng: lngStr };

    if (target === 'pickup') {
      setLocalPickup(point);
      onPickupChange(point);
      setTarget('delivery');
    } else {
      setLocalDelivery(point);
      onDeliveryChange(point);
    }

    setSearchQuery('');
    setSuggestions([]);
  };

  const handleUseCurrentLocation = async () => {
    try {
      const { lat, lng } = await getCurrentLocation();
      handleMapClick(lat, lng);
    } catch (err) {
      console.warn('Geolocation error:', err);
    }
  };

  return {
    activeTarget,
    setActiveTarget: setTarget,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    suggestions,
    isSearching,
    isRouting,
    routeData: effectiveRouteData,
    hasPickup,
    hasDelivery,
    pickupCoords,
    deliveryCoords,
    effectivePickup,
    effectiveDelivery,
    handleMapClick,
    handlePickupDrag,
    handleDeliveryDrag,
    handleSelectPlace,
    handleUseCurrentLocation,
  };
}
