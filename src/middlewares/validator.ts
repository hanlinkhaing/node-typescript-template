import HttpStatus from 'http-status-codes'
import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { RESPONSE_STATUS } from '../utils/enums'
import { Logger } from '../services/logger'

export default (schema: Joi.ObjectSchema) => async (req: Request, res: Response, next: NextFunction) => {
	try {
		await schema.validateAsync(req, { abortEarly: false })
		next()
	} catch (err: any) {
		let message
		if (err.details) {
			message = err.details
				.map((el: any) => {
					Logger.warn(el.type + ' : ' + el.message)
					return el.message
				})
				.join('\n')
		} else {
			Logger.error(err)
			message = err.message
		}
		return res.status(HttpStatus.BAD_REQUEST).send({
			status: RESPONSE_STATUS.ERROR,
			message
		})
	}
}
