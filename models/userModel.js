const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide us your email'],
        unique:true, 
        lowercase: true,
        validate:[validator.isEmail , 'Please provide a valid mail']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user','guide','lead','admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    //the costume validator is the best to manage the password
    passwordConfirm: {
        type: String,
        required: [true, 'please confirm your password'],
        minlength: 8,
        validate:{
            //CRUCIAL DETAIL : this only works on CREATE and SAVE !! 
            validator: function(el) {
                return el == this.password
            },
            message : 'Passwords are not the same'
        }
    }, 
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires: Date
})



//Pre Hook for encryption
userSchema.pre('save' , async function(next) {
    //The functions only if the password is modified
    if (!this.isModified('password')) return next()

    this.password = await bcrypt.hash(this.password , 12)
    this.passwordConfirm = undefined //to not make it persistent in the database
    next()
})

//This is an instance method, which is a method that will
//be avaialbe in all the collections of a document
userSchema.methods.correctPassword = async function(candidatePassword , userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

}) 

userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 100 ,10)
        return JWTTimestamp < changedTimestamp;
        //console.log(this.passwordChangedAt, JWTTimestamp)
    }
    
    return false
}


userSchema.methods.createPasswordResetToken = function() {
    //it is a reset password and behave like a password
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwrodResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    this.passwrodResetExpires = Date.now() + 10 * 60 * 1000 //10 minutes
    return resetToken;
}

const User = mongoose.model('User', userSchema)

module.exports = User;