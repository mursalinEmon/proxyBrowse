import React, { useState, useEffect } from 'react';
import { createProfile, checkProxy } from '../services/api';
import './styles.css';

const proxyTypeOptions = ['HTTP', 'HTTPS', 'SOCKS5'];
const ipCheckerOptions = ['ipify', 'ipapi', 'IP2Location'];
const platformOptions = ['none', 'ios', 'android', 'windows', 'mac'];

function ProfileForm({ onCreated, onUpdated, editingProfile, onCancelEdit }) {
  const [name, setName] = useState('');
  const [proxyType, setProxyType] = useState('HTTP');
  const [proxyHost, setProxyHost] = useState('');
  const [proxyPort, setProxyPort] = useState('');
  const [proxyUsername, setProxyUsername] = useState('');
  const [proxyPassword, setProxyPassword] = useState('');
  const [ipChecker, setIpChecker] = useState('ipify');
  const [changeIpUrl, setChangeIpUrl] = useState('');
  const [platform, setPlatform] = useState('none');
  const [tabs, setTabs] = useState('');
  const [userAgent, setUserAgent] = useState('');
  const [checkingProxy, setCheckingProxy] = useState(false);
  const [proxyCheckResult, setProxyCheckResult] = useState(null);
  const isEditing = Boolean(editingProfile);

  const resetForm = () => {
    setName('');
    setProxyType('HTTP');
    setProxyHost('');
    setProxyPort('');
    setProxyUsername('');
    setProxyPassword('');
    setIpChecker('ipify');
    setChangeIpUrl('');
    setPlatform('none');
    setTabs('');
    setUserAgent('');
    setProxyCheckResult(null);
  };

  useEffect(() => {
    if (editingProfile) {
      setName(editingProfile.name || '');
      setProxyType(editingProfile.proxy_type || 'HTTP');
      setProxyHost(editingProfile.proxy_host || '');
      setProxyPort(editingProfile.proxy_port ? String(editingProfile.proxy_port) : '');
      setProxyUsername(editingProfile.proxy_username || '');
      setProxyPassword('');
      setIpChecker((editingProfile.ip_checker || 'ipify'));
      setChangeIpUrl(editingProfile.change_ip_url || '');
      setPlatform(editingProfile.platform || 'none');
      const tabString = Array.isArray(editingProfile.tabs)
        ? editingProfile.tabs.join('\n')
        : (editingProfile.tabs || '');
      setTabs(tabString);
      setUserAgent(editingProfile.user_agent || '');
      setProxyCheckResult(null);
    } else {
      resetForm();
    }
  }, [editingProfile]);

  const effectiveProxyPassword = proxyPassword || (isEditing && editingProfile?.proxy_password !== '********'
    ? editingProfile?.proxy_password
    : undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        proxy_type: proxyType,
        proxy_host: proxyHost,
        proxy_port: proxyPort,
        proxy_username: proxyUsername || undefined,
        ip_checker: ipChecker,
        change_ip_url: changeIpUrl || undefined,
        platform,
        tabs,
        user_agent: userAgent || undefined
      };

      if (proxyPassword) {
        payload.proxy_password = proxyPassword;
      } else if (isEditing && editingProfile?.proxy_password && editingProfile.proxy_password !== '********') {
        payload.proxy_password = editingProfile.proxy_password;
      }

      let savedProfile;
      if (editingProfile && onUpdated) {
        savedProfile = await onUpdated(editingProfile.id, payload);
      } else {
        const resp = await createProfile(payload);
        savedProfile = resp.data;
      }
      onCreated(savedProfile);
      resetForm();
      if (editingProfile) {
        onCancelEdit?.();
      }
    } catch (err) {
      console.error('Error saving profile', err);
    }
  };

  const handleCheckProxy = async () => {
    if (!proxyHost || !proxyPort) {
      return;
    }
    setCheckingProxy(true);
    setProxyCheckResult(null);
    try {
      const resp = await checkProxy({
        proxy_type: proxyType,
        proxy_host: proxyHost,
        proxy_port: proxyPort,
        proxy_username: proxyUsername || undefined,
        proxy_password: effectiveProxyPassword,
        ip_checker: ipChecker
      });
      setProxyCheckResult({
        success: true,
        latency: resp.data.latency,
        result: resp.data.result
      });
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Unknown error';
      setProxyCheckResult({ success: false, error: message });
    } finally {
      setCheckingProxy(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit?.();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{isEditing ? 'Edit Profile' : 'Create a New Profile'}</h3>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <label className="field-label">Proxy Type</label>
      <select value={proxyType} onChange={e => setProxyType(e.target.value)}>
        {proxyTypeOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <div className="grid two">
        <input placeholder="Proxy Host" value={proxyHost} onChange={e => setProxyHost(e.target.value)} required />
        <input placeholder="Proxy Port" value={proxyPort} onChange={e => setProxyPort(e.target.value)} required />
      </div>
      <div className="grid two">
        <input placeholder="Proxy Username (optional)" value={proxyUsername} onChange={e => setProxyUsername(e.target.value)} />
        <input placeholder="Proxy Password (optional)" type="password" value={proxyPassword} onChange={e => setProxyPassword(e.target.value)} />
      </div>
      <label className="field-label">IP Checker</label>
      <select value={ipChecker} onChange={e => setIpChecker(e.target.value)}>
        {ipCheckerOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleCheckProxy}
        disabled={checkingProxy || !proxyHost || !proxyPort}
      >
        {checkingProxy ? 'Checking…' : 'Check Proxy'}
      </button>
      {proxyCheckResult && (
        <div className={`proxy-check ${proxyCheckResult.success ? 'success' : 'error'}`}>
          {proxyCheckResult.success ? (
            <>
              <span>Proxy reachable. </span>
              <span>Latency: {proxyCheckResult.latency} ms. </span>
              {proxyCheckResult.result?.ip && <span>Detected IP: {proxyCheckResult.result.ip}</span>}
            </>
          ) : (
            <span>Error: {proxyCheckResult.error}</span>
          )}
        </div>
      )}
      <input placeholder="Change IP URL (optional)" value={changeIpUrl} onChange={e => setChangeIpUrl(e.target.value)} />
      <label className="field-label">Platform</label>
      <select value={platform} onChange={e => setPlatform(e.target.value)}>
        {platformOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <textarea
        placeholder="Tabs to open (one URL per line)"
        value={tabs}
        onChange={e => setTabs(e.target.value)}
        rows={4}
      />
      <input placeholder="User Agent" value={userAgent} onChange={e => setUserAgent(e.target.value)} />
      <div className="form-actions">
        <button type="submit">{isEditing ? 'Update Profile' : 'Create Profile'}</button>
        {isEditing && (
          <button type="button" className="secondary" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ProfileForm;
