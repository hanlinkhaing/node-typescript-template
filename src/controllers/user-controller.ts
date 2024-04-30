import { Request, Response, NextFunction } from 'express'
import HttpStatus from 'http-status-codes'
import { RESPONSE_STATUS } from '../utils/enums'
import HttpErrors from 'http-errors'
import {
	createUser,
	login as userLogin,
	checkUserExists as checkUserIsExists,
	refreshAccessToken,
	updateUser
} from '../services/user'
import { Logger } from '../services/logger'
import { IAuthUser, IUserUpdateData } from '../interfaces/user-interfaces'

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
	const payload = req.body as IUserUpdateData
	const { username } = req.user as { username: string }

	if (username !== payload.user)
		return next(HttpErrors(HttpStatus.UNAUTHORIZED, "You cannot update other person's data."))

	try {
		const user = await updateUser(payload)

		if (user === null)
			return next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, 'Return null while updating user data.'))

		return res.status(HttpStatus.OK).send({
			status: RESPONSE_STATUS.SUCCESS,
			data: user
		})
	} catch (err: any) {
		Logger.error(err)
		return next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, err))
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
		return next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, err))
	}
}

export const checkUserExists = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const isExisted = await checkUserIsExists(req.body.username)

		return res.status(HttpStatus.OK).send({
			status: RESPONSE_STATUS.SUCCESS,
			data: { isExisted }
		})
	} catch (err: any) {
		Logger.error(err)
		return next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, err))
	}
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await createUser(req.body)

		return res.status(HttpStatus.OK).send({
			status: RESPONSE_STATUS.SUCCESS,
			data: user
		})
	} catch (err: any) {
		Logger.error(err)
		return next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, err))
	}
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const authUser = req.user as IAuthUser
		if (!authUser || !authUser.username) {
			return next(HttpErrors(HttpStatus.UNAUTHORIZED, 'Unauthorized.'))
		}
		const tokens = await userLogin(authUser)

		return res.status(HttpStatus.OK).send({
			status: RESPONSE_STATUS.SUCCESS,
			data: tokens
		})
	} catch (err: any) {
		Logger.error(err)
		return next(HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, err))
	}
}
