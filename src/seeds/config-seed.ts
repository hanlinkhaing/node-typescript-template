import ConfigModel from '../models/config-model'
import { PRICE_CREDIT } from '../utils/constants'
import { IConfig } from '../interfaces/config-interfaces'
import { Logger } from '../services/logger'

const data: IConfig[] = [
	{
		config: PRICE_CREDIT,
		description_VI: '100',
		description_EN: '50',
		imgURL: '',
		status: false,
		align: '',
		width: '',
		height: ''
	}
]

export default async function () {
	try {
		for await (const d of data) {
			// @ts-ignore
			const result = await ConfigModel.findOneOrCreate({ config: d.config }, d)
			Logger.info(`Seed ${result.config}: ${result.description_VI}`)
		}
	} catch (err: any) {
		Logger.warn(`Error while Seed: ${err.message}`)
	}
}
