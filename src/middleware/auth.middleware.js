const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next){
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token; // Try to get JWT token from cookie or from header i.e "Authorization: Bearer <token>" header  

  // Aur agar dono hi jagah token nhi mila that means, user ne logged in nhi kiya hai, toh hum usko access denge hi nhi, aur error message bhejenge ki login kro pehle

  if(!token){
    return res.status(401).json({
      message: "Unauthorized user, user isn't logged in, please login to access this resource",
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

module.exports = {
  authMiddleware
}