import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../hooks/useStore';
import {
  setCustomer,
  setDelivery,
  setCardInfo,
} from '../store/slices/checkoutSlice';
import type { Customer, DeliveryInfo, CreditCardInfo } from '../types';
import { detectCardBrand, isValidLuhn, isValidExpiry, isValidCVC, formatCardNumber } from '../utils/card-validator';
import ProgressSteps from './ProgressSteps';

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutForm() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useAppSelector((s) => s.products);
  useAppSelector((s) => s.checkout);

  const [customerData, setCustomerData] = useState<Customer>({
    fullName: '',
    email: '',
    phone: '',
  });

  const [deliveryData, setDeliveryData] = useState<DeliveryInfo>({
    address: '',
    city: '',
    department: '',
    postalCode: '',
  });

  const [cardData, setCardData] = useState<CreditCardInfo>({
    number: '',
    cvc: '',
    expMonth: '',
    expYear: '',
    cardHolder: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Customer validation
    if (!customerData.fullName.trim()) newErrors.fullName = 'Nombre requerido';
    if (!customerData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email))
      newErrors.email = 'Email inválido';
    if (!customerData.phone.trim() || customerData.phone.length < 7)
      newErrors.phone = 'Teléfono inválido';

    // Delivery validation
    if (!deliveryData.address.trim()) newErrors.address = 'Dirección requerida';
    if (!deliveryData.city.trim()) newErrors.city = 'Ciudad requerida';
    if (!deliveryData.department.trim()) newErrors.department = 'Departamento requerido';
    if (!deliveryData.postalCode.trim()) newErrors.postalCode = 'Código postal requerido';

    // Card validation
    const cleanNumber = cardData.number.replaceAll(/\s/g, '');
    if (!isValidLuhn(cleanNumber)) newErrors.cardNumber = 'Número de tarjeta inválido';
    if (!isValidExpiry(cardData.expMonth, cardData.expYear))
      newErrors.expiry = 'Fecha de expiración inválida';
    if (!isValidCVC(cardData.cvc)) newErrors.cvc = 'CVC inválido';
    if (!cardData.cardHolder.trim()) newErrors.cardHolder = 'Titular requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(setCustomer(customerData));
    dispatch(setDelivery(deliveryData));
    dispatch(
      setCardInfo({
        number: cardData.number.replaceAll(/\s/g, ''),
        expMonth: cardData.expMonth,
        expYear: cardData.expYear,
        cardHolder: cardData.cardHolder,
      }),
    );
    navigate(`/summary/${productId}`);
  };

  const cardBrand = detectCardBrand(cardData.number);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => navigate(`/products/${productId}`)} className="hover:text-[#5A3E9B] transition-colors">
          ← Volver al producto
        </button>
      </nav>

      <ProgressSteps currentStep={1} />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Info */}
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-[#5A3E9B]/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#5A3E9B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Información personal</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                id="fullName"
                type="text"
                value={customerData.fullName}
                onChange={(e) => setCustomerData({ ...customerData, fullName: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan Pérez"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="juan@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                id="phone"
                type="tel"
                value={customerData.phone}
                onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="3001234567"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        </section>

        {/* Delivery Info */}
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Información de entrega</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                id="address"
                type="text"
                value={deliveryData.address}
                onChange={(e) => setDeliveryData({ ...deliveryData, address: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Calle 123 #45-67"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                id="city"
                type="text"
                value={deliveryData.city}
                onChange={(e) => setDeliveryData({ ...deliveryData, city: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Medellín"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <input
                id="department"
                type="text"
                value={deliveryData.department}
                onChange={(e) => setDeliveryData({ ...deliveryData, department: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Antioquia"
              />
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Código postal</label>
              <input
                id="postalCode"
                type="text"
                value={deliveryData.postalCode}
                onChange={(e) => setDeliveryData({ ...deliveryData, postalCode: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
                  errors.postalCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="050001"
              />
              {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
            </div>
          </div>
        </section>

        {/* Credit Card */}
        <section className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-[#5A3E9B]/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#5A3E9B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Tarjeta de crédito</h2>
          </div>

          {/* Card Preview */}
          <div className="bg-linear-to-br from-[#432C7A] to-[#5A3E9B] rounded-xl p-6 text-white mb-6 max-w-sm">
            <div className="flex justify-between items-start mb-8">
              <span className="text-xs opacity-75">Tarjeta de crédito</span>
              <span className="text-sm font-bold uppercase">
                {cardBrand === 'unknown' ? '' : cardBrand}
              </span>
            </div>
            <p className="text-lg tracking-widest mb-6 font-mono">
              {formatCardNumber(cardData.number) || '•••• •••• •••• ••••'}
            </p>
            <div className="flex justify-between">
              <div>
                <p className="text-xs opacity-75">Titular</p>
                <p className="text-sm">{cardData.cardHolder || 'NOMBRE APELLIDO'}</p>
              </div>
              <div>
                <p className="text-xs opacity-75">Vence</p>
                <p className="text-sm">
                  {cardData.expMonth || 'MM'}/{cardData.expYear || 'AA'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
              <input
                id="cardNumber"
                type="text"
                value={formatCardNumber(cardData.number)}
                onChange={(e) => {
                  const raw = e.target.value.replaceAll(/\D/g, '').slice(0, 16);
                  setCardData({ ...cardData, number: raw });
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all font-mono ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                inputMode="numeric"
              />
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">Titular de la tarjeta</label>
              <input
                id="cardHolder"
                type="text"
                value={cardData.cardHolder}
                onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value.toUpperCase() })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
                  errors.cardHolder ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="NOMBRE COMO EN LA TARJETA"
              />
              {errors.cardHolder && <p className="text-red-500 text-xs mt-1">{errors.cardHolder}</p>}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="expMonth" className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                <select
                  id="expMonth"
                  value={cardData.expMonth}
                  onChange={(e) => setCardData({ ...cardData, expMonth: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
                    errors.expiry ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="expYear" className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                <select
                  id="expYear"
                  value={cardData.expYear}
                  onChange={(e) => setCardData({ ...cardData, expYear: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
                    errors.expiry ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">AA</option>
                  {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i).slice(-2)).map(
                    (y) => (
                      <option key={y} value={y}>{y}</option>
                    ),
                  )}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
              <input
                id="cvc"
                type="password"
                value={cardData.cvc}
                onChange={(e) => {
                  const raw = e.target.value.replaceAll(/\D/g, '').slice(0, 4);
                  setCardData({ ...cardData, cvc: raw });
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#5A3E9B] focus:border-transparent outline-none transition-all ${
                  errors.cvc ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123"
                maxLength={4}
                inputMode="numeric"
                autoComplete="off"
              />
              {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="w-full py-3.5 bg-[#5A3E9B] text-white font-semibold rounded-xl hover:bg-[#432C7A] active:scale-[0.98] transition-all shadow-md shadow-[#5A3E9B]/20 flex items-center justify-center gap-2"
        >
          Revisar resumen
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </form>
    </div>
  );
}
