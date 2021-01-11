const nodemailer = require('nodemailer');

let transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "dfaad3176cddf1",
    pass: "68834af23dbbe4"
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

exports.sendEmail = async (user, host) => {
  try {
    const { email, verifyToken } = user;
    await transport.sendMail({
      from: '4b9f2ffd6e-df5375@inbox.mailtrap.io', // sender address
      to: email, // list of receivers
      subject: 'Hello ✔', // Subject line
      text: `
      Hello,
      thanks for registerin on our site.
      Please click the link bellow to verify your account.
      ${host}/users/auth/verify-email?token=${verifyToken}`, // plain text body
      html: `<h3>Hello,</h3><p>Thanks for registering on our site</p><p>Please click the link bellow to verify your account.</p><a href='${host}/users/auth/verify-email?token=${verifyToken}'>Verify your account. </a>`, // html body
    });
  } catch (err) {
    console.log(err);
  }
};