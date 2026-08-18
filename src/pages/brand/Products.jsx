import Products from '../admin/Products';
import { useBrand } from '../../contexts/BrandContext';

export default function BrandProducts() {
  const { brandId } = useBrand();
  return <Products mode="brand" brandId={brandId} />;
}
