import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Eye, Edit, Trash2, Download, Plus, Clock } from 'lucide-react';
import type { ProductFile, ProductData } from '../types';
import { SupabaseStorage } from '../utils/supabaseStorage';
import { ProductTable } from './ProductTable';
import { generatePDF } from '../utils/pdfGenerator';
import type { User } from '@supabase/supabase-js';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [files, setFiles] = useState<ProductFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProductFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState<string | null>(null);
  const [versions, setVersions] = useState<Array<{ version: number; data: ProductData[]; createdAt: Date }>>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const loadedFiles = await SupabaseStorage.getFiles();
      setFiles(loadedFiles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (file: ProductFile) => {
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleDelete = async (fileId: string) => {
    try {
      await SupabaseStorage.deleteFile(fileId);
      await loadFiles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDownloadPDF = (file: ProductFile) => {
    const qrCodes = file.data.map(product => ({
      id: product.id || '',
      name: product.name || '',
      price: product.price || 0
    }));
    const codesPerPage = 12;
    generatePDF(file.data, qrCodes, codesPerPage);
  };

  const handleShowVersions = async (fileId: string) => {
    try {
      const fileVersions = await SupabaseStorage.getFileVersions(fileId);
      setVersions(fileVersions);
      setShowVersions(fileId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={loadFiles}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (showPreview && selectedFile) {
    return (
      <ProductTable
        file={selectedFile}
        onBack={() => {
          setShowPreview(false);
          setSelectedFile(null);
          loadFiles(); // Reload files in case of updates
        }}
      />
    );
  }

  if (showVersions) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">File Versions</h2>
          <button
            onClick={() => {
              setShowVersions(null);
              setVersions([]);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="space-y-4">
          {versions.map((version, index) => (
            <div key={version.version} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">
                    Version {version.version} {index === 0 && '(Previous)'}
                  </h3>
                </div>
                <span className="text-sm text-gray-500">
                  {version.createdAt.toLocaleDateString()} at {version.createdAt.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Contains {version.data.length} products
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      {version.data.length > 0 && Object.keys(version.data[0]).map((key) => (
                        <th key={key} className="text-left py-2 px-4 font-medium text-gray-700">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {version.data.slice(0, 3).map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {Object.values(row).map((value, cellIdx) => (
                          <td key={cellIdx} className="py-2 px-4 text-gray-600">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {version.data.length > 3 && (
                  <p className="text-sm text-gray-500 mt-2">
                    ... and {version.data.length - 3} more rows
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your product files and generate QR codes</p>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No files yet</h3>
          <p className="text-gray-600 mb-6">Upload an Excel file or create raw data to get started</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <div key={file.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{file.name}</h3>
                    <p className="text-sm text-gray-500">{file.data.length} products</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created: {file.createdAt.toLocaleDateString()}
                    {file.updatedAt.getTime() !== file.createdAt.getTime() && (
                      <span className="ml-2 text-blue-600">
                        (Updated: {file.updatedAt.toLocaleDateString()})
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleView(file)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(file)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => handleShowVersions(file.id)}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    Versions
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this file?')) {
                        handleDelete(file.id);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};