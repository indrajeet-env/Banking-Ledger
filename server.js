require('dotenv').config(); // to load env variables from .env file, we use this package called dotenv

const app = require('./src/app'); //we can also use that import syntax of nodejs, instead of require

const connectToDB = require('./src/config/db'); // we need to connect to DB before starting the server, so we import the connectToDB function from db.js file

connectToDB(); // we call the connectToDB function to connect to DB, and then we start the server

app.listen(3000, ()=>{
  console.log('server is running at port 3000'); // so app.listen, consists of two params, port ka naam and a call back
})

