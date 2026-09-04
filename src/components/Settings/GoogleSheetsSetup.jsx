import React, { useState } from 'react';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';
import { Cloud, CloudOff, RefreshCw, ExternalLink, Save, CheckCircle2, XCircle } from 'lucide-react';
import { timeAgo } from '../../utils/formatters';
import { useToast } from '../common/Toast';

export default function GoogleSheetsSetup() {
  const { isConnected, spreadsheetUrl, clientId, lastSynced, syncStatus, setClientId, setSheetUrl, connect, disconnect, syncNow, autoSync, setAutoSync } = useGoogleSheets();
  const [localClientId, setLocalClientId] = useState(clientId || '');
  const [localSheetUrl, setLocalSheetUrl] = useState(spreadsheetUrl || '');
  const { showToast } = useToast();

  const handleSave = () => {
    setClientId(localClientId);
    setSheetUrl(localSheetUrl);
    showToast('Google Sheets credentials saved', 'success');
  };

  const handleSync = async () => {
    try {
      await syncNow();
      showToast('Synced successfully with Google Sheets', 'success');
    } catch (err) {
      showToast('Sync failed', 'error');
    }
  };

  return (
    <div className="sheets-setup">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Connection Status</span>
        {isConnected ? (
          <span className="status-badge connected">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span>
            Connected to Google Sheets
          </span>
        ) : (
          <span className="status-badge disconnected">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span>
            Not Connected
          </span>
        )}
      </div>

      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Setup Instructions
        </h4>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '0.5rem' }}>Create a Google Cloud Project and enable Google Sheets API.</li>
          <li style={{ marginBottom: '0.5rem' }}>Create an OAuth 2.0 Client ID for Web application.</li>
          <li style={{ marginBottom: '0.5rem' }}>Create a new Google Sheet and copy its URL.</li>
          <li>Paste the Client ID and URL below.</li>
        </ol>
      </div>

      <div className="form-group">
        <label>OAuth 2.0 Client ID</label>
        <input 
          type="text" 
          className="form-control" 
          value={localClientId} 
          onChange={(e) => setLocalClientId(e.target.value)} 
          placeholder="Enter your Client ID here"
        />
      </div>

      <div className="form-group">
        <label>Google Spreadsheet URL</label>
        <input 
          type="text" 
          className="form-control" 
          value={localSheetUrl} 
          onChange={(e) => setLocalSheetUrl(e.target.value)} 
          placeholder="https://docs.google.com/spreadsheets/d/..."
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={handleSave} style={{ flex: 1 }}>
          <Save size={18} /> Save Config
        </button>
        {!isConnected ? (
          <button className="btn btn-primary" onClick={connect} disabled={!localClientId} style={{ flex: 1 }}>
            Connect
          </button>
        ) : (
          <button className="btn btn-danger" onClick={disconnect} style={{ flex: 1 }}>
            Disconnect
          </button>
        )}
      </div>

      {isConnected && (
        <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Last Synced: {lastSynced ? <strong style={{color:'var(--text-primary)'}}>{timeAgo(lastSynced)}</strong> : 'Never'}
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={autoSync} 
                onChange={(e) => {
                  setAutoSync(e.target.checked);
                  showToast(`Auto sync ${e.target.checked ? 'enabled' : 'disabled'}`, 'success');
                }} 
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              Auto Sync
            </label>
          </div>
          <button className="btn btn-primary" onClick={handleSync} disabled={syncStatus === 'syncing'} style={{ width: '100%' }}>
            <RefreshCw size={18} className={syncStatus === 'syncing' ? 'spin' : ''} /> 
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}
    </div>
  );
}
