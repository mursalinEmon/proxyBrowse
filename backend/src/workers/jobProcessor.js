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

  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        `--proxy-server=${profile.proxy}`
      ],
      userDataDir: `./profiles_data/profile_${profile.id}`
    });
    const page = await browser.newPage();
    if (profile.user_agent) {
      await page.setUserAgent(profile.user_agent);
    }
    await page.goto('https://www.google.com/');

    // await browser.close(); // we want to keep it open

    await Job.update({ status: 'success', result: 'Launched ok' }, { where: { id: jobId } });
  } catch (err) {
    console.error('Job error:', err);
    await Job.update({ status: 'failed', result: err.toString() }, { where: { id: jobId } });
  }
});
