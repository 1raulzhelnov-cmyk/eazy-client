import { useCallback } from 'react';

export const useAnalytics = () => {
  const trackEvent = useCallback((event: string, data?: any) => {
    console.log('Analytics event:', event, data);
    // Simple analytics tracking for now
  }, []);

  const trackPageView = useCallback((page: string) => {
    console.log('Page view:', page);
  }, []);

  return {
    trackEvent,
    trackPageView
  };
};