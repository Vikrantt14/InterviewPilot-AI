const express = require('express')
// OR const {Router} = require('express')
// const authRouter = Router();

const authRouter = express.Router();
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')


// CREATE APIs 

/**
 * @route POST /api/auth/register
 * @description Rgister a new user
 * @access public
 */
authRouter.post("/register", authController.registerUserController);


/**
 * @route POST /api/auth/login
 * @description login a user
 * @access public
 */
authRouter.post("/login", authController.loginUserController);


/**
 * @route GET /api/auth/logout
 * @description Clear token from user cookie and add the token in blacklist
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController);


/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController);




module.exports= authRouter;