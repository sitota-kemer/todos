/*
    - This file is used to read all enviromental variables and export them.
    - It is good not to directly use the enviromental variables from process.env object.
    - Use dotenv library to do that for you.
*/

// ----------------------------------------------
// Dotenv
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

// Export the variables
module.exports = {
  env: process.env.NODE_ENV,
  host: process.env.HOST,
  port: process.env.PORT,
  db: {
    remote: process.env.DB_REMOTE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresin: process.env.JWT_EXPIRESIN,
  },
  email: {
    api: process.env.EMAIL_API_KEY,
    from: "nebyu@kemercode.com",
  },
};
