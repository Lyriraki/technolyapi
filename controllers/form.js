const { sendEmailWithNodemailer } = require("../helpers/email");

exports.contactForm = (req, res) => {
  const { name, email, message } = req.body;

  const emailData = {
    from: email, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
    to: process.env.EMAIL_ACCOUNT, // WHO SHOULD BE RECEIVING THIS EMAIL? IT SHOULD BE YOUR GMAIL
    subject: `Website Contact Form - ${process.env.APP_NAME}`,
    text: `Email received from contact from Sender name: ${name} Sender email: ${email} Sender message: ${message}`,
    html: `
    <h4>Message received form:</h4>
    <p>name: ${name}</p>
    <p>email: ${email}</p>
    <p>message: ${message}</p>
        <hr />
        <p>This email may contain sensitive information</p>
        <p>${process.env.APP_NAME}</p>
    `,
  };

  sendEmailWithNodemailer(req, res, emailData);
};

exports.contactBlogAuthorForm = (req, res) => {
  const { authorEmail, name, email, message } = req.body;

  let mailList = [authorEmail, process.env.EMAIL_ACCOUNT];

  const emailData = {
    to: mailList,
    from: email,
    subject: `Someone messaged you from - ${process.env.APP_NAME}`,
    text: `Email received from contact from Sender name: ${name} Sender email: ${email} Sender message: ${message}`,
    html: `
        <h4>Message received form:</h4>
        <p>name: ${name}</p>
        <p>email: ${email}</p>
        <p>message: ${message}</p>
        <hr />
        <p>This email may contain sensitive information</p>
        <p>${process.env.APP_NAME}</p>
    `,
  };

  sendEmailWithNodemailer(req, res, emailData);
};
