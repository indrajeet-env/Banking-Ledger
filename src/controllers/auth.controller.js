const userModel = require('../models/user.model');

const jwt = require('jsonwebtoken');

const emailService = require('../services/email.service');

/**
 * 
 * - user register controller
 * - POST -> /api/auth/register
 */
async function userRegisterController(req, res){
  const {email, name, password} = req.body; // this means that we are getting email, name and password from the request body, which is sent by the client when user is trying to register

  const isExist = await userModel.findOne({email : email}); // (the email is passed from req.body) here we are checking if a user with the same email already exists in the database, if it exists, then we will not allow the user to register with the same email, because email should be unique for each user.

  if(isExist){
    return res.status(422).json({
      message: "User already exists with this email, please login instead",
      status: "failed",
    })
  }

  const user = await userModel.create({
    email, password, name
  })

  const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'}) // this means that we are creating a JWT token for the user, and we are signing the token with the user's id and a secret key, which is stored in the environment variable JWT_SECRET, and we are setting the token to expire in 1 day

  res.cookie("token", token)

  res.status(201).json({
    user: {
      _id : user._id,
      name: user.name,
      email: user.email,
    }, 
    token
  }) //status code 201 means that the user is created successfully, and we are sending a json response with a message and the user data, which is sent back to the client after successful registration

  await emailService.sendRegistrationEmail(user.email, user.name)
}

/**
 * 
 * - user login controller
 * - POST -> /api/auth/login
 */
async function userLoginController(req, res){
  const {email, password} = req.body; // this means that we are getting email and password from the request body, which is sent by the client when user is trying to login


  const user = await userModel.findOne({email: email}).select('+password') // this means that we are finding the user in the database with the email entered by the user, and if the user is not found, then we will send an error response back to the client, because if user is not found, then it means that the email entered by the user is incorrect

  if(!user){
    return res.status(404).json({
      message: "User not found with this email, please register first",
      status: "failed",
    })
  }

  const isValidPass = await user.comparePassword(password);

  // When password is incorrect, then we will send an error response back to the client, because it means that the user is trying to login with wrong password, and we will not allow the user to login with wrong password
  if(!isValidPass){
    return res.status(401).json({
      message: "Invalid password, please try again",
      status: "failed",
    })
  }

  const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1d'}) // If the password is correct, then we will create a JWT token for the user, and we are signing the token with the user's id and a secret key, which is stored in the environment variable JWT_SECRET, and we are setting the token to expire in 1 day

  res.cookie("token", token)

  res.status(200).json({
    user: {
      _id : user._id,
      name: user.name,
      email: user.email,
    }, 
    token
  }) //status code 201 means that the user is created successfully, and we are sending a json response with a message and the user data, which is sent back to the client after successful registration
  
}

module.exports ={
  userRegisterController,
  userLoginController
}