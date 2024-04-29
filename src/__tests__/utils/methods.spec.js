import { test, describe, expect, vi } from 'vitest'
import { generateAccessToken, generateRefreshToken, findOneOrCreate } from '../../utils/methods'

describe('findOneOrCreate(condition: any, data: any)', () => {
    const MongoMock = function() {
        this.findOne = vi.fn((condition) => condition)
        this.create = vi.fn((data) => data)
    }

    test('should return data if user did not exist', async () => {
        const payload = ['some conditions', 'some data']

        const result = await findOneOrCreate.apply(new MongoMock(), payload)

        expect(result).toBe(payload[0])
    })

    test('should return data if user existed', async () => {
        const payload = ['some conditions', 'some data']

        const result = await findOneOrCreate.apply(new MongoMock(), payload)

        expect(result).toBe(payload[0])
    })
})

describe('generateAccessToken(data: IAuthCustomer)', () => {
    test('should return a token string', () => {
        const payload = 'string payload'

        const token = generateAccessToken(payload)

        expect(token).toBeDefined()
    })
})

describe('generateRefreshToken(data: IAuthCustomer)', () => {
    test('should return a token string', () => {
        const payload = 'string payload'

        const token = generateRefreshToken(payload)

        expect(token).toBeDefined()
    })
})