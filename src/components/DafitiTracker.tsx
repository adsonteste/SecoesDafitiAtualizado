import React, { useEffect } from 'react';

function RouteEvolution() {
  useEffect(() => {
    // Redireciona automaticamente quando o componente é montado
    window.location.href = 'https://rotas-phi.vercel.app/';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Redirecionando...
          </h2>
          
          <p className="text-gray-600 text-sm">
            Abrindo o sistema Evolutivo de Rotas...
          </p>
          
          <div className="mt-6">
            <a 
              href="https://rotas-phi.vercel.app/" 
              className="text-green-600 hover:text-green-700 underline text-sm"
            >
              Clique aqui se não abrir automaticamente
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteEvolution;
