// All the authentication related routes are defined here
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST -> /api/auth/register  , it will be read as this
router.post("/register", authController.userRegisterController) // this means that when user is trying to register, then we will call the userRegisterController function from auth.controller.js file, and we will pass the request and response objects to that function, and then that function will handle the registration logic, and then it will send the response back to the client


// POST -> /api/auth/login
router.post("/login", authController.userLoginController)


module.exports = router;