'use client';

import { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    activeTargetRef.current = activeTarget;
  }, [activeTarget]);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  const searchAbortRef = useRef<AbortController | null>(null);

  const pickupLat = parseFloat(pickupLocation.lat);
  const pickupLng = parseFloat(pickupLocation.lng);
  const hasPickup = !isNaN(pickupLat) && !isNaN(pickupLng);

  const deliveryLat = parseFloat(deliveryLocation.lat);
  const deliveryLng = parseFloat(deliveryLocation.lng);
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

  const handleMapClick = async (lat: number, lng: number) => {
    const target = activeTargetRef.current;
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const address = await reverseGeocodeCoords(lat, lng);

    if (target === 'pickup') {
      onPickupChange({ address, lat: latStr, lng: lngStr });
      setActiveTarget('delivery');
    } else {
      onDeliveryChange({ address, lat: latStr, lng: lngStr });
    }
  };

  const handlePickupDrag = async (lat: number, lng: number) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const address = await reverseGeocodeCoords(lat, lng);
    onPickupChange({ address, lat: latStr, lng: lngStr });
  };

  const handleDeliveryDrag = async (lat: number, lng: number) => {
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);
    const address = await reverseGeocodeCoords(lat, lng);
    onDeliveryChange({ address, lat: latStr, lng: lngStr });
  };

  const handleSelectPlace = (place: GeocodingResult) => {
    const target = activeTargetRef.current;
    const latStr = place.lat.toFixed(6);
    const lngStr = place.lng.toFixed(6);

    if (target === 'pickup') {
      onPickupChange({ address: place.address, lat: latStr, lng: lngStr });
      setActiveTarget('delivery');
    } else {
      onDeliveryChange({ address: place.address, lat: latStr, lng: lngStr });
    }

    setSearchQuery('');
    setSuggestions([]);
  };

  const handleUseCurrentLocation = async () => {
    try {
      const { lat, lng } = await getCurrentLocation();
      await handleMapClick(lat, lng);
    } catch (err) {
      console.warn('Geolocation error:', err);
    }
  };

  return {
    activeTarget,
    setActiveTarget,
    searchQuery,
    setSearchQuery,
    handleSearchChange,
    suggestions,
    isSearching,
    isRouting,
    routeData: effectiveRouteData,
    hasPickup,
    hasDelivery,
    pickupCoords: hasPickup ? ([pickupLat, pickupLng] as [number, number]) : null,
    deliveryCoords: hasDelivery ? ([deliveryLat, deliveryLng] as [number, number]) : null,
    handleMapClick,
    handlePickupDrag,
    handleDeliveryDrag,
    handleSelectPlace,
    handleUseCurrentLocation,
  };
}
