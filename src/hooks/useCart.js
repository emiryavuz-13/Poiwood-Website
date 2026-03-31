import { useSelector, useDispatch } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, addToCart as addToCartAPI, updateCartItem, removeCartItem, clearCart as clearCartAPI } from '../api/cart';
import { addGuestItem, updateGuestItem, removeGuestItem, clearGuestCart } from '../store/slices/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const guestItems = useSelector((state) => state.cart.items);

  // --- Authenticated: backend cart via React Query ---
  const { data: serverCart, isLoading: serverLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: isAuthenticated,
  });

  // --- Derived state ---
  const items = isAuthenticated ? (serverCart?.items || []) : guestItems;
  const subtotal = isAuthenticated
    ? (serverCart?.subtotal || 0)
    : guestItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const isLoading = isAuthenticated ? serverLoading : false;

  // --- Add to cart ---
  const addMutation = useMutation({
    mutationFn: addToCartAPI,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const addItem = ({ product, quantity, selected_width_cm, selected_height_cm, unit_price }) => {
    if (isAuthenticated) {
      return addMutation.mutateAsync({
        product_id: product.id,
        quantity,
        selected_width_cm,
        selected_height_cm,
      });
    }
    dispatch(addGuestItem({ product, quantity, selected_width_cm, selected_height_cm, unit_price }));
    return Promise.resolve();
  };

  // --- Update quantity ---
  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItem(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const updateItem = (itemId, quantity) => {
    if (isAuthenticated) {
      return updateMutation.mutate({ itemId, quantity });
    }
    dispatch(updateGuestItem({ itemId, quantity }));
  };

  // --- Remove item ---
  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeItem = (itemId) => {
    if (isAuthenticated) {
      return removeMutation.mutate(itemId);
    }
    dispatch(removeGuestItem(itemId));
  };

  // --- Clear cart ---
  const clearMutation = useMutation({
    mutationFn: clearCartAPI,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const clearAll = () => {
    if (isAuthenticated) {
      return clearMutation.mutate();
    }
    dispatch(clearGuestCart());
  };

  return {
    items,
    subtotal,
    itemCount,
    isLoading,
    addItem,
    addPending: addMutation.isPending,
    addError: addMutation.error,
    updateItem,
    updatePending: updateMutation.isPending,
    removeItem,
    removePending: removeMutation.isPending,
    clearAll,
    clearPending: clearMutation.isPending,
  };
};
