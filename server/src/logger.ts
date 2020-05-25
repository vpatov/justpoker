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

export const logger = winston.createLogger({
    transports: [new winston.transports.File(options.errorFile), new winston.transports.Console(options.consoleDebug)],
    exitOnError: false, // do not exit on handled exceptions
});

export interface DebugFuncParams {
    noCall?: boolean; // supress logging of function call
    noRtrn?: boolean; // supress logging of function return
    noArgs?: boolean; // supress logging of function argunments
    noRslt?: boolean; // supress logging of function result
}

export function debugFunc(params?: DebugFuncParams) {
    return function decorator(target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            descriptor.value = function (...args: any[]) {
                let startMessage = `CALL: ${String(key)}`;
                if (!params.noArgs) startMessage += `\t ARGS: ${JSON.stringify(args)}`;
                logger.debug(startMessage);
                try {
                    const result = original.apply(this, args);
                    let finishMessage = `RTRN ${String(key)}`;
                    if (!params.noRslt) finishMessage += `\t RSLT: ${JSON.stringify(result)}`;
                    logger.debug(finishMessage);
                    return result;
                } catch (e) {
                    logger.debug(`RTRN: ${String(key)} \t ERRR: ${e}`);
                    throw e;
                }
            };
        }
        return descriptor;
    };
}

export default logger;
