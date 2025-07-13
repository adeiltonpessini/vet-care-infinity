import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseAsyncDataOptions<T> {
  initialData?: T;
  onError?: (error: Error) => void;
  errorMessage?: string;
}

export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = [],
  options: UseAsyncDataOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      } else if (options.errorMessage) {
        toast({
          title: 'Erro',
          description: options.errorMessage,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch,
    setData
  };
}