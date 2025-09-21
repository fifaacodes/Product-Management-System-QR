import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthWrapper } from './components/AuthWrapper';
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
  const [currentView, setCurrentView] = useState<'dashboard' | 'excel' | 'raw'>('dashboard');

  const renderCurrentView = (user: any) => {
    return <HomePage />;
  };

  React.useEffect(() => {
  }, []);

  return (
    <AuthWrapper>
      {(user) => (
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/product/:fileId/:productIndex" element={<ProductView />} />
              <Route path="*" element={
                <>
                  <TopNavigation currentView={currentView} onViewChange={setCurrentView} />
                  <main className="pt-16">
                    {renderCurrentView(user)}
                  </main>
                </>
              } />
            </Routes>
          </div>
        </Router>
      )}
    </AuthWrapper>
  );
}

export default App;