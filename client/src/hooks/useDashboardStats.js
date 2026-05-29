import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-keys';

export function useDashboardStats() {
  const items = useQuery({
    queryKey: queryKeys.items.all,
    queryFn: () => api.get('/items'),
  });

  const reservations = useQuery({
    queryKey: queryKeys.reservations.all,
    queryFn: () => api.get('/reservations'),
  });

  const discrepancies = useQuery({
    queryKey: queryKeys.discrepancies.all,
    queryFn: () => api.get('/discrepancies'),
  });

  const isLoading = items.isLoading || reservations.isLoading || discrepancies.isLoading;
  const isError = items.isError || reservations.isError || discrepancies.isError;

  const stats = {
    totalItems: items.data?.count ?? 0,
    availableItems: items.data?.data?.filter((i) => i.status === 'available').length ?? 0,
    checkedOut: items.data?.data?.filter((i) => i.status === 'checked_out').length ?? 0,
    totalReservations: reservations.data?.count ?? 0,
    activeReservations: reservations.data?.data?.filter((r) => r.status === 'active').length ?? 0,
    pendingReservations: reservations.data?.data?.filter((r) => r.status === 'pending').length ?? 0,
    flaggedDiscrepancies: discrepancies.data?.flagged ?? 0,
    resolvedDiscrepancies: discrepancies.data?.resolved ?? 0,
    recentReservations: reservations.data?.data?.slice(0, 5) ?? [],
    recentDiscrepancies: discrepancies.data?.data?.slice(0, 5) ?? [],
  };

  return { stats, isLoading, isError };
}
