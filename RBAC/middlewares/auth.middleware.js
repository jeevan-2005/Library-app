const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.model");
require("dotenv").config();

const isAuth = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(500).send("You are not authenticated, Please Login.");
  } else {
    let isBlacklistToken = await blacklistModel.findOne({ token });
    if (isBlacklistToken) {
      return res.status(500).send("You are logged out, Please Login again!");
    }
    jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
      if (err) return res.send("Invalid Token, Please login again.");
      req.body.userId = decoded._doc._id;
      req.body.userName = decoded._doc.name;
      req.body.role = decoded._doc.role;
      next();
    });
  }
};

module.exports = isAuth;
