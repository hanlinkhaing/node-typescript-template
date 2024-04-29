import CounterModel from '../models/counter-model'
import { ZERO } from '../utils/constants'
import { ICounter } from '../interfaces/counter-interfaces'
import { Logger } from '../services/logger'

const data: ICounter[] = [
	{
		entity: 'CustomerId',
		seq: ZERO
	}
]

export default async function () {
	try {
		for await (const d of data) {
			// @ts-ignore
			const result = await CounterModel.findOneOrCreate({ config: d.config }, d)
			Logger.info(`Seed ${result.entity}: ${result.seq}`)
		}
	} catch (err: any) {
		Logger.warn(`Error while Seed: ${err.message}`)
	}
}
