// src/pages/BusinessPanel/ConsoleProfiles.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConsoleProfile, ConfiguredSeason } from '../../types';
import {
  REGIONS,
  getRegionById,
  defaultPayoutLogicSettings,
} from '../../lib/hardcodedData';
import { ConsoleProfileService } from '../../services/database.service';

const ConsoleProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<ConsoleProfile[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProfile, setNewProfile] = useState({
    title: '',
    username: '',
    password: '',
    region: REGIONS[0].id,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await ConsoleProfileService.getAll();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load console profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewProfile((prev) => ({ ...prev, [name]: value as any }));
  };

  const handleAddProfile = async () => {
    if (
      newProfile.title &&
      newProfile.username &&
      newProfile.password &&
      newProfile.region
    ) {
      const regionData = getRegionById(newProfile.region);
      if (!regionData) {
        alert('Invalid region selected.');
        return;
      }

      const initialSeasons: ConfiguredSeason[] = regionData.seasons.map(
        (hs) => ({
          hardcodedId: hs.id,
          enabled: true,
          enabledUpsellIds: hs.availableUpsellIds,
          payoutLogic: hs.hasPayoutLogic
            ? defaultPayoutLogicSettings
            : undefined,
        })
      );

      try {
        await ConsoleProfileService.create({
          title: newProfile.title,
          username: newProfile.username,
          password: newProfile.password,
          region: newProfile.region,
          seasons: initialSeasons,
        });

        setNewProfile({
          title: '',
          username: '',
          password: '',
          region: REGIONS[0].id,
        });
        setIsAdding(false);
        await loadProfiles();
      } catch (error) {
        console.error('Failed to create console profile:', error);
        alert('Failed to create console profile. Please try again.');
      }
    } else {
      alert('Please fill out all fields.');
    }
  };

  const handleDeleteProfile = async (idToDelete: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this console profile? This cannot be undone.'
      )
    ) {
      try {
        await ConsoleProfileService.delete(idToDelete);
        await loadProfiles();
      } catch (error) {
        console.error('Failed to delete console profile:', error);
        alert('Failed to delete console profile. Please try again.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Console Profiles</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-cps-blue text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 px-4 py-2"
          >
            <Plus size={16} />
            Add Profile
          </button>
        )}
      </div>
      <div className="bg-gray-800 rounded-lg p-6">
        {isAdding && (
          <div className="mb-4 pb-4 border-b border-gray-700 space-y-4">
            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                name="title"
                value={newProfile.title}
                onChange={handleInputChange}
                placeholder="Title (e.g., Main Office)"
                className="input"
              />
              <input
                type="text"
                name="username"
                value={newProfile.username}
                onChange={handleInputChange}
                placeholder="Username"
                className="input"
              />
              <input
                type="password"
                name="password"
                value={newProfile.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="input"
              />
              <select
                name="region"
                value={newProfile.region}
                onChange={handleInputChange}
                className="input"
              >
                {REGIONS.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleAddProfile}
                className="bg-cps-green text-white rounded-md hover:bg-green-700 transition-colors flex-1 py-2"
              >
                Save
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors flex-1 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Profile List */}
        <div className="space-y-2">
          {loading ? (
            <p className="text-center text-gray-400 py-4">Loading profiles...</p>
          ) : profiles.length > 0 ? (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between bg-gray-700/50 p-3 rounded-md hover:bg-gray-700 transition-colors group"
              >
                <button
                  onClick={() =>
                    navigate(`/business-panel/console-profiles/${profile.id}`)
                  }
                  className="flex-1 text-left"
                >
                  <p className="font-medium text-white">{profile.title}</p>
                  <p className="text-sm text-gray-400">
                    {profile.username} ({profile.region})
                  </p>
                </button>
                <button
                  onClick={() => handleDeleteProfile(profile.id)}
                  className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-2"
                  title="Delete Profile"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">
              No console profiles created yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsoleProfiles;
