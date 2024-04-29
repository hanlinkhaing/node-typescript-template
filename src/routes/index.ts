import express, { Router } from 'express'
import userRoutes from './user-route'

const router: Router = express.Router()

router.use('/users', userRoutes)

export default router
