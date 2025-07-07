import { useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!validExtensions.includes(fileExtension)) {
      alert('Por favor, selecione um arquivo XLSX, XLS ou CSV.');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
        dragActive 
          ? 'border-orange-500 bg-orange-50' 
          : 'border-gray-300 hover:border-orange-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto text-orange-500 mb-4" size={32} />
      
      <p className="text-gray-700 mb-4">
        {selectedFile 
          ? `Arquivo selecionado: ${selectedFile.name}` 
          : 'Arraste e solte seu arquivo aqui, ou clique para selecionar'}
      </p>
      
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
      />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <label 
          htmlFor="fileInput" 
          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-md cursor-pointer hover:bg-orange-200 transition-colors inline-block"
        >
          Selecionar Arquivo
        </label>
        
        {selectedFile && (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Processar Arquivo
          </button>
        )}
      </div>
    </div>
  );
};

export default FileUpload;