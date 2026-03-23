const express = require('express');
const transactionRouter = express.Router();

const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middleware/auth.middleware');

transactionRouter.post('/', authMiddleware.authMiddleware, transactionController.createTransactionController); // this means that when a POST request is made to the /transactions endpoint, the authMiddleware will be executed first to check if the user is authenticated, and if the user is authenticated, then the createTransactionController will be executed to handle the transaction creation logic.


/**
 * - POST - /api/transactions/system/initial-funds
 * Create initial fund transaction from system user
 */

transactionRouter.post('/system/initial-funds', authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction); // this endpoint is used to create initial fund transaction from system user to a user account, this will be used when we want to add funds to a user's account for the first time, for example, when a user signs up and we want to give them some initial funds in their account, then we can use this endpoint to create a transaction from the system user to the user's account with the specified amount.

module.exports = transactionRouter;