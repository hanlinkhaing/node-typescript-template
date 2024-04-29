import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import app from '../../app'
import UserModel from '../../models/user-model'
import supertest from 'supertest'
import { createUser } from '../../services/user'
import { generateAccessToken, generateRefreshToken } from '../../utils/methods'

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

const authUser = {
	id: 999,
	username: 'testuser@gmail.com',
	phone: '08412345672',
	fullname: 'testuser',
	bankList: '',
	loginCount: 3,
	popupCount: 0,
	userLastUpdate: new Date()
}

describe('users/profile', () => {
	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	let loginToken

	beforeEach(async () => {
		await UserModel.findOneAndDelete({ username: registerPayload.user })
		await createUser(registerPayload)
		loginToken = generateAccessToken(authUser)
	})

	const updateData = {
		user: 'testuser@gmail.com',
		phone: '213454566',
		name: 'PikaPika3'
	}

	test('should return 200 with updated data for success process', async () => {
		const { statusCode, body } = await supertest(app)
			.put('/users/profile')
			.set('Authorization', `Bearer ${loginToken}`)
			.send(updateData)

		expect(statusCode).toBe(200)
		expect(body.data.fullname).toBe(updateData.name)
		expect(body.data.phone).toBe(updateData.phone)
	})

	test("should return 401 when token's username and payload user are not same", async () => {
		updateData.user = 'wrong@gmail.com'

		const { statusCode } = await supertest(app)
			.put('/users/profile')
			.set('Authorization', `Bearer ${loginToken}`)
			.send(updateData)

		expect(statusCode).toBe(401)
	})
})

describe('users/refreshToken', () => {
	let refreshToken

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
		await createUser(registerPayload)
		refreshToken = generateRefreshToken(authUser)
	})

	afterAll(async () => {
		await UserModel.findOneAndDelete({ username: registerPayload.user })
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	test('give valid refreshToken and should return status 200 with access token', async () => {
		const { statusCode, body } = await supertest(app)
			.get('/users/refreshToken')
			.set('Authorization', `Bearer ${refreshToken}`)

		expect(statusCode).toBe(200)
		expect(body.data.token).toBeDefined()
	})

	test('give no refreshToken and should return status 401', async () => {
		const { statusCode } = await supertest(app).get('/users/refreshToken')

		expect(statusCode).toBe(401)
	})

	test('give a refreshToken with some changes and should return status 401', async () => {
		const { statusCode } = await supertest(app)
			.get('/users/refreshToken')
			.set('Authorization', `Bearer ${refreshToken}abcdef`)

		expect(statusCode).toBe(401)
	})
})

describe('users/checkUserExists', () => {
	let payload = {
		username: 'testuser@gmail.com'
	}
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

	test('username already existed and should return status 200 with isExisted true', async () => {
		const { statusCode, body } = await supertest(app).post('/users/checkUserExists').send(payload)

		expect(statusCode).toBe(200)
		expect(body.data.isExisted).toBeTruthy()
	})

	test("username doesn't exist and should return status 200 with isExisted false", async () => {
		await UserModel.findOneAndDelete({ username: registerPayload.user })

		const { statusCode, body } = await supertest(app).post('/users/checkUserExists').send(payload)

		expect(statusCode).toBe(200)
		expect(body.data.isExisted).toBeFalsy()
	})
})

describe('users/login', () => {
	let loginPayload
	beforeEach(() => {
		loginPayload = {
			username: 'testuser@gmail.com',
			password: '123452'
		}
	})

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
		await createUser(registerPayload)
	})

	afterAll(async () => {
		await UserModel.findOneAndDelete({ username: registerPayload.user })
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	test('give executable data and should return status 200 with tokens', async () => {
		const { statusCode, body } = await supertest(app).post('/users/login').send(loginPayload)

		expect(statusCode).toBe(200)
		expect(body.data.token).toBeDefined()
	})

	test('give unexisted username and should return status 401', async () => {
		loginPayload.username = 'usertest'

		const { statusCode, body } = await supertest(app).post('/users/login').send(loginPayload)

		expect(statusCode).toBe(401)
	})

	test('give wrong password and should return status 401', async () => {
		loginPayload.username = 'wrongpassword'

		const { statusCode, body } = await supertest(app).post('/users/login').send(loginPayload)

		expect(statusCode).toBe(401)
	})
})

describe('users/register', () => {
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
	})

	test('give executable data and then should return status 200 with user data', async () => {
		const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)

		expect(statusCode).toBe(200)
		expect(body.data.username).toBe(registerPayload.user)
	})

	describe('username validation', () => {
		afterEach(() => {
			registerPayload.user = 'testuser@gmail.com'
		})

		test('give executable data and username is already existed', async () => {
			const userResult = await supertest(app).post('/users/register').send(registerPayload)
			expect(userResult.statusCode).toBe(200)

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Username is already taken by another account.')
		})

		test('give null to user ', async () => {
			registerPayload.user = null

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Username should be a type of string.')
		})

		test('give empty string to user ', async () => {
			registerPayload.user = ''

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Username required.')
		})
	})

	describe('fullname validation', () => {
		afterEach(() => {
			registerPayload.name = 'testuser'
		})

		test('give null to name ', async () => {
			registerPayload.name = null

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Fullname must be a type of string.')
		})

		test('give empty string to name ', async () => {
			registerPayload.name = ''

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Fullname required.')
		})

		test('give only 1 character to name ', async () => {
			registerPayload.name = 'a'

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Fullname must have at least 2 characters.')
		})

		test('give a string with special character to name ', async () => {
			registerPayload.name = 'testuser@'

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Special characters are not allowed or invalid fullname.')
		})
	})

	describe('password validation', () => {
		afterEach(() => {
			registerPayload.pass = '123452'
		})

		test('give null to pass ', async () => {
			registerPayload.pass = null

			const { statusCode } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
		})

		test('give empty string to pass ', async () => {
			registerPayload.pass = ''

			const { statusCode } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
		})

		test('give a string with space to pass ', async () => {
			registerPayload.pass = '1234 5678'

			const { statusCode } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
		})

		test('give only 5 characters to pass ', async () => {
			registerPayload.pass = null

			const { statusCode } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
		})
	})

	describe('repeat passwrod validation', () => {
		afterEach(() => {
			registerPayload.pass_repeat = '123452'
		})

		test('give different pass_repeat from pass ', async () => {
			registerPayload.pass_repeat = '254321'

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Repeat password must be same with password.')
		})
	})

	describe('phone validation', () => {
		afterEach(() => {
			registerPayload.phone = '08412345672'
		})

		test('give a phone number with less than 8 digit', async () => {
			registerPayload.phone = '084123'

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Phone must a string of digits with 8 to 14 characters in length')
		})

		test('give a phone number with more than 14 digit', async () => {
			registerPayload.phone = '0841231213324343434'

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Phone must a string of digits with 8 to 14 characters in length')
		})

		test('give a phone number with an alphabet', async () => {
			registerPayload.phone = '084123121a'

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Phone must a string of digits with 8 to 14 characters in length')
		})

		test('give a phone number start with +', async () => {
			registerPayload.phone = '084123121a'

			const { statusCode, body } = await supertest(app).post('/users/register').send(registerPayload)
			expect(statusCode).toBe(400)
			expect(body.message).toBe('Phone must a string of digits with 8 to 14 characters in length')
		})
	})
})
