import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Calendar, Edit3, Trash2, Eye, Download } from 'lucide-react';
import { FileEntry } from '../types';
import { getFileEntries, deleteFileEntry } from '../utils/storage';

interface DashboardProps {
  onFileSelect: (file: FileEntry) => void;
  onEditFile: (file: FileEntry) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onFileSelect, onEditFile }) => {
  const [files, setFiles] = useState<FileEntry[]>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    const fileEntries = getFileEntries();
    setFiles(fileEntries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteFileEntry(id);
      loadFiles();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-6">
            <FileSpreadsheet className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Files Yet</h2>
          <p className="text-gray-600 mb-6">Start by adding an Excel file or creating raw data</p>
          <div className="text-sm text-gray-500">
            Use the buttons in the top navigation to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Files</h2>
          <p className="text-gray-600">Manage your uploaded Excel files and raw data entries</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              <div className={`h-2 ${file.type === 'excel' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      file.type === 'excel' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <FileSpreadsheet className={`w-5 h-5 ${
                        file.type === 'excel' ? 'text-green-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate max-w-[150px]" title={file.name}>
                        {file.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        file.type === 'excel' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {file.type === 'excel' ? 'Excel' : 'Raw Data'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(file.createdAt)}</span>
                  </div>
                  {file.updatedAt.getTime() !== file.createdAt.getTime() && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Edit3 className="w-4 h-4" />
                      <span>Updated: {formatDate(file.updatedAt)}</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{file.data.length}</span> products
                    {file.versions.length > 0 && (
                      <span className="ml-2 text-blue-600">
                        • {file.versions.length} version{file.versions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => onFileSelect(file)}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => onEditFile(file)}
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};