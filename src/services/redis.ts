import { promisify } from 'util'
import * as redis from 'redis'
import config from '../config/index'
import { Logger } from './logger'

const databaseNo = config.REDIS_DATABASE_NUMBER || '19'

// const url = `redis://${password ? `${username}:${password}@` : ''}${host}:${port}`;
const url = config.REDIS_URL
const client = redis.createClient({ url })

client.connect();

client.on('connect', () => {
	client.select(parseInt(databaseNo, 10))
	Logger.info('Connected to Redis')
})

client.on('error', (err: Error) => {
	Logger.error(err)
})

client.on('ready', () => {
	Logger.info('Redis connection esablished')
})

const redisClient = {
	SADD: promisify(client.SADD).bind(client),
	SIMEMBER: promisify(client.SISMEMBER).bind(client),
	SREM: promisify(client.SREM).bind(client),
	SET: promisify(client.SET).bind(client),
	GET: promisify(client.get).bind(client),
	HSET: promisify(client.HSET).bind(client),
	HGET: promisify(client.HGET).bind(client),
	DEL: promisify(client.DEL).bind(client),
	EXISTS: promisify(client.EXISTS).bind(client)
}

export default redisClient
