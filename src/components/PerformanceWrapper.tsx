import React, { useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance';

interface PerformanceWrapperProps {
  name: string;
  children: React.ReactNode;
  enableMemoryTracking?: boolean;
}

const PerformanceWrapper: React.FC<PerformanceWrapperProps> = ({
  name,
  children,
  enableMemoryTracking = false
}) => {
  useEffect(() => {
    const cleanup = performanceMonitor.measureRender(name);

    if (enableMemoryTracking) {
      const checkMemory = () => {
        const memory = performanceMonitor.getMemoryUsage();
        if (memory && memory.used > 50) { // Alert if using more than 50MB
          console.warn(`High memory usage in ${name}:`, memory);
        }
      };
      checkMemory();
    }

    return cleanup;
  }, [name, enableMemoryTracking]);

  return <>{children}</>;
};

export default PerformanceWrapper;