import React, { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { Service, ServiceParameter } from '../../types';

type PaymentType = 'Pre-Book or Pre-Pay' | 'Pre-Book only' | 'Pre-Pay only';

interface UpsellPreviewProps {
  title: string;
  description: string;
  queries: any[]; // Kept for compatibility, but unused
  paymentType: PaymentType;
  taxRate: number;
  services: Service[];
}

const UpsellPreview: React.FC<UpsellPreviewProps> = ({
  title,
  description,
  paymentType,
  taxRate,
  services,
}) => {
  const [selectedPayment, setSelectedPayment] = useState('');
  const [amountReceived, setAmountReceived] = useState('0.00');
  const [otherNotes, setOtherNotes] = useState('');

  const prePayMethods = ['Cash', 'Cheque', 'ETF', 'CCD'];
  const preBookMethods = ['IOS'];

  let paymentMethods: string[] = [];

  if (paymentType === 'Pre-Book or Pre-Pay') {
    paymentMethods = [...prePayMethods, ...preBookMethods];
  } else if (paymentType === 'Pre-Pay only') {
    paymentMethods = prePayMethods;
  } else if (paymentType === 'Pre-Book only') {
    paymentMethods = preBookMethods;
  }

  const handleAmountChange = (value: string) => {
    value = value.replace(/[^\d.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts[1];
    if (value.includes('.')) {
      const [whole, decimal] = value.split('.');
      value = `${whole}.${decimal.slice(0, 2)}`;
    }
    setAmountReceived(value);
  };

  const calculateTax = () => {
    const baseAmount = parseFloat(amountReceived);
    if (isNaN(baseAmount)) return;
    const withTax = baseAmount * (1 + taxRate / 100);
    setAmountReceived(withTax.toFixed(2));
  };

  const uniqueParameters = useMemo(() => {
    const allParams: ServiceParameter[] = [];
    const seenTitles = new Set<string>();

    services.forEach((service) => {
      service.futureParameters.forEach((param) => {
        if (!seenTitles.has(param.title)) {
          allParams.push(param);
          seenTitles.add(param.title);
        }
      });
    });

    return allParams;
  }, [services]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h2 className="text-xl font-bold text-gray-100">
        {title || 'Your Title Here'}
      </h2>
      <p className="text-gray-400">
        {description || 'Your description will appear here.'}
      </p>

      {uniqueParameters.map((param) => (
        <div key={param.id}>
          {param.type === 'Yes/No' ? (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-cps-blue focus:ring-cps-blue"
              />
              <span className="text-sm font-medium text-gray-300">
                {param.title}
              </span>
            </label>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {param.title}
              </label>
              <select className="input" defaultValue={param.options[0] || ''}>
                {param.options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      ))}

      <div>
        <label htmlFor="otherNotes" className="label">
          Other Notes
        </label>
        <input
          id="otherNotes"
          type="text"
          value={otherNotes}
          onChange={(e) => setOtherNotes(e.target.value)}
          className="input"
          placeholder="Enter any additional notes"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount Received
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              $
            </span>
            <input
              type="text"
              value={amountReceived}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100"
            />
          </div>
          <button
            type="button"
            onClick={calculateTax}
            className="px-3 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
            title={`Add ${taxRate}% Tax`}
          >
            <Calculator size={20} />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-3 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setSelectedPayment(method)}
              className={`py-2 px-4 rounded-md border ${
                selectedPayment === method
                  ? 'border-cps-red bg-red-900/20 text-cps-red'
                  : 'border-gray-600 hover:bg-gray-700'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpsellPreview;
