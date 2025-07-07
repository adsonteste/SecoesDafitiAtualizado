import * as XLSX from 'xlsx';

type ComparisonResult = {
  number: string;
  details: string;
  status: string;
};

/**
 * Checks if a value is numeric
 */
const isNumeric = (value: any): boolean => {
  if (typeof value === 'number') return true;
  if (typeof value === 'string') {
    // Remove any common formatting like spaces, dashes, parentheses
    const cleanValue = value.replace(/[\s-()]/g, '');
    // Check if the cleaned string is a valid number
    return !isNaN(Number(cleanValue)) && cleanValue.trim() !== '';
  }
  return false;
};

/**
 * Processes Excel/CSV files and performs comparison of column A
 */
export const processExcelFiles = async (
  r2ppFile1: File | null,
  r2ppFile2: File | null,
  riachueloFile: File
): Promise<ComparisonResult[]> => {
  // Read the files
  const fileReadPromises = [
    r2ppFile1 ? readFile(r2ppFile1, { startRow: 2 }) : Promise.resolve([]),
    r2ppFile2 ? readFile(r2ppFile2, { startRow: 2 }) : Promise.resolve([]),
    readFile(riachueloFile, { startRow: 3 })
  ];

  const [r2ppData1, r2ppData2, riachueloData] = await Promise.all(fileReadPromises);

  // Get numeric values from column A (index 0)
  const r2ppNumbers = new Set<string>();
  const riachueloNumbers = new Set<string>();

  // Process R2PP data from first file
  for (const row of r2ppData1) {
    const value = row['A'] || row[0];
    if (isNumeric(value)) {
      r2ppNumbers.add(String(value));
    }
  }

  // Process R2PP data from second file
  for (const row of r2ppData2) {
    const value = row['A'] || row[0];
    if (isNumeric(value)) {
      r2ppNumbers.add(String(value));
    }
  }

  // Process Riachuelo data
  for (const row of riachueloData) {
    const value = row['A'] || row[0];
    if (isNumeric(value)) {
      riachueloNumbers.add(String(value));
    }
  }

  // Compare and generate results
  const results: ComparisonResult[] = [];

  // Check numbers in both files
  for (const number of r2ppNumbers) {
    if (riachueloNumbers.has(number)) {
      results.push({
        number,
        details: '',
        status: 'Recebido'
      });
    } else {
      results.push({
        number,
        details: '',
        status: 'Pedido recebido, mas não enviado no arquivo da Riachuelo'
      });
    }
  }

  // Check numbers only in Riachuelo file
  for (const number of riachueloNumbers) {
    if (!r2ppNumbers.has(number)) {
      results.push({
        number,
        details: '',
        status: 'Não recebido na base'
      });
    }
  }

  // Sort results: first received, then not in base, then not in Riachuelo
  return results.sort((a, b) => {
    const statusOrder: Record<string, number> = {
      'Recebido': 1,
      'Não recebido na base': 2,
      'Pedido recebido, mas não enviado no arquivo da Riachuelo': 3
    };

    return statusOrder[a.status] - statusOrder[b.status];
  });
};

/**
 * Reads an Excel or CSV file and returns the data as an array of objects
 */
const readFile = (file: File, options: { startRow: number }): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const fileType = file.name.split('.').pop()?.toLowerCase();
        let workbook;

        if (fileType === 'csv') {
          workbook = XLSX.read(data, { type: 'binary', raw: true });
        } else {
          workbook = XLSX.read(data, { type: 'binary' });
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Get the range of the worksheet
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        
        // Update the start row while keeping the original column range
        range.s.r = options.startRow - 1; // Subtract 1 because Excel rows are 1-based
        
        // Update the worksheet reference with the new range
        worksheet['!ref'] = XLSX.utils.encode_range(range);
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};