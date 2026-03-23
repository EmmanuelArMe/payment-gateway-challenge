import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import { createTransaction, processPayment } from '../store/slices/checkoutSlice';
import { formatCurrency, maskCardNumber } from '../utils/formatters';
import { WOMPI_PUBLIC_KEY } from '../config';
import ProgressSteps from './ProgressSteps';

export default function Summary() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedProduct: product } = useAppSelector((s) => s.products);
  const { quantity, customer, delivery, cardInfo, loading, error } = useAppSelector(
    (s) => s.checkout,
  );
  const [cardCvc, setCardCvc] = useState('');
  const [cvcError, setCvcError] = useState('');

  if (!product || !customer || !delivery || !cardInfo) {
    navigate(`/products/${productId}`);
    return null;
  }

  const subtotal = product.price * quantity;
  const baseFee = 5000;
  const deliveryFee = 10000;
  const total = subtotal + baseFee + deliveryFee;

  const handlePay = async () => {
    if (!cardCvc || cardCvc.length < 3) {
      setCvcError('Ingrese el CVC de su tarjeta');
      return;
    }
    setCvcError('');

    // Step 1: Create the transaction
    const txResult = await dispatch(
      createTransaction({
        productId: product.id,
        quantity,
        customerName: customer.fullName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        deliveryAddress: delivery.address,
        deliveryCity: delivery.city,
        deliveryDepartment: delivery.department,
        deliveryPostalCode: delivery.postalCode,
      }),
    );

    if (createTransaction.rejected.match(txResult)) return;

    const transaction = txResult.payload as { id: string };

    // Step 2: Tokenize card via backend (which calls Wompi)

    // Get acceptance token
    const acceptResponse = await fetch(
      `https://api-sandbox.co.uat.wompi.dev/v1/merchants/${encodeURIComponent(WOMPI_PUBLIC_KEY)}`,
    );
    const acceptData = (await acceptResponse.json()) as {
      data?: { presigned_acceptance?: { acceptance_token?: string } };
    };
    const acceptanceToken = acceptData?.data?.presigned_acceptance?.acceptance_token;
    if (!acceptanceToken) return;

    // Tokenize card
    const tokenResponse = await fetch(
      'https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
        },
        body: JSON.stringify({
          number: cardInfo.number,
          cvc: cardCvc,
          exp_month: cardInfo.expMonth,
          exp_year: cardInfo.expYear,
          card_holder: cardInfo.cardHolder,
        }),
      },
    );
    const tokenData = (await tokenResponse.json()) as { data?: { id?: string } };
    const cardToken = tokenData?.data?.id;
    if (!cardToken) return;

    // Step 3: Process payment
    await dispatch(
      processPayment({
        transactionId: transaction.id,
        cardToken,
        acceptanceToken,
        customerEmail: customer.email,
      }),
    );

    navigate(`/result/${transaction.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => navigate(`/checkout/${productId}`)} className="hover:text-[#5A3E9B] transition-colors">
          ← Volver al formulario
        </button>
      </nav>

      <ProgressSteps currentStep={2} />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Resumen de compra</h1>

      {/* Product Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-[#5A3E9B]/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-[#5A3E9B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Producto</h2>
        </div>
        <div className="flex gap-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-500">Cantidad: {quantity}</p>
            <p className="text-sm text-gray-500">Precio unitario: {formatCurrency(product.price)}</p>
          </div>
        </div>
      </div>

      {/* Customer Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Cliente</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-500">Nombre:</span>
          <span className="text-gray-900">{customer.fullName}</span>
          <span className="text-gray-500">Email:</span>
          <span className="text-gray-900">{customer.email}</span>
          <span className="text-gray-500">Teléfono:</span>
          <span className="text-gray-900">{customer.phone}</span>
        </div>
      </div>

      {/* Delivery Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Entrega</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-gray-500">Dirección:</span>
          <span className="text-gray-900">{delivery.address}</span>
          <span className="text-gray-500">Ciudad:</span>
          <span className="text-gray-900">{delivery.city}</span>
          <span className="text-gray-500">Departamento:</span>
          <span className="text-gray-900">{delivery.department}</span>
          <span className="text-gray-500">Código postal:</span>
          <span className="text-gray-900">{delivery.postalCode}</span>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-[#5A3E9B]/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-[#5A3E9B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Pago</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <span className="text-gray-500">Tarjeta:</span>
          <span className="text-gray-900 font-mono">{maskCardNumber(cardInfo.number)}</span>
          <span className="text-gray-500">Titular:</span>
          <span className="text-gray-900">{cardInfo.cardHolder}</span>
          <span className="text-gray-500">Vence:</span>
          <span className="text-gray-900">{cardInfo.expMonth}/{cardInfo.expYear}</span>
        </div>

        {/* CVC confirmation */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirme su CVC para pagar
          </label>
          <input
            type="password"
            value={cardCvc}
            onChange={(e) => {
              setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
              setCvcError('');
            }}
            className={`w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
              cvcError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="CVC"
            maxLength={4}
            inputMode="numeric"
            autoComplete="off"
          />
          {cvcError && <p className="text-red-500 text-xs mt-1">{cvcError}</p>}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gradient-to-br from-gray-50 to-[#5A3E9B]/5 rounded-2xl shadow-lg p-6 mb-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal ({quantity} × {formatCurrency(product.price)})</span>
            <span className="text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tarifa base</span>
            <span className="text-gray-900">{formatCurrency(baseFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Envío</span>
            <span className="text-gray-900">{formatCurrency(deliveryFee)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-[#5A3E9B]">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-3.5 bg-[#5A3E9B] text-white font-semibold rounded-xl hover:bg-[#432C7A] active:scale-[0.98] transition-all shadow-md shadow-[#5A3E9B]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            Procesando pago...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Pagar {formatCurrency(total)}
          </>
        )}
      </button>
    </div>
  );
}
