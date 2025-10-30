import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';

interface Service {
  name: string;
  options: {
    frontOnly: boolean;
    backOnly: boolean;
    lockedGate: boolean;
    sprinkler: boolean;
    springTreatment?: boolean;
    fallTreatment?: boolean;
  };
  amount: string;
  prepaid: boolean;
}

interface UpsellMenuProps {
  onClose: () => void;
  onSubmit: (services: Service[]) => void;
}

const serviceNotes = {
  'Star Plan Pro': 'Includes core aeration, overseeding, and fertilization. Helps establish a thicker, healthier lawn.',
  'Lawn Rejuvenation': 'Comprehensive treatment including dethatching, aeration, and overseeding to restore lawn health.',
  'Dethatching': 'Removes dead grass and organic matter buildup to improve nutrient absorption.',
  'Grub Control': 'Preventive treatment against grub damage, protecting grass roots.'
};

const UpsellMenu: React.FC<UpsellMenuProps> = ({ onClose, onSubmit }) => {
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [services, setServices] = useState<Service[]>([
    {
      name: 'Star Plan Pro',
      options: {
        frontOnly: false,
        backOnly: false,
        lockedGate: false,
        sprinkler: false
      },
      amount: '0.00',
      prepaid: true
    },
    {
      name: 'Lawn Rejuvenation',
      options: {
        frontOnly: false,
        backOnly: false,
        lockedGate: false,
        sprinkler: false
      },
      amount: '0.00',
      prepaid: true
    },
    {
      name: 'Dethatching',
      options: {
        frontOnly: false,
        backOnly: false,
        lockedGate: false,
        sprinkler: false
      },
      amount: '0.00',
      prepaid: false
    },
    {
      name: 'Grub Control',
      options: {
        frontOnly: false,
        backOnly: false,
        lockedGate: false,
        springTreatment: false,
        fallTreatment: false
      },
      amount: '0.00',
      prepaid: false
    }
  ]);

  const handleAmountChange = (serviceIndex: number, value: string) => {
    value = value.replace(/[^\d.]/g, '');
    
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts[1];
    }
    
    if (value.includes('.')) {
      const [whole, decimal] = value.split('.');
      value = `${whole}.${decimal.slice(0, 2)}`;
    }

    setServices(prev => prev.map((service, idx) => {
      if (idx === serviceIndex) {
        return { ...service, amount: value };
      }
      return service;
    }));
  };

  const calculateTax = (serviceIndex: number) => {
    setServices(prev => prev.map((service, idx) => {
      if (idx === serviceIndex) {
        const amount = parseFloat(service.amount) || 0;
        const withTax = amount * 1.05;
        return { ...service, amount: withTax.toFixed(2) };
      }
      return service;
    }));
  };

  const handleSubmit = () => {
    const activeServices = services.filter(service => 
      selectedServices.has(service.name)
    );
    onSubmit(activeServices);
  };

  const toggleService = (serviceName: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceName)) {
      newSelected.delete(serviceName);
    } else {
      newSelected.add(serviceName);
    }
    setSelectedServices(newSelected);
  };

  const toggleOption = (serviceIndex: number, option: string) => {
    setServices(prev => prev.map((service, idx) => {
      if (idx === serviceIndex) {
        return {
          ...service,
          options: {
            ...service.options,
            [option]: !service.options[option]
          }
        };
      }
      return service;
    }));
  };

  const handlePrepaidToggle = (serviceIndex: number) => {
    setServices(prev => prev.map((service, idx) => {
      if (idx === serviceIndex) {
        const newPrepaid = !service.prepaid;
        return {
          ...service,
          prepaid: newPrepaid
        };
      }
      return service;
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md m-4 flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-100">Select Services</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full text-gray-400 hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {services.map((service, index) => (
            <div
              key={service.name}
              className={`p-4 rounded-lg transition-colors ${
                selectedServices.has(service.name)
                  ? 'bg-gray-700'
                  : 'bg-gray-700/50 hover:bg-gray-700/70'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedServices.has(service.name)}
                  onChange={() => toggleService(service.name)}
                  className="mt-1 rounded border-gray-600 bg-gray-700 text-cps-red focus:ring-cps-red"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-100">{service.name}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{serviceNotes[service.name]}</p>

                  {selectedServices.has(service.name) && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Amount (inc tax)
                        </label>
                        <div className="flex gap-2">
                          <div className="currency-input flex-1">
                            <span>$</span>
                            <input
                              type="text"
                              value={service.amount}
                              onChange={(e) => handleAmountChange(index, e.target.value)}
                              className="input"
                              placeholder="0.00"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => calculateTax(index)}
                            className="px-3 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors text-gray-300"
                            title="Add 5% tax"
                          >
                            <Calculator size={20} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={service.options.frontOnly}
                              onChange={() => toggleOption(index, 'frontOnly')}
                              className="rounded border-gray-600 bg-gray-700 text-cps-red focus:ring-cps-red"
                            />
                            <span className="text-gray-200">Front Only</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={service.options.backOnly}
                              onChange={() => toggleOption(index, 'backOnly')}
                              className="rounded border-gray-600 bg-gray-700 text-cps-red focus:ring-cps-red"
                            />
                            <span className="text-gray-200">Back Only</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={service.options.lockedGate}
                              onChange={() => toggleOption(index, 'lockedGate')}
                              className="rounded border-gray-600 bg-gray-700 text-cps-red focus:ring-cps-red"
                            />
                            <span className="text-gray-200">Locked Gate</span>
                          </label>
                          {service.name !== 'Grub Control' && (
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={service.options.sprinkler}
                                onChange={() => toggleOption(index, 'sprinkler')}
                                className="rounded border-gray-600 bg-gray-700 text-cps-red focus:ring-cps-red"
                              />
                              <span className="text-gray-200">Sprinkler</span>
                            </label>
                          )}
                        </div>

                        {service.name === 'Grub Control' && (
                          <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={service.options.springTreatment}
                                onChange={() => toggleOption(index, 'springTreatment')}
                                className="rounded border-gray-600 bg-gray-700 text-cps-red focus:ring-cps-red"
                              />
                              <span className="text-gray-200">Spring Treatment</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={service.options.fallTreatment}
                                onChange={() => toggleOption(index, 'fallTreatment')}
                                className="rounded border-gray-600 bg-gray-700 text-cps-red focus:ring-cps-red"
                              />
                              <span className="text-gray-200">Fall Treatment</span>
                            </label>
                          </div>
                        )}
                      </div>

                      {service.name === 'Dethatching' || service.name === 'Grub Control' ? (
                        <div>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={service.prepaid}
                              onChange={() => handlePrepaidToggle(index)}
                              className="rounded border-gray-600 bg-gray-700 text-cps-red focus:ring-cps-red"
                            />
                            <span className="text-gray-200">Prepaid</span>
                          </label>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={service.prepaid}
                              disabled
                              className="rounded border-gray-600 bg-gray-700 text-cps-red focus:ring-cps-red cursor-not-allowed opacity-50"
                            />
                            <span className="text-gray-400">Prepaid Required</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 bg-cps-red text-white rounded-md hover:bg-[#dc2f3d] transition-colors"
          >
            Add Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpsellMenu;