import { v4 as uuidv4 } from 'uuid';
import { DeliveryData, ImportedRow, ProcessedData, Region } from '../types';

const dafitiBrokers = [
  'Aroldo Moreira da Silva Junior',
  'Elisama de Oliveira Pereira',
  'Joao Batista Carneiro',
  'Edson Rodrigues de Figueiredo',
  'Gabriel Silva de Figueiredo'
];

function determineRegion(veiculo: string | undefined, localInicio: string | undefined, driver: string): Region {
  if (dafitiBrokers.includes(driver)) {
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

export function processExcelData(rawData: ImportedRow[]): DeliveryData[] {
  const driversMap = new Map<string, Array<{
    totalOrders: number;
    region: Region;
    codes: string[];
    titles: string[];
    veiculo?: string;
    localInicio?: string;
  }>>();
  
  let currentDriver = '';
  
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row.A) continue;
    
    const cellA = String(row.A);
    
    if (cellA.includes('Agente:') && row.B) {
      currentDriver = row.B;
      if (!driversMap.has(currentDriver)) {
        driversMap.set(currentDriver, []);
      }
      driversMap.get(currentDriver)?.push({
        totalOrders: 0,
        region: 'Dafiti',
        codes: [],
        titles: []
      });
    }
    else if (cellA.includes('Serviços:') && row.B && currentDriver) {
      const driverRoutes = driversMap.get(currentDriver);
      if (driverRoutes && driverRoutes.length > 0) {
        driverRoutes[driverRoutes.length - 1].totalOrders = parseInt(row.B, 10) || 0;
      }
    }
    else if (cellA.includes('Veículo:') && row.B && currentDriver) {
      const driverRoutes = driversMap.get(currentDriver);
      if (driverRoutes && driverRoutes.length > 0) {
        driverRoutes[driverRoutes.length - 1].veiculo = row.B;
      }
    }
    else if (cellA.includes('Início:') && row.B && currentDriver) {
      const driverRoutes = driversMap.get(currentDriver);
      if (driverRoutes && driverRoutes.length > 0) {
        driverRoutes[driverRoutes.length - 1].localInicio = row.B;
      }
    }
    else if ((row.G || row.H) && currentDriver) {
      const driverRoutes = driversMap.get(currentDriver);
      if (driverRoutes && driverRoutes.length > 0) {
        const isDafitiBroker = dafitiBrokers.includes(currentDriver);
        
        if (isDafitiBroker && row.H) {
          driverRoutes[driverRoutes.length - 1].codes.push(row.H);
          driverRoutes[driverRoutes.length - 1].titles.push(row.H);
        } else if (row.G) {
          driverRoutes[driverRoutes.length - 1].codes.push(row.G);
          driverRoutes[driverRoutes.length - 1].titles.push(row.H || '');
        }
      }
    }
  }

  const result: DeliveryData[] = [];
  
  driversMap.forEach((routes, driver) => {    
    routes.forEach((data) => {
      const delivered = 0;
      const pending = data.totalOrders;
      const unsuccessful = 0;
      const deliveryPercentage = 0;
      const routePercentage = 0;
      const region = determineRegion(data.veiculo, data.localInicio, driver);
      const isDafitiBroker = dafitiBrokers.includes(driver);
      
      result.push({
        id: uuidv4(),
        driver: driver,
        totalOrders: data.totalOrders,
        region,
        routes: routes.length,
        delivered,
        pending,
        unsuccessful,
        deliveryPercentage,
        routePercentage,
        serviceCodes: isDafitiBroker ? data.titles : data.codes,
        successfulCodes: [],
        unsuccessfulCodes: [],
        senderMap: {}
      });
    });
  });
  
  return result.sort((a, b) => a.deliveryPercentage - b.deliveryPercentage);
}

function parseDateTime(dateStr: string): Date {
  if (!dateStr) return new Date(0);

  dateStr = dateStr.split('+')[0].trim();
  
  const formats = [
    { regex: /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?/, order: [3, 2, 1, 4, 5, 6] },
    { regex: /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/, order: [1, 2, 3, 4, 5, 6] },
    { regex: /(\d{2})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/, order: [0, 2, 1, 4, 5, 6] }
  ];

  for (const format of formats) {
    const match = dateStr.match(format.regex);
    if (match) {
      const parts = match.slice(1).map(part => part ? parseInt(part) : 0);
      const [year, month, day, hour, minute, second] = format.order.map(i => parts[i] || 0);
      const fullYear = year < 100 ? 2000 + year : year;
      return new Date(fullYear, month - 1, day, hour, minute, second);
    }
  }

  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  console.warn(`Unable to parse date: ${dateStr}`);
  return new Date(0);
}

interface StatusEntry {
  status: string;
  timestamp: Date;
  sender: string;
  allTimestamps: Array<{
    timestamp: Date;
    status: string;
    rawDate: string;
    agent?: string;
    title?: string;
    sender?: string;
  }>;
}

export function updateDeliveryStatus(currentData: DeliveryData[], statusData: any[]): DeliveryData[] {
  const statusMap = new Map<string, StatusEntry>();
  
  statusData.forEach(entry => {
    const code = entry['Código']?.toString() || 
                entry['Codigo']?.toString() || 
                entry['Code']?.toString();
    
    const title = entry['H']?.toString() ||
                 entry['Título']?.toString() ||
                 entry['Titulo']?.toString() ||
                 entry['Title']?.toString();
    
    const status = entry['Situação - Finalizado']?.toString().toLowerCase() ||
                  entry['Situacao - Finalizado']?.toString().toLowerCase() ||
                  entry['Status']?.toString().toLowerCase();
    
    const sender = entry['F']?.toString() ||
                  entry['Remetente']?.toString() ||
                  'Não especificado';
    
    const dateStr = String(
      entry['Horários (execução) - Concluído'] || 
      entry['Horarios (execucao) - Concluido'] || 
      entry['Timestamp'] || ''
    );

    const agent = entry['Agente']?.toString() ||
                 entry['Agent']?.toString() ||
                 'Não especificado';
    
    const timestamp = parseDateTime(dateStr);

    const finalCode = dafitiBrokers.includes(agent) ? title : code;
    
    if (!finalCode) return;

    if (statusMap.has(finalCode)) {
      const existing = statusMap.get(finalCode)!;
      
      existing.allTimestamps.push({
        timestamp,
        status,
        rawDate: dateStr,
        agent,
        title,
        sender
      });
      
      if (timestamp > existing.timestamp) {
        existing.status = status;
        existing.timestamp = timestamp;
        existing.sender = sender;
      }
    } else {
      statusMap.set(finalCode, {
        status,
        timestamp,
        sender,
        allTimestamps: [{
          timestamp,
          status,
          rawDate: dateStr,
          agent,
          title,
          sender
        }]
      });
    }
  });

  console.group('Análise de Códigos Duplicados');
  statusMap.forEach((value, code) => {
    if (value.allTimestamps.length > 1) {
      console.group(`\nCódigo/Título ${code} (${value.allTimestamps.length} entradas):`);
      
      const sortedEntries = [...value.allTimestamps]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      sortedEntries.forEach((entry, index) => {
        console.log(`\nEntrada ${index + 1}:`);
        console.log(`  Agente: ${entry.agent}`);
        console.log(`  Título: ${entry.title || 'N/A'}`);
        console.log(`  Data/Hora: ${entry.rawDate}`);
        console.log(`  Status: ${entry.status}`);
        console.log(`  Remetente: ${entry.sender}`);
        console.log(`  Timestamp processado: ${entry.timestamp.toISOString()}`);
        
        if (index === 0) {
          console.log('  >>> ESTE É O STATUS SENDO UTILIZADO <<<');
        }
      });
      
      console.groupEnd();
    }
  });
  console.groupEnd();

  return currentData.map(driver => {
    let delivered = 0;
    let unsuccessful = 0;
    const successfulCodes: string[] = [];
    const unsuccessfulCodes: string[] = [];
    const senderMap: { [key: string]: string } = {};

    driver.serviceCodes.forEach(code => {
      const statusEntry = statusMap.get(code);
      
      if (statusEntry) {
        const { status, sender } = statusEntry;
        senderMap[code] = sender;
        
        if (status?.includes('sucesso') && !status?.includes('sem sucesso')) {
          delivered++;
          successfulCodes.push(code);
        } else if (status?.includes('sem sucesso')) {
          unsuccessful++;
          unsuccessfulCodes.push(code);
        }
      }
    });

    const pending = driver.totalOrders - (delivered + unsuccessful);
    const deliveryPercentage = driver.totalOrders > 0
      ? Math.round((delivered / driver.totalOrders) * 100)
      : 0;
    const routePercentage = driver.totalOrders > 0
      ? Math.round(((driver.totalOrders - pending) / driver.totalOrders) * 100)
      : 0;

    return {
      ...driver,
      delivered,
      unsuccessful,
      pending,
      deliveryPercentage,
      routePercentage,
      successfulCodes,
      unsuccessfulCodes,
      senderMap
    };
  });
}