import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedProducts } from '../api/products';

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: fetchFeaturedProducts,
  });
};
