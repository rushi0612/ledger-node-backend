const express = require('express');


const AuthRoutes = require('./routes/auth.routes');

const app = express();

app.use("/")

module.exports = app;