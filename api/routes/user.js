const userRouter = require('express').Router()
const userController = require('../controllers/user.js')
const auth = require('../middleware/auth.js')

userRouter.post('/user/register', auth.onlyAdminBPN, userController.registerUser)

userRouter.post(
  '/admin-bpn/register',
  userController.registerAdminBPN
)

userRouter.post('/enroll', userController.enrollAdmin)
userRouter.post('/login', userController.loginUser)

userRouter.get(
  '/list/users',
  auth.verifyToken,
  userController.getAllUsers
)

module.exports = userRouter
