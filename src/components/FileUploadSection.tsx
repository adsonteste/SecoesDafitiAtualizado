import React from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import { useFileContext } from '../context/FileContext';

const FileUploadSection: React.FC = () => {
  const { 
    uploadR2ppFile1,
    uploadR2ppFile2,
    uploadRiachueloFile, 
    isProcessing, 
    clearData,
    r2ppFile1,
    r2ppFile2,
    riachueloFile,
    compareFiles
  } = useFileContext();

  const canCompare = (r2ppFile1 || r2ppFile2) && riachueloFile && !isProcessing;

  return (
    <section className="bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-300">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Importar Arquivos</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 hover:border-orange-500 transition-colors bg-orange-50">
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-orange-600 mb-2" />
                <p className="text-md font-medium mb-2">Arquivo R2PP (1)</p>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  {r2ppFile1 ? r2ppFile1.name : 'Arraste ou clique para selecionar'}
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={uploadR2ppFile1}
                  className="hidden"
                  id="r2pp-file-1"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="r2pp-file-1"
                  className={`px-4 py-2 ${
                    isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 cursor-pointer'
                  } text-white rounded transition-colors`}
                >
                  Selecionar Arquivo
                </label>
                <p className="mt-2 text-xs text-gray-600">
                  Comparação pela Coluna A
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 hover:border-orange-500 transition-colors bg-orange-50">
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-orange-600 mb-2" />
                <p className="text-md font-medium mb-2">Arquivo R2PP (2)</p>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  {r2ppFile2 ? r2ppFile2.name : 'Arraste ou clique para selecionar'}
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={uploadR2ppFile2}
                  className="hidden"
                  id="r2pp-file-2"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="r2pp-file-2"
                  className={`px-4 py-2 ${
                    isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 cursor-pointer'
                  } text-white rounded transition-colors`}
                >
                  Selecionar Arquivo
                </label>
                <p className="mt-2 text-xs text-gray-600">
                  Comparação pela Coluna A
                </p>
              </div>
            </div>
          </div>

          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 hover:border-blue-500 transition-colors bg-blue-50">
            <div className="flex flex-col items-center">
              <Upload className="w-10 h-10 text-blue-600 mb-2" />
              <p className="text-md font-medium mb-2">Arquivo RIACHUELO</p>
              <p className="text-sm text-gray-500 mb-4 text-center">
                {riachueloFile ? riachueloFile.name : 'Arraste ou clique para selecionar'}
              </p>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={uploadRiachueloFile}
                className="hidden"
                id="riachuelo-file"
                disabled={isProcessing}
              />
              <label
                htmlFor="riachuelo-file"
                className={`px-4 py-2 ${
                  isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                } text-white rounded transition-colors`}
              >
                Selecionar Arquivo
              </label>
              <p className="mt-2 text-xs text-gray-600">
                Comparação pela Coluna A
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={compareFiles}
            disabled={!canCompare}
            className={`px-6 py-3 ${
              !canCompare
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white rounded-lg font-medium transition-colors`}
          >
            Comparar Arquivos
          </button>

          <button
            onClick={clearData}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            disabled={isProcessing}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpar Dados
          </button>
        </div>
      </div>
    </section>
  );
};

export default FileUploadSection;