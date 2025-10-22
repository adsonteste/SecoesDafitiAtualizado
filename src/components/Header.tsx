import React from 'react';
import { FileSearch } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold">Sistema Neres</h1>
          </div>
          <div className="text-sm md:text-base">
            Gestão de Pedidos e Insucessos
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
