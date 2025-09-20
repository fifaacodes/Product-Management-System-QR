import * as XLSX from 'xlsx';
import { ExcelRow } from '../types';

export const parseExcelFile = (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        resolve(jsonData as ExcelRow[]);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const generateExcelWithQR = (data: ExcelRow[], qrCodes: string[]): Uint8Array => {
  const dataWithQR = data.map((row, index) => ({
    ...row,
    'QR Code': qrCodes[index] || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataWithQR);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};