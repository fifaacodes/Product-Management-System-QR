export interface ProductData {
  id: string;
  [key: string]: any;
}

export interface ExcelRow {
  [key: string]: any;
}

export interface QRCodeData {
  id: string;
  productData: ProductData;
  qrCodeUrl: string;
}

export interface FileEntry {
  id: string;
  name: string;
  type: 'excel' | 'raw';
  createdAt: Date;
  updatedAt: Date;
  data: ProductData[];
  versions: FileVersion[];
}

export interface FileVersion {
  id: string;
  timestamp: Date;
  data: ProductData[];
  changes: string;
}

export interface RawDataField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date';
}