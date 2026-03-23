const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'account',
    required: true,
    index: true,
    immutable: true, // This means that once the account is set for a ledger entry, it cannot be changed.
  },

  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'transaction',
    required: true,
    index: true,
    immutable: true,
  },

  amount: {
    type: Number,
    required: true,
    immutable: true,
  },

  type: {
    type: String,
    enum: {
      values: ["DEBIT", "CREDIT"],
      message: "Type must be either DEBIT or CREDIT",
    },
    required: true,
    immutable: true,
  },

  // currency: {
  //   type: String,
  //   required: true,
  //   default: "INR"
  // },

  // balanceAfterTransaction: {
  //   type: Number,
  //   required: true,
  //   immutable: true,
  // },

}, {
  timestamps: true
})

ledgerSchema.index({ account: 1, createdAt: -1 }); // to get transaction history for an account sorted by most recent transactions

function preventLedgerModification(){
  throw new Error("Ledger entries cannot be modified or deleted once created.");
}

ledgerSchema.pre('save', function() {
  if (!this.isNew) { // when  we use throw keyword, we dont need to use the next keyword in functions as a argument, because the throw keyword will automatically stop the execution of the function and return the error message, so we dont need to call next() to move to the next middleware or route handler, because the error will be thrown and handled by the error handling middleware in our application.
    throw new Error("Ledger entries cannot be modified");
  }
});

ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('findOneAndRemove', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);

const ledgerModel = mongoose.model('ledger', ledgerSchema);

module.exports = ledgerModel;