import mongoose from 'mongoose'
import config from '../config'
import { Logger } from '../services/logger'

mongoose.Promise = global.Promise
mongoose.connect(config.MONGO_URL || '')

mongoose.connection
	.once('open', () => {
		Logger.info('Connection has been made')
	})
	.on('error', (error: Error) => {
		Logger.error(error)
	})
	.on('disconnected', () => {
		Logger.warn('Connection disconnected')
	})

export default mongoose
