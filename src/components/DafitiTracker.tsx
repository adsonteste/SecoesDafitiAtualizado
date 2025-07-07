import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileUp, Download, Calendar, ArrowUpDown, Filter } from 'lucide-react';

interface ProcessedData {
  id?: string;
  referencia: string;
  ultimaOcorrencia: string;
  dataUltimaOcorrencia: string | null;
  valorNF: string;
  status: string;
  servico: string; // Adicionado para debug
}

const DafitiTracker: React.FC = () => {
  const [data, setData] = useState<ProcessedData[]>([]);
  const [error, setError] = useState<string>('');
  const [daysToShow, setDaysToShow] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProcessedData;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  // Estados para os filtros de exportação
  const [exportFilters, setExportFilters] = useState({
    'Romaneio em Transferencia': false,
    'Coletado': false,
    'Recebido na Base': false
  });

  const formatDateTime = (dateStr: string | number): string | null => {
    try {
      let parsedDate: Date;

      if (typeof dateStr === 'number') {
        const date = XLSX.SSF.parse_date_code(dateStr);
        parsedDate = new Date(date.y, date.m - 1, date.d, date.H, date.M);
      } else {
        // Tentar diferentes formatos de data
        const dateString = String(dateStr).trim();
        
        // Formato DD/MM/YYYY HH:MM ou DD/MM/YYYY HH:MM:SS
        const brDateMatch = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
        if (brDateMatch) {
          const [, day, month, year, hour, minute, second] = brDateMatch;
          parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second || '0'));
        } else {
          parsedDate = new Date(dateString);
        }
      }

      if (!isNaN(parsedDate.getTime())) {
        // Formato brasileiro: DD/MM/AAAA HH:MM
        const day = parsedDate.getDate().toString().padStart(2, '0');
        const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = parsedDate.getFullYear();
        const hours = parsedDate.getHours().toString().padStart(2, '0');
        const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }

      return null;
    } catch (err) {
      console.error('Error formatting date:', err);
      return null;
    }
  };

  const findColumnIndex = (headers: any[], searchTerms: string[]): number => {
    console.log('Headers encontrados:', headers);
    console.log('Procurando por:', searchTerms);
    
    const index = headers.findIndex(header => 
      searchTerms.some(term => 
        String(header).toLowerCase().includes(term.toLowerCase())
      )
    );
    
    console.log(`Índice encontrado para ${searchTerms}: ${index}`);
    return index;
  };

  // Função para validar se a ocorrência é válida (mais específica)
  const isValidOcorrencia = (ocorrencia: string): { isValid: boolean; normalizedName: string } => {
    const ocorrenciaLower = ocorrencia.toLowerCase().trim();
    
    console.log(`Analisando ocorrência: "${ocorrencia}"`);
    
    // Verificar se é exatamente "Coletado" (sem "não coletado" ou outras variações)
    if (ocorrenciaLower === 'coletado') {
      return { isValid: true, normalizedName: 'Coletado' };
    }
    
    // Verificar se é "Recebido na Base" (exato)
    if (ocorrenciaLower === 'recebido na base') {
      return { isValid: true, normalizedName: 'Recebido na Base' };
    }
    
    // Verificar se é "Romaneio em Transferencia" (com ou sem acento)
    if (ocorrenciaLower === 'romaneio em transferencia' || 
        ocorrenciaLower === 'romaneio em transferência') {
      return { isValid: true, normalizedName: 'Romaneio em Transferencia' };
    }
    
    // Rejeitar qualquer coisa que contenha "não" ou "nao"
    if (ocorrenciaLower.includes('não') || ocorrenciaLower.includes('nao')) {
      console.log(`❌ Rejeitado por conter "não": "${ocorrencia}"`);
      return { isValid: false, normalizedName: '' };
    }
    
    // Rejeitar qualquer coisa que contenha "sva"
    if (ocorrenciaLower.includes('sva')) {
      console.log(`❌ Rejeitado por conter "SVA": "${ocorrencia}"`);
      return { isValid: false, normalizedName: '' };
    }
    
    // Rejeitar qualquer coisa que contenha "pendente"
    if (ocorrenciaLower.includes('pendente')) {
      console.log(`❌ Rejeitado por conter "pendente": "${ocorrencia}"`);
      return { isValid: false, normalizedName: '' };
    }
    
    console.log(`❌ Ocorrência não reconhecida: "${ocorrencia}"`);
    return { isValid: false, normalizedName: '' };
  };

  const processFile = async (file: File) => {
    setError('');
    const reader = new FileReader();
    
    reader.onerror = () => {
      setError('Erro ao ler o arquivo. Por favor, tente novamente.');
    };

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          setError('Arquivo vazio ou inválido.');
          return;
        }

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        let workbook;

        if (fileExtension === 'csv') {
          // Para arquivos CSV, usar configuração específica
          const csvData = new Uint8Array(data as ArrayBuffer);
          const csvString = new TextDecoder('utf-8').decode(csvData);
          workbook = XLSX.read(csvString, { 
            type: 'string',
            raw: false,
            codepage: 65001 // UTF-8
          });
        } else {
          // Para arquivos XLSX/XLS
          workbook = XLSX.read(data, { type: 'binary' });
        }

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const rawData = XLSX.utils.sheet_to_json(firstSheet, {
          header: 1,
          defval: '',
          blankrows: false,
          raw: false // Importante para CSV
        }) as any[][];

        console.log('Dados brutos (primeiras 5 linhas):', rawData.slice(0, 5));
        console.log('Total de linhas:', rawData.length);

        if (rawData.length < 2) {
          setError('Arquivo não contém dados suficientes.');
          return;
        }

        const headers = rawData[0];
        console.log('Cabeçalhos completos:', headers);

        // Buscar colunas com termos mais específicos
        const referenciaIndex = findColumnIndex(headers, ['referência', 'referencia', 'ref']);
        const ocorrenciaIndex = findColumnIndex(headers, ['última ocorrência', 'ultima ocorrencia', 'ocorrencia']);
        const dataIndex = findColumnIndex(headers, ['dt. últ. ocorrência', 'data ultima ocorrencia', 'data']);
        const servicoIndex = findColumnIndex(headers, ['serviço', 'servico']); // Busca específica por serviço
        const valorIndex = findColumnIndex(headers, ['vlr mercadoria', 'valor mercadoria', 'vlr']);

        console.log('Índices encontrados:', {
          referenciaIndex,
          ocorrenciaIndex,
          dataIndex,
          servicoIndex,
          valorIndex
        });

        if (referenciaIndex === -1 || ocorrenciaIndex === -1 || servicoIndex === -1) {
          setError(`Colunas obrigatórias não encontradas. Verifique se o arquivo contém as colunas: Referência, Última Ocorrência e Serviço.`);
          return;
        }

        console.log('Iniciando processamento dos dados...');
        
        let totalProcessed = 0;
        let filteredByService = 0;
        let filteredByOcorrencia = 0;
        let validRecords = 0;
        
        const processedData = rawData
          .slice(1) // Pular cabeçalho
          .map((row, index) => {
            totalProcessed++;
            
            const referencia = String(row[referenciaIndex] || '').trim();
            const ultimaOcorrencia = String(row[ocorrenciaIndex] || '').trim();
            const dataRaw = row[dataIndex] || '';
            const servico = String(row[servicoIndex] || '').trim();
            const valorNFBruto = valorIndex !== -1 ? String(row[valorIndex] || '').trim() : '0';

            if (index < 20) { // Log das primeiras 20 linhas para debug
              console.log(`Linha ${index + 1}:`, {
                referencia,
                ultimaOcorrencia,
                servico,
                dataRaw
              });
            }

            const formattedDate = formatDateTime(dataRaw);
            
            const valorNumerico = parseFloat(valorNFBruto.replace(/[^\d,.-]/g, '').replace(',', '.'));
            const valorNF = isNaN(valorNumerico)
              ? 'R$ 0,00'
              : valorNumerico.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                });

            return {
              referencia,
              ultimaOcorrencia,
              dataUltimaOcorrencia: formattedDate,
              servico,
              valorNF,
              status: 'Pendentes'
            };
          })
          .filter(row => {
            // FILTRO 1: Deve ter referência válida
            const hasValidRef = row.referencia && row.referencia.length > 0;
            
            // FILTRO 2: Deve ser serviço "MR Coleta" (exato)
            const isMRColeta = row.servico.toLowerCase().trim() === 'mr coleta';
            
            if (!isMRColeta && hasValidRef) {
              filteredByService++;
              if (filteredByService <= 10) { // Log apenas os primeiros 10
                console.log(`❌ Filtrado por serviço - Ref: ${row.referencia}, Serviço: "${row.servico}" (esperado: "MR Coleta")`);
              }
            }
            
            // FILTRO 3: Deve ter uma das ocorrências específicas (usando função mais rigorosa)
            const ocorrenciaValidation = isValidOcorrencia(row.ultimaOcorrencia);
            const hasValidOcorrencia = ocorrenciaValidation.isValid;
            
            if (!hasValidOcorrencia && hasValidRef && isMRColeta) {
              filteredByOcorrencia++;
              if (filteredByOcorrencia <= 10) { // Log apenas os primeiros 10
                console.log(`❌ Filtrado por ocorrência - Ref: ${row.referencia}, Ocorrência: "${row.ultimaOcorrencia}"`);
              }
            }

            const isValid = hasValidRef && isMRColeta && hasValidOcorrencia;
            
            if (isValid) {
              validRecords++;
              // Normalizar o nome da ocorrência
              row.ultimaOcorrencia = ocorrenciaValidation.normalizedName;
            }
            
            return isValid;
          });

        console.log(`📊 Estatísticas do processamento:`);
        console.log(`   Total de linhas processadas: ${totalProcessed}`);
        console.log(`   Filtradas por serviço (não MR Coleta): ${filteredByService}`);
        console.log(`   Filtradas por ocorrência inválida: ${filteredByOcorrencia}`);
        console.log(`   Registros válidos finais: ${validRecords}`);

        // Remover duplicatas baseado na referência (manter o mais recente)
        const uniqueData = processedData.reduce((acc: ProcessedData[], current) => {
          const existingIndex = acc.findIndex(item => item.referencia === current.referencia);
          if (existingIndex >= 0) {
            console.log(`🔄 Duplicata encontrada para referência: ${current.referencia}`);
            acc[existingIndex] = current;
          } else {
            acc.push(current);
          }
          return acc;
        }, []);

        console.log(`✅ Dados únicos finais: ${uniqueData.length} registros`);

        // Log de contagem por status
        const statusCount = {
          'Recebido na Base': uniqueData.filter(item => item.ultimaOcorrencia === 'Recebido na Base').length,
          'Coletado': uniqueData.filter(item => item.ultimaOcorrencia === 'Coletado').length,
          'Romaneio em Transferencia': uniqueData.filter(item => item.ultimaOcorrencia === 'Romaneio em Transferencia').length
        };
        
        console.log('📈 Contagem final por status:', statusCount);

        if (uniqueData.length === 0) {
          setError('Nenhum dado encontrado com os critérios especificados. Verifique se o arquivo contém registros com Serviço = "MR Coleta" e as ocorrências exatas: "Recebido na Base", "Coletado" ou "Romaneio em Transferencia".');
          return;
        }

        setData(uniqueData);
      } catch (err) {
        console.error('Error processing file:', err);
        setError('Erro ao processar o arquivo. Verifique se o formato está correto.');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleStatusChange = async (referencia: string, newStatus: string) => {
    setData(data.map(item => 
      item.referencia === referencia ? { ...item, status: newStatus } : item
    ));
  };

  const handleFilterChange = (filterName: string) => {
    setExportFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName as keyof typeof prev]
    }));
  };

  const getFilteredDataForExport = () => {
    const selectedFilters = Object.entries(exportFilters)
      .filter(([_, isSelected]) => isSelected)
      .map(([filterName, _]) => filterName);

    if (selectedFilters.length === 0) {
      return data; // Se nenhum filtro selecionado, retorna todos os dados
    }

    return data.filter(item => 
      selectedFilters.includes(item.ultimaOcorrencia)
    );
  };

  const exportToExcel = () => {
    try {
      const filteredData = getFilteredDataForExport();
      
      if (filteredData.length === 0) {
        setError('Nenhum dado encontrado para os filtros selecionados.');
        return;
      }

      const exportData = filteredData.map(item => ({
        Referência: item.referencia,
        'Última Ocorrência': item.ultimaOcorrencia,
        'Data Última Ocorrência': item.dataUltimaOcorrencia,
        'Valor NF': item.valorNF,
        Status: item.status
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Dados Filtrados");
      
      // Nome do arquivo baseado nos filtros selecionados
      const selectedFilters = Object.entries(exportFilters)
        .filter(([_, isSelected]) => isSelected)
        .map(([filterName, _]) => filterName);
      
      const fileName = selectedFilters.length > 0 
        ? `dafiti_${selectedFilters.join('_').replace(/\s+/g, '_').toLowerCase()}.xlsx`
        : 'dafiti_todos_dados.xlsx';
      
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      setError('Erro ao exportar o arquivo.');
      console.error('Error exporting to Excel:', err);
    }
  };

  const handleSort = (key: keyof ProcessedData) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (key === 'dataUltimaOcorrencia') {
        // Para ordenação de data, converter de volta para timestamp
        const dateA = a[key] ? new Date(a[key]!.split(' ')[0].split('/').reverse().join('-') + ' ' + a[key]!.split(' ')[1]).getTime() : 0;
        const dateB = b[key] ? new Date(b[key]!.split(' ')[0].split('/').reverse().join('-') + ' ' + b[key]!.split(' ')[1]).getTime() : 0;
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setData(sortedData);
  };

  const getFilterCounts = () => {
    return {
      'Romaneio em Transferencia': data.filter(item => item.ultimaOcorrencia === 'Romaneio em Transferencia').length,
      'Coletado': data.filter(item => item.ultimaOcorrencia === 'Coletado').length,
      'Recebido na Base': data.filter(item => item.ultimaOcorrencia === 'Recebido na Base').length
    };
  };

  const filterCounts = getFilterCounts();

  return (
    <div className="bg-white shadow-md p-6 min-h-screen w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sistema Dafiti</h2>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer bg-[#ed5c0e] text-white px-4 py-2 rounded hover:bg-[#d45509] transition-colors">
            <FileUp size={20} />
            Importar XLSX / CSV
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>


      {/* Seção de Filtros de Exportação */}
      {data.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-medium text-gray-800">Filtros de Exportação</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {Object.entries(filterCounts).map(([filterName, count]) => (
              <label key={filterName} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportFilters[filterName as keyof typeof exportFilters]}
                  onChange={() => handleFilterChange(filterName)}
                  className="w-4 h-4 text-[#ed5c0e] border-gray-300 rounded focus:ring-[#ed5c0e]"
                />
                <span className="text-sm font-medium text-gray-700">
                  {filterName} ({count})
                </span>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              <Download size={20} />
              Exportar Selecionados
            </button>
            
            <div className="text-sm text-gray-600">
              {Object.values(exportFilters).some(Boolean) 
                ? `${getFilteredDataForExport().length} registros serão exportados`
                : `${data.length} registros serão exportados (todos)`
              }
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#ed5c0e] text-white font-bold">
              <tr>
                <th className="px-6 py-3 text-left text-sm uppercase tracking-wider cursor-pointer hover:bg-[#d45509] transition-colors" onClick={() => handleSort('referencia')}>
                  <div className="flex items-center gap-2">
                    Referência
                    <ArrowUpDown size={16} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm uppercase tracking-wider cursor-pointer hover:bg-[#d45509] transition-colors" onClick={() => handleSort('ultimaOcorrencia')}>
                  <div className="flex items-center gap-2">
                    Última Ocorrência
                    <ArrowUpDown size={16} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm uppercase tracking-wider cursor-pointer hover:bg-[#d45509] transition-colors" onClick={() => handleSort('dataUltimaOcorrencia')}>
                  <div className="flex items-center gap-2">
                    Data Última Ocorrência
                    <ArrowUpDown size={16} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm uppercase tracking-wider cursor-pointer hover:bg-[#d45509] transition-colors" onClick={() => handleSort('valorNF')}>
                  <div className="flex items-center gap-2">
                    Valor NF
                    <ArrowUpDown size={16} />
                  </div>
                </th>               
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => (
                <tr key={row.referencia}>
                  <td className="px-6 py-4 whitespace-nowrap">{row.referencia}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.ultimaOcorrencia === 'Recebido na Base' ? 'bg-green-100 text-green-800' :
                      row.ultimaOcorrencia === 'Coletado' ? 'bg-blue-100 text-blue-800' :
                      row.ultimaOcorrencia === 'Romaneio em Transferencia' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {row.ultimaOcorrencia}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.dataUltimaOcorrencia}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{row.valorNF}</td>        
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DafitiTracker;