const ledgerModel = require('../models/ledger.model');
const transactionModel = require('../models/transaction.model');
const accountModel = require('../models/account.model');
const userModel = require('../models/user.model');

const emailService = require('../services/email.service');

const mongoose = require('mongoose');



/** 
 * - Create a new transaction between two accounts
 * THE 10 STEP TRANSACTION FLOW:
    * 1. Validate the request body to ensure all required fields are present (fromAccount, toAccount, amount, idempotencyKey)
    * 2. Validate idempotencyKey to ensure the same transaction is not processed multiple times
    * 3. Check account status
    * 4. Derive sender balance from ledger
    * 5. Creat transaction (PENDING)
    * 6. Create DEBIT Ledger entry
    * 7. Create CREDIT Ledger entry
    * 8. Mark transaction COMPLETED
    * 9. Commit MongoDB session
    * 10. Send email notificaiton
 */

async function createTransactionController(req, res){

  /**
   * 1. Validate request
   */
  const {fromAccount, toAccount, amount, idempotencyKey} = req.body;  

  if(!fromAccount || !toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
      message: 'Missing required fields, fromAccount, toAccount, amount and idempotencyKey are required' // 400 usually send, when client side se kuch galti hui hai
    })
  }

  // yeh check karne ke liye ki fromAccount aur toAccount exist karte hai ya nahi, agar nahi karte hai toh 404 not found error bhejenge, kyunki client ne galat account id bheji hai

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount, 
  })

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  })

  if(!fromUserAccount || !toUserAccount){
    return res.status(404).json({
      message: 'Invalid fromAccount or toAccount' 
    })
  }

  /** 
   * 2. Validate idempotencyKey
   */

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  })

  if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status === 'COMPLETED'){
      return res.status(200).json({
        message: 'Transaction already processed',
        transaction: isTransactionAlreadyExists, // agar transaction already completed hai, toh hum us transaction ka details bhi bhej denge response me, taki client ko pata chal jaye ki uska transaction successfully process ho chuka hai, aur usko dobara se same transaction karne ki zarurat nahi hai
      })
    } 

    if(isTransactionAlreadyExists.status === 'PENDING'){
      return res.status(200).json({
        message: 'Transaction is still processing',
      })
    }

    if(isTransactionAlreadyExists.status === 'FAILED'){
      return res.status(500).json({
        message: 'Previous transaction attempt failed, please try again',
      })
    }

    if(isTransactionAlreadyExists.status === 'REVERSED'){
      return res.status(500).json({
        message: 'Previous transaction attempt was reversed, please try again',
      })
    }
  }

  /**
   * 3. Check account status
   */

  if(fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE'){
    return res.status(403).json({
      message: 'Both accounts fromAccount and toAccount must be active to process the transaction',
    })
  }
  
  /**
   * 4. Derive sender balance from ledger
   */

  const balance = await fromUserAccount.getBalance();

  if(balance < amount){
    return res.status(400).json({
      message: `Insufficient balance. Current balance is: ${balance} and Requested amount is: ${amount}`,
    })
  }

  /**
   * 5. Create transaction (PENDING)
   * Step 5 to step 9
   */

  // We are creating session because we want to make sure that all the operations related to this transaction are atomic (Step 5 to Step 8), which means that either all the operations should be successful, or if any of the operation fails, then all the operations should be rolled back

  //  if all the operations are successful, then we can commit the transaction, otherwise if any of the operation fails, then we can abort the transaction, which will roll back all the operations performed within that transaction
  const session = await mongoose.startSession();

  let transaction;

  try{
    session.startTransaction();

      transaction = (await transactionModel.create([{
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      type : 'TRANSFER',
    }], {session}))[0];

    const debitLedgerEntry = await ledgerModel.create([{
      account: fromAccount,
      transaction: transaction._id,
      amount: amount,
      type: 'DEBIT',
    }], {session});

    await(() => {
      return new Promise((resolve) => setTimeout(resolve, 30 * 1000)) // this is just to simulate a long running transaction (30 sec), so that we can test the idempotency key functionality, because if the transaction is taking too long to process, then the client might send the same transaction request again, and in that case, we should be able to handle that gracefully using idempotency key, and we should not process the same transaction multiple times, so this setTimeout will help us to simulate that scenario
    }) ()

    const creditLedgerEntry = await ledgerModel.create([{
      account: toAccount,
      transaction: transaction._id,
      amount: amount,
      type: 'CREDIT',
    }], {session});

    transaction.status = 'COMPLETED';

    await transactionModel.findOneAndUpdate(
      {_id: transaction._id},
      {status: 'COMPLETED'},
      {session}
    )

    await session.commitTransaction(); // this will commit the transaction, which means that all the operations performed within this transaction will be saved to the database, and the changes will be permanent
  }
  catch(err){
    await session.abortTransaction(); // this will abort the transaction, which means that all the operations performed within this transaction will be rolled back, and the changes will not be saved to the database
    return res.status(500).json({
      message: 'Transaction is pending due to some issue',
      error: err.message,
    })
  }
  finally{
    session.endSession(); // this will end the session, which means that we can start a new session for the next transaction
  }
  
    res.status(201).json({ //so if i added return here then it will stop here once we got res.status(201) i.e transaction is successful, and we wont reach till email part that means that, and we can send the email notification to the user about the successful transaction,
    message: 'Transaction successful',
    transaction: transaction,
  });

  /**
   * 10. Send email notification
   */

   emailService.sendSuccessfulTransactionEmail(req.user.email, req.user.name, fromAccount, toAccount, amount, transaction._id).catch((err) => {
    console.error('Error sending transaction email notification:', err);
   })
} 

async function createInitialFundsTransaction(req, res){
  // This function is to create a transaction to add initial funds to the user's account when they register, this transaction will be from a special system account (like a bank's main account) to the user's account, and the amount will be a fixed amount (like 1000 INR) which will be added to the user's account as initial funds, this will help the user to explore the features of the application without having to add funds to their account first

  const {toAccount, idempotencyKey} = req.body; // fromAccount is not required here because it will be a special system account

  if(!toAccount || !idempotencyKey){
    return res.status(400).json({
      message: 'Missing required fields toAccount, idempotencyKey are required',
    })
  }

  const INITIAL_FUNDS_AMOUNT = 1000;
  const amount = INITIAL_FUNDS_AMOUNT;

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  })

  if(!toUserAccount){
    return res.status(404).json({
      message: 'Invalid toAccount',
    })
  }

  const fromUserAccount = await accountModel.findOne({
    systemUser: true // Bydefault for all the users, this field is false, so there will be only one account whose systemUser field is true(set by us directly from db), so fromUserAccount is only that users account
  })

  if(!fromUserAccount){ // this is just a safety check, bychance if the system account is not created in the database or got deleted bymistakely, toh us case me hum transaction nahi kar sakte hai
    return res.status(400).json({
      message: 'System account not found, cannot process the transaction',
    })
  }

  // If the user got initial funds, then he will be counted in existing transaction, so we will check that too, taki user ko dobara se initial funds na mile, because initial funds is only for new users
  const existing = await transactionModel.findOne({
    toAccount,
    type: 'INITIAL_FUNDS'
  });
  
  if (existing) {
    return res.status(400).json({
      message: 'Initial funds already granted'
    });
  }

  // Now we can finally initiate the transaction, since we got our toAccount user and fromAccount user (system account)

  const session = await mongoose.startSession();

  let transaction;

  try{
    session.startTransaction();

    transaction = new transactionModel({ // this is not created in the db but created on the server, so we dont need session here, because we are not saving it to the database yet, we will save it to the database after we have created the ledger entries, and updated the transaction status to completed
      fromAccount: fromUserAccount._id, 
      toAccount,
      amount,
      idempotencyKey,
      status: 'PENDING',
      type: 'INITIAL_FUNDS',
    });

    const debitLedgerEntry = await ledgerModel.create([{
      account : fromUserAccount._id, // we didnt pass fromAccount here, because  we are not taking fromAccount from user directly, but for creditLedgerEntry, we are passing toAccount, since that is taken from the user
      transaction: transaction._id,
      amount : amount,
      type: 'DEBIT',
    }], {session});

    const creditLedgerEntry = await ledgerModel.create([{
      account : toAccount,
      transaction: transaction._id,
      amount : amount,
      type: 'CREDIT',
    }], {session});

    transaction.status = 'COMPLETED';

    await transaction.save({session});
    await session.commitTransaction();

  }catch(err){
    await session.abortTransaction();
    return res.status(500).json({
      message: 'Transaction failed',
      error: err.message,
    });
  }
  finally{
    session.endSession();
  }
  return res.status(201).json({
    message: 'Initial funds added successfully',
    transaction: transaction,
  })
}

module.exports = {
  createTransactionController, createInitialFundsTransaction
}