const AppError = require("../utils/appErrors")

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message , 400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)
    const message = `Duplicate field value: x. please use another value`
    return new AppError(message, 400)
}

const handleJWTError = err => new AppError('Invalid token, please log in again' , 401)

const handleJWTExpired = err => new AppError('Your Token has expired! Please log in again',401)


module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'
    let error = {...err}
    if (error === 'CastError') {
        error = handleCastErrorDB(error)
    }
    if (error.code === 11000) {
        error === handleDuplicateFieldsDB(error)
    }
    if (error === 'JsonWebTokenError') error = handleJWTError(error)
    if (error === 'TokenExpiredError') error = handleJWTExpired(error)
    res.status(err.statusCode).json({
        status: error.status,
        message: error.message,
        err: error,
        stack:err.stack
    })
}