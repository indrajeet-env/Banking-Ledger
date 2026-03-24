const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

const tokenBlacklistModel = require('../models/blacklist.model');

async function authMiddleware(req, res, next){
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token; // Try to get JWT token from cookie or from header i.e "Authorization: Bearer <token>" header  

  // Aur agar dono hi jagah token nhi mila that means, user ne logged in nhi kiya hai, toh hum usko access denge hi nhi, aur error message bhejenge ki login kro pehle

  if(!token){
    return res.status(401).json({
      message: "Unauthorized user, user isn't logged in, please login to access this resource",
    })
  }

  // Check if the token is blacklisted (i.e., user has logged out), agar token blacklist mai mila, that means user ne logout kiya hai, toh usko access denge hi nhi, aur error message bhejenge ki login kro pehle
  const isBlacklisted = await tokenBlacklistModel.findOne({token}); // Check if the token is blacklisted (i.e., user has logged out)

  if(isBlacklisted){
    return res.status(401).json({
      message: "Unauthorized user, please login to access this resource, or your token might be expired or invalid",
    })
  }

  try{ // Verify token, extract userId, fetch user from DB and allow request if valid

    const decoded = jwt.verify (token, process.env.JWT_SECRET) // this means that we are verifying the token with the secret key, and if the token is valid, then we will get the decoded payload, which contains the user id, and if the token is invalid, then it will throw an error, which will be caught by the catch block below

    const user = await userModel.findById(decoded.userId) // // Fetch user from DB using userId from token

    req.user = user; // set kro req.user mai

    return next(); // Allow request to continue (auth passed, continue to the next middleware or controller)
      
    } catch(error){ // Token invalid or expired → block access
    return res.status(401).json({
      message: "Unauthorized user, invalid token",
    })
  }
}

async function authSystemUserMiddleware(req, res, next){
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token; // Try to get JWT token from cookie or from header i.e "Authorization: Bearer <token>" header  

  if(!token){
    return res.status(401).json({
      message: "Unauthorized user, user isn't logged in, please login to access this resource",
    })
  }

  // Same check will be done for systemUser, agar token blacklist mai mila, that means user ne logout kiya hai, toh usko access denge hi nhi, aur error message bhejenge ki login kro pehle

  const isBlacklisted = await tokenBlacklistModel.findOne({token}); // Check if the token is blacklisted (i.e., user has logged out)

  if(isBlacklisted){
    return res.status(401).json({
      message: "Unauthorized user, please login to access this resource, or your token might be expired or invalid",
    })
  }

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await userModel.findById(decoded.userId).select("+systemUser") // Fetch user from DB using userId from token, and also select the systemUser field, because by default we have set select: false for systemUser field in the user schema, so we need to explicitly select it here, taki hume pata chal jaye ki ye user system user hai ya nahi

    if(!user.systemUser){ // agar user system user nahi hai, toh usko access denge hi nahi
      return res.status(403).json({
        message: "Forbidden access, this resource is only accessible to system users",
      })
    }

    req.user = user; // set kro req.user mai

    return next();

  }catch(err){
    return res.status(401).json({
      message: "Unauthorized user, invalid token",
    })
  }
}


module.exports = {
  authMiddleware, authSystemUserMiddleware
}