const sequelize = require('../config/db');
const Profile = require('./profile');
const Job = require('./job');

// define relationships
Profile.hasMany(Job, { foreignKey: 'profile_id', onDelete: 'CASCADE' });
Job.belongsTo(Profile, { foreignKey: 'profile_id' });

module.exports = {
  sequelize,
  Profile,
  Job
};
