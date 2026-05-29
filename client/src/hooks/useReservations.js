import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/query-keys';

export function useReservations() {
  return useQuery({
    queryKey: queryKeys.reservations.all,
    queryFn: () => api.get('/reservations'),
  });
}

export function useReservation(id) {
  return useQuery({
    queryKey: queryKeys.reservations.detail(id),
    queryFn: () => api.get(`/reservations/${id}`),
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/reservations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
    },
  });
}

export function useReturnItems(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items) => api.post(`/reservations/${id}/return`, { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
    },
  });
}
