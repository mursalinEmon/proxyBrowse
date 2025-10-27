const { Profile } = require('../models');

exports.listProfiles = async (req, res) => {
  try {
    const profiles = await Profile.findAll();
    res.json(profiles);
  } catch (err) {
    console.error('Error listing profiles', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createProfile = async (req, res) => {
  const { name, proxy, user_agent } = req.body;
  try {
    const profile = await Profile.create({ name, proxy, user_agent });
    res.status(201).json(profile);
  } catch (err) {
    console.error('Error creating profile', err);
    res.status(500).json({ error: 'Server error' });
  }
};
