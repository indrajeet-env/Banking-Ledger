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

async function getAccountBalanceController(req, res){// Get the balance of a specific account for the authenticated user
  const {accountId} = req.params; // Extract the accountId from the request parameters entered by the user in the URL
  
  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id, // Ensure the account belongs to that authenticated user only, and he his trying to access his own account balance, not someone else's account balance
  })

  if(!account){
    return res.status(404).json({
      message: "Account not found"
    })
  }

  const balance = await account.getBalance(); // Call the getBalance method from the account model to calculate the balance of the specified account

  res.status(200).json({
    accountId: account._id,
    balance: balance
  })

}

module.exports = {
  createAccountController, getUserAccountsController, getAccountBalanceController
}