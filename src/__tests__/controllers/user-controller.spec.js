import { describe, test, vi, expect, afterEach, beforeEach } from 'vitest'
import { checkUserExists, login, refreshToken, register, updateUserProfile } from '../../controllers/user-controller'

vi.mock('../../services/user')
const response = {
	statusCode: 0,
	status: vi.fn(function (number) {
		this.statusCode = number
		return this
	}),
	send: vi.fn(function (resPayload) {
		return resPayload
	})
}

const request = {
	user: {
		username: 'testuser'
	},
	body: {
		username: 'testuser'
	}
}

const next = vi.fn()

describe('update controller', () => {
	beforeEach(() => {
		request.body.user = 'testuser'
	})

	test("should call next function with error when body's user and auth's username are not same.", async () => {
		request.body.user = 'updateuser'

		await updateUserProfile(request, response, next)

		expect(next).toBeCalled()
	})

	test('should call next function with error when throw an exception', async () => {
		response.status.mockImplementationOnce(() => {
			throw new Error('test error')
		})

		await updateUserProfile(request, response, next)

		expect(next).toBeCalled()
	})

	test('should return by calling response method for success process', async () => {
		await updateUserProfile(request, response, next)

		expect(response.status).toBeCalledWith(200)
	})
})

describe('login controller', () => {
	afterEach(() => {
		request.user.username = 'testuser'
	})

	test('should call next function with error when auth user is not existed in request', async () => {
		delete request.user.username

		await login(request, response, next)

		expect(next).toBeCalled()
	})

	test('should call next function with error when throw an exception', async () => {
		response.status.mockImplementationOnce(function () {
			throw new Error('Test error')
		})

		await login(request, response, next)

		expect(next).toBeCalled()
	})

	test('should return by calling response methods for success process', async () => {
		await login(request, response, next)

		expect(response.status).toBeCalledWith(200)
	})
})

describe('register controller', () => {
	test('should return by calling response methods for success process', async () => {
		await register(request, response, next)

		expect(response.status).toBeCalledWith(200)
	})

	test('should call next function with error when throw an exception', async () => {
		response.status.mockImplementationOnce(() => {
			throw new Error('test error')
		})

		await register(request, response, next)

		expect(next).toBeCalled()
	})
})

describe('checkUserExists controller', () => {
	test('should return by calling response methods for success process', async () => {
		await checkUserExists(request, response, next)

		expect(response.status).toBeCalledWith(200)
	})

	test('should call next function with error when throw an exception', async () => {
		response.status.mockImplementationOnce(() => {
			throw new Error('test error')
		})

		await checkUserExists(request, response, next)

		expect(next).toBeCalled()
	})
})

describe('refreshToken controller', () => {
	test('should return by calling response methods for success process', async () => {
		await refreshToken(request, response, next)

		expect(response.status).toBeCalledWith(200)
	})

	test('should call next function with error when throw an exception', async () => {
		response.status.mockImplementationOnce(() => {
			throw new Error('test error')
		})

		await refreshToken(request, response, next)

		expect(next).toBeCalled()
	})
})
