import passport from 'passport'
import passportLocal from 'passport-local'
import { compare } from 'bcryptjs'
import UserModel from '../models/user-model'
import { Request, Response, NextFunction } from 'express'
import { Logger } from '../services/logger'
import { IAuthUser, IUser } from '../interfaces/user-interfaces'
import { RESPONSE_STATUS } from '../utils/enums'
import { StatusCodes } from 'http-status-codes'
import { userToAuthMapper } from '../mappers/user-mappers'
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt'
import config from '.'

passport.serializeUser<any, any>((req, user, done) => {
	done(undefined, user)
})

passport.use(
	new passportLocal.Strategy(
		{ usernameField: 'username', passwordField: 'password' },
		async (username: string, password: string, done: any) => {
			try {
				const user = await UserModel.findOne({ username })
				if (!user) return done(undefined, false, { message: 'User not found.' })

				const isMatch = await compare(password, user?.password ?? '')
				if (!isMatch) return done(undefined, false, { message: 'Invalid email or password.' })

				const authUser = userToAuthMapper().map<IUser, IAuthUser>(user, 'IUser', 'IAuthUser')
				return done(undefined, authUser)
			} catch (err: any) {
				Logger.error(err)
				return done(err, false)
			}
		}
	)
)

passport.use(
	'access-token',
	new JWTStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.ACCESS_TOKEN_SECRET || undefined
		},
		async (payload, done) => {
			if (!payload || !payload.data || !payload.data.username) {
				return done(undefined, false, { message: 'Invalid token.' })
			}
			try {
				const authUser = payload.data as IAuthUser

				const user = await UserModel.findOne({ username: authUser.username })
				if (!user) return done(undefined, false, { message: 'Invalid token.' })

				return done(undefined, authUser)
			} catch (err: any) {
				Logger.error(err)
				return done(err, false)
			}
		}
	)
)

passport.use(
	'refresh-token',
	new JWTStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.REFRESH_TOKEN_SECRET || undefined
		},
		async (payload, done) => {
			if (!payload || !payload.data || !payload.data.username) {
				return done(undefined, false, { message: 'Invalid token.' })
			}
			try {
				const { username } = payload.data

				const user = await UserModel.findOne({ username })
				if (!user) return done(undefined, false, { message: 'Invalid token.' })

				return done(undefined, { username })
			} catch (err: any) {
				Logger.error(err)
				return done(err, false)
			}
		}
	)
)

export const checkAuthenticated = (req: Request, res: Response, next: NextFunction) => {
	return passport.authenticate('local', (err: any, user: IAuthUser, info: any) => {
		if (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				status: RESPONSE_STATUS.ERROR,
				message: err.message
			})
		}
		if (info?.message) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				status: RESPONSE_STATUS.ERROR,
				message: info?.message
			})
		}
		req.user = user
		next()
	})(req, res, next)
}

export const checkAccessToken = (req: Request, res: Response, next: NextFunction) => {
	return passport.authenticate('access-token', (err: any, user: IAuthUser, info: any) => {
		if (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				status: RESPONSE_STATUS.ERROR,
				message: err.message
			})
		}
		if (info?.message) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				status: RESPONSE_STATUS.ERROR,
				message: info?.message
			})
		}
		req.user = user
		next()
	})(req, res, next)
}

export const checkRefreshToken = (req: Request, res: Response, next: NextFunction) => {
	return passport.authenticate('refresh-token', (err: any, user: { username: string }, info: any) => {
		if (err) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				status: RESPONSE_STATUS.ERROR,
				message: err.message
			})
		}
		if (info?.message) {
			return res.status(StatusCodes.UNAUTHORIZED).json({
				status: RESPONSE_STATUS.ERROR,
				message: info?.message
			})
		}
		req.user = user
		next()
	})(req, res, next)
}
