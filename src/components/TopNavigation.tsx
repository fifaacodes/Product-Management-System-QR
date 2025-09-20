import React from 'react';
import { FileSpreadsheet, Plus, Home } from 'lucide-react';

interface TopNavigationProps {
  activeView: 'dashboard' | 'excel' | 'raw';
  onViewChange: (view: 'dashboard' | 'excel' | 'raw') => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Excel QR Manager</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <button
              onClick={() => onViewChange('excel')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'excel'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Add Excel File</span>
            </button>
            
            <button
              onClick={() => onViewChange('raw')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === 'raw'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Raw Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};