const express = require('express');
const cookieParser = require('cookie-parser');


const AuthRoutes = require('./routes/auth.routes');
const AccountRoutes = require('./routes/account.routes')
const TransactionRoutes = require('./routes/transaction.routes')

const app = express();

app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", AuthRoutes)
app.use("/api/accounts", AccountRoutes)
app.use("/api/transactions", TransactionRoutes)

module.exports = app;