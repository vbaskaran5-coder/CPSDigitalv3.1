// src/pages/BusinessPanel/ConsoleProfileDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  ToggleLeft,
  ToggleRight,
  Settings,
} from 'lucide-react';
import {
  ConsoleProfile,
  ConfiguredSeason,
  PayoutLogicSettings,
} from '../../types';
import {
  REGIONS,
  ALL_UPSELLS,
  getRegionById,
  defaultPayoutLogicSettings,
} from '../../lib/hardcodedData';
import { ConsoleProfileService, ActiveSeasonService } from '../../services/database.service';

const ConsoleProfileDetail: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ConsoleProfile | null>(null);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileIdNum = parseInt(profileId || '0');
      const currentProfile = await ConsoleProfileService.getById(profileIdNum);

      if (currentProfile) {
        const activeSeason = await ActiveSeasonService.get(profileIdNum);
        setActiveSeasonId(activeSeason?.activeSeasonId || null);

        // Ensure seasons exist based on region, add if missing
        const regionData = getRegionById(currentProfile.region);
      if (regionData) {
        let profileUpdated = false;
        const currentSeasonIds = new Set(
          currentProfile.seasons.map((s) => s.hardcodedId)
        );
        const updatedSeasons = [...currentProfile.seasons];

        regionData.seasons.forEach((hardcodedSeason) => {
          if (!currentSeasonIds.has(hardcodedSeason.id)) {
            // Add missing season configuration
            updatedSeasons.push({
              hardcodedId: hardcodedSeason.id,
              enabled: true, // Default to enabled
              enabledUpsellIds: hardcodedSeason.availableUpsellIds, // Default all available upsells
              payoutLogic: hardcodedSeason.hasPayoutLogic
                ? defaultPayoutLogicSettings
                : undefined,
            });
            profileUpdated = true;
          } else {
            // Ensure existing seasons have payoutLogic if they should
            const existingSeason = updatedSeasons.find(
              (s) => s.hardcodedId === hardcodedSeason.id
            );
            if (
              existingSeason &&
              hardcodedSeason.hasPayoutLogic &&
              !existingSeason.payoutLogic
            ) {
              existingSeason.payoutLogic = defaultPayoutLogicSettings;
              profileUpdated = true;
            } else if (
              existingSeason &&
              !hardcodedSeason.hasPayoutLogic &&
              existingSeason.payoutLogic
            ) {
              // Remove payoutLogic if it shouldn't exist (e.g., Service type)
              delete existingSeason.payoutLogic;
              profileUpdated = true;
            }
          }
        });

        // Remove seasons that are no longer in the region's definition (optional cleanup)
        const validSeasonIds = new Set(regionData.seasons.map((s) => s.id));
        const finalSeasons = updatedSeasons.filter((s) =>
          validSeasonIds.has(s.hardcodedId)
        );
        if (finalSeasons.length !== updatedSeasons.length) {
          profileUpdated = true;
        }

        if (profileUpdated) {
          currentProfile.seasons = finalSeasons;
          await ConsoleProfileService.update(currentProfile.id, { seasons: finalSeasons });
        }
      }

        setProfile(currentProfile);

        const availableEnabledSeasons = currentProfile.seasons.filter(
          (cs) => cs.enabled
        );
        const currentActiveIsValid = activeSeasonId && availableEnabledSeasons.some(
          (cs) => cs.hardcodedId === activeSeasonId
        );

        if (!currentActiveIsValid && availableEnabledSeasons.length > 0) {
          const firstAvailableSeasonId = availableEnabledSeasons[0].hardcodedId;
          setActiveSeasonId(firstAvailableSeasonId);
          await ActiveSeasonService.set(currentProfile.id, firstAvailableSeasonId);
        } else if (
          !currentActiveIsValid &&
          availableEnabledSeasons.length === 0
        ) {
          setActiveSeasonId(null);
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeasonToggle = async (hardcodedId: string) => {
    if (profile) {
      try {
        const updatedSeasons = profile.seasons.map((s) =>
          s.hardcodedId === hardcodedId ? { ...s, enabled: !s.enabled } : s
        );
        await ConsoleProfileService.update(profile.id, { seasons: updatedSeasons });
        await loadProfile();
      } catch (error) {
        console.error('Failed to toggle season:', error);
      }
    }
  };

  const handleSetActiveSeason = async (hardcodedId: string) => {
    if (activeSeasonId !== hardcodedId && profile) {
      if (
        window.confirm(
          'Are you sure you want to change the active season for this profile?'
        )
      ) {
        try {
          await ActiveSeasonService.set(profile.id, hardcodedId);
          setActiveSeasonId(hardcodedId);
        } catch (error) {
          console.error('Failed to set active season:', error);
        }
      }
    }
  };

  if (loading) {
    return <div className="text-white p-6">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-white p-6">Profile not found.</div>;
  }

  const regionData = getRegionById(profile.region);
  const hardcodedSeasonsMap = new Map(
    regionData?.seasons.map((s) => [s.id, s])
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/business-panel/console-profiles')}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="text-gray-400" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.title}</h2>
            <p className="text-sm text-gray-400">Region: {profile.region}</p>
          </div>
        </div>
        {/* Removed overall Edit Profile button */}
      </div>

      {/* Seasons Section */}
      <div className="bg-gray-800 rounded-lg p-6 max-w-3xl mx-auto space-y-4">
        <h3 className="text-lg font-medium text-white mb-2">Seasons</h3>
        <p className="text-sm text-gray-400 mb-4">
          Toggle seasons on/off for this profile. Click the active season radio
          button to set the globally active season for users logged into this
          profile.
        </p>

        <div className="space-y-3">
          {profile.seasons?.map((configuredSeason) => {
            const hardcodedSeason = hardcodedSeasonsMap.get(
              configuredSeason.hardcodedId
            );
            if (!hardcodedSeason) return null; // Should not happen if data is consistent

            const isActive = activeSeasonId === configuredSeason.hardcodedId;

            return (
              <div
                key={configuredSeason.hardcodedId}
                className={`p-4 rounded-md transition-all border ${
                  isActive
                    ? 'bg-cps-blue/10 border-cps-blue'
                    : 'bg-gray-700/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Active Season Radio Button */}
                    <input
                      type="radio"
                      name="activeSeason"
                      checked={isActive}
                      onChange={() =>
                        handleSetActiveSeason(configuredSeason.hardcodedId)
                      }
                      disabled={!configuredSeason.enabled}
                      className={`form-radio h-5 w-5 ${
                        configuredSeason.enabled
                          ? 'text-cps-blue focus:ring-cps-blue cursor-pointer'
                          : 'text-gray-600 cursor-not-allowed'
                      }`}
                      title={
                        configuredSeason.enabled
                          ? 'Set as active season'
                          : 'Enable season first'
                      }
                    />
                    <div>
                      <p
                        className={`font-medium ${
                          configuredSeason.enabled
                            ? 'text-white'
                            : 'text-gray-500 line-through'
                        }`}
                      >
                        {hardcodedSeason.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {hardcodedSeason.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Edit Payout/Upsells Button */}
                    {hardcodedSeason.hasPayoutLogic &&
                      configuredSeason.enabled && (
                        <button
                          onClick={() =>
                            navigate(
                              `/business-panel/console-profiles/${profileId}/edit-season/${configuredSeason.hardcodedId}`
                            )
                          }
                          className="p-2 text-gray-400 hover:text-cps-blue rounded-full hover:bg-gray-600 transition-colors"
                          title="Edit Payout Logic & Upsells"
                        >
                          <Settings size={18} />
                        </button>
                      )}
                    {/* Enable/Disable Toggle */}
                    <button
                      onClick={() =>
                        handleSeasonToggle(configuredSeason.hardcodedId)
                      }
                      className={`p-1 rounded-full ${
                        configuredSeason.enabled
                          ? 'text-green-400 hover:text-green-300'
                          : 'text-gray-500 hover:text-gray-400'
                      }`}
                      title={
                        configuredSeason.enabled
                          ? 'Disable Season'
                          : 'Enable Season'
                      }
                    >
                      {configuredSeason.enabled ? (
                        <ToggleRight size={24} />
                      ) : (
                        <ToggleLeft size={24} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConsoleProfileDetail;
