//IN THIS FILE, we will have everything that is related to the server
// In the other side, what is related to express, is in the app.js

const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const app = require('./app');
//her, instead of putting the password directly in the placeholder in the .env
//you can replace it using the .replace('<PASSWORD> with the password form the env)
const MongoDB = process.env.DATABASE
const mongoose = require('mongoose')


//Options to add to deal with the duplicates
mongoose.connect(MongoDB)
    .then(() => {
    console.log('DB Connection Successeful')
})



const server = app.listen(process.env.PORT , () => {
    console.log(`App running on port ${process.env.PORT}`)
})



//This is to handle a global error
process.on('unhandledRejection', err => {
    console.log(err.name , err.message)
    console.log('UNHANDLED REJECTION : Shutting Down...')
    server.close(() => {process.exit(1)})
    
})

