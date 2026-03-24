const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware'); // // Protect this route by ensuring only logged-in users with a valid JWT can access it, preventing unauthorized access or data manipulation

const accountController = require('../controllers/account.controller');

/**
 * - Route: POST /api/accounts/
 */

router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)

/**
 * - Route: GET /api/accounts/
 */

router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountsController) // this means that when a GET request is made to the /accounts endpoint, the authMiddleware will be executed first to check if the user is authenticated, and if the user is authenticated, then the getUserAccountsController will be executed to handle the logic of fetching the user's account details and returning it in the response.


/**
 * - Route: GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId", authMiddleware.authMiddleware, accountController.getAccountBalanceController)

module.exports = router;