import validator from '../../middlewares/validator'
import {
	CustomerRegisterSchema,
	CustomerLoginScheam,
	CustomerCheckSchema,
	CustomerUpdateSchema
} from '../../validators/customer-schema'
import { afterEach, describe, expect, test, vi, beforeAll, afterAll } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import counterSeed from '../../seeds/counter-seed'
import configSeed from '../../seeds/config-seed'
import { createCustomer } from '../../services/customer'

const response = {
	status: vi.fn(function (number) {
		return this
	}),
	send: vi.fn(function (resPayload) {
		return resPayload
	})
}

const next = vi.fn()

describe('customer-profile-update-validation', () => {
	const registerData = {
		aff_id: '',
		credit_rate: '100',
		txtname: 'testuser',
		txtpass: '123452',
		txtpass_repeat: '123452',
		txtphone: '08412345672',
		txtphone2: '0987654322',
		txtuser: 'testuser@gmail.com'
	}

	const body = {
		txtuser: 'testuser@gmail.com',
		txtname: 'updateuser',
		txtphone: '08412345673',
		txtphone2: '0987654323'
	}

	const request = { body }

	let mongoServer

	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
		await configSeed()
		await counterSeed()
		await createCustomer(registerData)
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	describe('username validation', () => {
		afterEach(() => {
			body.txtuser = 'testuser@gmail.com'
		})

		test('should call response method when null to txtuser', async () => {
			body.txtuser = null

			await validator(CustomerUpdateSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call next method when valid value to txtuser', async () => {
			await validator(CustomerUpdateSchema)(request, response, next)
			expect(next).toBeCalled()
		})
	})

	describe('fullname validation', () => {
		afterEach(() => {
			body.txtname = 'updateuser'
		})

		test('should call response method when null to txtname ', async () => {
			body.txtname = null

			await validator(CustomerUpdateSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when empty string to txtname ', async () => {
			body.txtname = ''

			await validator(CustomerUpdateSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when only 1 character to txtname ', async () => {
			body.txtname = 'a'

			await validator(CustomerUpdateSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when string with special character to txtname ', async () => {
			body.txtname = 'testuser@'

			await validator(CustomerUpdateSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('txtphone validation', () => {
		afterEach(() => {
			body.txtphone = '08412345673'
		})

		test('should call response method when phone number with null', async () => {
			body.txtphone = null

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with less than 8 digit', async () => {
			body.txtphone = '084123'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with more than 14 digit', async () => {
			body.txtphone = '0841231213324343434'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with an alphabet', async () => {
			body.txtphone = '084123121a'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number start with +', async () => {
			body.txtphone = '084123121a'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('txtphone2 validation', () => {
		afterEach(() => {
			body.txtphone2 = '08412345673'
		})

		test('should call next method when phone number with null', async () => {
			body.txtphone2 = null

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(next).toBeCalled()
		})

		test('should call response method when phone number with less than 8 digit', async () => {
			body.txtphone2 = '084123'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with more than 14 digit', async () => {
			body.txtphone2 = '0841231213324343434'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with an alphabet', async () => {
			body.txtphone2 = '084123121a'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})
})

describe.skip('customer-check-validation', () => {
	test('should call next function', async () => {
		const request = {
			body: {
				username: 'username'
			}
		}

		await validator(CustomerCheckSchema)(request, response, next)
		expect(next).toBeCalled()
	})

	test('should call response method when username is null', async () => {
		const request = {
			body: {
				username: null
			}
		}

		await validator(CustomerCheckSchema)(request, response, next)
		expect(response.status).toBeCalledWith(400)
	})
})

describe.skip('customer-login-validation', () => {
	test('should call next function', async () => {
		const request = {
			body: {
				username: 'username',
				password: 'password'
			}
		}

		await validator(CustomerLoginScheam)(request, response, next)
		expect(next).toBeCalled()
	})

	test('should call response method when username is null', async () => {
		const request = {
			body: {
				username: null,
				password: 'password'
			}
		}

		await validator(CustomerLoginScheam)(request, response, next)
		expect(response.status).toBeCalledWith(400)
	})

	test('should call response method when password is null', async () => {
		const request = {
			body: {
				username: 'username',
				password: null
			}
		}

		await validator(CustomerLoginScheam)(request, response, next)
		expect(response.status).toBeCalledWith(400)
	})
})

describe.skip('customer-register-validation', () => {
	const body = {
		aff_id: '',
		credit_rate: '100',
		txtname: 'testuser',
		txtpass: '123452',
		txtpass_repeat: '123452',
		txtphone: '08412345672',
		txtphone2: '0987654322',
		txtuser: 'testuser@gmail.com'
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
		await validator(CustomerRegisterSchema)(request, response, next)
		expect(next).toBeCalled()
	})

	describe('when username already existed', () => {
		beforeAll(async () => {
			await configSeed()
			await counterSeed()
			await createCustomer(body)
		})

		test('should call response methods with 400', async () => {
			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('username validation', () => {
		afterEach(() => {
			body.txtuser = 'testuser@gmail.com'
		})

		test('should call response method when null to txtuser ', async () => {
			body.txtuser = null

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when empty string to txtuser ', async () => {
			body.txtuser = ''

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('fullname validation', () => {
		afterEach(() => {
			body.txtname = 'testuser'
		})

		test('should call response method when null to txtname ', async () => {
			body.txtname = null

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when empty string to txtname ', async () => {
			body.txtname = ''

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when only 1 character to txtname ', async () => {
			body.txtname = 'a'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when string with special character to txtname ', async () => {
			body.txtname = 'testuser@'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('password validation', () => {
		afterEach(() => {
			body.txtpass = '123452'
		})

		test('should call response method when null to txtpass ', async () => {
			body.txtpass = null

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when empty string to txtpass ', async () => {
			body.txtpass = ''

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when a string with space to txtpass ', async () => {
			body.txtpass = '1234 5678'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when only 5 characters to txtpass ', async () => {
			body.txtpass = null

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('repeat passwrod validation', () => {
		afterEach(() => {
			body.txtpass_repeat = '123452'
		})

		test('should call response method when different txtpass_repeat from txtpass ', async () => {
			body.txtpass_repeat = '254321'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('txtphone validation', () => {
		afterEach(() => {
			body.txtphone = '08412345672'
		})

		test('should call response method when phone number with less than 8 digit', async () => {
			body.txtphone = '084123'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with more than 14 digit', async () => {
			body.txtphone = '0841231213324343434'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with an alphabet', async () => {
			body.txtphone = '084123121a'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number start with +', async () => {
			body.txtphone = '084123121a'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})

	describe('txtphone2 validation', () => {
		afterEach(() => {
			body.txtphone2 = '08412345672'
		})

		test('should call response method when phone number with less than 8 digit', async () => {
			body.txtphone2 = '084123'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with more than 14 digit', async () => {
			body.txtphone2 = '0841231213324343434'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})

		test('should call response method when phone number with an alphabet', async () => {
			body.txtphone2 = '084123121a'

			await validator(CustomerRegisterSchema)(request, response, next)
			expect(response.status).toBeCalledWith(400)
		})
	})
})
