import React, { useState } from 'react';
import { X, Calculator, Save } from 'lucide-react';
import { useJobs } from '../contexts/JobContext';

// Define interfaces locally for component props
interface Query {
  id: number;
  question: string;
  options: string[];
}

type PaymentType = 'Pre-Book or Pre-Pay' | 'Pre-Book only' | 'Pre-Pay only';

interface UpsellMenu {
  id: number;
  title: string;
  description: string;
  queries: Query[];
  paymentType: PaymentType;
  taxRate: number;
}

interface UpsellFormModalProps {
  menu: UpsellMenu;
  client: any;
  onClose: () => void;
}

const UpsellFormModal: React.FC<UpsellFormModalProps> = ({
  menu,
  client,
  onClose,
}) => {
  const { addJob } = useJobs();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [amountReceived, setAmountReceived] = useState('0.00');
  const [selectedPayment, setSelectedPayment] = useState('');

  const handleAnswerChange = (queryId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [queryId]: value }));
  };

  const handleSaveContract = () => {
    const newContract = {
      // Client Info
      customerName: client.customerName,
      address: client.address,
      phone: client.phone,
      email: client.email,
      routeNumber: client.routeNumber,

      // Upsell Info
      isContract: true,
      contractTitle: menu.title,
      price: parseFloat(amountReceived),
      paymentMethod: selectedPayment,
      notes: JSON.stringify(answers),
      upsellMenuId: menu.id, // Save the menu ID

      // Default job fields
      completed: '',
      status: 'pending',
    };

    addJob(newContract);
    onClose();
  };

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
    const withTax = baseAmount * (1 + menu.taxRate / 100);
    setAmountReceived(withTax.toFixed(2));
  };

  const prePayMethods = ['Cash', 'Cheque', 'ETF', 'CCD'];
  const preBookMethods = ['IOS'];
  let paymentMethods: string[] = [];

  if (menu.paymentType === 'Pre-Book or Pre-Pay') {
    paymentMethods = [...prePayMethods, ...preBookMethods];
  } else if (menu.paymentType === 'Pre-Pay only') {
    paymentMethods = prePayMethods;
  } else if (menu.paymentType === 'Pre-Book only') {
    paymentMethods = preBookMethods;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-100">{menu.title}</h2>
          <p className="text-gray-400">{menu.description}</p>

          {menu.queries.map((query) => (
            <div key={query.id}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {query.question}
              </label>
              <select
                className="input"
                onChange={(e) =>
                  handleAnswerChange(query.question, e.target.value)
                }
              >
                {query.options.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}

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
                title={`Add ${menu.taxRate}% Tax`}
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

          <button
            onClick={handleSaveContract}
            className="w-full bg-cps-green text-white py-3 rounded-md hover:bg-green-700 transition-colors font-medium text-lg mt-4 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Contract
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpsellFormModal;
