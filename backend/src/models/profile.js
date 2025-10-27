const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profile = sequelize.define('Profile', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  proxy: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'idle'
  }
}, {
  tableName: 'profiles'
});

module.exports = Profile;
