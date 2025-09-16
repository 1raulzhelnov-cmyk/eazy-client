import React, { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number; // Number of items to render outside visible area
}

function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    const visibleStartIndex = Math.max(0, startIndex - overscan);
    const visibleItems = items.slice(visibleStartIndex, endIndex);

    return {
      visibleItems: visibleItems.map((item, index) => ({
        item,
        index: visibleStartIndex + index
      })),
      totalHeight: items.length * itemHeight,
      offsetY: visibleStartIndex * itemHeight
    };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  return (
    <div
      ref={scrollRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} style={{ height: itemHeight }}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VirtualizedList;