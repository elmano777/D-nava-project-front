import React from 'react';

interface MaintenancePageProps {
  consecutiveFailures: number;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  consecutiveFailures,
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4 bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icono de herramientas animado */}
        <div className="mb-6 relative">
          <svg
            className="w-24 h-24 mx-auto text-blue-500 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Estamos en Mantenimiento
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          Estamos trabajando para mejorar tu experiencia.
          <br />
          Volveremos en unos momentos.
        </p>

        {/* Indicador de reconexión */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            <span className="text-sm text-blue-700 font-medium">
              Reconectando automáticamente...
            </span>
          </div>
          {consecutiveFailures > 0 && consecutiveFailures < 999 && (
            <p className="text-xs text-gray-500 mt-2">
              Intentos de conexión: {consecutiveFailures}
            </p>
          )}
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse w-2/3"></div>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Esta página se actualizará automáticamente
        </p>
      </div>
    </div>
  );
};
