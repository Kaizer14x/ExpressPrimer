const { promisify } = require('util')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appErrors')
const sendEmail = require('../utils/email')


const signToken = id => {
    return jwt.sign({ id} , process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    } )
}

//IDK WIN DNRIHA
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }
}

exports.signup = catchAsync(async (req , res , next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data : {
            user: newUser
        }
    })
})


exports.login = catchAsync(async (req,res,next) => {
    const {email,password} = req.body
    // 1) Check if email and password exsists
        if (!email || !password) {
            next(new AppError('Please Provide a valid email or password' ,400))
        }
    // 2) check if the user exsists and password is correct
        const user = await User.findOne({email}).select('+password')
        console.log(user)
      
        //if there is no user we will be in the error, and if the user exists 
        // but an information is incorrect, we also throw an error
        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError('Incorrect email or password' , 401))
        }

    // 3) if the everything is okey, return the things 
        const token = signToken(user._id)
        res.status(200).json({
            status: 'success',
            token})
})


exports.protect = catchAsync( async (req,res,next)=> {
    // 1) Getting token and check if its there
    let token
    if (req.headers.authotization && req.headers.authotization.startsWith('Bearer')) {
        token = req.headers.authotization.split('')[1];
    }


    if(!token) {
        return next(new AppError('You are not logged in ! ' , 401))
    }



    // 2) Verfication of the token

    //What is this pormisify ?
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET )


    // 3) check if user still exsits
    const freshUser = await User.findById(decoded.id)
    if(!freshUser) {
        return next(new AppError('The user bleonging to the token no longer exists' , 401))
    }


    // 4) Check if user changed password after the token was issued
    if (freshUser.changePasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again' , 401))
    }


    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    next()
})

//Why are we doing this ?
exports.restrictTo = (...roles) => {
    return (req,res,next) => {
        // roles ['admin','roles']
        if(!roles.includes(req.user.roles)){
            return next(new AppError('You do not have permission to perform this action', 401))
        }
    }
}

exports.forgotPassword = catchAsync(async (req,res,next) => {
    // 1) Get user based on POSTed email 
    const user = await User.findOne({email: req.body.email})
    if (!user) {
        return next(new AppError('There is no User with this mail' , 404))
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave : false})



    // 3) Send it to users email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a request with your new passowrd and passwordConfrim to : ${resetURL}`
    
    try {
    await sendEmail({
        email:user.email,
        subject:'Your passwrod reset token is only alid for 10 minutes'
    })

    res.status(200).json({
        status: 'success',
        message:'Token sent to email'
    })
}
catch(err){
    user.passwordResetToken = undefined
    user.passwrodResetExpires = undefined
    await user.save({ validateBeforeSave : false})
    returnnext(new AppError('There was an error sending the email, Try again later!', 500))
}
})  

exports.resetPassword = catchAsync(async(req,res,next) => {

    // 1) Get user based on the token 
        const hasehdToken = crypto.createHash('sha256').update(req.params.token).digest('hex')


        const user = await User.findOne({passwordResetToken:hasehdToken, passwordResetToken: {$gt: Date.now()}})
    // 2) IF token has not been expired, and there is user,set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired' , 400))
    }

    user.password =req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // 3) Update changedPasswordAt property for the user 
    


    // 4) Log the user in , send JWT
    const token = signToken(user._id)

    res.status(200).json({
        status:'success',
        token
    })
})
