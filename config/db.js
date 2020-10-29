'use strict';
 
var Sequelize = require('sequelize');
var db = {};

var sequelize = new Sequelize(
  process.env.DB_DATABASE,
  null,
  null, 
  {
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306, 
    replication: {
      read: [
        { host: process.env.DB_HOST_READ, username: process.env.DB_USER, password: process.env.DB_PASS },
      ],
      write: { host: process.env.DB_HOST, username: process.env.DB_USER, password: process.env.DB_PASS }
    },
    // similar for sync: you can define this to always force sync for models
    sync: {
      force: false
    },
    // pool configuration used to pool database connections
    pool: {
      max: 5,
      idle: 30000,
      acquire: 60000,
    },
  }

);


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;