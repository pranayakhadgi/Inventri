import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-keys';

export function useLocations() {
  return useQuery({
    queryKey: queryKeys.locations.all,
    queryFn: () => api.get('/locations'),
  });
}
