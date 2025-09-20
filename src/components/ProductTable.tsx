import React, { useState, useEffect } from 'react';
import { Download, FileDown, Settings, ArrowLeft, Edit3 } from 'lucide-react';
import { ProductData, FileEntry } from '../types';
import { generateQRCode } from '../utils/qrGenerator';
import { generateQRCodesPDF } from '../utils/pdfGenerator';
import { QRCodeModal } from './QRCodeModal';
import { updateFileEntry } from '../utils/storage';

interface ProductTableProps {
  file: FileEntry;
  onBack: () => void;
  onEdit: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ file, onBack, onEdit }) => {
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [showPDFOptions, setShowPDFOptions] = useState(false);
  const [qrCodesPerPage, setQrCodesPerPage] = useState(9);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<ProductData[]>(file.data);

  useEffect(() => {
    generateAllQRCodes();
  }, [file.data]);

  useEffect(() => {
    setEditedData(file.data);
  }, [file.data]);

  const generateAllQRCodes = async () => {
    if (file.data.length === 0) return;
    
    setIsGeneratingQR(true);
    const newQrCodes: Record<string, string> = {};
    
    for (const product of file.data) {
      try {
        const productUrl = `${window.location.origin}/product/${product.id}`;
        const qrCodeUrl = await generateQRCode(productUrl);
        newQrCodes[product.id] = qrCodeUrl;
      } catch (error) {
        console.error('Error generating QR code for product:', product.id, error);
      }
    }
    
    setQrCodes(newQrCodes);
    setIsGeneratingQR(false);
  };

  const handleSaveChanges = () => {
    updateFileEntry(file.id, editedData, 'Updated product data');
    setEditingRow(null);
    // Refresh the component by calling onBack and then re-selecting
    window.location.reload();
  };

  const handleCancelEdit = () => {
    setEditedData(file.data);
    setEditingRow(null);
  };

  const updateRowValue = (rowId: string, field: string, value: string) => {
    setEditedData(editedData.map(row => 
      row.id === rowId ? { ...row, [field]: value } : row
    ));
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const qrCodeData = file.data.map(product => ({
        id: product.id,
        qrCodeUrl: qrCodes[product.id] || '',
        productName: product['Product Name'] || product['Name'] || `Product ${product.id}`
      }));
      
      const pdf = generateQRCodesPDF({
        qrCodesPerPage,
        qrCodes: qrCodeData
      });
      
      pdf.save('qr-codes.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
      setShowPDFOptions(false);
    }
  };

  if (file.data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="text-center py-12">
            <p className="text-gray-500">No data to display in this file.</p>
          </div>
        </div>
      </div>
    );
  }

  const columns = Object.keys(file.data[0]).filter(key => key !== 'id');
  const hasChanges = JSON.stringify(editedData) !== JSON.stringify(file.data);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{file.name}</h2>
              <p className="text-gray-600">
                {file.data.length} products • Created {file.createdAt.toLocaleDateString()}
                {file.versions.length > 0 && ` • ${file.versions.length} version${file.versions.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex space-x-3">
              {hasChanges && (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span>Save Changes</span>
                  </button>
                </>
              )}
              <button
                onClick={onEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Structure</span>
              </button>
              <button
                onClick={() => setShowPDFOptions(true)}
                disabled={isGeneratingQR || Object.keys(qrCodes).length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Codes PDF</span>
              </button>
            </div>
          </div>
        </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(column => (
                  <th
                    key={column}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {editedData.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map(column => (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingRow === row.id ? (
                        <input
                          type="text"
                          value={row[column] || ''}
                          onChange={(e) => updateRowValue(row.id, column, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        row[column]
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isGeneratingQR ? (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : qrCodes[row.id] ? (
                      <img
                        src={qrCodes[row.id]}
                        alt={`QR Code for ${row.id}`}
                        className="w-16 h-16 cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => window.open(`/product/${row.id}`, '_blank')}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No QR</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setEditingRow(editingRow === row.id ? null : row.id)}
                      className={`text-sm px-3 py-1 rounded transition-colors ${
                        editingRow === row.id
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {editingRow === row.id ? 'Done' : 'Edit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPDFOptions && (
        <QRCodeModal
          isOpen={showPDFOptions}
          onClose={() => setShowPDFOptions(false)}
          qrCodesPerPage={qrCodesPerPage}
          onQrCodesPerPageChange={setQrCodesPerPage}
          onDownload={handleDownloadPDF}
          isGenerating={isGeneratingPDF}
          totalQrCodes={file.data.length}
        />
      )}
      </div>
    </div>
  );
};