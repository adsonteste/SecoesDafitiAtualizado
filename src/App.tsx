import React, { useState } from 'react';
import FileUploadSection from './components/FileUploadSection';
import ResultsSection from './components/ResultsSection';
import { FileProvider } from './context/FileContext';
import Header from './components/Header';
import SystemSelection from './components/SystemSelection';
import DafitiTracker from './components/DafitiTracker';
import { ArrowLeft } from 'lucide-react';

function App() {
  const [selectedSystem, setSelectedSystem] = useState<'none' | 'comparador' | 'insucessos' | 'dafiti' | 'evolutivo'>('none');
  const [showHeader, setShowHeader] = useState(true);

  const handleSystemSelect = (system: 'comparador' | 'insucessos' | 'dafiti' | 'evolutivo') => {
    if (system === 'insucessos') {
      window.location.href = 'https://romaneio-circuit.vercel.app/';
      return;
    }

    if (system === 'evolutivo') {
      // ✅ Redireciona na mesma aba e mantém histórico (botão "voltar" funciona)
      window.location.href = 'https://evolutivo-geral.vercel.app/';
      return;
    }

    setSelectedSystem(system);
    setShowHeader(false);
  };

  const handleBack = () => {
    setSelectedSystem('none');
    setShowHeader(true);
  };

  return (
    <FileProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {showHeader && <Header />}
        <main className="flex-1">
          {selectedSystem !== 'none' && (
            <div className="px-4">
              <button
                onClick={handleBack}
                className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar para Seleção
              </button>
            </div>
          )}
          
          {selectedSystem === 'none' && (
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <SystemSelection onSelect={handleSystemSelect} />
              </div>
            </div>
          )}
          
          {selectedSystem === 'comparador' && (
            <div className="w-full px-4">
              <FileUploadSection />
              <ResultsSection />
            </div>
          )}
          
          {selectedSystem === 'dafiti' && (
            <div className="w-full">
              <DafitiTracker />
            </div>
          )}
        </main>
      </div>
    </FileProvider>
  );
}

export default App;
