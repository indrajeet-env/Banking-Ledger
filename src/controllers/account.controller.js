const userModel = require('../models/user.model');
const accountModel = require('../models/account.model');

async function createAccountController(req, res){ // Create a new account for the authenticated user (req.user is set by auth middleware)
  const user = req.user;

  const account = await accountModel.create({
    user: user._id,
  })

  res.status(201).json({
    account
  })
}

module.exports = {
  createAccountController
}