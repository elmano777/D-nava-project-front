import { useEffect, useState } from 'react';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'unknown';
  consecutiveFailures: number;
  isChecking: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
const HEALTH_CHECK_URL = `${API_BASE_URL}/health`;
const POLLING_INTERVAL = 15000; // 15 segundos durante mantenimiento

export const useHealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'ok',
    consecutiveFailures: 0,
    isChecking: false,
  });
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const checkHealth = async (): Promise<HealthStatus> => {
    try {
      const response = await fetch(HEALTH_CHECK_URL, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // No incluir credenciales/auth en health check
      });

      const data = await response.json();

      return {
        status: data.status || 'unknown',
        consecutiveFailures: data.database?.consecutiveFailures || 0,
        isChecking: false,
      };
    } catch (error) {
      // Si /health falla, asumir degraded
      return {
        status: 'degraded',
        consecutiveFailures: 999, // Fallo crítico
        isChecking: false,
      };
    }
  };

  const startMaintenanceMode = () => {
    setIsMaintenanceMode(true);
  };

  const stopMaintenanceMode = () => {
    setIsMaintenanceMode(false);
    // Auto-reload para limpiar estado
    window.location.reload();
  };

  useEffect(() => {
    if (!isMaintenanceMode) return;

    // Polling solo cuando estamos en modo mantenimiento
    const interval = setInterval(async () => {
      const status = await checkHealth();
      setHealthStatus(status);

      if (status.status === 'ok') {
        stopMaintenanceMode();
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [isMaintenanceMode]);

  return {
    healthStatus,
    isMaintenanceMode,
    checkHealth,
    startMaintenanceMode,
    stopMaintenanceMode,
  };
};
