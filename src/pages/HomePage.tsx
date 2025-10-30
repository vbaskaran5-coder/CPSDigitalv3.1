import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  LayoutDashboard,
  Database,
  Shield,
} from 'lucide-react';
import { AuthService } from '../services/auth.service';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col justify-center items-center p-4">
      <div className="text-center mb-12">
        <img
          src="/logo.svg"
          alt="Canadian Property Stars"
          className="w-32 h-32 mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold mb-2 text-cps-red">
          Canadian Property Stars
        </h1>
        <p className="text-gray-400">Digital Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <button
          onClick={() => navigate('/logsheet/signin')}
          className="group bg-gradient-to-br from-cps-red to-red-700 hover:from-red-700 hover:to-cps-red p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          <ClipboardList className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Digital Logsheet</h2>
          <p className="text-gray-200 text-sm">
            Track your jobs, manage bookings, and record daily work
          </p>
        </button>

        <button
          onClick={() => navigate('/route-manager/login')}
          className="group bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          <LayoutDashboard className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Route Manager</h2>
          <p className="text-gray-200 text-sm">
            Manage routes, assign workers, and oversee operations
          </p>
        </button>

        <button
          onClick={() => navigate('/console/login')}
          className="group bg-gradient-to-br from-cps-green to-green-700 hover:from-green-700 hover:to-cps-green p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          <Database className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Admin Console</h2>
          <p className="text-gray-200 text-sm">
            Manage bookings, workers, payouts, and system configuration
          </p>
        </button>

        <button
          onClick={() => navigate('/business-panel/login')}
          className="group bg-gradient-to-br from-yellow-600 to-yellow-800 hover:from-yellow-700 hover:to-yellow-900 p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          <Shield className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Business Panel</h2>
          <p className="text-gray-200 text-sm">
            Configure system settings, territories, and master data
          </p>
        </button>
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Digital Management System v2.0.0</p>
        <p className="mt-1">Powered by Supabase</p>
      </div>
    </div>
  );
};

export default HomePage;
