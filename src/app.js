// First file created : 
// Task is to create server's instance and config the server(like what all middlewares we want to use, which routes we want to use, what all api we'll have etc)

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express(); 
// server instance created (server ka instance is saved in app constant)
// in app.js file we just create severs instance and  config the server, but we dont start the server in app.js, for that we create server.js

app.use(express.json()) // this means that we are using express.json() middleware to parse the incoming request body, which is in json format, and then we can access the data in the request body using req.body in our controllers

app.use(cookieParser()) // this means that we are using cookieParser middleware to parse the cookies sent by the client in the request, and then we can access the cookies using req.cookies in our controllers

/**
 * - Routes required
 */

const authRouter = require('./routes/auth.routes');
const accountRouter = require('./routes/account.routes');
const transactionRouter = require('./routes/transaction.routes');

app.get("/", (req, res) => {
  res.send("Ledger service is up and running");
})

/**
 * - Routes used
 */

app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRouter)


module.exports = app;