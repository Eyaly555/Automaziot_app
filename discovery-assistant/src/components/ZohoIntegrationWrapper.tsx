import React from 'react';
import { useZohoIntegration } from '../hooks/useZohoIntegration';
import { ZohoModeIndicator } from './ZohoModeIndicator';
import { ZohoConsent } from './ZohoConsent';
import { ZohoNotifications } from './ZohoNotifications';

interface ZohoIntegrationWrapperProps {
  children: React.ReactNode;
}

export const ZohoIntegrationWrapper: React.FC<ZohoIntegrationWrapperProps> = ({ children }) => {
  const { isZohoMode } = useZohoIntegration();

  return (
    <>
      {children}
      {isZohoMode && <ZohoModeIndicator />}
      <ZohoConsent />
      <ZohoNotifications />
    </>
  );
};