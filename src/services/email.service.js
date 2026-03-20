require('dotenv').config();
const nodemailer = require('nodemailer');

// Transporters responsibility: Jo google ka server hoga (jo email send krta hai) google ke smtp server ke sath interact krne ke liye we created this transporter
// Transporter is responsible for sending emails by connecting to Gmail's SMTP service
// using OAuth2 authentication. It acts as the email delivery mechanism.

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration, verifying the credentials we have put in
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Banking-ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name){
  const subject = "Welcome to Banking Ledger!";

  const text = `Hi ${name},\n\nThank you for registering with Banking Ledger. We're excited to have you on board!\n\nBest regards,\nThe Banking Ledger Team`;

  const html = `<p>Hi ${name},</p> <p>Thank you for registering with Banking Ledger. We're excited to have you on board!<p> <p>Best regards,<br>The Banking Ledger Team</p>`;
  
  await sendEmail(userEmail, subject, text, html);

}

module.exports = {
  sendRegistrationEmail,
};