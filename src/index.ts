import http from 'http'
import app from './app'
import { DEFAULT_PORT, ONE, TEN, ZERO } from './utils/constants'
import { SERVER_LISTENING_ERROR } from './utils/enums'
import type { HttpError } from 'http-errors'
import { Logger } from './services/logger'
import './services/cache'
import './mongoose'

function normalizePort(val: string): number {
	const port = parseInt(val, TEN)

	if (Number.isNaN(port)) return NaN

	if (port >= ZERO) return port

	return NaN
}

const port = normalizePort(process.env.PORT || DEFAULT_PORT)

const server = http.createServer(app)

server.listen(port)

server.on('error', function (error: HttpError) {
	const { syscall, code } = error
	Logger.error(error)
	if (syscall !== 'listen') {
		throw error
	}

	const bind: string = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`

	switch (code) {
		case SERVER_LISTENING_ERROR.EACCES:
			Logger.warn(`${bind} requires elevated privileges`)
			process.exit(ONE)
			break
		case SERVER_LISTENING_ERROR.EADDRINUSE:
			Logger.warn(`${bind} is already in use`)
			process.exit(ONE)
			break
		default:
			throw error
	}
})

server.on('listening', function () {
	const addr:
		| {
				address: string
				family: string
				port: number
		  }
		| string
		| null = server.address()
	const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`
	Logger.info(`Listening on ${bind}`)
})
