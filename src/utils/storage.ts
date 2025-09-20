import { FileEntry, FileVersion, ProductData } from '../types';

const STORAGE_KEY = 'excel-qr-files';

export const saveFileEntry = (fileEntry: FileEntry): void => {
  const existingFiles = getFileEntries();
  const updatedFiles = existingFiles.filter(f => f.id !== fileEntry.id);
  updatedFiles.push(fileEntry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
};

export const getFileEntries = (): FileEntry[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const files = JSON.parse(stored);
    return files.map((file: any) => ({
      ...file,
      createdAt: new Date(file.createdAt),
      updatedAt: new Date(file.updatedAt),
      versions: file.versions?.map((v: any) => ({
        ...v,
        timestamp: new Date(v.timestamp)
      })) || []
    }));
  } catch {
    return [];
  }
};

export const deleteFileEntry = (id: string): void => {
  const existingFiles = getFileEntries();
  const updatedFiles = existingFiles.filter(f => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
};

export const updateFileEntry = (id: string, data: ProductData[], changes: string): void => {
  const existingFiles = getFileEntries();
  const fileIndex = existingFiles.findIndex(f => f.id === id);
  
  if (fileIndex === -1) return;
  
  const file = existingFiles[fileIndex];
  
  // Create new version
  const newVersion: FileVersion = {
    id: `version-${Date.now()}`,
    timestamp: new Date(),
    data: [...file.data], // Store old data
    changes
  };
  
  // Update file
  file.versions.push(newVersion);
  file.data = data;
  file.updatedAt = new Date();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingFiles));
};