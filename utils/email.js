const nodemailer = require('nodemailer');

const sendEmail =  async (to, subject, htmlContent) => {
    let transporter;
      if (process.env.NODE_ENV === 'production') {
        // production service
        transporter = nodemailer.createTransport({
          service: 'AnotherService',
          auth: {
            user: process.env.ANOTHER_SERVICE_USERNAME,
            pass: process.env.ANOTHER_SERVICE_PASSWORD
          }
        });
      }
      else {
        // development service
        transporter = nodemailer.createTransport({
            host:'smtp.ethereal.email',// process.env.EMAIL_HOST,
            port: 465,// process.env.EMAIL_PORT,
            secure: true,
            auth: {
              user: 'jocelyn.sipes@ethereal.email', // process.env.EMAIL_USERNAME,
              pass: 'CuNHdeJswyngR1XNWz' // process.env.EMAIL_PASSWORD
            }
          });
        }
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent,
        };
        await transporter.sendMail(mailOptions);        
}

// exports.sendWelcome = async () => {
//       await sendMail('welcome', 'Your account has been successfully verified! you can login now to your account.');
//     }
module.exports = sendEmail