import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Eye, Save, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import UpsellPreview from './UpsellPreview';
import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from '../../lib/localStorage';
import {
  ConsoleProfile,
  UpsellMenu,
  Service,
  ServiceLink,
  Query,
} from '../../types';

type PaymentType = 'Pre-Book or Pre-Pay' | 'Pre-Book only' | 'Pre-Pay only';
type TaxType = 'Tax Deducted' | 'Tax inc. on Cash' | 'Tax inc.';

const AddUpsell: React.FC = () => {
  const { profileId, seasonId } = useParams<{
    profileId: string;
    seasonId: string;
  }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>(
    'Pre-Book or Pre-Pay'
  );
  const [taxType, setTaxType] = useState<TaxType>('Tax Deducted');
  const [eqPercentage, setEqPercentage] = useState('0');
  const [prePayCommissionPercentage, setPrePayCommissionPercentage] =
    useState('10');
  const [preBookCommission, setPreBookCommission] = useState('5');

  const [allServices, setAllServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<ConsoleProfile | null>(null);
  const [serviceLinks, setServiceLinks] = useState<ServiceLink[]>([
    { serviceId: 0, outputSeasonId: 0 },
  ]);

  useEffect(() => {
    const profiles: ConsoleProfile[] = getStorageItem(
      STORAGE_KEYS.CONSOLE_PROFILES,
      []
    );
    const currentProfile = profiles.find((p) => p.id.toString() === profileId);
    setProfile(currentProfile || null);

    const services = getStorageItem(STORAGE_KEYS.SERVICES, []);
    setAllServices(services);
  }, [profileId]);

  const handleServiceLinkChange = (
    index: number,
    field: keyof ServiceLink,
    value: string
  ) => {
    const updatedLinks = [...serviceLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: parseInt(value, 10) || 0,
    };
    setServiceLinks(updatedLinks);

    if (
      index === serviceLinks.length - 1 &&
      updatedLinks[index].serviceId &&
      updatedLinks[index].outputSeasonId
    ) {
      setServiceLinks([...updatedLinks, { serviceId: 0, outputSeasonId: 0 }]);
    }
  };

  const handleRemoveServiceLink = (index: number) => {
    if (serviceLinks.length > 1) {
      const updatedLinks = serviceLinks.filter((_, i) => i !== index);
      setServiceLinks(updatedLinks);
    }
  };

  const handleSave = () => {
    if (!title) {
      alert('Please enter a title for the upsell menu.');
      return;
    }

    const newMenu: UpsellMenu = {
      id: Date.now(),
      title,
      description,
      queries: [],
      paymentType,
      taxType,
      eqPercentage: parseFloat(eqPercentage) || 0,
      prePayCommissionPercentage: parseFloat(prePayCommissionPercentage) || 0,
      preBookCommission: parseFloat(preBookCommission) || 0,
      serviceLinks: serviceLinks.filter(
        (link) => link.serviceId && link.outputSeasonId
      ),
    };

    const profiles: ConsoleProfile[] = getStorageItem(
      STORAGE_KEYS.CONSOLE_PROFILES,
      []
    );
    const updatedProfiles = profiles.map((p) => {
      if (p.id.toString() === profileId) {
        const updatedSeasons = (p.seasons || []).map((s) => {
          if (s.id.toString() === seasonId) {
            return {
              ...s,
              upsells: [...(s.upsells || []), newMenu],
            };
          }
          return s;
        });
        return { ...p, seasons: updatedSeasons };
      }
      return p;
    });

    setStorageItem(STORAGE_KEYS.CONSOLE_PROFILES, updatedProfiles);
    navigate(
      `/business-panel/console-profiles/${profileId}/edit-season/${seasonId}`
    );
  };

  const selectedServicesForPreview = serviceLinks
    .map((link) => allServices.find((s) => s.id === link.serviceId))
    .filter((s): s is Service => Boolean(s));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              navigate(
                `/business-panel/console-profiles/${profileId}/edit-season/${seasonId}`
              )
            }
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="text-gray-400" />
          </button>
          <h2 className="text-2xl font-bold text-white">Add Upsell Menu</h2>
        </div>
        <button
          onClick={handleSave}
          className="bg-cps-green text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 px-4 py-2"
        >
          <Save size={16} />
          Save Upsell
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Form Builder */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div>
            <label htmlFor="title" className="label">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="e.g., Spring Cleanup"
            />
          </div>
          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input h-24 resize-none"
              placeholder="Enter a brief description for the upsell menu."
            />
          </div>

          <div>
            <label htmlFor="paymentType" className="label">
              Payment Type
            </label>
            <select
              id="paymentType"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value as PaymentType)}
              className="input"
            >
              <option>Pre-Book or Pre-Pay</option>
              <option>Pre-Book only</option>
              <option>Pre-Pay only</option>
            </select>
          </div>

          <div>
            <label htmlFor="taxType" className="label">
              Tax Calculation
            </label>
            <select
              id="taxType"
              value={taxType}
              onChange={(e) => setTaxType(e.target.value as TaxType)}
              className="input"
            >
              <option>Tax Deducted</option>
              <option>Tax inc. on Cash</option>
              <option>Tax inc.</option>
            </select>
          </div>

          <div>
            <label htmlFor="eqPercentage" className="label">
              % Towards EQ
            </label>
            <input
              id="eqPercentage"
              type="number"
              value={eqPercentage}
              onChange={(e) => setEqPercentage(e.target.value)}
              className="input"
              placeholder="e.g., 0"
            />
          </div>

          {(paymentType === 'Pre-Book or Pre-Pay' ||
            paymentType === 'Pre-Pay only') && (
            <div>
              <label htmlFor="prePayCommissionPercentage" className="label">
                Pre-Pay Commission Percentage
              </label>
              <input
                id="prePayCommissionPercentage"
                type="number"
                value={prePayCommissionPercentage}
                onChange={(e) => setPrePayCommissionPercentage(e.target.value)}
                className="input"
                placeholder="e.g., 10"
              />
            </div>
          )}

          {(paymentType === 'Pre-Book or Pre-Pay' ||
            paymentType === 'Pre-Book only') && (
            <div>
              <label htmlFor="preBookCommission" className="label">
                Pre-Book Commission $
              </label>
              <input
                id="preBookCommission"
                type="number"
                value={preBookCommission}
                onChange={(e) => setPreBookCommission(e.target.value)}
                className="input"
                placeholder="e.g., 5"
              />
            </div>
          )}

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-white mb-2">Services</h3>
            <div className="space-y-2">
              {serviceLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={link.serviceId}
                    onChange={(e) =>
                      handleServiceLinkChange(
                        index,
                        'serviceId',
                        e.target.value
                      )
                    }
                    className="input flex-1"
                  >
                    <option value={0}>-- Select a Service --</option>
                    {allServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={link.outputSeasonId}
                    onChange={(e) =>
                      handleServiceLinkChange(
                        index,
                        'outputSeasonId',
                        e.target.value
                      )
                    }
                    className="input flex-1"
                  >
                    <option value={0}>-- Select Output Season --</option>
                    {profile?.seasons?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {index < serviceLinks.length - 1 && (
                    <button
                      onClick={() => handleRemoveServiceLink(index)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Eye size={20} />
            Preview
          </h3>
          <UpsellPreview
            title={title}
            description={description}
            queries={[]}
            paymentType={paymentType}
            taxRate={13}
            services={selectedServicesForPreview}
          />
        </div>
      </div>
    </div>
  );
};

export default AddUpsell;
