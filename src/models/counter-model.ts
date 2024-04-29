import mongoose from 'mongoose'
import { BaseSchema } from './base-schema'
import { findOneOrCreate as _findOneOrCreate } from '../utils/methods'
import { ICounter } from '../interfaces/counter-interfaces'

const CounterSchema = new BaseSchema<ICounter>(
	{
		entity: { type: String, required: true },
		seq: { type: Number, default: 0 }
	},
	{
		statics: {
			async findOneOrCreate(condition: any, data: any) {
				const result = await _findOneOrCreate.call(this, condition, data)
				return result
			}
		}
	}
)

const CounterModel = mongoose.model<ICounter>('Counter', CounterSchema)

export default CounterModel
