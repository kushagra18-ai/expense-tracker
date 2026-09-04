import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';
import { Cloud, RefreshCw, Save, CheckCircle2, XCircle, AlertCircle, LogIn, LogOut, ExternalLink } from 'lucide-react';
import { timeAgo } from '../../utils/formatters';
import { useToast } from '../common/Toast';

export default function GoogleSheetsSetup() {
  const {
    isConnected, spreadsheetUrl, clientId,
    lastSynced, syncStatus, syncError,
    initialized, autoSync,
    setClientId, setSheetUrl,
    connect, disconnect, syncNow, setAutoSync,
  } = useGoogleSheets();

  const { showToast } = useToast();

  // Bug 2 fix: sync localClientId and localSheetUrl from context whenever
  // context values load asynchronously from storage (they start as '' and
  // resolve after the initial useEffect in GoogleSheetsContext runs).
  const [localClientId, setLocalClientId] = useState('');
  const [localSheetUrl, setLocalSheetUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (clientId) setLocalClientId(clientId);
  }, [clientId]);

  useEffect(() => {
    if (spreadsheetUrl) setLocalSheetUrl(spreadsheetUrl);
  }, [spreadsheetUrl]);

  // Bug 1 + 4 fix: await setClientId (which calls initGoogleAuth) before
  // calling setSheetUrl, and only show success toast when both succeed.
  const handleSave = async () => {
    if (!localClientId.trim()) {
      showToast('Please enter your OAuth 2.0 Client ID', 'error');
      return;
    }
    setSaving(true);
    try {
      await setClientId(localClientId.trim());
      if (localSheetUrl.trim()) {
        await setSheetUrl(localSheetUrl.trim());
      }
      showToast('Settings saved — now click Connect', 'success');
    } catch (err) {
      showToast('Failed to initialize Google Auth: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = async () => {
    // Bug 3 fix: always call save first if the text fields are dirty
    if (!initialized) {
      showToast('Click "Save Settings" first to initialize auth', 'warning');
      return;
    }
    if (!localSheetUrl.trim()) {
      showToast('Enter your Google Sheet URL before connecting', 'warning');
      return;
    }
    setConnecting(true);
    try {
      // Ensure the sheet URL is persisted
      await setSheetUrl(localSheetUrl.trim());
      // Opens the Google OAuth popup
      connect();
      // connect() is synchronous (fires popup) — auth result comes via callback
      showToast('Google sign-in popup opened. Complete sign-in to connect.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    showToast('Disconnected from Google Sheets', 'success');
  };

  const handleSync = async () => {
    const result = await syncNow();
    if (result?.success) {
      showToast(`Synced! ${result.added} added, ${result.updated} updated`, 'success');
    } else {
      showToast('Sync failed: ' + (result?.error || 'Unknown error'), 'error');
    }
  };

  // Derived state
  const clientIdDirty = localClientId.trim() !== (clientId || '').trim();
  const sheetUrlDirty = localSheetUrl.trim() !== (spreadsheetUrl || '').trim();
  const hasDirtyFields = clientIdDirty || sheetUrlDirty;

  return (
    <div className="sheets-setup">

      {/* ── Status Banner ── */}
      <div className="sync-status-banner">
        {isConnected ? (
          <div className="status-row connected">
            <CheckCircle2 size={18} />
            <span>Connected to Google Sheets</span>
            {lastSynced && (
              <span className="last-sync-time">Last synced {timeAgo(lastSynced)}</span>
            )}
          </div>
        ) : (
          <div className="status-row disconnected">
            <XCircle size={18} />
            <span>Not connected — complete setup below</span>
          </div>
        )}
      </div>

      {/* ── Step 1: Credentials ── */}
      <div className="setup-step">
        <div className="step-header">
          <span className={`step-badge ${initialized ? 'done' : 'pending'}`}>
            {initialized ? <CheckCircle2 size={13} /> : '1'}
          </span>
          <h4>Google OAuth Credentials</h4>
        </div>

        <div className="step-help">
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noreferrer"
            className="help-link"
          >
            <ExternalLink size={13} /> Open Google Cloud Console
          </a>
          <span className="help-text">
            Create an OAuth 2.0 Client ID for a <strong>Web application</strong> and add <code>{window.location.origin}</code> as an Authorized JavaScript Origin.
          </span>
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>OAuth 2.0 Client ID</label>
          <input
            type="text"
            className="form-control"
            value={localClientId}
            onChange={e => setLocalClientId(e.target.value)}
            placeholder="xxxxxxxx.apps.googleusercontent.com"
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        <div className="form-group">
          <label>Google Spreadsheet URL</label>
          <input
            type="text"
            className="form-control"
            value={localSheetUrl}
            onChange={e => setLocalSheetUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            autoComplete="off"
            spellCheck="false"
          />
          <span className="field-hint">Paste the full URL of your Google Sheet</span>
        </div>

        <button
          className={`btn btn-primary save-btn ${saving ? 'loading' : ''} ${hasDirtyFields ? 'dirty' : ''}`}
          onClick={handleSave}
          disabled={saving || !localClientId.trim()}
        >
          {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : hasDirtyFields ? 'Save Settings *' : 'Save Settings'}
        </button>
      </div>

      {/* ── Step 2: Sign In ── */}
      <div className={`setup-step ${!initialized ? 'step-disabled' : ''}`}>
        <div className="step-header">
          <span className={`step-badge ${isConnected ? 'done' : initialized ? 'ready' : 'pending'}`}>
            {isConnected ? <CheckCircle2 size={13} /> : '2'}
          </span>
          <h4>Sign in with Google</h4>
        </div>

        {!initialized && (
          <p className="step-note">Complete Step 1 first to enable sign-in.</p>
        )}

        <div className="connect-row">
          {!isConnected ? (
            <button
              className="btn btn-google"
              onClick={handleConnect}
              disabled={!initialized || connecting}
            >
              <LogIn size={16} />
              {connecting ? 'Opening popup…' : 'Connect Google Account'}
            </button>
          ) : (
            <button className="btn btn-danger-soft" onClick={handleDisconnect}>
              <LogOut size={16} />
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* ── Step 3: Sync ── */}
      {isConnected && (
        <div className="setup-step">
          <div className="step-header">
            <span className="step-badge done"><CheckCircle2 size={13} /></span>
            <h4>Sync</h4>
          </div>

          <div className="sync-options">
            <label className="auto-sync-toggle">
              <span>Auto-sync on every expense</span>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={e => {
                  setAutoSync(e.target.checked);
                  showToast(`Auto sync ${e.target.checked ? 'on' : 'off'}`, 'success');
                }}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
            </label>

            {syncError && (
              <div className="sync-error-msg">
                <AlertCircle size={15} />
                <span>{syncError}</span>
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSync}
              disabled={syncStatus === 'syncing'}
              style={{ width: '100%' }}
            >
              <RefreshCw size={16} className={syncStatus === 'syncing' ? 'spin' : ''} />
              {syncStatus === 'syncing' ? 'Syncing…' : 'Pull from Sheet Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
