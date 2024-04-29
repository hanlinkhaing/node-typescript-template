import { IUserRegiser, IUser, IAuthUser, IUserUpdateData, IUserUpdate } from '../interfaces/user-interfaces'
import UserModel from '../models/user-model'
import { ONE, TEN } from '../utils/constants'
import { hash } from 'bcryptjs'
import HttpErrors from 'http-errors'
import HttpStatus from 'http-status-codes'
import { userRegisterToUserMapper, userToAuthMapper, updateDataToUserUpdateMapper } from '../mappers/user-mappers'
import { generateAccessToken, generateRefreshToken } from '../utils/methods'

export const updateUser = async (data: IUserUpdateData): Promise<IUser | null> => {
	const payload = updateDataToUserUpdateMapper().map<IUserUpdateData, IUserUpdate>(
		data,
		'IUserUpdateData',
		'IUserUpdate'
	)
	const user = await UserModel.findOneAndUpdate({ username: data.user }, payload, { new: true })

	return user
}

export const refreshAccessToken = async (username: string): Promise<string> => {
	const user = await UserModel.findOne({ username })
	if (!user) throw HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, `Auth user not found.`)

	const authUser = userToAuthMapper().map<IUser, IAuthUser>(user, 'IUser', 'IAuthUser')
	const accessToken = generateAccessToken(authUser)

	return accessToken
}

export const checkUserExists = async (username: string): Promise<boolean> => {
	const user = await UserModel.findOne({ username })
	if (!user) return false
	return true
}

export const login = async (payload: IAuthUser): Promise<{ token: string; refresh_token: string }> => {
	const user = await UserModel.findOne({ username: payload.username })
	if (!user) throw HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, `Auth user not found.`)

	const authUser = userToAuthMapper().map<IUser, IAuthUser>(user, 'IUser', 'IAuthUser')
	const accessToken = generateAccessToken(authUser)
	const refreshToken = generateRefreshToken(authUser)

	return { token: accessToken, refresh_token: refreshToken }
}

export const createUser = async (payload: IUserRegiser): Promise<IUser> => {
	/* eslint-disable */
	const { pass } = payload
	const str = Math.floor(Math.random() * TEN) + ONE

	const data = userRegisterToUserMapper().map<IUserRegiser, IUser>(payload, 'IUserRegister', 'IUser')
	data.str = str.toString()
	data.password = await hash(pass, str)

	let user = new UserModel(data)

	user = await user.save()

	return user
}
