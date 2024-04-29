import { Request, Response, NextFunction } from 'express'
import HttpStatus from 'http-status-codes'
import { RESPONSE_STATUS } from '../utils/enums'
import HttpErrors from 'http-errors'
import {
	createCustomer,
	login as customerLogin,
	checkCustomerExists,
	refreshAccessToken,
	updateCustomer
} from '../services/customer'
import { Logger } from '../services/logger'
import { IAuthCustomer, ICustomerUpdateData } from '../interfaces/customer-interfaces'

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
	const payload = req.body as ICustomerUpdateData
	const { username } = req.user as { username: string }

	if (username !== payload.txtuser) next(HttpErrors(HttpStatus.UNAUTHORIZED, "You cannot update other person's data."))

	try {
		const customer = await updateCustomer(payload)

		if (customer === null) next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, 'Return null while updating user data.'))

		return res.status(HttpStatus.OK).send({
			status: RESPONSE_STATUS.SUCCESS,
			data: customer
		})
	} catch (err: any) {
		Logger.error(err)
		next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, err))
	}
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
	const { username } = req.user as { username: string }
	try {
		const token = await refreshAccessToken(username)

		return res.status(HttpStatus.OK).send({
			status: RESPONSE_STATUS.SUCCESS,
			data: { token }
		})
	} catch (err: any) {
		Logger.error(err)
		next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, err))
	}
}

export const checkUserExists = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const isExisted = await checkCustomerExists(req.body.username)

		return res.status(HttpStatus.OK).send({
			status: RESPONSE_STATUS.SUCCESS,
			data: { isExisted }
		})
	} catch (err: any) {
		Logger.error(err)
		next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, err))
	}
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const customer = await createCustomer(req.body)

		return res.status(HttpStatus.OK).send({
			status: RESPONSE_STATUS.SUCCESS,
			data: customer
		})
	} catch (err: any) {
		Logger.error(err)
		next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, err))
	}
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const authCustomer = req.user as IAuthCustomer
		if (!authCustomer || !authCustomer.username) {
			return next(HttpErrors(HttpStatus.UNAUTHORIZED, 'Unauthorized.'))
		}
		const tokens = await customerLogin(authCustomer)

		return res.status(HttpStatus.OK).send({
			status: RESPONSE_STATUS.SUCCESS,
			data: tokens
		})
	} catch (err: any) {
		Logger.error(err)
		next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, err))
	}
}
