import mongoose, { Document } from 'mongoose'
import { BaseSchema } from './base-schema'
import { IUser } from '../interfaces/user-interfaces'

const UserSchema = new BaseSchema<IUser>(
	{
		username: { type: String, index: { unique: true }, dropDups: true },
		password: { type: String, required: true },
		str: { type: String, required: true },
		fullname: String,
		phone: { type: String, index: true },
		email: String
	},
	{
		toJSON: {
			transform(doc: Document, ret: Record<string, any>) {
				ret.id = ret._id
				delete ret._id
				delete ret.password
				delete ret.str
				delete ret.__v
			}
		}
	}
)

const UserModel = mongoose.model<IUser>('User', UserSchema)

export default UserModel
