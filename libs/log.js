import winston from 'winston';

function getLogger() {
    // Path label removed for ES6 compatibility
    return winston.createLogger({
        transports : [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                ),
                level: 'debug',
            })
        ]
    });
}

export default getLogger();
