import React from 'react';
import { useFileContext } from '../context/FileContext';
import { Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { exportToExcel } from '../utils/excelExport';

const ResultsSection: React.FC = () => {
  const { 
    comparisonResults, 
    isProcessing, 
    hasResults,
    r2ppFile1,
    r2ppFile2,
    riachueloFile
  } = useFileContext();

  if (isProcessing) {
    return (
      <section className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Comparando arquivos...</p>
        </div>
      </section>
    );
  }

  if (!hasResults) {
    return null;
  }

  const handleExport = () => {
    if (comparisonResults && comparisonResults.length > 0) {
      exportToExcel(comparisonResults, 'resultados_comparacao');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Recebido':
        return <CheckCircle className="text-green-500 w-5 h-5" />;
      case 'Não recebido na base':
        return <XCircle className="text-red-500 w-5 h-5" />;
      case 'Pedido recebido, mas não enviado no arquivo da Riachuelo':
        return <AlertCircle className="text-amber-500 w-5 h-5" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Recebido':
        return 'bg-green-50 border-green-200';
      case 'Não recebido na base':
        return 'bg-red-50 border-red-200';
      case 'Pedido recebido, mas não enviado no arquivo da Riachuelo':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const counts = {
    ok: comparisonResults.filter(item => item.status === 'Recebido').length,
    notReceived: comparisonResults.filter(item => item.status === 'Não recebido na base').length,
    notSent: comparisonResults.filter(item => item.status === 'Pedido recebido, mas não enviado no arquivo da Riachuelo').length
  };

  const getFileNames = () => {
    const files = [];
    if (r2ppFile1) files.push(r2ppFile1.name);
    if (r2ppFile2) files.push(r2ppFile2.name);
    return files.join(' e ');
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Resultados da Comparação</h2>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar XLSX
        </button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-green-800 font-semibold">QTD. PEDIDOS OK</div>
          <div className="text-2xl font-bold text-green-600">{counts.ok}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-red-800 font-semibold">QTD. NÃO RECEBIDO</div>
          <div className="text-2xl font-bold text-red-600">{counts.notReceived}</div>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="text-amber-800 font-semibold">QTD. RECEBIDO, MAS NÃO ENVIADO</div>
          <div className="text-2xl font-bold text-amber-600">{counts.notSent}</div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Comparando {getFileNames()} com {riachueloFile?.name}
        </p>
      </div>

      <div className="overflow-auto max-h-[60vh]">
        <div className="grid grid-cols-3 gap-4 mb-4 font-medium text-gray-700 bg-gray-100 p-3 rounded-md">
          <div>Número do Pedido</div>
          <div>Detalhes</div>
          <div>Status</div>
        </div>
        
        {comparisonResults.map((result, index) => (
          <div
            key={index}
            className={`grid grid-cols-3 gap-4 p-3 border rounded-md mb-2 transition-all hover:shadow-md ${getStatusClass(
              result.status
            )}`}
          >
            <div className="font-medium">{result.number}</div>
            <div className="text-gray-600">{result.details || '-'}</div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(result.status)}
              <span>{result.status}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center space-x-2 text-sm">
          <CheckCircle className="text-green-500 w-4 h-4" />
          <span>Recebido: Presente em ambos os arquivos</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <XCircle className="text-red-500 w-4 h-4" />
          <span>Não recebido na base: Somente no arquivo Riachuelo</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <AlertCircle className="text-amber-500 w-4 h-4" />
          <span>Recebido, mas não enviado: Somente no arquivo R2PP</span>
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;