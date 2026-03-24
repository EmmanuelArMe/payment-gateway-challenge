import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import { fetchProductById } from '../store/slices/productSlice';
import { setQuantity } from '../store/slices/checkoutSlice';
import { formatCurrency } from '../utils/formatters';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, loading } = useAppSelector((s) => s.products);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [id, dispatch]);

  if (loading || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5A3E9B]/20 border-t-[#5A3E9B]" />
        <p className="text-gray-500 text-sm">Cargando producto...</p>
      </div>
    );
  }

  const handleContinue = () => {
    dispatch(setQuantity(qty));
    navigate(`/checkout/${product.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-[#5A3E9B] transition-colors">
          Productos
        </button>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative bg-gray-50">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-80 md:h-full object-cover min-h-100"
            />
            {/* Stock badge on image */}
            <div className="absolute top-4 left-4">
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${
                  product.stock > 0
                    ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                    : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} unidades disponibles`
                  : 'Producto agotado'}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col justify-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
              <p className="text-3xl font-bold text-[#5A3E9B] mb-8">
                {formatCurrency(product.price)}
              </p>
            </div>

            {product.stock > 0 && (
              <div>
                <label id="quantity-label" htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-3">
                  Cantidad
                </label>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-11 h-11 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-[#5A3E9B]/30 hover:bg-[#5A3E9B]/5 transition-all text-lg font-bold text-gray-600"
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    value={qty}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(product.stock, Number(e.target.value) || 1));
                      setQty(v);
                    }}
                    min={1}
                    max={product.stock}
                    aria-labelledby="quantity-label"
                    className="text-xl font-bold w-12 text-center text-gray-900 border-0 outline-none bg-transparent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-11 h-11 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-[#5A3E9B]/30 hover:bg-[#5A3E9B]/5 transition-all text-lg font-bold text-gray-600"
                    disabled={qty >= product.stock}
                  >
                    +
                  </button>
                </div>

                {/* Price breakdown */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Subtotal ({qty} × {formatCurrency(product.price)})</span>
                    <span className="font-medium">{formatCurrency(product.price * qty)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Tarifa base</span>
                    <span className="font-medium">{formatCurrency(5000)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>Envío</span>
                    <span className="font-medium">{formatCurrency(10000)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-[#5A3E9B] text-lg">{formatCurrency(product.price * qty + 5000 + 10000)}</span>
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full py-3.5 bg-[#5A3E9B] text-white font-semibold rounded-xl hover:bg-[#432C7A] active:scale-[0.98] transition-all shadow-md shadow-[#5A3E9B]/20 flex items-center justify-center gap-2"
                >
                  Continuar con la compra
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
