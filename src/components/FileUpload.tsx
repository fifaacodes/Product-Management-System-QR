import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { FileEntry } from '../types';
import { saveFileEntry } from '../utils/storage';
import { parseExcelFile } from '../utils/excelParser';
import { ProductData } from '../types';

interface FileUploadProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onBack, onSuccess }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls'
    ];
    
    const isValid = validTypes.some(type => 
      file.type === type || file.name.toLowerCase().endsWith(type)
    );
    
    if (!isValid) {
      setError('Please upload a valid Excel file (.xlsx or .xls)');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        handleFileProcess(file);
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        handleFileProcess(file);
      }
    }
  };

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const excelData = await parseExcelFile(file);
      
      if (excelData.length === 0) {
        throw new Error('The Excel file appears to be empty or has no valid data.');
      }
      
      // Convert to ProductData with unique IDs
      const productData: ProductData[] = excelData.map((row, index) => ({
        id: `product-${Date.now()}-${index}`,
        ...row
      }));
      
      // Create file entry
      const fileEntry: FileEntry = {
        id: `file-${Date.now()}`,
        name: fileName.trim() || file.name.replace(/\.[^/.]+$/, ''),
        type: 'excel',
        createdAt: new Date(),
        updatedAt: new Date(),
        data: productData,
        versions: []
      };
      
      saveFileEntry(fileEntry);
      onSuccess();
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Failed to process the Excel file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Excel File</h2>
          <p className="text-gray-600">Upload your Excel file to generate QR codes for each product</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Name (Optional)
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter custom name or leave blank to use file name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isLoading ? 'Processing your file...' : 'Upload Excel File'}
            </h3>
            <p className="text-sm text-gray-600">
              Drag and drop your Excel file here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports .xlsx and .xls files (max 10MB)
            </p>
          </div>
          
          {!isLoading && (
            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Excel Files Only</span>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};