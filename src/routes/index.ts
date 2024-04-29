import express, { Router } from 'express'
import customerRoutes from './customer-route'

const router: Router = express.Router()

router.use('/users', customerRoutes)

export default router
