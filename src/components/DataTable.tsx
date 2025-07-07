import React, { useState } from 'react';
import { DriverData } from '../types/types';
import { ArrowUpDown, FileText, Printer } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface DataTableProps {
  data: DriverData[];
  setData: (data: DriverData[]) => void;
}

type SortField = keyof DriverData;
type SortDirection = 'asc' | 'desc';

const DataTable: React.FC<DataTableProps> = ({ data, setData }) => {
  const [sortField, setSortField] = useState<SortField>('percentualEntrega');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  if (data.length === 0) {
    return <p className="text-gray-600">Nenhum dado encontrado.</p>;
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePrint = async () => {
    const table = document.getElementById('route-table');
    if (table) {
      try {
        const dataUrl = await htmlToImage.toPng(table, {
          quality: 1.0,
          width: 1920,
          height: table.offsetHeight,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left',
            width: '1920px'
          }
        });
        
        const link = document.createElement('a');
        link.download = `evolutivo-rotas-${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
  };

  const getPercentageStyle = (value: string, type: 'entrega' | 'rota') => {
    const percentage = parseFloat(value);
    
    if (type === 'entrega') {
      if (percentage >= 98) return 'bg-green-100 text-green-600';
      if (percentage >= 91) return 'bg-yellow-100 text-yellow-600';
      return 'bg-red-100 text-red-600';
    } else {
      if (percentage === 100) return 'bg-green-100 text-green-600';
      if (percentage >= 96) return 'bg-yellow-100 text-yellow-600';
      return 'bg-red-100 text-red-600';
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string' && aValue.includes('%')) {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue as string);
    }

    if (sortField === 'percentualEntrega' || sortField === 'percentualRota') {
      return sortDirection === 'asc' ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const renderSortButton = (field: SortField, label: string) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 w-full justify-center hover:bg-orange-600 transition-colors px-2 py-1 rounded"
    >
      {label}
      <ArrowUpDown size={16} className={`
        transition-transform
        ${sortField === field && sortDirection === 'desc' ? 'rotate-180' : ''}
      `} />
    </button>
  );

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Printer size={18} />
          Print
        </button>
      </div>
      <div className="overflow-x-auto">
        <table id="route-table" className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="bg-orange-500 text-white text-center">
              <th className="py-3 px-1 font-bold border border-gray-800 rounded-tl-lg w-[2px]">
                {renderSortButton('motorista', 'MOTORISTA')}
              </th>
              <th className="py-3 px-4 font-bold border border-gray-800 w-[100px]">
                {renderSortButton('rotas', 'ROTAS')}
              </th>
              <th className="py-3 px-4 font-bold border border-gray-800 w-[120px]">
                {renderSortButton('percentualEntrega', '% ENTREGA')}
              </th>
              <th className="py-3 px-4 font-bold border border-gray-800 w-[150px]">
                {renderSortButton('totalPedidos', 'TOTAL PEDIDOS')}
              </th>
              <th className="py-3 px-4 font-bold border border-gray-800 w-[120px]">
                {renderSortButton('entregue', 'ENTREGUE')}
              </th>
              <th className="py-3 px-4 font-bold border border-gray-800 w-[120px]">
                {renderSortButton('pendentes', 'PENDENTES')}
              </th>
              <th className="py-3 px-4 font-bold border border-gray-800 w-[120px]">
                {renderSortButton('insucessos', 'INSUCESSOS')}
              </th>
              <th className="py-3 px-4 font-bold border border-gray-800 rounded-tr-lg w-[120px]">
                {renderSortButton('percentualRota', '% ROTA')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={`${row.motorista}-${index}`} className={`${index % 2 === 0 ? 'bg-orange-50' : 'bg-white'} hover:bg-orange-100`}>
                <td className="py-3 px-4 border border-gray-800 font-semibold max-w-[200px] truncate overflow-hidden text-ellipsis">
                  {row.motorista.split(' (')[0]}
                </td>
                <td className="py-3 px-4 border border-gray-800 text-center font-semibold">{row.rotas}</td>
                <td className={`py-3 px-4 border border-gray-800 text-center font-semibold ${getPercentageStyle(row.percentualEntrega, 'entrega')}`}>
                  {row.percentualEntrega}
                </td>
                <td className="py-3 px-4 border border-gray-800 text-center font-semibold">
                  {row.totalPedidos}
                </td>
                <td className="py-3 px-4 border border-gray-800 text-center font-semibold">
                  {row.entregue}
                </td>
                <td className="py-3 px-4 border border-gray-800 text-center font-semibold">{row.pendentes}</td>
                <td className="py-3 px-4 border border-gray-800 text-center font-semibold">
                  {row.insucessos}
                </td>
                <td className={`py-3 px-4 border border-gray-800 text-center font-semibold ${getPercentageStyle(row.percentualRota, 'rota')}`}>
                  {row.percentualRota}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;