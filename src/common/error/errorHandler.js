const logger = require('../logger/logger');

module.exports = (err, req, res, next) => {
    console.log('Error handler called');
    const operational = err.isOperational;
    
    logger.error(err.message, req.correlationId, {
        statusCode: err.statusCode,
        stack: err.stack,
        operational,
        body: req.body,
    })
    if (operational){
        return res.status(err.statusCode).json({error: err.message});
    }
    return res.status(500).json({error: 'something went wrong'});

}