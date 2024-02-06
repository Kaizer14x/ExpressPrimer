
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')



const AppError = require('./utils/appErrors')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/toursRoutes')
const userRouter = require('./routes/userRoutes')


const app = express()


//GLOBAL MIDDLEWARE :

app.use(helmet())


app.use(morgan('dev'))

const limiter = rateLimit({
    max:100,
    //What is this ?
    windowMs: 60 * 60 * 1000, 
    message: 'toomany requirest for the same IP adress at the same time'
})

app.use('/api' , limiter)


//Body Parser, readeing data from the bdoy into req.body

app.use(express.json({ limit: '10kb'}));

// Data sanitization agains t NoSQL query injectoin 
app.use(mongoSanitize())

// Data saniziation againist XSS
app.use(xss())

app.use('/api/v1/tours' , tourRouter)
app.use('/api/v1/users' , userRouter)

//handler for all the routes
app.all('*' , (req,res,next) =>{
    next(new AppError(`Can't find ${req.originalUrl} on this server` , 404))
}) 

 
app.use(globalErrorHandler) 



module.exports = app;