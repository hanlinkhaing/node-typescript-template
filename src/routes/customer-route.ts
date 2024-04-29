import { Router } from 'express'
import { register, login, checkUserExists, refreshToken, updateUserProfile } from '../controllers/customer-controller'
import validator from '../middlewares/validator'
import {
	CustomerRegisterSchema,
	CustomerLoginScheam,
	CustomerCheckSchema,
	CustomerUpdateSchema
} from '../validators/customer-schema'
import { checkAccessToken, checkAuthenticated, checkRefreshToken } from '../config/passport'

const router: Router = Router()

router.post('/register', validator(CustomerRegisterSchema), register)
router.post('/login', validator(CustomerLoginScheam), checkAuthenticated, login)
router.post('/checkUserExists', validator(CustomerCheckSchema), checkUserExists)
router.get('/refreshToken', checkRefreshToken, refreshToken)
router.put('/profile', validator(CustomerUpdateSchema), checkAccessToken, updateUserProfile)

export default router
