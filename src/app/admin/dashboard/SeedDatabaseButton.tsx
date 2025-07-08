'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { handleSeedDatabase } from '../actions';
import { Rocket } from 'lucide-react';
import { useState } from 'react';

export function SeedDatabaseButton() {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleClick = async () => {
    setIsSeeding(true);
    const result = await handleSeedDatabase();
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
        className: 'bg-green-100 text-green-800',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message,
      });
    }
    setIsSeeding(false);
  };

  return (
    <Button onClick={handleClick} disabled={isSeeding} variant="outline">
      <Rocket className="mr-2 h-4 w-4" />
      {isSeeding ? 'Resetting...' : 'Reset & Seed Database'}
    </Button>
  );
}