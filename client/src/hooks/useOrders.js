import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/order.service';
import toast from 'react-hot-toast';

export const useMyOrders = (params) => {
  return useQuery({
    queryKey: ['my-orders', params],
    queryFn: () => orderService.getMyOrders(params).then(r => {
      const body = r?.data;
      if (!body) return [];
      if (Array.isArray(body)) return body;
      if (Array.isArray(body.data)) return body.data;
      if (body.data && Array.isArray(body.data.data)) return body.data.data;
      return [];
    }),
    staleTime: 2 * 60 * 1000,
  });
};

export const useOrderById = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id).then(r => r.data),
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => orderService.createOrder(data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      toast.success('Order placed successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to place order');
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }) => orderService.updateOrderStatus(id, status, note),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated!');
    },
    onError: () => toast.error('Failed to update status'),
  });
};

export const useUploadPaymentScreenshot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => orderService.uploadPaymentScreenshot(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast.success('Payment screenshot uploaded! We will verify shortly.');
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Failed to upload screenshot. Please try again.';
      toast.error(msg);
    },
  });
};
