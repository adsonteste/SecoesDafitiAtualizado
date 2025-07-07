import * as XLSX from 'xlsx';
import { DriverData } from '../types/types';

const DAFITI_DRIVERS = [
  'Aroldo Moreira da Silva Junior',
  'Elisama de Oliveira Pereira',
  'Joao Batista Carneiro',
  'Edson Rodrigues de Figueiredo',
  'Gabriel Silva de Figueiredo'
];

function determineRegion(agente: string, veiculo: string, localInicio: string): DriverData['regiao'] {
  if (DAFITI_DRIVERS.includes(agente)) {
    return 'Dafiti';
  }

  const veiculoUpper = veiculo?.toUpperCase() || '';
  const localInicioUpper = localInicio?.toUpperCase() || '';

  if (veiculoUpper.includes('NESPRESSO') || localInicioUpper.includes('NESPRESSO')) {
    return 'Nespresso';
  }

  if ((veiculoUpper.includes('SP') && localInicioUpper.includes('PARI')) ||
      (veiculoUpper.includes('PARI') || localInicioUpper.includes('SP'))) {
    return 'São Paulo';
  }

  if ((veiculoUpper.includes('BARUERI') && localInicioUpper.includes('BARUERI')) ||
      (veiculoUpper.includes('BARUERI') || localInicioUpper.includes('BARUERI'))) {
    return 'São Paulo';
  }

  if ((veiculoUpper.includes('RJ') && localInicioUpper.includes('CRISTOVAO')) ||
      (veiculoUpper.includes('RJ') || localInicioUpper.includes('RJ'))) {
    return 'Rio De Janeiro';
  }

  return 'Dafiti';
}

export async function processSpreadsheet(file: File): Promise<DriverData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { 
          header: 1,
          defval: "",
          range: 1
        });
        
        const processedData = extractDriverData(jsonData);
        resolve(processedData);
      } catch (error) {
        reject(new Error("Erro ao processar o arquivo. Verifique se o formato está correto."));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Erro ao ler o arquivo."));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export async function processStatusFile(file: File, existingData: DriverData[]): Promise<DriverData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" });

        const statusMap = new Map<string, string[]>();

        jsonData.forEach(row => {
          const code = row['Rota - #']?.toString().trim();
          const status = row['Situação - Finalizado']?.toString().trim().toLowerCase();

          if (code && status) {
            if (!statusMap.has(code)) {
              statusMap.set(code, []);
            }
            statusMap.get(code)?.push(status);
          }
        });

        const updatedData = existingData.map(driver => {
          let successCount = 0;
          let failureCount = 0;

          driver.codigos.forEach(code => {
            const statuses = statusMap.get(code.trim());
            if (statuses && statuses.length > 0) {
              statuses.forEach(status => {
                if (status === 'sucesso') {
                  successCount++;
                } else if (status === 'sem sucesso') {
                  failureCount++;
                }
              });
            }
          });

          const total = driver.totalPedidos;
          const pendentes = total - (successCount + failureCount);
          const percentualEntrega = total > 0 ? ((successCount / total) * 100).toFixed(1) + '%' : '0%';
          const percentualRota = total > 0 ? (((successCount + failureCount) / total) * 100).toFixed(1) + '%' : '0%';

          return {
            ...driver,
            entregue: successCount,
            insucessos: failureCount,
            pendentes,
            percentualEntrega,
            percentualRota
          };
        });

        resolve(updatedData);
      } catch (error) {
        reject(new Error("Erro ao processar o arquivo de status. Verifique se o formato está correto."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler o arquivo de status."));
    };

    reader.readAsArrayBuffer(file);
  });
}

export async function convertFile(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
        
        const latestEntries = new Map<string, any>();
        
        jsonData.forEach((row: any) => {
          const code = row['Código']?.toString();
          const timestamp = row['Horários (execução) - Concluído'];
          
          if (code && timestamp) {
            if (!latestEntries.has(code) || 
                timestamp > latestEntries.get(code)['Horários (execução) - Concluído']) {
              latestEntries.set(code, row);
            }
          }
        });
        
        const processedData = Array.from(latestEntries.values());
        
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.json_to_sheet(processedData);
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Processed');
        
        const now = new Date();
        const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
        
        XLSX.writeFile(newWorkbook, `Convertido_${dateStr}.xlsx`);
        
        resolve();
      } catch (error) {
        reject(new Error("Erro ao processar o arquivo. Verifique se o formato está correto."));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Erro ao ler o arquivo."));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

function extractDriverData(data: any[]): DriverData[] {
  const result: DriverData[] = [];
  let currentDriver: Partial<DriverData> | null = null;
  let currentCodigos: string[] = [];
  const driverMap = new Map<string, number>();
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;
    
    const hashValue = row[0];
    const agenteName = row[7];
    const veiculo = row[8];
    const localInicio = row[9];
    const servicosPrevisto = row[26];
    
    if (agenteName && typeof agenteName === 'string') {
      if (currentDriver && currentDriver.motorista) {
        const driverName = currentDriver.motorista;
        const routeNumber = driverMap.get(driverName) || 1;
        
        result.push({
          motorista: driverName,
          rotas: routeNumber,
          percentualEntrega: "0%",
          totalPedidos: currentDriver.totalPedidos || 0,
          entregue: currentDriver.entregue || 0,
          pendentes: currentDriver.pendentes || 0,
          insucessos: currentDriver.insucessos || 0,
          percentualRota: "0%",
          codigos: currentCodigos,
          veiculo: currentDriver.veiculo,
          localInicio: currentDriver.localInicio,
          regiao: currentDriver.regiao
        });
      }
      
      const existingRoutes = driverMap.get(agenteName) || 0;
      driverMap.set(agenteName, existingRoutes + 1);
      
      currentDriver = {
        motorista: agenteName,
        rotas: driverMap.get(agenteName) || 1,
        percentualEntrega: "0%",
        totalPedidos: 0,
        entregue: 0,
        pendentes: 0,
        insucessos: 0,
        percentualRota: "0%",
        veiculo,
        localInicio,
        regiao: determineRegion(agenteName, veiculo, localInicio)
      };
      
      currentCodigos = [];
      
      if (servicosPrevisto && !isNaN(Number(servicosPrevisto))) {
        const totalPedidos = parseInt(servicosPrevisto.toString(), 10);
        currentDriver.totalPedidos = totalPedidos;
        currentDriver.pendentes = totalPedidos;
      }
    }
    
    if (currentDriver && hashValue) {
      currentCodigos.push(hashValue.toString());
    }
  }
  
  if (currentDriver && currentDriver.motorista) {
    const driverName = currentDriver.motorista;
    const routeNumber = driverMap.get(driverName) || 1;
    
    result.push({
      motorista: driverName,
      rotas: routeNumber,
      percentualEntrega: "0%",
      totalPedidos: currentDriver.totalPedidos || 0,
      entregue: currentDriver.entregue || 0,
      pendentes: currentDriver.pendentes || 0,
      insucessos: currentDriver.insucessos || 0,
      percentualRota: "0%",
      codigos: currentCodigos,
      veiculo: currentDriver.veiculo,
      localInicio: currentDriver.localInicio,
      regiao: currentDriver.regiao
    });
  }
  
  return result;
}