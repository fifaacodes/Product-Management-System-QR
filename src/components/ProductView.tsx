import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, Tag } from 'lucide-react';
import { SupabaseStorage } from '../utils/supabaseStorage';

interface ProductViewProps {
  products: ProductData[];
}

export const ProductView: React.FC<ProductViewProps> = ({ products }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);

  useEffect(() => {
    if (id && products.length > 0) {
      const foundProduct = products.find(p => p.id === id);
        const file = await SupabaseStorage.getFile(fileId);
    }
  }, [id, products]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  const productEntries = Object.entries(product).filter(([key]) => key !== 'id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">
                    {product['Product Name'] || product['Name'] || 'Product Details'}
                  </h1>
                  <p className="text-blue-100 mt-1">Product ID: {product.id}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                {productEntries.map(([key, value], index) => (
                  <div
                    key={key}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {key.toLowerCase().includes('date') || key.toLowerCase().includes('time') ? (
                          <Calendar className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Tag className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                          {key}
                        </h3>
                        <p className="text-gray-900 break-words">
                          {value?.toString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {productEntries.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No additional product details available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};