import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import { fetchProducts } from '../store/slices/productSlice';
import { resetCheckout } from '../store/slices/checkoutSlice';
import { formatCurrency } from '../utils/formatters';

const ITEMS_PER_PAGE = 6;

export default function ProductList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useAppSelector((state) => state.products);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(resetCheckout());
  }, [dispatch]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5A3E9B]/20 border-t-[#5A3E9B]" />
        <p className="text-gray-500 text-sm">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 mb-4 font-medium">{error}</p>
        <button
          onClick={() => dispatch(fetchProducts())}
          className="px-6 py-2.5 bg-[#5A3E9B] text-white rounded-xl hover:bg-[#432C7A] transition-colors font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {filtered.length} {filtered.length === 1 ? 'producto encontrado' : 'productos encontrados'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5A3E9B] focus:border-[#5A3E9B] focus:bg-white transition-all text-sm"
          />
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Empty search */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No se encontraron productos para "{search}"</p>
          <button onClick={() => handleSearchChange('')} className="mt-3 text-[#5A3E9B] hover:text-[#432C7A] font-medium text-sm">
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {paginated.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 flex flex-col"
          >
            {/* Image */}
            <button
              type="button"
              className="relative aspect-4/3 overflow-hidden bg-gray-50 cursor-pointer w-full"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* Stock badge — subtle pill */}
              <div className="absolute top-3 right-3">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    product.stock > 0
                      ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                      : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                </span>
              </div>
            </button>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <button
                type="button"
                className="text-base font-bold text-gray-900 mb-1 cursor-pointer group-hover:text-[#5A3E9B] transition-colors text-left"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                {product.name}
              </button>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-1">
                {product.description}
              </p>
              <p className="text-xl font-bold text-gray-900 mb-4">
                {formatCurrency(product.price)}
                <span className="text-xs font-medium text-gray-400 ml-1">{product.currency}</span>
              </p>
              <button
                onClick={() => navigate(`/products/${product.id}`)}
                disabled={product.stock === 0}
                className="w-full py-2.5 bg-[#5A3E9B] text-white text-sm font-semibold rounded-xl hover:bg-[#432C7A] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {product.stock > 0 ? 'Comprar ahora' : 'Agotado'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                p === page
                  ? 'bg-[#5A3E9B] text-white shadow-md'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
