import {
	ICustomerRegiser,
	ICustomer,
	IAuthCustomer,
	ICustomerUpdateData,
	ICustomerUpdate
} from '../interfaces/customer-interfaces'
import CustomerModel from '../models/customer-model'
import ConfigModel from '../models/config-model'
import { ONE, PRICE_CREDIT, TEN } from '../utils/constants'
import { hash } from 'bcryptjs'
import HttpErrors from 'http-errors'
import HttpStatus from 'http-status-codes'
import {
	customerRegisterToCustomerMapper,
	customerToAuthMapper,
	updateDataToCustomerUpdateMapper
} from '../mappers/customer-mappers'
import { generateAccessToken, generateRefreshToken } from '../utils/methods'

export const updateCustomer = async (data: ICustomerUpdateData): Promise<ICustomer | null> => {
	const payload = updateDataToCustomerUpdateMapper().map<ICustomerUpdateData, ICustomerUpdate>(
		data,
		'ICustomerUpdateData',
		'ICustomerUpdate'
	)
	const customer = await CustomerModel.findOneAndUpdate({ user: data.txtuser }, payload, { new: true })

	return customer
}

export const refreshAccessToken = async (username: string): Promise<string> => {
	const customer = await CustomerModel.findOne({ user: username })
	if (!customer) throw HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, `Auth user not found.`)

	const authCustomer = customerToAuthMapper().map<ICustomer, IAuthCustomer>(customer, 'ICustomer', 'IAuthCustomer')
	const accessToken = generateAccessToken(authCustomer)
	customer.token_login = accessToken
	await customer.save()

	return accessToken
}

export const checkCustomerExists = async (username: string): Promise<boolean> => {
	const customer = await CustomerModel.findOne({ user: username })
	if (!customer) return false
	return true
}

export const login = async (payload: IAuthCustomer): Promise<{ token: string; refresh_token: string }> => {
	const customer = await CustomerModel.findOne({ user: payload.username })
	if (!customer) throw HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, `Auth user not found.`)

	customer.login_count = (customer.login_count ?? 0) + 1
	customer.last_login = new Date()

	const authCustomer = customerToAuthMapper().map<ICustomer, IAuthCustomer>(customer, 'ICustomer', 'IAuthCustomer')
	const accessToken = generateAccessToken(authCustomer)
	const refreshToken = generateRefreshToken(authCustomer)

	customer.token_login = accessToken
	await customer.save()

	return { token: accessToken, refresh_token: refreshToken }
}

export const createCustomer = async (payload: ICustomerRegiser): Promise<ICustomer> => {
	/* eslint-disable */
	const { txtpass } = payload
	const str = Math.floor(Math.random() * TEN) + ONE

	const data = customerRegisterToCustomerMapper().map<ICustomerRegiser, ICustomer>(
		payload,
		'ICustomerRegister',
		'ICustomer'
	)
	data.str = str.toString()
	data.password = await hash(txtpass, str)

	const config = await ConfigModel.findOne({ config: PRICE_CREDIT })
	if (!config) throw HttpErrors(HttpStatus.INTERNAL_SERVER_ERROR, `"${PRICE_CREDIT}" config value not found.`)

	data.credit = config.description_VI

	let customer = new CustomerModel(data)

	customer = await customer.save()

	return customer
}
