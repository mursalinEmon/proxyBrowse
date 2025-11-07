const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profile = sequelize.define('Profile', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  proxy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  proxy_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'HTTP'
  },
  proxy_host: {
    type: DataTypes.STRING,
    allowNull: false
  },
  proxy_port: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  proxy_username: {
    type: DataTypes.STRING,
    allowNull: true
  },
  proxy_password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ip_checker: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'ipify'
  },
  change_ip_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'none'
  },
  tabs: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('tabs');
      try {
        return rawValue ? JSON.parse(rawValue) : [];
      } catch (err) {
        return [];
      }
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('tabs', JSON.stringify(value));
      } else if (typeof value === 'string') {
        this.setDataValue('tabs', value);
      } else {
        this.setDataValue('tabs', null);
      }
    }
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
