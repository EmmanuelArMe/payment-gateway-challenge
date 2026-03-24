import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppSelector } from '../hooks/useStore';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import type { Transaction } from '../types';
import { TransactionStatus } from '../types';
import ProgressSteps from './ProgressSteps';

export default function TransactionResult() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { transaction: storeTransaction } = useAppSelector((s) => s.checkout);
  const [transaction, setTransaction] = useState<Transaction | null>(storeTransaction);

  const polling = transaction?.status === TransactionStatus.PENDING;

  useEffect(() => {
    if (!transactionId) return;

    // If transaction is PENDING, poll for status updates
    if (transaction?.status === TransactionStatus.PENDING) {
      const interval = setInterval(async () => {
        try {
          const result = await api.getTransaction(transactionId);
          setTransaction(result.data);
          if (result.data.status !== TransactionStatus.PENDING) {
            clearInterval(interval);
          }
        } catch {
          // Ignore polling errors
        }
      }, 2000);

      // Stop polling after 60 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 60000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [transactionId, transaction?.status]);

  // If no transaction in store, fetch it
  useEffect(() => {
    if (!transaction && transactionId) {
      api.getTransaction(transactionId).then((r) => setTransaction(r.data)).catch(() => {});
    }
  }, [transaction, transactionId]);

  const statusConfig: Record<string, { icon: string; color: string; bg: string; title: string; message: string }> = {
    [TransactionStatus.APPROVED]: {
      icon: '✓',
      color: 'text-green-600',
      bg: 'bg-green-100',
      title: '¡Pago aprobado!',
      message: 'Tu transacción ha sido procesada exitosamente. Recibirás un correo de confirmación.',
    },
    [TransactionStatus.DECLINED]: {
      icon: '✕',
      color: 'text-red-600',
      bg: 'bg-red-100',
      title: 'Pago rechazado',
      message: 'La transacción fue rechazada por la entidad financiera. Intenta con otro método de pago.',
    },
    [TransactionStatus.PENDING]: {
      icon: '⏳',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      title: 'Pago pendiente',
      message: 'Tu transacción está siendo procesada. Te notificaremos cuando se complete.',
    },
    [TransactionStatus.ERROR]: {
      icon: '!',
      color: 'text-red-600',
      bg: 'bg-red-100',
      title: 'Error en el pago',
      message: 'Ocurrió un error al procesar tu transacción. Por favor intenta nuevamente.',
    },
    [TransactionStatus.VOIDED]: {
      icon: '⊘',
      color: 'text-gray-600',
      bg: 'bg-gray-100',
      title: 'Transacción anulada',
      message: 'Esta transacción ha sido anulada.',
    },
  };

  if (!transaction) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A3E9B]" />
      </div>
    );
  }

  const status = statusConfig[transaction.status] || statusConfig[TransactionStatus.ERROR];

  return (
    <div className="max-w-3xl mx-auto">
      <ProgressSteps currentStep={3} />

      {/* Status Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-6">
        <div
          className={`w-20 h-20 rounded-full ${status.bg} flex items-center justify-center mx-auto mb-4`}
        >
          <span className={`text-3xl font-bold ${status.color}`}>{status.icon}</span>
        </div>
        <h1 className={`text-2xl font-bold mb-2 ${status.color}`}>{status.title}</h1>
        <p className="text-gray-600 mb-6">{status.message}</p>

        {polling && (
          <div className="flex items-center justify-center gap-2 text-yellow-600 mb-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600" />
            <span className="text-sm">Verificando estado del pago...</span>
          </div>
        )}
      </div>

      {/* Transaction Details */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-[#5A3E9B]/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-[#5A3E9B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Detalles de la transacción</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <span className="text-gray-500">ID de transacción:</span>
          <span className="text-gray-900 font-mono text-xs break-all">{transaction.id}</span>
          {transaction.wompiReference && (
            <>
              <span className="text-gray-500">Referencia Wompi:</span>
              <span className="text-gray-900 font-mono text-xs break-all">
                {transaction.wompiReference}
              </span>
            </>
          )}
          <span className="text-gray-500">Estado:</span>
          <span className={`font-semibold ${status.color}`}>{transaction.status}</span>
          <span className="text-gray-500">Subtotal:</span>
          <span className="text-gray-900">{formatCurrency(transaction.amount)}</span>
          <span className="text-gray-500">Tarifa base:</span>
          <span className="text-gray-900">{formatCurrency(transaction.baseFee)}</span>
          <span className="text-gray-500">Envío:</span>
          <span className="text-gray-900">{formatCurrency(transaction.deliveryFee)}</span>
          <span className="text-gray-500">Total:</span>
          <span className="text-gray-900 font-bold text-lg">{formatCurrency(transaction.total)}</span>
          <span className="text-gray-500">Fecha:</span>
          <span className="text-gray-900">{new Date(transaction.createdAt).toLocaleString('es-CO')}</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="w-full py-3.5 bg-[#5A3E9B] text-white font-semibold rounded-xl hover:bg-[#432C7A] active:scale-[0.98] transition-all shadow-md shadow-[#5A3E9B]/20 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        Volver a productos
      </button>
    </div>
  );
}
