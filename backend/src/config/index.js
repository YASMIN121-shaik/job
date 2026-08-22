
require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,

  frontendUrl:
    process.env.FRONTEND_URL || "http://localhost:3000",

  nodeEnv:
    process.env.NODE_ENV || "development",
};

module.exports = config;