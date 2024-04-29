import winston, { format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import config from '../config'

export class Logger {
    private static logger: winston.Logger
    private constructor() {
        const transport: DailyRotateFile = new DailyRotateFile({
            filename: `template-%DATE%.log`,
            zippedArchive: true,
            maxSize: config.LOG_FILE_SIZE,
            dirname: config.LOG_DIR
        })

        Logger.logger = winston.createLogger({
            transports: [
                transport,
                new winston.transports.Console()
            ],
            format: format.combine(
                format.timestamp(),
                format.prettyPrint(),
                format.colorize(),
                format.errors({ stack: true })
            )
        })
    }

    public static info(msg: string) {
        if(!this.logger) new this
        this.logger.info(msg)
    }

    public static error(err: Error) {
        if(!this.logger) new this
        this.logger.error(`${err.name}: ${err.message} \n${err.stack}`);
    }

    public static warn(msg: string) {
        if(!this.logger) new this
        this.logger.warn(msg)
    }
}
