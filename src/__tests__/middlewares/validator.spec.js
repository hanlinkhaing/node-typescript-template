import { describe, test, expect, vi } from "vitest";
import validator from '../../middlewares/validator'

const response = {
    status: vi.fn(function(number) {
        return this
    }),
    send: vi.fn(function(resPayload) {
        return resPayload
    })
}

const request = {}

const next = vi.fn()

const schema = {
    validateAsync: vi.fn()
}

describe('request validator', () => {
    test('should call next funciton when validation success', async () => {
        await validator(schema)(request, response, next)

        expect(next).toBeCalled()
    })

    test('should return with status code 400 when validation throw an exception without details', async () => {
        schema.validateAsync.mockImplementationOnce(() => { throw new Error('test error') })

        await validator(schema)(request, response, next)

        expect(next).toBeCalled()
    })

    test('should return with status code 400 when validation throw an exception with details', async () => {
        schema.validateAsync.mockImplementationOnce(() => {
            const error = new Error('test error')
            error.details = [
                {
                    type: 'test type',
                    message: 'test error'
                }
            ]
            throw error
        })

        await validator(schema)(request, response, next)

        expect(next).toBeCalled()
    })
})