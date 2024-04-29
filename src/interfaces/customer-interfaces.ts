export interface ICustomer {
	id?: string
	customerId?: number
	aff_code?: string
	refer_code?: string
	dob?: Date
	user: string
	password: string
	reset_key?: string
	str: string
	balance?: number
	fullname?: string
	birthday?: string
	phone: string
	email?: string
	address?: string
	yid?: string
	level?: string
	status?: boolean
	ban_forever?: boolean
	verified_tel?: boolean
	verified_tel2?: boolean
	verified_tel_date?: Date
	verified_tel_date2?: Date
	suspect?: number
	suspect_note?: string
	date_created?: Date
	user_last_update?: Date
	create_by?: string
	last_login?: Date
	credit?: string
	logs?: string
	login_count?: number
	popup_count?: number
	created_on_mobi_desktop?: string
	is_warning?: boolean
	warning_note?: string
	ignore_warning?: boolean
	support_note?: string
	token_login?: string
	bank_list?: string
	history?: string
}

export interface ICustomerRegiser {
	aff_id: string
	txtuser: string
	txtpass: string
	txtpass_repeat: string
	txtname: string
	txtphone: string
	txtphone2: string
	credit_rate?: string
}

export interface ICustomerLogin {
	username: string
	passwrod: string
}

export interface IAuthCustomer {
	id?: number
	username?: string
	phone?: string
	fullname?: string
	bankList?: string
	loginCount?: number
	popupCount?: number
	userLastUpdate?: Date
}

export interface ICustomerUpdateData {
	txtuser: string
	txtname: string
	txtphone: string
	txtphone2: string
}

export interface ICustomerUpdate {
	fullname: string
	phone: string
}
