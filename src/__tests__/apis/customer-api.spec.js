import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import app from '../../app'
import CustomerModel from '../../models/customer-model'
import supertest from 'supertest'
import { createCustomer } from '../../services/customer'
import counterSeed from '../../seeds/counter-seed'
import configSeed from '../../seeds/config-seed'
import { generateAccessToken, generateRefreshToken } from '../../utils/methods'

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
		await configSeed()
		await counterSeed()
	})

	afterAll(async () => {
		await mongoose.disconnect()
		await mongoose.connection.close()
		if (mongoServer) await mongoServer.stop()
	})

	let loginToken

	beforeEach(async () => {
		await CustomerModel.findOneAndDelete({ user: registerPayload.txtuser })
		await createCustomer(registerPayload)
		loginToken = generateAccessToken(authUser)
	})

	const updateData = {
		txtuser: 'testuser@gmail.com',
		txtphone: '213454566',
		txtname: 'PikaPika3',
		txtphone2: '76543219'
	}

	test('should return 200 with updated data for success process', async () => {
		const { statusCode, body } = await supertest(app)
			.put('/users/profile')
			.set('Authorization', `Bearer ${loginToken}`)
			.send(updateData)

		expect(statusCode).toBe(200)
		expect(body.data.fullname).toBe(updateData.txtname)
		expect(body.data.phone).toBe(`${updateData.txtphone};${updateData.txtphone2}`)
	})

	test("should return 401 when token's username and payload txtuser are not same", async () => {
		updateData.txtuser = 'wrong@gmail.com'

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
		await configSeed()
		await counterSeed()
		await createCustomer(registerPayload)
		refreshToken = generateRefreshToken(authUser)
	})

	afterAll(async () => {
		await CustomerModel.findOneAndDelete({ user: registerPayload.txtuser })
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
        username: 'testuser@gmail.com',
    }
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

    test('username already existed and should return status 200 with isExisted true', async () => {
        const {statusCode, body} = await supertest(app).post("/users/checkUserExists").send(payload)

        expect(statusCode).toBe(200)
        expect(body.data.isExisted).toBeTruthy()
    })

    test('username doesn\'t exist and should return status 200 with isExisted false', async () => {
        await CustomerModel.findOneAndDelete({ user: registerPayload.txtuser })

        const {statusCode, body} = await supertest(app).post("/users/checkUserExists").send(payload)

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
        await configSeed()
        await counterSeed()
        await createCustomer(registerPayload)
    })

    afterAll(async () => {
        await CustomerModel.findOneAndDelete({ user: registerPayload.txtuser })
        await mongoose.disconnect()
        await mongoose.connection.close()
        if (mongoServer) await mongoServer.stop()
    })

    test('give executable data and should return status 200 with tokens', async () => {
        const {statusCode, body} = await supertest(app).post("/users/login").send(loginPayload)

        expect(statusCode).toBe(200)
        expect(body.data.token).toBeDefined()
    })

    test('give unexisted username and should return status 401', async () => {
        loginPayload.username = 'usertest'

        const {statusCode, body} = await supertest(app).post("/users/login").send(loginPayload)

        expect(statusCode).toBe(401)
    })

    test('give wrong password and should return status 401', async () => {
        loginPayload.username = 'wrongpassword'

        const {statusCode, body} = await supertest(app).post("/users/login").send(loginPayload)

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

    describe('when config data not seeded', () => {
        test('give executable data and then should return status 500', async () => {
            const {statusCode} = await supertest(app).post("/users/register").send(registerPayload)
            expect(statusCode).toBe(500)
        })
    })

    describe('when config data seeded', () => {
        beforeAll(async () => {
            await configSeed()
            await counterSeed()
        })

        beforeEach(async () => {
            await CustomerModel.findOneAndDelete({ user: registerPayload.txtuser })
        })

        test('give executable data and then should return status 200 with user data', async () => {
            const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)

            expect(statusCode).toBe(200)
            expect(body.data.user).toBe(registerPayload.txtuser)
        })

        describe('username validation', () => {
            afterEach(() => {
                registerPayload.txtuser = "testuser@gmail.com"
            })

            test('give executable data and username is already existed', async () => {
                const customerResult = await supertest(app).post("/users/register").send(registerPayload)
                expect(customerResult.statusCode).toBe(200)

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Username is already taken by another account.')
            })

            test('give null to txtuser ', async () => {
                registerPayload.txtuser = null

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Username should be a type of string.')
            })

            test('give empty string to txtuser ', async () => {
                registerPayload.txtuser = ''

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Username required.')
            })
        })

        describe('fullname validation', () => {
            afterEach(() => {
                registerPayload.txtname = "testuser"
            })

            test('give null to txtname ', async () => {
                registerPayload.txtname = null

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Fullname must be a type of string.')
            })

            test('give empty string to txtname ', async () => {
                registerPayload.txtname = ''

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Fullname required.')
            })

            test('give only 1 character to txtname ', async () => {
                registerPayload.txtname = 'a'

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Fullname must have at least 2 characters.')
            })

            test('give a string with special character to txtname ', async () => {
                registerPayload.txtname = 'testuser@'

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Special characters are not allowed or invalid fullname.')
            })
        })

        describe('password validation', () => {
            afterEach(() => {
                registerPayload.txtpass = "123452"
            })

            test('give null to txtpass ', async () => {
                registerPayload.txtpass = null

                const {statusCode} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
            })

            test('give empty string to txtpass ', async () => {
                registerPayload.txtpass = ''

                const {statusCode} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
            })

            test('give a string with space to txtpass ', async () => {
                registerPayload.txtpass = '1234 5678'

                const {statusCode} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
            })

            test('give only 5 characters to txtpass ', async () => {
                registerPayload.txtpass = null

                const {statusCode} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
            })
        })

        describe('repeat passwrod validation', () => {
            afterEach(() => {
                registerPayload.txtpass_repeat = "123452"
            })

            test('give different txtpass_repeat from txtpass ', async () => {
                registerPayload.txtpass_repeat = '254321'

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Repeat password must be same with password.')
            })
        })

        describe('txtphone validation', () => {
            afterEach(() => {
                registerPayload.txtphone = '08412345672'
            })

            test('give a phone number with less than 8 digit', async () => {
                registerPayload.txtphone = '084123'

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Phone must a string of digits with 8 to 14 characters in length')
            })

            test('give a phone number with more than 14 digit', async () => {
                registerPayload.txtphone = '0841231213324343434'

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Phone must a string of digits with 8 to 14 characters in length')
            })

            test('give a phone number with an alphabet', async () => {
                registerPayload.txtphone = '084123121a'

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Phone must a string of digits with 8 to 14 characters in length')
            })

            test('give a phone number start with +', async () => {
                registerPayload.txtphone = '084123121a'

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Phone must a string of digits with 8 to 14 characters in length')
            })
        })

        describe('txtphone2 validation', () => {
            afterEach(() => {
                registerPayload.txtphone2 = '08412345672'
            })

            test('without txtphone2 field and should success', async () => {
                delete registerPayload.txtphone2

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)

                expect(statusCode).toBe(200)
            })

            test('give null and should success', async () => {
                registerPayload.txtphone2 = null

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)

                expect(statusCode).toBe(200)
            })

            test('give a phone number with less than 8 digit', async () => {
                registerPayload.txtphone2 = '084123'

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Phone 2 must a string of digits(allowed +) with 8 to 14 characters in length')
            })

            test('give a phone number with more than 14 digit', async () => {
                registerPayload.txtphone2 = '0841231213324343434'

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Phone 2 must a string of digits(allowed +) with 8 to 14 characters in length')
            })

            test('give a phone number with an alphabet', async () => {
                registerPayload.txtphone2 = '084123121a'

                const {statusCode, body} = await supertest(app).post("/users/register").send(registerPayload)
                expect(statusCode).toBe(400)
                expect(body.message).toBe('Phone 2 must a string of digits(allowed +) with 8 to 14 characters in length')
            })
        })
    })
})