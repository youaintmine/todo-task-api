
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRIP_API_KEY)


const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ahmbarishsaikia103@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let us know about the user experience of the app`,
        // html: ``
    })
}

const cancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'ahmbarishsaikia103@gmail.com',
        subject: 'Thanks for staying with us. We will miss you!',
        text: `${name}, please let us know about the user experience of the app and why you are leaving this app.So there might be improvements`
    })
}

module.exports = {
    sendWelcomeEmail,
    cancelEmail
}