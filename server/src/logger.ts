const winston = require('winston');

// LOG LEVEL BEST PRACTICES
//     error: 0     logged in production
//     warn: 1,     logged in production
//     info: 2,     logged in production
//     http: 3,     NO USE CASE
//     verbose: 4,  logged in dev
//     debug: 5,    logged when run spcifically in debug mode TODO take log level as command line argunment
//     silly: 6     NO USE CASE
//   }

const options = {
    errorFile: {
        level: 'error',
        filename: 'error.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    consoleDebug: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.align(),
            winston.format.simple(),
            winston.format.printf((info: any) => {
                const { timestamp, level, message, ...args } = info;
                const ts = timestamp.slice(0, 19).replace('T', ' ');
                return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args) : ''}`;
            }),
        ),
    },
};
// new winston.transports.File({ filename: 'error.log', level: 'error' }),
// new winston.transports.File({ filename: 'combined.log' }),
// new winston.transports.Console({ format: winston.format.simple() }),

export const logger = winston.createLogger({
    transports: [new winston.transports.File(options.errorFile), new winston.transports.Console(options.consoleDebug)],
    exitOnError: false, // do not exit on handled exceptions
});

export function debugFunc(target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    if (typeof original === 'function') {
        descriptor.value = function (...args: any[]) {
            logger.debug(`CALL ${String(key)} \t WITH: ${JSON.stringify(args)}`);
            try {
                const result = original.apply(this, args);
                logger.debug(`RTRN: ${String(key)} \t RSLT: ${JSON.stringify(result)}`);
                return result;
            } catch (e) {
                logger.debug(`RTRN: ${String(key)} \t ERRR: ${e}`);
                throw e;
            }
        };
    }
    return descriptor;
}

export default logger;
