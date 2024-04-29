export interface IUser {
	username: string
	password: string
	str: string
	fullname?: string
	phone: string
	email?: string
}

export interface IUserRegiser {
	user: string
	pass: string
	pass_repeat: string
	name: string
	phone: string
}

export interface IUserLogin {
	username: string
	passwrod: string
}

export interface IAuthUser {
	username?: string
	phone?: string
	fullname?: string
}

export interface IUserUpdateData {
	user: string
	name: string
	phone: string
}

export interface IUserUpdate {
	fullname: string
	phone: string
}
