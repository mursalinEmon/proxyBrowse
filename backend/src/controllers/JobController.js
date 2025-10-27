const { Job, Profile } = require('../models');
const { launchQueue } = require('../queue/queue');

exports.listJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({ include: { model: Profile } });
    res.json(jobs);
  } catch (err) {
    console.error('Error listing jobs', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.launchProfile = async (req, res) => {
  const { profileId } = req.body;
  try {
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    const jobRec = await Job.create({
      profile_id: profile.id,
      type: 'launch_browser'
    });
    await launchQueue.add({
      jobId: jobRec.id,
      profileId: profile.id
    });
    res.json({ job: jobRec });
  } catch (err) {
    console.error('Error launching profile', err);
    res.status(500).json({ error: 'Server error' });
  }
};
