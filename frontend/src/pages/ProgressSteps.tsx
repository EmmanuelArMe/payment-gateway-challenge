const stepLabels = ['Producto', 'Datos', 'Resumen', 'Resultado'];

const stepIcons = [
  // Package
  <svg key="0" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  // Clipboard
  <svg key="1" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  // Eye
  <svg key="2" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  // Check circle
  <svg key="3" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
];

interface ProgressStepsProps {
  currentStep: number; // 0-based: 0=Producto, 1=Datos, 2=Resumen, 3=Resultado
}

function getStepStyle(step: number, current: number): string {
  if (step < current) return 'bg-green-500 text-white';
  if (step === current)
    return 'bg-[#5A3E9B] text-white shadow-md shadow-[#5A3E9B]/20';
  return 'bg-gray-100 text-gray-400 border-2 border-gray-200';
}

export default function ProgressSteps({ currentStep }: Readonly<ProgressStepsProps>) {
  return (
    <div className="flex items-center justify-center mb-8">
      {stepLabels.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                getStepStyle(i, currentStep)
              }`}
            >
              {i < currentStep ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                stepIcons[i]
              )}
            </div>
            <span
              className={`mt-1.5 text-xs font-medium hidden sm:block ${
                i <= currentStep ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </div>
          {i < 3 && (
            <div
              className={`w-12 sm:w-16 h-0.5 mx-1 sm:mx-2 -mt-4 sm:-mt-5 ${
                i < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
