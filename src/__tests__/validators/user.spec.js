import validator from '../../middlewares/validator'
import { UserRegisterSchema, UserLoginScheam, UserCheckSchema, UserUpdateSchema } from '../../validators/user-schema'
import { afterEach, describe, expect, test, vi, beforeAll, afterAll } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { createUser } from '../../services/user'

const response = {
	status: vi.fn(function (number) {
		return this
	}),
	send: vi.fn(function (resPayload) {
		return resPayload
	})
}

const next = vi.fn()

describe('user-profile-update-validation', () => {
	const registerData = {
		aff_id: '',
		credit_rate: '100',
		name: 'testuser',
		pass: '123452',
		pass_repeat: '123452',
		phone: '08412345672',
		user: 'testuser@gmail.com'
	}

	const body = {
		user: 'testuser@gmail.com',
		name: 'updateuser',
		phone: '08412345673'
	}

	const request = { body }

	let mongoServer

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
		await createUser(registerData)
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	describe('username validation', () => {
		afterEach(() => {
			body.user = 'testuser@gmail.com'
		})

		test('should call response method when null to user', async () => {
			body.user = null

			await validator(UserUpdateSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call next method when valid value to user', async () => {
			await validator(UserUpdateSchema)(request, response, next)
			expect(next).toBeCalled()
		})
	})

	describe('fullname validation', () => {
		afterEach(() => {
			body.name = 'updateuser'
		})

		test('should call response method when null to name ', async () => {
			body.name = null

			await validator(UserUpdateSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when empty string to name ', async () => {
			body.name = ''

			await validator(UserUpdateSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when only 1 character to name ', async () => {
			body.name = 'a'

			await validator(UserUpdateSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when string with special character to name ', async () => {
			body.name = 'testuser@'

			await validator(UserUpdateSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('phone validation', () => {
		afterEach(() => {
			body.phone = '08412345673'
		})

		test('should call response method when phone number with null', async () => {
			body.phone = null

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with less than 8 digit', async () => {
			body.phone = '084123'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with more than 14 digit', async () => {
			body.phone = '0841231213324343434'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with an alphabet', async () => {
			body.phone = '084123121a'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number start with +', async () => {
			body.phone = '084123121a'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})
})

describe('user-check-validation', () => {
	test('should call next function', async () => {
		const request = {
			body: {
				username: 'username'
			}
		}

		await validator(UserCheckSchema)(request, response, next)
		expect(next).toBeCalled()
	})

	test('should call response method when username is null', async () => {
		const request = {
			body: {
				username: null
			}
		}

		await validator(UserCheckSchema)(request, response, next)
		expect(response.status).toBeCalledWith(400)
	})
})

describe('user-login-validation', () => {
	test('should call next function', async () => {
		const request = {
			body: {
				username: 'username',
				password: 'password'
			}
		}

		await validator(UserLoginScheam)(request, response, next)
		expect(next).toBeCalled()
	})

	test('should call response method when username is null', async () => {
		const request = {
			body: {
				username: null,
				password: 'password'
			}
		}

		await validator(UserLoginScheam)(request, response, next)
		expect(response.status).toBeCalledWith(400)
	})

	test('should call response method when password is null', async () => {
		const request = {
			body: {
				username: 'username',
				password: null
			}
		}

		await validator(UserLoginScheam)(request, response, next)
		expect(response.status).toBeCalledWith(400)
	})
})

describe('user-register-validation', () => {
	const body = {
		aff_id: '',
		credit_rate: '100',
		name: 'testuser',
		pass: '123452',
		pass_repeat: '123452',
		phone: '08412345672',
		user: 'testuser@gmail.com'
	}

	const request = { body }

	let mongoServer

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	test('should call next method', async () => {
		await validator(UserRegisterSchema)(request, response, next)
		expect(next).toBeCalled()
	})

	describe('when username already existed', () => {
		beforeAll(async () => {
			await createUser(body)
		})

		test('should call response methods with 400', async () => {
			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('username validation', () => {
		afterEach(() => {
			body.user = 'testuser@gmail.com'
		})

		test('should call response method when null to user ', async () => {
			body.user = null

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when empty string to user ', async () => {
			body.user = ''

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('fullname validation', () => {
		afterEach(() => {
			body.name = 'testuser'
		})

		test('should call response method when null to name ', async () => {
			body.name = null

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when empty string to name ', async () => {
			body.name = ''

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when only 1 character to name ', async () => {
			body.name = 'a'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when string with special character to name ', async () => {
			body.name = 'testuser@'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('password validation', () => {
		afterEach(() => {
			body.pass = '123452'
		})

		test('should call response method when null to pass ', async () => {
			body.pass = null

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when empty string to pass ', async () => {
			body.pass = ''

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when a string with space to pass ', async () => {
			body.pass = '1234 5678'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when only 5 characters to pass ', async () => {
			body.pass = null

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('repeat passwrod validation', () => {
		afterEach(() => {
			body.pass_repeat = '123452'
		})

		test('should call response method when different pass_repeat from pass ', async () => {
			body.pass_repeat = '254321'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('phone validation', () => {
		afterEach(() => {
			body.phone = '08412345672'
		})

		test('should call response method when phone number with less than 8 digit', async () => {
			body.phone = '084123'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with more than 14 digit', async () => {
			body.phone = '0841231213324343434'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with an alphabet', async () => {
			body.phone = '084123121a'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number start with +', async () => {
			body.phone = '084123121a'

			await validator(UserRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})
})
