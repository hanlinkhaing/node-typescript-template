import Joi from 'joi'
import CustomerModel from '../models/customer-model'
import { ICustomerRegiser, ICustomerLogin, ICustomerUpdateData } from '../interfaces/customer-interfaces'

export const CustomerUpdateSchema: Joi.ObjectSchema = Joi.object<{ body: ICustomerUpdateData }>({
	body: Joi.object({
		txtuser: Joi.string().required().messages({
			'string.base': 'Username should be a type of string.',
			'string.empty': 'Username required.'
		}),
		txtname: Joi.string()
			.required()
			.min(2)
			.pattern(/^[a-zA-Z0-9]+$/)
			.messages({
				'string.base': 'Fullname must be a type of string.',
				'string.empty': 'Fullname required.',
				'string.min': 'Fullname must have at least 2 characters.',
				'string.pattern.base': 'Special characters are not allowed or invalid fullname.',
				'string.pattern.name': 'Special characters are not allowed or invalid fullname.'
			}),
		txtphone: Joi.string()
			.required()
			.pattern(/^[0-9]{8,14}$/)
			.message('Phone must a string of digits with 8 to 14 characters in length')
			.messages({
				'string.empty': 'txtphone required.'
			}),
		txtphone2: Joi.string()
			.allow(null, '')
			.pattern(/^(\+{0,1})([0-9]{8,14})$/)
			.message('Phone 2 must a string of digits(allowed +) with 8 to 14 characters in length')
			.messages({
				'string.empty': 'txtphone2 required.'
			})
	}).unknown()
}).unknown()

export const CustomerCheckSchema: Joi.ObjectSchema = Joi.object<{ body: { username: string } }>({
	body: Joi.object({
		username: Joi.string().required().messages({
			'string.base': 'Username must be a type of string.',
			'string.empty': 'Username required.'
		})
	})
}).unknown()

export const CustomerLoginScheam: Joi.ObjectSchema = Joi.object<{ body: ICustomerLogin }>({
	body: Joi.object({
		username: Joi.string().required().messages({
			'string.base': 'Username must be a type of string.',
			'string.empty': 'Username required.'
		}),
		password: Joi.string().required().messages({
			'string.base': 'Password must be a type of string.',
			'string.empty': 'Password required.'
		})
	})
}).unknown()

export const CustomerRegisterSchema: Joi.ObjectSchema = Joi.object<{ body: ICustomerRegiser }>({
	body: Joi.object({
		txtuser: Joi.string()
			.required()
			.external(async (value: string, helpers: Joi.CustomHelpers) => {
				const existed = await CustomerModel.findOne({ user: value })
				if (existed) return helpers.message({ external: 'Username is already taken by another account.' })
				return value
			})
			.messages({
				'string.base': 'Username should be a type of string.',
				'string.empty': 'Username required.',
				'username.taken': 'Username is already taken by another account.'
			}),
		txtpass: Joi.string()
			.required()
			.min(6)
			.custom((value: string, helpers: Joi.CustomHelpers) => {
				if (value.includes(' ')) return helpers.error('any.invalid')
				return value
			})
			.messages({
				'string.base': 'Password must be a type of string.',
				'string.empty': 'Password required.',
				'string.min': 'Password must have at least 6 characters.',
				'any.invalid': 'Space characters are not allowed in password.'
			}),
		txtpass_repeat: Joi.valid(Joi.ref('txtpass')).messages({
			'any.only': 'Repeat password must be same with password.'
		}),
		txtname: Joi.string()
			.required()
			.min(2)
			.pattern(/^[a-zA-Z0-9]+$/)
			.messages({
				'string.base': 'Fullname must be a type of string.',
				'string.empty': 'Fullname required.',
				'string.min': 'Fullname must have at least 2 characters.',
				'string.pattern.base': 'Special characters are not allowed or invalid fullname.',
				'string.pattern.name': 'Special characters are not allowed or invalid fullname.'
			}),
		txtphone: Joi.string()
			.pattern(/^[0-9]{8,14}$/)
			.message('Phone must a string of digits with 8 to 14 characters in length')
			.messages({
				'string.empty': 'txtphone required.'
			}),
		txtphone2: Joi.string()
			.allow(null)
			.pattern(/^(\+{0,1})([0-9]{8,14})$/)
			.message('Phone 2 must a string of digits(allowed +) with 8 to 14 characters in length')
			.messages({
				'string.empty': 'txtphone2 required.'
			}),
		aff_id: Joi.optional(),
		credit_rate: Joi.optional()
	})
		.with('txtpass', 'txtpass_repeat')
		.unknown()
}).unknown()
