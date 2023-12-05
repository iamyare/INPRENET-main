const nodemailer = require('nodemailer');

const mail = {
    user: 'ematronix77@gmail.com',
    pass: 'oixl yqpv lckq qhdf'
}

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
        user: mail.user,
        pass: mail.pass,
    },
});

const sendEmail = async (email, subject, html) => {
    try {
        await transporter.sendMail({
            from: `SYSJUB`,
            to: email,
            subject,
            text: "",
            html,
        });
    } catch (error) {
        console.log('Algo no va bien con el email', error);
    }
}

const getTemplate = (name, token) => {
    const enlace = `http://localhost:4200/#/register/${token}`;
    return `
        <head>
            <link rel="stylesheet" href="./style.css">
        </head>
        
        <div id="email___content">
            <img src="https://i.imgur.com/eboNR82.png" alt="">
            <h2>Hola ${ name }</h2>
            <p>Haz clic en el siguiente enlace para actualizar tus datos:</p><a href="${enlace}">${enlace}</a>
        </div>
    `;
}

module.exports = {
    sendEmail,
    getTemplate
}
