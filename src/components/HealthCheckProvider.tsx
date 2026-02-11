'use client';

import { useEffect } from 'react';
import { setMaintenanceModeCallback } from '@/lib/api';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { MaintenancePage } from './MaintenancePage';

export function HealthCheckProvider({ children }: { children: React.ReactNode }) {
  const { healthStatus, isMaintenanceMode, startMaintenanceMode } = useHealthCheck();

  useEffect(() => {
    // Registrar callback para activar modo mantenimiento desde apiFetch
    setMaintenanceModeCallback(startMaintenanceMode);
  }, [startMaintenanceMode]);

  if (isMaintenanceMode) {
    return <MaintenancePage consecutiveFailures={healthStatus.consecutiveFailures} />;
  }

  return <>{children}</>;
}
