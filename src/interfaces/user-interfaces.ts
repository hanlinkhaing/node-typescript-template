export interface IUser {
	username: string
	password: string
	str: string
	fullname?: string
	phone: string
	email?: string
}

export interface IUserRegiser {
	txtuser: string
	txtpass: string
	txtpass_repeat: string
	txtname: string
	txtphone: string
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
	txtuser: string
	txtname: string
	txtphone: string
}

export interface IUserUpdate {
	fullname: string
	phone: string
}
