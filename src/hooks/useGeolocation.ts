import { useState, useEffect } from 'react';

interface Position {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    watchPosition = true
  } = options;

  useEffect(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      });
      setLoading(false);
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setPosition({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined
      });
      setError(null);
      setLoading(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      let message = 'An unknown error occurred.';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Location access denied by user.';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out.';
          break;
      }

      setError({
        code: error.code,
        message
      });
      setLoading(false);
    };

    const geoOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };

    let watchId: number;

    if (watchPosition) {
      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enableHighAccuracy, timeout, maximumAge, watchPosition]);

  const refreshPosition = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined
        });
        setError(null);
        setLoading(false);
      },
      (error) => {
        setError({
          code: error.code,
          message: error.message
        });
        setLoading(false);
      },
      { enableHighAccuracy, timeout: 5000 }
    );
  };

  return {
    position,
    error,
    loading,
    refreshPosition
  };
};