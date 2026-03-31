import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavorites, addFavorite, removeFavorite } from '../api/favorites';

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const isFavorite = (productId) => favorites.some((f) => f.product_id === productId);

  const toggleFavorite = (productId) => {
    if (!isAuthenticated) return false; // caller should redirect
    if (isFavorite(productId)) {
      removeMutation.mutate(productId);
    } else {
      addMutation.mutate(productId);
    }
    return true;
  };

  const addToFavorites = (productId) => addMutation.mutate(productId);
  const removeFromFavorites = (productId) => removeMutation.mutate(productId);

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
};
