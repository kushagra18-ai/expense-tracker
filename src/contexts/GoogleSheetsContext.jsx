import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initGoogleAuth, signIn as gSignIn, signOut as gSignOut, isAuthenticated as gIsAuth } from '../services/googleAuth';
import { extractSpreadsheetId, createExpensesSheet, createDashboardSheet } from '../services/googleSheets';
import { syncFromSheet } from '../services/sync';
import * as storage from '../services/storage';

const GoogleSheetsContext = createContext(null);

export function GoogleSheetsProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [spreadsheetId, setSpreadsheetIdState] = useState(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [clientId, setClientIdState] = useState('');
  const [lastSynced, setLastSynced] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [syncError, setSyncError] = useState(null);
  const [autoSync, setAutoSyncState] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    loadSavedSettings();
  }, []);

  const loadSavedSettings = async () => {
    const savedClientId = await storage.getSetting('googleClientId');
    const savedSheetUrl = await storage.getSetting('googleSheetUrl');
    const savedSheetId = await storage.getSetting('spreadsheetId');
    const savedLastSync = await storage.getSetting('lastSynced');
    const savedAutoSync = await storage.getSetting('autoSync');
    
    if (savedClientId) setClientIdState(savedClientId);
    if (savedSheetUrl) setSpreadsheetUrl(savedSheetUrl);
    if (savedSheetId) setSpreadsheetIdState(savedSheetId);
    if (savedLastSync) setLastSynced(new Date(savedLastSync));
    if (savedAutoSync !== undefined) setAutoSyncState(savedAutoSync);
    
    // Try to initialize auth if client ID exists
    if (savedClientId) {
      try {
        await initGoogleAuth(savedClientId, handleAuthChange);
        setInitialized(true);
      } catch (err) {
        console.error('Failed to init Google Auth:', err);
      }
    }
  };

  const handleAuthChange = useCallback(({ authenticated }) => {
    setIsConnected(authenticated);
  }, []);

  const setClientId = useCallback(async (id) => {
    setClientIdState(id);
    await storage.setSetting('googleClientId', id);
    
    if (id) {
      try {
        await initGoogleAuth(id, handleAuthChange);
        setInitialized(true);
      } catch (err) {
        console.error('Failed to init Google Auth:', err);
      }
    }
  }, [handleAuthChange]);

  const setSheetUrl = useCallback(async (url) => {
    setSpreadsheetUrl(url);
    await storage.setSetting('googleSheetUrl', url);
    
    const sheetId = extractSpreadsheetId(url);
    setSpreadsheetIdState(sheetId);
    await storage.setSetting('spreadsheetId', sheetId);
  }, []);

  const connect = useCallback(async () => {
    if (!initialized) {
      throw new Error('Set your Google Client ID first');
    }
    gSignIn();
  }, [initialized]);

  const disconnect = useCallback(() => {
    gSignOut();
    setIsConnected(false);
  }, []);

  const setupSheets = useCallback(async () => {
    if (!spreadsheetId || !isConnected) return;
    
    try {
      await createExpensesSheet(spreadsheetId);
      await createDashboardSheet(spreadsheetId);
    } catch (err) {
      console.error('Failed to setup sheets:', err);
      throw err;
    }
  }, [spreadsheetId, isConnected]);

  const syncNow = useCallback(async (categories) => {
    if (!spreadsheetId || !isConnected) return;
    
    setSyncStatus('syncing');
    setSyncError(null);
    
    try {
      const result = await syncFromSheet(spreadsheetId, categories);
      if (result.success) {
        const now = new Date();
        setLastSynced(now);
        await storage.setSetting('lastSynced', now.toISOString());
        setSyncStatus('success');
        return result;
      } else {
        setSyncStatus('error');
        setSyncError(result.error);
        return result;
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  }, [spreadsheetId, isConnected]);

  const setAutoSync = useCallback(async (enabled) => {
    setAutoSyncState(enabled);
    await storage.setSetting('autoSync', enabled);
  }, []);

  const value = {
    isConnected,
    spreadsheetId,
    spreadsheetUrl,
    clientId,
    lastSynced,
    syncStatus,
    syncError,
    autoSync,
    initialized,
    setClientId,
    setSheetUrl,
    connect,
    disconnect,
    setupSheets,
    syncNow,
    setAutoSync,
  };

  return (
    <GoogleSheetsContext.Provider value={value}>
      {children}
    </GoogleSheetsContext.Provider>
  );
}

export function useGoogleSheets() {
  const ctx = useContext(GoogleSheetsContext);
  if (!ctx) throw new Error('useGoogleSheets must be used within GoogleSheetsProvider');
  return ctx;
}

export default GoogleSheetsContext;
