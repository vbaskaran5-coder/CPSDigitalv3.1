import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from '../../lib/localStorage';

interface UpsellMenu {
  id: number;
  title: string;
  description: string;
}

const UpsellMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState<UpsellMenu[]>([]);

  useEffect(() => {
    const savedMenus = getStorageItem(STORAGE_KEYS.UPSELL_MENUS, []);
    setMenus(savedMenus);
  }, []);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this upsell menu?')) {
      const updatedMenus = menus.filter((menu) => menu.id !== id);
      setMenus(updatedMenus);
      setStorageItem(STORAGE_KEYS.UPSELL_MENUS, updatedMenus);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Upsell Menus</h2>
        <button
          onClick={() => navigate('/business-panel/upsell-menu/add')}
          className="bg-cps-blue text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 px-4 py-2"
        >
          <Plus size={16} />
          Add Upsell
        </button>
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="space-y-2">
          {menus.length > 0 ? (
            menus.map((menu) => (
              <div
                key={menu.id}
                className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md"
              >
                <div>
                  <p className="font-medium text-white">{menu.title}</p>
                  <p className="text-sm text-gray-400">{menu.description}</p>
                </div>
                <button
                  onClick={() => handleDelete(menu.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">
              No upsell menus created yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpsellMenuPage;
