import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { checkUserExists, createUser, login, refreshAccessToken, updateUser } from '../../services/user'
import UserModel from '../../models/user-model'
import mongoose from 'mongoose'
import { verify } from 'jsonwebtoken'
import config from '../../config'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { PRICE_CREDIT } from '../../utils/constants'

const userData = {
	username: 'testuser@gmail.com',
	fullname: 'testuser',
	phone: '08412345672;0987654322',
	email: 'testuser@gmail.com',
	loginCount: 5,
	popupCount: 0,
	bankList: '',
	userLastUpdate: '2023-08-17T04:40:02.660Z',
	id: 27
}

let registerPayload = {
	aff_id: '',
	credit_rate: '100',
	name: 'testuser',
	pass: '123452',
	pass_repeat: '123452',
	phone: '08412345672',
	user: 'testuser@gmail.com'
}

let mongoServer

describe('updateUser(data: IUserUpdateData)', () => {
	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	beforeEach(async () => {
		await UserModel.findOneAndDelete({ username: registerPayload.user })
		await createUser(registerPayload)
	})

	const updateData = {
		user: 'testuser@gmail.com',
		phone: '213454566',
		name: 'PikaPika3'
	}

	test('should return updated user data when executable data is given', async () => {
		const user = await updateUser(updateData)

		expect(user.fullname).toBe(updateData.name)
		expect(user.phone).toEqual(updateData.phone)
	})
})

describe('creteUser(payload: IUserRegiser)', () => {
	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	test('should return saved user data', async () => {
		const user = await createUser(registerPayload)

		expect(user).toBeDefined()
		expect(user._id).toBeDefined()
	})

	test('should throw error when username already existed', async () => {
		try {
			await createUser(registerPayload)
		} catch (err) {
			expect(err).toBeDefined()
		}
	})
})

describe('login(payload: IAuthUser)', () => {
	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
		await createUser(registerPayload)
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	test('should return valid token strings when user existed', async () => {
		const tokens = await login(userData)

		expect(tokens).toBeDefined()

		const tokenVerification = verify(tokens.token, config.ACCESS_TOKEN_SECRET, { complete: true })
		const refreshVerification = verify(tokens.refresh_token, config.REFRESH_TOKEN_SECRET, { complete: true })

		expect(tokenVerification.payload.data).toBeDefined()
		expect(refreshVerification.payload.data).toBeDefined()
	})

	test('should throw error when user not existed', async () => {
		await UserModel.findOneAndDelete({ username: registerPayload.user })

		try {
			await login(userData)
		} catch (err) {
			expect(err.message).toEqual('Auth user not found.')
		}
	})
})

describe('refreshAccessToken(username: string)', () => {
	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
		await createUser(registerPayload)
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	test('should return valid token string when user existed', async () => {
		const token = await refreshAccessToken(registerPayload.user)

		expect(token).toBeDefined()

		const verification = verify(token, config.ACCESS_TOKEN_SECRET, { complete: true })

		expect(verification.payload.data).toBeDefined()
	})

	test('should throw error when user not existed', async () => {
		await UserModel.findOneAndDelete({ username: registerPayload.user })

		try {
			await refreshAccessToken(registerPayload.user)
		} catch (err) {
			expect(err.message).toEqual('Auth user not found.')
		}
	})
})

describe('checkUserExists(username: string)', () => {
	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
		await createUser(registerPayload)
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	test('username already existed and should true', async () => {
		const result = await checkUserExists(registerPayload.user)

		expect(result).toBeTruthy
	})

	test("username doesn't exist and should return false", async () => {
		await UserModel.findOneAndDelete({ username: registerPayload.user })

		const result = await checkUserExists(registerPayload.user)

		expect(result).toBeFalsy()
	})
})
