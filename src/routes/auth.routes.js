const express = require('express');
const authController= require("../controllers/auth.controller")

const router = express.Router();

/* POST /auth/register */
router.post('/register', authController.userRegisterController)

/* POST /auth/login */
router.post('/login', authController.userLoginController)

module.exports = router;