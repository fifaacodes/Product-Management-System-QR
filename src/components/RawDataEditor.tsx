import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, Edit3 } from 'lucide-react';
import { ProductData, RawDataField, FileEntry } from '../types';
import { saveFileEntry, updateFileEntry } from '../utils/storage';

interface RawDataEditorProps {
  onBack: () => void;
  editingFile?: FileEntry | null;
}

export const RawDataEditor: React.FC<RawDataEditorProps> = ({ onBack, editingFile }) => {
  const [fileName, setFileName] = useState('');
  const [fields, setFields] = useState<RawDataField[]>([
    { id: '1', name: 'Product Name', type: 'text' },
    { id: '2', name: 'Price', type: 'number' },
    { id: '3', name: 'Description', type: 'text' }
  ]);
  const [rows, setRows] = useState<ProductData[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingFile) {
      setFileName(editingFile.name);
      
      // Extract fields from existing data
      if (editingFile.data.length > 0) {
        const existingFields = Object.keys(editingFile.data[0])
          .filter(key => key !== 'id')
          .map((key, index) => ({
            id: `field-${index}`,
            name: key,
            type: 'text' as const
          }));
        setFields(existingFields);
      }
      
      setRows(editingFile.data);
    }
  }, [editingFile]);

  const addField = () => {
    const newField: RawDataField = {
      id: `field-${Date.now()}`,
      name: `Field ${fields.length + 1}`,
      type: 'text'
    };
    setFields([...fields, newField]);
    
    // Add empty value for this field in all existing rows
    setRows(rows.map(row => ({ ...row, [newField.name]: '' })));
  };

  const removeField = (fieldId: string) => {
    const fieldToRemove = fields.find(f => f.id === fieldId);
    if (!fieldToRemove) return;
    
    setFields(fields.filter(f => f.id !== fieldId));
    
    // Remove this field from all rows
    setRows(rows.map(row => {
      const { [fieldToRemove.name]: removed, ...rest } = row;
      return rest;
    }));
  };

  const updateField = (fieldId: string, updates: Partial<RawDataField>) => {
    const oldField = fields.find(f => f.id === fieldId);
    if (!oldField) return;
    
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
    
    // If field name changed, update all rows
    if (updates.name && updates.name !== oldField.name) {
      setRows(rows.map(row => {
        const { [oldField.name]: value, ...rest } = row;
        return { ...rest, [updates.name!]: value };
      }));
    }
  };

  const addRow = () => {
    const newRow: ProductData = {
      id: `row-${Date.now()}`,
      ...fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
    };
    setRows([...rows, newRow]);
  };

  const removeRow = (rowId: string) => {
    setRows(rows.filter(r => r.id !== rowId));
  };

  const updateRowValue = (rowId: string, fieldName: string, value: any) => {
    setRows(rows.map(row => 
      row.id === rowId ? { ...row, [fieldName]: value } : row
    ));
  };

  const handleSave = async () => {
    if (!fileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    if (rows.length === 0) {
      alert('Please add at least one row of data');
      return;
    }

    setIsSaving(true);

    try {
      if (editingFile) {
        // Update existing file
        updateFileEntry(editingFile.id, rows, 'Updated via raw data editor');
      } else {
        // Create new file
        const newFile: FileEntry = {
          id: `file-${Date.now()}`,
          name: fileName,
          type: 'raw',
          createdAt: new Date(),
          updatedAt: new Date(),
          data: rows,
          versions: []
        };
        saveFileEntry(newFile);
      }
      
      onBack();
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {editingFile ? 'Edit Raw Data' : 'Create Raw Data'}
              </h2>
              <p className="text-gray-600">
                {editingFile ? 'Modify your existing data' : 'Create a new dataset with custom fields and rows'}
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* File Name Input */}
          <div className="p-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name..."
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Fields Configuration */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Fields</h3>
              <button
                onClick={addField}
                className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Field</span>
              </button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fields.map((field) => (
                <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(field.id, { name: e.target.value })}
                      className="font-medium bg-transparent border-none outline-none text-gray-900 flex-1"
                    />
                    <button
                      onClick={() => removeField(field.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Data Table */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Data</h3>
              <button
                onClick={addRow}
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Row</span>
              </button>
            </div>

            {rows.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No data rows yet. Click "Add Row" to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {fields.map((field) => (
                        <th
                          key={field.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {field.name}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        {fields.map((field) => (
                          <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                            <input
                              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                              value={row[field.name] || ''}
                              onChange={(e) => updateRowValue(row.id, field.name, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => removeRow(row.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};