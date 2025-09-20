import React from 'react';
import { X, Download, Settings } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodesPerPage: number;
  onQrCodesPerPageChange: (value: number) => void;
  onDownload: () => void;
  isGenerating: boolean;
  totalQrCodes: number;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  qrCodesPerPage,
  onQrCodesPerPageChange,
  onDownload,
  isGenerating,
  totalQrCodes
}) => {
  if (!isOpen) return null;

  const totalPages = Math.ceil(totalQrCodes / qrCodesPerPage);
  const presetOptions = [4, 6, 9, 12, 16, 20];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">PDF Export Options</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              QR Codes per Page
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presetOptions.map(option => (
                <button
                  key={option}
                  onClick={() => onQrCodesPerPageChange(option)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                    qrCodesPerPage === option
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <input
                type="range"
                min="1"
                max="25"
                value={qrCodesPerPage}
                onChange={(e) => onQrCodesPerPageChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span className="font-medium">{qrCodesPerPage}</span>
                <span>25</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Total QR Codes:</span>
                <span className="font-medium">{totalQrCodes}</span>
              </div>
              <div className="flex justify-between">
                <span>QR Codes per Page:</span>
                <span className="font-medium">{qrCodesPerPage}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1">
                <span>Total Pages:</span>
                <span className="font-medium">{totalPages}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDownload}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};