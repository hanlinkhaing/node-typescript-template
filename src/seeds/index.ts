import counter from './counter-seed'
import config from './config-seed'
;(async () => {
	await counter()
	await config()
})()
