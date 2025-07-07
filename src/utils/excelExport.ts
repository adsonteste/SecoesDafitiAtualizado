import * as XLSX from 'xlsx';

type ComparisonResult = {
  number: string;
  details: string;
  status: string;
};

/**
 * Exports comparison results to an Excel file with formatting
 */
export const exportToExcel = (
  data: ComparisonResult[],
  fileName: string = 'export'
): void => {
  // Calculate counts
  const counts = {
    ok: data.filter(item => item.status === 'Recebido').length,
    notReceived: data.filter(item => item.status === 'Não recebido na base').length,
    notSent: data.filter(item => item.status === 'Pedido recebido, mas não enviado no arquivo da Riachuelo').length
  };

  // Create a new worksheet
  const worksheet: XLSX.WorkSheet = {};

  // Add export date/time to first row
  const now = new Date();
  const dateStr = now.toLocaleString('pt-BR');
  worksheet[XLSX.utils.encode_cell({ r: 0, c: 0 })] = { v: 'Data de Exportação:', t: 's' };
  worksheet[XLSX.utils.encode_cell({ r: 0, c: 1 })] = { v: dateStr, t: 's' };

  // Add empty row
  worksheet[XLSX.utils.encode_cell({ r: 1, c: 0 })] = { v: '', t: 's' };

  // Add summary headers and values in columns A, B, C
  worksheet[XLSX.utils.encode_cell({ r: 2, c: 0 })] = { v: 'QTD. PEDIDOS OK', t: 's' };
  worksheet[XLSX.utils.encode_cell({ r: 2, c: 1 })] = { v: 'QTD. NÃO RECEBIDO', t: 's' };
  worksheet[XLSX.utils.encode_cell({ r: 2, c: 2 })] = { v: 'QTD. RECEBIDO, MAS NÃO ENVIADO NO ARQV.', t: 's' };

  worksheet[XLSX.utils.encode_cell({ r: 3, c: 0 })] = { v: counts.ok, t: 'n' };
  worksheet[XLSX.utils.encode_cell({ r: 3, c: 1 })] = { v: counts.notReceived, t: 'n' };
  worksheet[XLSX.utils.encode_cell({ r: 3, c: 2 })] = { v: counts.notSent, t: 'n' };

  // Add empty row
  worksheet[XLSX.utils.encode_cell({ r: 4, c: 0 })] = { v: '', t: 's' };

  // Add data headers
  worksheet[XLSX.utils.encode_cell({ r: 5, c: 0 })] = { v: 'Pedido - NF', t: 's' };
  worksheet[XLSX.utils.encode_cell({ r: 5, c: 1 })] = { v: 'Status Do Pedido', t: 's' };

  // Add data rows
  const exportData = data.map(({ number, status }) => ({
    number,
    status: status === 'Recebido' ? 'Recebido' : status
  }));

  exportData.forEach((row, index) => {
    worksheet[XLSX.utils.encode_cell({ r: index + 6, c: 0 })] = { v: row.number, t: 's' };
    worksheet[XLSX.utils.encode_cell({ r: index + 6, c: 1 })] = { v: row.status, t: 's' };
  });

  // Set worksheet range
  worksheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: exportData.length + 5, c: 2 }
  });

  // Set column widths
  worksheet['!cols'] = [
    { wch: 45 },  // number/QTD OK column
    { wch: 45 },  // status/QTD NÃO RECEBIDO column
    { wch: 45 }   // QTD RECEBIDO MAS NÃO ENVIADO column
    
  ];

  // Style date row with center alignment
  const dateLabel = worksheet[XLSX.utils.encode_cell({ r: 0, c: 0 })];
  const dateValue = worksheet[XLSX.utils.encode_cell({ r: 0, c: 1 })];
  [dateLabel, dateValue].forEach(cell => {
    if (cell) cell.s = {
      font: { bold: true, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "E6E6E6" }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  });

  // Style summary section with center alignment
  for (let col = 0; col <= 2; col++) {
    const headerCell = worksheet[XLSX.utils.encode_cell({ r: 2, c: col })];
    const valueCell = worksheet[XLSX.utils.encode_cell({ r: 3, c: col })];
    
    if (headerCell) headerCell.s = {
      font: { bold: true, color: { rgb: "000000" } },
      fill: { fgColor: { rgb: "E6E6E6" }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    
    if (valueCell) valueCell.s = {
      font: { bold: true, color: { rgb: "000000" } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
  }

  // Style data headers and rows
  const dataStartRow = 5;
  for (let R = dataStartRow; R <= dataStartRow + exportData.length; R++) {
    const numberCell = worksheet[XLSX.utils.encode_cell({ r: R, c: 0 })];
    const statusCell = worksheet[XLSX.utils.encode_cell({ r: R, c: 1 })];

    if (R === dataStartRow) {
      // Headers style
      [numberCell, statusCell].forEach(cell => {
        if (cell) cell.s = {
          font: { bold: true, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "CCCCCC" }, patternType: 'solid' },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      });
    } else {
      // Data rows style
      const status = statusCell?.v;
      if (status === 'OK') {
        [numberCell, statusCell].forEach(cell => {
          if (cell) cell.s = {
            fill: { fgColor: { rgb: "C6EFCE" }, patternType: 'solid' },
            font: { color: { rgb: "006100" } },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        });
      } else if (status === 'Não recebido na base') {
        [numberCell, statusCell].forEach(cell => {
          if (cell) cell.s = {
            fill: { fgColor: { rgb: "FFC7CE" }, patternType: 'solid' },
            font: { color: { rgb: "9C0006" } },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        });
      } else if (status) {
        [numberCell, statusCell].forEach(cell => {
          if (cell) cell.s = {
            fill: { fgColor: { rgb: "FFEB9C" }, patternType: 'solid' },
            font: { color: { rgb: "9C6500" } },
            alignment: { horizontal: 'center', vertical: 'center' }
          };
        });
      }
    }
  }

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');
  
  // Generate Excel file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};