import React from 'react';
import { MapPin, Users, CheckCircle, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="text-cps-blue" />
            <h3 className="text-lg font-medium text-white">Active Routes</h3>
          </div>
          <p className="text-2xl font-bold text-white">12</p>
          <p className="text-sm text-gray-400">4 in progress</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-cps-yellow" />
            <h3 className="text-lg font-medium text-white">Team Members</h3>
          </div>
          <p className="text-2xl font-bold text-white">8</p>
          <p className="text-sm text-gray-400">6 active today</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-cps-green" />
            <h3 className="text-lg font-medium text-white">Completed</h3>
          </div>
          <p className="text-2xl font-bold text-white">45</p>
          <p className="text-sm text-gray-400">Today's total</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-cps-red" />
            <h3 className="text-lg font-medium text-white">Issues</h3>
          </div>
          <p className="text-2xl font-bold text-white">2</p>
          <p className="text-sm text-gray-400">Require attention</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <p className="text-gray-400">Loading activity...</p>
        </div>
      </div>

      {/* Route Overview */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Route Overview</h3>
        <div className="space-y-4">
          <p className="text-gray-400">Loading routes...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;