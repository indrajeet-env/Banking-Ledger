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

async function getUserAccountsController(req, res){ // Get all accounts for the authenticated user (req.user is set by auth middleware)
  const user = req.user;

  const accounts = await accountModel.find({
    user: user._id,
  })

  res.status(200).json({
    accounts
  })
}

module.exports = {
  createAccountController, getUserAccountsController
}