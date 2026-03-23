const ledgerModel = require('./ledger.model');

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

accountSchema.methods.getBalance = async function() {
  const balanceData = await ledgerModel.aggregate([
    { $match: { account: this._id } }, // match the account and get all the ledger entries for this account
    {
      $group: {
        _id: null, // group all the ledger entries for this account together, we don't need to group by any field, so we can set _id to null
        
        totalDebit: { // sum of all the debit transactions for this account, we will use $cond to check if the type of the transaction is DEBIT, then we will add the amount to totalDebit, otherwise we will add 0 to totalDebit
          $sum: {
            $cond: [
              { $eq: ["$type", "DEBIT"] }, // if type == DEBIT
              "$amount",                   // add amount
              0                            // else add 0       
            ]
          }
        },

        totalCredit: { // sum of all the credit transactions for this account, we will use $cond to check if the type of the transaction is CREDIT, then we will add the amount to totalCredit, otherwise we will add 0 to totalCredit
          $sum: {
            $cond: [
              { $eq: ["$type", "CREDIT"]},
              "$amount",
              0
            ]
          }
        }
      }
    },
    {
      $project: {  // project is basically to shape the output of the aggregation, we will use it to calculate the balance from totalCredit and totalDebit
        _id: 0, // we don't need _id in the final output, so we can set it to 0
        balance: {$subtract: ["$totalCredit", "$totalDebit"] }
      }
    }
  ])

  if(balanceData.length === 0){
    return 0; // if there are no ledger entries for this account, then the balance is 0, usually when the account is newly created and no transactions have been made yet, so there are no ledger entries for this account, in that case we will return 0 as the balance
  }

  return balanceData[0].balance; // if there are ledger entries for this account, then we will return the balance calculated from the ledger entries, which is totalCredit - totalDebit and its always at index 0, because there is just one element in the final aggregation result i.e in the $project, we just have "balance"
}


const accountModel = mongoose.model('account', accountSchema) // Create a model called account using this schema;
module.exports = accountModel;


// MATCH → filter data
// GROUP → compute totals
// PROJECT → format result