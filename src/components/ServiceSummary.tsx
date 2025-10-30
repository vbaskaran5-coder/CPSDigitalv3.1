import React from 'react';

interface ServiceSummaryProps {
  services: Array<{
    name: string;
    price: number;
    options: {
      frontOnly: boolean;
      backOnly: boolean;
      lockedGate: boolean;
      sprinkler: boolean;
      springTreatment?: boolean;
      fallTreatment?: boolean;
    };
    prepaid: boolean;
  }>;
}

const ServiceSummary: React.FC<ServiceSummaryProps> = ({ services }) => {
  if (!services?.length) return null;

  return (
    <div className="bg-gray-700/30 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-100 mb-3">Additional Services</h3>
      <div className="space-y-3">
        {services.map((service, index) => (
          <div key={index} className="border-b border-gray-600 last:border-0 pb-3 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-200">{service.name}</span>
              <span className="text-gray-300">${service.price.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              {(service.options.frontOnly || service.options.backOnly) && (
                <div>
                  Property: {service.options.frontOnly ? 'Front Only' : 'Back Only'}
                </div>
              )}
              {service.options.lockedGate && <div>Locked Gate</div>}
              {service.options.sprinkler && <div>Sprinkler System</div>}
              {service.options.springTreatment && <div>Spring Treatment</div>}
              {service.options.fallTreatment && <div>Fall Treatment</div>}
              {service.prepaid && <div>Prepaid</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceSummary;