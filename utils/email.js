const nodemailer = require('nodemailer')

const sendEmail = async options => {
// 1) Create a transporter (what is this)
const transporter = nodemailer.createTransport({
    // YOU HAVE TO SIGN TO THE MAILTRAP
    service:'Gmail',
    auth: {
        user:process.env.EMAIL_USERNAME,
        pass:process.env.EMAIL_PASSWORD
    }
    // Activate in gmail "less secure app" option
})

// 2) Define the email options 

const mailOptions = {
    from:'Mehdi flani <hello@nigga.io>',
    to:options.email,
    subject: options.subject,
    text: options.message,
    //html:
}


// 3) Send the actual mail
await transporter.sendMial(mailOptions)

}

module.exports = sendEmail