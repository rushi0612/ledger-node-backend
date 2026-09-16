const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")

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
    const { fromAccount, toAccount, amount, idempotencyKey} = req.body
    
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        res.status(400).json({
            message: "FromAccount, ToAccount, Amount and IdempotencyKey is required"
        })
    }
    
    const fromUserAccount = await accountModel.findOne({
        _id:fromAccount,
    })

    const toUserAccount = await accountModel.findOne({
        _id:toAccount,
    })

    if(!fromAccount || !toAccount){
        return res.status(400).json({
            message:"Invalid fromAccount or toAccount"
        })
    }
}