const userModel = require('../models/user.model');


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


}

module.exports={
    userRegisterController,
}