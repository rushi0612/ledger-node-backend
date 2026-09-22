const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const emailServise = require('../services/email.service');
const tokenBlackListModel = require('../models/blackList.model')

/** 
* - User Registration Controller
* - POST api/auth/register
*/
async function userRegisterController(req, res) {

    const { email, password, name } = req.body

    const isExists = await userModel.findOne({ 
        email: email        
     })

    if (isExists) {
        return res.status(422).json({
             message: " User already exists with this Email",
             status: "failed"
         })
    }

    const user = await userModel.create({
        email, password, name
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });
    res.cookie("token", token)
    res.status(201).json({
        user:{
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token 
    })

    await emailServise.sendRegistrationEmail(user.email, user.name);

}

/** 
* - User Login Controller
* - POST api/auth/login
*/
async function userLoginController(req, res) {
    const { email, password } = req.body
    const user = await userModel.findOne({ email }).select('+password')

    if (!user) {
        return res.status(404).json({
            message: "Email or password is incorrect"
        })
    }

    const isValidPassword = await user.comparePassword(password)

    if(!isValidPassword){
        return res.status(404).json({
            message: "Password is Invalid"
        })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3d' });

    res.cookie("token", token)
    res.status(200).json({
        user:{
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token 
    })
}

/**
 * - User Logout controller
 */
async function userLogoutController(req, res){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(400).json({
            message: "User logged out successfuly "
        })
    }

    res.cookie("token", "")

    await tokenBlackListModel.create({
        token: token
    })

    res.status(200).json({
        message: "User logged out successfully "
    })
}

module.exports={
    userRegisterController,
    userLoginController, 
    userLogoutController
}