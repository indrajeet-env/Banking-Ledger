const mongoose = require('mongoose');


const transactionSchema = new mongoose.Schema({
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'account',
    required: true,
    index: true,
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'account',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    enum: ['TRANSFER', 'INITIAL_FUNDS', 'REFUND', 'REVERSAL'],
    default: 'TRANSFER',
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: "INR"
  },
  status: {
    type: String,
    enum: {
      values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
      message: "Status must be either PENDING, COMPLETED, FAILED or REVERSED",
    },
    default: "PENDING",
  },
  idempotencyKey: { // This key same payment ko 2 baar hone se rokti hai (which can occur due to some network issue), and this key is generated on the client side
    type: String,
    required: true,
    unique: true, // this means that the idempotencyKey must be unique in the collection, which will prevent duplicate transactions from being created with the same idempotencyKey
    index: true
  }
}, {
  timestamps: true
})

const transactionModel = mongoose.model('transaction', transactionSchema);
module.exports = transactionModel