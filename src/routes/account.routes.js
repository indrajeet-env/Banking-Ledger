const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware'); // // Protect this route by ensuring only logged-in users with a valid JWT can access it, preventing unauthorized access or data manipulation

const accountController = require('../controllers/account.controller');

/**
 * - Route: POST /api/accounts/
 */

router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)

module.exports = router;