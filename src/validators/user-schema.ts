import Joi from 'joi'
import UserModel from '../models/user-model'
import { IUserRegiser, IUserLogin, IUserUpdateData } from '../interfaces/user-interfaces'

export const UserUpdateSchema: Joi.ObjectSchema = Joi.object<{ body: IUserUpdateData }>({
	body: Joi.object({
		user: Joi.string().required().messages({
			'string.base': 'Username should be a type of string.',
			'string.empty': 'Username required.'
		}),
		name: Joi.string()
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
		phone: Joi.string()
			.required()
			.pattern(/^[0-9]{8,14}$/)
			.message('Phone must a string of digits with 8 to 14 characters in length')
			.messages({
				'string.empty': 'phone required.'
			})
	}).unknown()
}).unknown()

export const UserCheckSchema: Joi.ObjectSchema = Joi.object<{ body: { username: string } }>({
	body: Joi.object({
		username: Joi.string().required().messages({
			'string.base': 'Username must be a type of string.',
			'string.empty': 'Username required.'
		})
	})
}).unknown()

export const UserLoginScheam: Joi.ObjectSchema = Joi.object<{ body: IUserLogin }>({
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

export const UserRegisterSchema: Joi.ObjectSchema = Joi.object<{ body: IUserRegiser }>({
	body: Joi.object({
		user: Joi.string()
			.required()
			.external(async (value: string, helpers: Joi.CustomHelpers) => {
				const existed = await UserModel.findOne({ username: value })
				if (existed) return helpers.message({ external: 'Username is already taken by another account.' })
				return value
			})
			.messages({
				'string.base': 'Username should be a type of string.',
				'string.empty': 'Username required.',
				'username.taken': 'Username is already taken by another account.'
			}),
		pass: Joi.string()
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
		pass_repeat: Joi.valid(Joi.ref('pass')).messages({
			'any.only': 'Repeat password must be same with password.'
		}),
		name: Joi.string()
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
		phone: Joi.string()
			.pattern(/^[0-9]{8,14}$/)
			.message('Phone must a string of digits with 8 to 14 characters in length')
			.messages({
				'string.empty': 'phone required.'
			}),
		aff_id: Joi.optional(),
		credit_rate: Joi.optional()
	})
		.with('pass', 'pass_repeat')
		.unknown()
}).unknown()
