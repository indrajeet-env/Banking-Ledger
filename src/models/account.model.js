const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,  
    index: true, // makes the user field indexed, which means that we can query the accounts by user id more efficiently, because in banking system, we will often need to get all the accounts of a user, so indexing the user field will improve the performance of such queries (makes querying process faster)
  },
  status: {
    type: String,
    enum: {
      values: ["ACTIVE", "FROZEN", "CLOSED"],
      message: "Status must be either ACTIVE, FROZEN or CLOSED",           
    },
    default: "ACTIVE" ,
  },
  currency: {
    type: String,
    required: true,
    default: "INR"
  },
    /*balance: { // In banking system, balance can never be hardcoded in the db, so we use ledger

  } */
}, {
  timestamps: true
});

accountSchema.index({user: 1, status: 1}); // this means that we are creating a compound index on user and status fields, which will improve the performance of queries that filter by both user and status.

// for example, if we want to get all the active accounts of a user, then we can use this index to get the results faster

// eg: const accounts = await accountModel.find({
//   user: userId,
//   status: "ACTIVE"
// });


const accountModel = mongoose.model('account', accountSchema) // Create a model called account using this schema;
module.exports = accountModel;