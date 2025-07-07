import React, { ChangeEvent } from 'react';

interface HeaderConfigProps {
  title: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const HeaderConfig: React.FC<HeaderConfigProps> = ({ 
  title, 
  value, 
  onChange, 
  placeholder 
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{title}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <p className="text-xs text-gray-500">
        Insira os cabeçalhos separados por vírgula
      </p>
    </div>
  );
};

export default HeaderConfig;