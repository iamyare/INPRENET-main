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
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #fff;
                    border: 1px solid #ddd;
                    padding: 20px;
                }
                .email-header img {
                    max-width: 100%;
                    height: auto;
                }
                .email-content h2 {
                    color: #333;
                }
                .email-content p {
                    font-size: 16px;
                }
                .email-button {
                    display: inline-block;
                    padding: 10px 20px;
                    margin-top: 20px;
                    background-color: #007bff;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .email-footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 12px;
                    color: #999;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <img src="https://cdn.pixabay.com/photo/2023/12/09/19/36/present-8440034_1280.jpg" alt="SYSJUB">
                </div>
                <div class="email-content">
                    <h2>Hola ${name}</h2>
                    <p>Haz clic en el siguiente enlace para actualizar tus datos:</p>
                    <a href="${enlace}" class="email-button">Actualizar Datos</a>
                </div>
                <div class="email-footer">
                    <p>Este es un mensaje automático, por favor no responder.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}


module.exports = {
    sendEmail,
    getTemplate
}
