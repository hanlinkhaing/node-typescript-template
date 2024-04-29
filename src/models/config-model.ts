import mongoose from 'mongoose'
import { BaseSchema } from './base-schema'
import { findOneOrCreate as _findOneOrCreate } from '../utils/methods'
import { IConfig } from '../interfaces/config-interfaces'

const ConfigSchema = new BaseSchema<IConfig>(
	{
		config: { type: String },
		description_VI: String,
		description_EN: { type: String, require: true, default: '' },
		imgURL: String,
		status: { type: Boolean, default: false },
		align: String,
		width: String,
		height: String
	},
	{
		statics: {
			async findOneOrCreate(condition: any, data: any) {
				const result = _findOneOrCreate.call(this, condition, data)
				return result
			}
		}
	}
)

const ConfigModel = mongoose.model<IConfig>('Config', ConfigSchema)

export default ConfigModel