import { BrowserRouter, Routes, Route, Link } from 'react-router';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import CheckoutForm from './pages/CheckoutForm';
import Summary from './pages/Summary';
import TransactionResult from './pages/TransactionResult';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-linear-to-r from-[#432C7A] to-[#5A3E9B] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Payment Gateway</h1>
                <p className="text-xs text-white/60">Checkout seguro con Wompi</p>
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/checkout/:productId" element={<CheckoutForm />} />
            <Route path="/summary/:productId" element={<Summary />} />
            <Route path="/result/:transactionId" element={<TransactionResult />} />
          </Routes>
        </main>
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-400">
            Payment Gateway Challenge &middot; Wompi Sandbox
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
