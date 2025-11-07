const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { Profile } = require('../models');

const IP_CHECKER_URLS = {
  ipify: 'https://api.ipify.org?format=json',
  ipapi: 'https://ipapi.co/json/',
  ip2location: 'https://ipwho.is/'
};

function buildProxyUrl({
  proxy_type = 'HTTP',
  proxy_host,
  proxy_port,
  proxy_username,
  proxy_password
}) {
  if (!proxy_host || !proxy_port) {
    throw new Error('Proxy host and port are required');
  }
  const protocol = proxy_type && proxy_type.toLowerCase().startsWith('https') ? 'https' : 'http';
  const credentials = proxy_username && proxy_password
    ? `${encodeURIComponent(proxy_username)}:${encodeURIComponent(proxy_password)}@`
    : '';
  return `${protocol}://${credentials}${proxy_host}:${proxy_port}`;
}

function resolveCheckerUrl(ipChecker) {
  const key = (ipChecker || 'ipify').toLowerCase();
  return IP_CHECKER_URLS[key] || IP_CHECKER_URLS.ipify;
}

exports.listProfiles = async (req, res) => {
  try {
    const profiles = await Profile.findAll();
    const sanitized = profiles.map((profile) => {
      const data = profile.toJSON();
      if (data.proxy_password) {
        data.proxy_password = '********';
      }
      return data;
    });
    res.json(sanitized);
  } catch (err) {
    console.error('Error listing profiles', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.checkProxy = async (req, res) => {
  const {
    proxy_type,
    proxy_host,
    proxy_port,
    proxy_username,
    proxy_password,
    ip_checker
  } = req.body;

  try {
    const proxyUrl = buildProxyUrl({
      proxy_type,
      proxy_host,
      proxy_port,
      proxy_username,
      proxy_password
    });
    const targetUrl = resolveCheckerUrl(ip_checker);

    const agent = new HttpsProxyAgent(proxyUrl);
    const startedAt = Date.now();
    const response = await axios.get(targetUrl, {
      timeout: 7000,
      httpAgent: agent,
      httpsAgent: agent,
      proxy: false
    });
    const latency = Date.now() - startedAt;

    res.json({
      success: true,
      latency,
      checker: targetUrl,
      result: response.data
    });
  } catch (err) {
    console.error('Proxy check failed', err);
    res.status(400).json({
      success: false,
      error: err.message || 'Proxy check failed'
    });
  }
};

function normalizeProfilePayload(body) {
  const {
    name,
    proxy_type,
    proxy_host,
    proxy_port,
    proxy_username,
    proxy_password,
    ip_checker,
    change_ip_url,
    platform,
    tabs,
    user_agent
  } = body;

  const normalizedTabs = Array.isArray(tabs)
    ? tabs
    : typeof tabs === 'string'
      ? tabs
        .split(/\r?\n/)
        .map((tab) => tab.trim())
        .filter(Boolean)
      : [];

  const numericPort = proxy_port ? parseInt(proxy_port, 10) : null;

  return {
    name,
    proxy_type: proxy_type || 'HTTP',
    proxy_host,
    proxy_port: Number.isNaN(numericPort) ? null : numericPort,
    proxy_username: proxy_username || null,
    proxy_password: proxy_password || null,
    ip_checker: ip_checker || 'ipify',
    change_ip_url: change_ip_url || null,
    platform: platform || 'none',
    tabs: normalizedTabs,
    user_agent: user_agent || null
  };
}

exports.createProfile = async (req, res) => {
  const payload = normalizeProfilePayload(req.body);

  if (payload.proxy_port === null) {
    return res.status(400).json({ error: 'Proxy port must be a number' });
  }

  try {
    const profile = await Profile.create({
      ...payload,
      proxy: payload.proxy_host && payload.proxy_port
        ? `${payload.proxy_host}:${payload.proxy_port}`
        : null
    });
    res.status(201).json(profile);
  } catch (err) {
    console.error('Error creating profile', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const payload = normalizeProfilePayload(req.body);

  if (payload.proxy_port === null) {
    return res.status(400).json({ error: 'Proxy port must be a number' });
  }

  try {
    const [affected] = await Profile.update(
      {
        ...payload,
        proxy: payload.proxy_host && payload.proxy_port
          ? `${payload.proxy_host}:${payload.proxy_port}`
          : null
      },
      { where: { id } }
    );
    if (!affected) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const updated = await Profile.findByPk(id);
    res.json(updated);
  } catch (err) {
    console.error('Error updating profile', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Profile.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting profile', err);
    res.status(500).json({ error: 'Server error' });
  }
};
