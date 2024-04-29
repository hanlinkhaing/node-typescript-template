import mongoose from 'mongoose'
import redisClient from './redis'
import { TWO_DAY_IN_SECOND } from '../utils/constants'

const { exec } = mongoose.Query.prototype

// @ts-ignore
mongoose.Query.prototype.cache = function (time: number = TWO_DAY_IN_SECOND) {
	// @ts-ignore
	this.useCache = true
	// @ts-ignore
	this.cacheTime = time
	return this
}

async function clearCachedData(collectionName: string, op: any) {
	const allowedCacheOps = ['find', 'findById', 'findOne']
	// if operation is insert or delete or update for any collection that exists and has cached values
	// delete its childern
	if (!allowedCacheOps.includes(op) && (await redisClient.EXISTS(collectionName))) {
		redisClient.DEL(collectionName)
	}
}

mongoose.Query.prototype.exec = async function (...args: any) {
	// @ts-ignore
	const collectionName: string = this.mongooseCollection.name

	// @ts-ignore
	if (this.useCache) {
		const key: string = JSON.stringify({
			...this.getOptions(),
			collectionName,
			// @ts-ignore
			op: this.op
		})
		const cachedResults = await redisClient.HGET(collectionName, key)

		if (cachedResults) {
			const result = JSON.parse(cachedResults)
			return Array.isArray(result) ? result.map(res => new this.model(res)) : new this.model(result)
		}
		const result = await exec.apply(this, args)

		// @ts-ignore
		redisClient.HSET(collectionName, key, JSON.stringify(result), 'EX', this.cacheTime)
		return result
	}

	// @ts-ignore
	clearCachedData(collectionName, this.op)
	return exec.apply(this, args)
}
