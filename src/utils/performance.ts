import React from 'react';

// Performance monitoring utilities

export const performanceMonitor = {
  // Measure and log component render times
  measureRender: (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = end - start;
      if (duration > 16) { // Log slow renders (>16ms)
        console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
      }
    };
  },

  // Debounce function for frequent operations
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll/resize events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Measure Core Web Vitals
  measureCoreWebVitals: () => {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const delay = (entry as any).processingStart - entry.startTime;
        console.log('FID:', delay);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const layoutShiftEntry = entry as any;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
          console.log('CLS:', clsValue);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  },

  // Memory usage monitoring
  getMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  },

  // Image preloader
  preloadImages: (urls: string[]): Promise<void[]> => {
    const promises = urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
    });
    return Promise.all(promises);
  },

  // Resource hints for critical resources
  addResourceHints: (urls: string[], type: 'preload' | 'prefetch' = 'preload') => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = type;
      link.href = url;
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
};

// Bundle analyzer for development
export const analyzeBundle = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis would be available in production build');
  }
};

// Code splitting helper
export const lazyImport = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};