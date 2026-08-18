class Logger {
  constructor() {
    if (!Logger.instance) {
        Logger.instance = this;
    }
    return Logger.instance;
  }

    log(level, message, correlationId, metadata = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            correlationId,
            ...metadata
        };

        // this could call datadog or any other logging service, but for now we will just log to the console
        console.log(JSON.stringify(logEntry));
    }

    info(message, correlationId, metadata = {}) {
        this.log('INFO', message, correlationId, metadata);
    }

    warn(message, correlationId, metadata = {}) {
        this.log('WARN', message, correlationId, metadata);
    }

    error(message, correlationId, metadata = {}) {
        this.log('ERROR', message, correlationId, metadata);
    }

    debug(message, correlationId, metadata = {}) {
        this.log('DEBUG', message, correlationId, metadata);
    }
    

}

const logger = new Logger();
module.exports = logger;