require('dotenv').config();
const { launchQueue } = require('../queue/queue');
const { Job, Profile, sequelize } = require('../models');
const puppeteer = require('puppeteer');

launchQueue.process(async (job) => {
  const { jobId, profileId } = job.data;
  console.log(`Processing job ${jobId}, profile ${profileId}`);

  // mark running
  await Job.update({ status: 'running' }, { where: { id: jobId } });

  const profile = await Profile.findByPk(profileId);
  if (!profile) {
    await Job.update({ status: 'failed', result: 'Profile not found' }, { where: { id: jobId } });
    return;
  }

  const buildProxyArg = () => {
    const type = (profile.proxy_type || 'HTTP').toLowerCase();
    const host = profile.proxy_host;
    const port = profile.proxy_port;
    if (!host || !port) {
      throw new Error('Profile proxy host/port missing');
    }
    if (type.startsWith('socks')) {
      return `socks5://${host}:${port}`;
    }
    if (type.startsWith('https')) {
      return `https://${host}:${port}`;
    }
    return `http://${host}:${port}`;
  };

  const normalizeUrl = (url) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    return `https://${url}`;
  };

  const PLATFORM_PRESETS = {
    ios: {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/109.0.0.0 Mobile/15E148 Safari/604.1',
      viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
      device: puppeteer.devices['iPhone 13 Pro']
    },
    android: {
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
      viewport: { width: 412, height: 915, deviceScaleFactor: 2.75, isMobile: true, hasTouch: true },
      device: puppeteer.devices['Pixel 5']
    },
    windows: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768, deviceScaleFactor: 1 }
    },
    mac: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
      viewport: { width: 1440, height: 900, deviceScaleFactor: 2 }
    }
  };

  const applyPrivacyProtections = async (page) => {
    await page.evaluateOnNewDocument(() => {
      const block = () => {
        throw new Error('WebRTC disabled');
      };
      const fakeConnection = function () {
        return {
          createDataChannel: block,
          removeTrack: block,
          addTrack: block,
          addStream: block,
          removeStream: block,
          close: () => {},
          getSenders: () => [],
          getReceivers: () => [],
          getLocalStreams: () => [],
          getRemoteStreams: () => []
        };
      };
      Object.defineProperty(window, 'RTCPeerConnection', {
        value: fakeConnection,
        configurable: true
      });
      Object.defineProperty(window, 'webkitRTCPeerConnection', {
        value: fakeConnection,
        configurable: true
      });
      if (navigator.mediaDevices) {
        Object.defineProperty(navigator, 'mediaDevices', {
          value: {
            getUserMedia: () => Promise.reject(new Error('WebRTC disabled')),
            getDisplayMedia: () => Promise.reject(new Error('WebRTC disabled')),
            enumerateDevices: () => Promise.resolve([])
          },
          configurable: true
        });
      } else {
        Object.defineProperty(navigator, 'mediaDevices', {
          value: {
            getUserMedia: () => Promise.reject(new Error('WebRTC disabled')),
            getDisplayMedia: () => Promise.reject(new Error('WebRTC disabled')),
            enumerateDevices: () => Promise.resolve([])
          },
          configurable: true
        });
      }
    });
  };

  try {
    const proxyArg = buildProxyArg();
    const launchArgs = [
      `--proxy-server=${proxyArg}`,
      '--force-webrtc-ip-handling-policy=disable_non_proxied_udp',
      '--webrtc-ip-handling-policy=disable_non_proxied_udp',
      '--enforce-webrtc-ip-permission-check',
      '--disable-ipc-flooding-protection'
    ];
    const browser = await puppeteer.launch({
      headless: false,
      args: launchArgs,
      userDataDir: `./profiles_data/profile_${profile.id}`
    });
    const page = await browser.newPage();
    await applyPrivacyProtections(page);
    const platformKey = (profile.platform || 'none').toLowerCase();
    const preset = PLATFORM_PRESETS[platformKey];
    const userAgentToUse = profile.user_agent || preset?.userAgent;
    if (preset?.device) {
      await page.emulate(preset.device);
      if (userAgentToUse && userAgentToUse !== preset.device.userAgent) {
        await page.setUserAgent(userAgentToUse);
      }
    } else {
      if (userAgentToUse) {
        await page.setUserAgent(userAgentToUse);
      }
      if (preset?.viewport) {
        await page.setViewport(preset.viewport);
      }
    }
    if (profile.proxy_username && profile.proxy_password) {
      await page.authenticate({
        username: profile.proxy_username,
        password: profile.proxy_password
      });
    }

    const tabsToOpen = Array.isArray(profile.tabs) && profile.tabs.length > 0
      ? profile.tabs
      : ['https://www.google.com/'];

    const normalizedTabs = tabsToOpen
      .map(normalizeUrl)
      .filter(Boolean);

    for (let index = 0; index < normalizedTabs.length; index += 1) {
      const targetUrl = normalizedTabs[index];
      if (index === 0) {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      } else {
        const tab = await browser.newPage();
        if (preset?.device) {
          await tab.emulate(preset.device);
          if (userAgentToUse && userAgentToUse !== preset.device.userAgent) {
            await tab.setUserAgent(userAgentToUse);
          }
        } else {
          if (userAgentToUse) {
            await tab.setUserAgent(userAgentToUse);
          }
          if (preset?.viewport) {
            await tab.setViewport(preset.viewport);
          }
        }
        if (profile.proxy_username && profile.proxy_password) {
          await tab.authenticate({
            username: profile.proxy_username,
            password: profile.proxy_password
          });
        }
        await applyPrivacyProtections(tab);
        await tab.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      }
    }

    // await browser.close(); // we want to keep it open

    await Job.update({
      status: 'success',
      result: `Launched with ${normalizedTabs.length} tab(s)`
    }, { where: { id: jobId } });
  } catch (err) {
    console.error('Job error:', err);
    await Job.update({ status: 'failed', result: err.toString() }, { where: { id: jobId } });
  }
});
