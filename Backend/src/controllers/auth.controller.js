const userModel = require('../models/user.model')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")


/**
 * @name registerUserController
 * @description register a new user, expect username, email, password
 * @access public
 */
async function registerUserController(req, res) {

    const { username, email, password} = req.body;

    if(!username || !email || !password) {
      return res.status(400).json({
        message: "please provide username, email and passsword"
      });
    }

    const isUserAlreadyExists = await userModel.findOne({
      $or: [
        {username},
        {email}
      ]
    });

    if(isUserAlreadyExists){
      return res.status(400).json({
        message:"Account already exists with this email address and username"
      });
    } 


    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
      username,
      email,
      password: hash,
    })

    const token = jwt.sign(
      {id:user._id, username: user.username},
      process.env.JWT_SECRET_KEY,
      {expiresIn:"1d"}
    )
    // SET TOKENMIN COOKIE

    res.cookie("token", token)

    res.status(201).json({
      message:"User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    })


}



/**
 * @name loginUserController
 * @description login a user
 * @access punlic
 */


async function loginUserController(req, res) {

  const {email, password} = req.body;

  // CHECK USER EXISTS OR NOT ON BASIS OF EMAIL

  const user= await userModel.findOne({
    email
  });

  if(!user){
    return res.status(401).json({
      message: "Invalid email or password"
    })
  }


  // IF USER EXIST WITH THIS EMAILL ADDRESS THEN CHECK THE PASSWORD FOR THIS USER COMPARE WITH THE PASSWORD WHICH IS SAVE IN DATABASE



  const isPasswordValid = await bcrypt.compare(password, user.password)


  if(!isPasswordValid){
    return res.status(400).json({
      message: "Invalid password"
    })
  }

  const token = jwt.sign(
    {id:user._id, username:user.username},
    process.env.JWT_SECRET_KEY,
    {expiresIn: "1d"}
  )

  res.cookie("token",token);

  res.status(200).json({
    message: "User login successfully",
    user : {
      id: user._id,
      username: user.username,
      email: user.email
    }
  })


}



/**
 * @name logoutUserController
 * @description logout a user
 * @access public
 */

async function logoutUserController(req, res) {
  const token = req.cookies.token;

  if(token){
    await tokenBlacklistModel.create({token})
  }

  res.clearCookie("token")

  res.status(200).json({
    message: "User logout successfully"
  })
}


/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */

async function getMeController(req, res) {

  const user = await userModel.findById(req.user.id)

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    })
  }

  res.status(200).json({
    message: "User details fetched successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  })

}



module.exports = {registerUserController, loginUserController, logoutUserController,getMeController}