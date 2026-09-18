const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")

/**
 * Create a new transaction
 *
 * Transfer flow:
 * 1. Validate transaction request
 * 2. Check idempotency key
 * 3. Verify account status
 * 4. Check available balance
 * 5. Create pending transaction
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction as completed
 * 9. Commit database transaction
 * 10. Send transaction notification
 */

async function createTransaction(req, res){


    //1. Validate transaction request
    const { fromAccount, toAccount, amount, idempotencyKey} = req.body
    
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "FromAccount, ToAccount, Amount and IdempotencyKey is required"
        })
    }
    
    const fromUserAccount = await accountModel.findOne({
        _id:fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id:toAccount,
    })

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"Invalid fromAccount or toAccount"
        })
    }

    //2. Check idempotency key
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message: "Transaction is already in processed",
                transaction: isTransactionAlreadyExists
            })
        }
        if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still in Processing"
            })
        }
        if(isTransactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message: "Transaction is Failed, please retry"
            })
        }
        if(isTransactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message: "Transaction was Reversed, please retry"
            })
        }

    }

    //3. Verify account status
    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE" ){
        return res.status(400).json({
            message: "Both fromUserAccount and toUserAccount must be ACTIVE to process transaction"
        })
    }

    //4. Check available balance
    const balance = await fromUserAccount.getBalance()

    if(balance < amount ){
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }


    //5. Create pending transaction...  6 7 8 9 
    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    }, { session })

    const debitLedgerEntry = await ledgerModel.create({
        account: fromAccount,
        amount: amount,
        transaction: transaction._id,
        type:"DEBIT"
    }, { session })

    const creditLedgerEntry = await ledgerModel.create({
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }, { session })


    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()
    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })

    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
    return res.satus(200).json({
        message: "Transaction Completed sussesfully",
        transaction: transaction
    })

}   

module.exports = { createTransaction}