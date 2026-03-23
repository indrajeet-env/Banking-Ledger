const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address"],
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // this means that when we query the user from DB, then password field will not be included in the result, because we dont want to send password to client
  },
  systemUser: {
    type: Boolean,
    default: false, // this means that by default, when a user is created, it will not be a system user, but we can set this field to true for some users who are created by the system for some specific purpose, like admin users or support users, etc.
    immutable: true, // this means that once the systemUser field is set for a user, it cannot be changed
    select: false, // this means that when we query the user from DB, then systemUser field will not be included in the result, because we dont want to send this information to client
  }
},{
  timestamps: true, // this will add createdAt and updatedAt fields to the user document, which will store the time when the user was created and updated
})

// Pre save middleware -> runs before saving: 

// whenever we will save the user, toh ye function chalega, and isme hum password ko hash karenge, taki password secure rahe, aur agar koi hacker hamare DB ko hack kar bhi leta hai, toh bhi usse password ka pata nahi chalega, because password hash hoga, and hash karne ke liye hum bcrypt package ka use karenge 
userSchema.pre('save', async function(){
  if(!this.isModified('password')){
    return; // this means that if password is not modified, then we will not hash the password, and we will just move to the next middleware, because if password is not modified, then it means that user is updating some other field like name or email, toh us case me hume password ko hash karne ki jarurat nahi hai, because password is not modified
  }
  const hash = await bcrypt.hash(this.password, 10); // this means that when password is changed by the user we are hashing the password with a salt of 10 rounds, and then we are storing the hashed password in the password field of the user document
  this.password = hash; // this means that we are replacing the plain text password with the hashed password
  return;
})

userSchema.methods.comparePassword = async function(password){
  return await bcrypt.compare(password, this.password); // this means that when user is trying to login, we will compare the plain text password with the hashed password stored in the database, and if they match, then we will return true, otherwise we will return false
}


const userModel = mongoose.model('user', userSchema) // Create a model called user using this schema
module.exports = userModel;
