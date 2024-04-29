import { Router } from 'express'
import { register, login, checkUserExists, refreshToken, updateUserProfile } from '../controllers/user-controller'
import validator from '../middlewares/validator'
import { UserRegisterSchema, UserLoginScheam, UserCheckSchema, UserUpdateSchema } from '../validators/user-schema'
import { checkAccessToken, checkAuthenticated, checkRefreshToken } from '../config/passport'

const router: Router = Router()

router.post('/register', validator(UserRegisterSchema), register)
router.post('/login', validator(UserLoginScheam), checkAuthenticated, login)
router.post('/checkUserExists', validator(UserCheckSchema), checkUserExists)
router.get('/refreshToken', checkRefreshToken, refreshToken)
router.put('/profile', validator(UserUpdateSchema), checkAccessToken, updateUserProfile)

export default router
