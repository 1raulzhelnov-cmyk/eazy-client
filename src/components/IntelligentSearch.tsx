import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export const IntelligentSearch = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Умный поиск..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button size="sm">
        <Search className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default IntelligentSearch;