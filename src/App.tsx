import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TopNavigation } from './components/TopNavigation';
import { Dashboard } from './components/Dashboard';
import { FileUpload } from './components/FileUpload';
import { RawDataEditor } from './components/RawDataEditor';
import { ProductTable } from './components/ProductTable';
import { ProductView } from './components/ProductView';
import { FileEntry, ProductData } from './types';
import { getFileEntries } from './utils/storage';

function HomePage() {
  const [activeView, setActiveView] = useState<'dashboard' | 'excel' | 'raw'>('dashboard');
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [editingFile, setEditingFile] = useState<FileEntry | null>(null);

  return (
    <div>
      <TopNavigation activeView={activeView} onViewChange={setActiveView} />
      
      {selectedFile ? (
        <ProductTable 
          file={selectedFile} 
          onBack={() => {
            setSelectedFile(null);
            setActiveView('dashboard');
          }}
          onEdit={() => {
            setEditingFile(selectedFile);
            setSelectedFile(null);
            setActiveView('raw');
          }}
        />
      ) : activeView === 'dashboard' ? (
        <Dashboard 
          onFileSelect={setSelectedFile}
          onEditFile={(file) => {
            setEditingFile(file);
            setActiveView('raw');
          }}
        />
      ) : activeView === 'excel' ? (
        <FileUpload 
          onBack={() => setActiveView('dashboard')}
          onSuccess={() => setActiveView('dashboard')}
        />
      ) : activeView === 'raw' ? (
        <RawDataEditor 
          onBack={() => {
            setActiveView('dashboard');
            setEditingFile(null);
          }}
          editingFile={editingFile}
        />
      ) : null}
    </div>
  );
}

function App() {
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);

  // Load all products from all files for the product view
  React.useEffect(() => {
    const files = getFileEntries();
    const products = files.flatMap(file => file.data);
    setAllProducts(products);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/product/:id" 
          element={<ProductView products={allProducts} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;