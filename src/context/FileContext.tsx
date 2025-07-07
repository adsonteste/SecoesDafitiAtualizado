import React, { createContext, useState, useContext, ReactNode, ChangeEvent } from 'react';
import { processExcelFiles } from '../utils/excelProcessor';

type ComparisonResult = {
  number: string;
  details: string;
  status: string;
};

interface FileContextType {
  r2ppFile1: File | null;
  r2ppFile2: File | null;
  riachueloFile: File | null;
  comparisonResults: ComparisonResult[];
  isProcessing: boolean;
  hasResults: boolean;
  uploadR2ppFile1: (e: ChangeEvent<HTMLInputElement>) => void;
  uploadR2ppFile2: (e: ChangeEvent<HTMLInputElement>) => void;
  uploadRiachueloFile: (e: ChangeEvent<HTMLInputElement>) => void;
  clearData: () => void;
  compareFiles: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [r2ppFile1, setR2ppFile1] = useState<File | null>(null);
  const [r2ppFile2, setR2ppFile2] = useState<File | null>(null);
  const [riachueloFile, setRiachueloFile] = useState<File | null>(null);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const processFiles = async () => {
    if ((r2ppFile1 || r2ppFile2) && riachueloFile) {
      setIsProcessing(true);
      try {
        const results = await processExcelFiles(r2ppFile1, r2ppFile2, riachueloFile);
        setComparisonResults(results);
        setHasResults(true);
      } catch (error) {
        console.error('Error processing files:', error);
        alert('Erro ao processar os arquivos: ' + (error as Error).message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const uploadR2ppFile1 = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setR2ppFile1(e.target.files[0]);
    }
  };

  const uploadR2ppFile2 = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setR2ppFile2(e.target.files[0]);
    }
  };

  const uploadRiachueloFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRiachueloFile(e.target.files[0]);
    }
  };

  const clearData = () => {
    setR2ppFile1(null);
    setR2ppFile2(null);
    setRiachueloFile(null);
    setComparisonResults([]);
    setHasResults(false);
  };

  const compareFiles = () => {
    if ((r2ppFile1 || r2ppFile2) && riachueloFile) {
      processFiles();
    }
  };

  return (
    <FileContext.Provider
      value={{
        r2ppFile1,
        r2ppFile2,
        riachueloFile,
        comparisonResults,
        isProcessing,
        hasResults,
        uploadR2ppFile1,
        uploadR2ppFile2,
        uploadRiachueloFile,
        clearData,
        compareFiles,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = (): FileContextType => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};