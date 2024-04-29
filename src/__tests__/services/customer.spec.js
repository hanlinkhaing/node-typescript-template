import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { checkCustomerExists, createCustomer, login, refreshAccessToken, updateCustomer } from '../../services/customer'
import CustomerModel from '../../models/customer-model'
import mongoose from 'mongoose'
import { verify } from 'jsonwebtoken'
import config from '../../config'
import { MongoMemoryServer } from 'mongodb-memory-server'
import counterSeed from '../../seeds/counter-seed'
import configSeed from '../../seeds/config-seed'
import { PRICE_CREDIT } from '../../utils/constants'

const customerData = {
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
	txtname: 'testuser',
	txtpass: '123452',
	txtpass_repeat: '123452',
	txtphone: '08412345672',
	txtphone2: '0987654322',
	txtuser: 'testuser@gmail.com'
}

let mongoServer

describe('updateCustomer(data: ICustomerUpdateData)', () => {
	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create()
		await mongoose.connect(mongoServer.getUri())
		await configSeed()
		await counterSeed()
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	beforeEach(async () => {
		await CustomerModel.findOneAndDelete({ user: registerPayload.txtuser })
		await createCustomer(registerPayload)
	})

	const updateData = {
		txtuser: 'testuser@gmail.com',
		txtphone: '213454566',
		txtname: 'PikaPika3',
		txtphone2: '76543219'
	}

	test('should return updated user data when executable data is given', async () => {
		const customer = await updateCustomer(updateData)

		expect(customer.fullname).toBe(updateData.txtname)
		expect(customer.phone).toEqual(`${updateData.txtphone};${updateData.txtphone2}`)
	})

	test('should return updated user data with 1 phone when txtphone2 is null or empty', async () => {
		updateData.txtphone2 = null

		const customer = await updateCustomer(updateData)

		expect(customer.phone).toBe(updateData.txtphone)
	})
})

describe('creteCustomer(payload: ICustomerRegiser)', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoose.connection.close()
        if (mongoServer) await mongoServer.stop()
    })

    test('should throw exception when config data not seeded', async () => {
        try {
            await createCustomer(registerPayload)
        } catch (err) {
            expect(err.message).toEqual(`"${PRICE_CREDIT}" config value not found.`)
        }
    })

    describe('config data seeded', () => {
        beforeAll(async () => {
            await configSeed()
            await counterSeed()
        })

        test('should return saved customer data', async () => {
            const customer = await createCustomer(registerPayload)

            expect(customer).toBeDefined()
            expect(customer._id).toBeDefined()
        })

        test('should throw error when username already existed', async () => {
            try {
                await createCustomer(registerPayload)
            } catch (err) {
                expect(err).toBeDefined()
            }
        })
    })
})

describe('login(payload: IAuthCustomer)', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
        await configSeed()
        await counterSeed()
        await createCustomer(registerPayload)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoose.connection.close()
        if (mongoServer) await mongoServer.stop()
    })

    test('should return valid token strings when customer existed', async () => {
        const tokens = await login(customerData)

        expect(tokens).toBeDefined()

        const tokenVerification = verify(tokens.token, config.ACCESS_TOKEN_SECRET, { complete: true })
        const refreshVerification = verify(tokens.refresh_token, config.REFRESH_TOKEN_SECRET, { complete: true })

        expect(tokenVerification.payload.data).toBeDefined()
        expect(refreshVerification.payload.data).toBeDefined()
    })

    test('should throw error when customer not existed', async () => {
        await CustomerModel.findOneAndDelete({ user: registerPayload.txtuser })

        try {
            await login(customerData)
        } catch (err) {
            expect(err.message).toEqual('Auth user not found.')
        }
    })
})

describe('refreshAccessToken(username: string)', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
        await configSeed()
        await counterSeed()
        await createCustomer(registerPayload)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoose.connection.close()
        if (mongoServer) await mongoServer.stop()
    })

    test('should return valid token string when customer existed', async () => {
        const token = await refreshAccessToken(registerPayload.txtuser)

        expect(token).toBeDefined()

        const verification = verify(token, config.ACCESS_TOKEN_SECRET, { complete: true })

        expect(verification.payload.data).toBeDefined()
    })

    test('should throw error when customer not existed', async () => {
        await CustomerModel.findOneAndDelete({ user: registerPayload.txtuser })

        try {
            await refreshAccessToken(registerPayload.txtuser)
        } catch (err) {
            expect(err.message).toEqual('Auth user not found.')
        }
    })
})

describe('checkCustomerExists(username: string)', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        await mongoose.connect(mongoServer.getUri())
        await configSeed()
        await counterSeed()
        await createCustomer(registerPayload)
    })

    afterAll(async () => {
        await mongoose.disconnect()
        await mongoose.connection.close()
        if (mongoServer) await mongoServer.stop()
    })

    test('username already existed and should true', async () => {
        const result = await checkCustomerExists(registerPayload.txtuser)

        expect(result).toBeTruthy
    })

    test('username doesn\'t exist and should return false', async () => {
        await CustomerModel.findOneAndDelete({ user: registerPayload.txtuser })

        const result = await checkCustomerExists(registerPayload.txtuser)

        expect(result).toBeFalsy()
    })
})
