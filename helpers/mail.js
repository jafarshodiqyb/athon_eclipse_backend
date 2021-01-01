const nodemailer = require('nodemailer');

let transport = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: 'deb12e3077f111',
    pass: '7e60a9d3e355f6',
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

exports.sendEmail = async (user, host) => {
  try {
    const { username, verifyToken } = user;
    await transport.sendMail({
      from: 'levi-4e1284@inbox.mailtrap.io', // sender address
      to: username, // list of receivers
      subject: 'Hello ✔', // Subject line
      text: `
      Hello,
      thanks for registerin on our site.
      Please click the link bellow to verify your account.
      http://${host}/api/auth/verify-email?token=${verifyToken}`, // plain text body
      html: `<h3>Hello,</h3><p>Thanks for registering on our site</p><p>Please click the link bellow to verify your account.</p><a href='http://${host}/api/auth/verify-email?token=${verifyToken}'>Verify your account. </a>`, // html body
    });
  } catch (err) {
    console.log(err);
  }
};
