const User = require("../models/user");
const Blog = require("../models/blog");
const shortId = require("shortid");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandle");
const nodeMailer = require("nodemailer");
const { sendEmailWithNodemailer } = require("../helpers/email");

exports.signup = (req, res) => {
  // ! Buat Testing doang cuy
  // const { name, email, password } = req.body;
  // res.json({
  //   user: { name, email, password },
  // });
  User.findOne({ email: req.body.email }).exec((err, user) => {
    // * cek jika email sudah ada
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    }

    // * Jika email belum ada
    const { name, email, password } = req.body;
    let username = shortId.generate();
    let profile = `${process.env.CLIENT_URL}/profile/${username}`; // ! untuk mengenerate nama profile sesuai url(SEO)

    let newUser = new User({ name, email, password, profile, username });
    newUser.save((err, success) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }
      // ! Untuk cek hasil data benar atau tidak
      // res.json({
      //   user: success,
      // });
      res.json({
        message: "Signup success! Please signin",
      });
    });
  });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  //* Cek user ada atau tidak
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with email is does not exist. Please Signup.",
      });
    }

    //* Autentikasi
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email or Password do not match.",
      });
    }

    //* Generate JWT and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, { expiresIn: "1d" });
    const { _id, username, name, email, role } = user;
    return res.json({
      token,
      user: { _id, username, name, email, role },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Signout Success",
  });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "user",
});

exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  //! 'user' di atas diambil dari properti userProperty
  User.findById({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    req.profile = user;
    next();
  });
};

exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user._id;
  User.findById({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== 1) {
      return res.status(400).json({
        error: "Admin resource. Access denied",
      });
    }

    req.profile = user;
    next();
  });
};

exports.canUpdateDeleteBlog = (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  Blog.findOne({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    let authorizedUser =
      data.postedBy._id.toString() === req.profile._id.toString();
    if (!authorizedUser) {
      return res.status(400).json({
        error: "You are not Authorized",
      });
    }
    next();
  });
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        error: "User with that email does not exist",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: "10m",
    });

    // email
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Password reset link`,
      html: `
          <p>Please use the following link to reset your password:</p>
          <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
          <hr />
          <p>This email may contain sensetive information</p>
          <p>TechnoLy</p>
      `,
    };
    // populating the db > user > resetPasswordLink
    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      console.log(`data : ${user}`);
      if (err) {
        return res.json({ error: errorHandler(err) });
      } else {
        sendEmailWithNodemailer(req, res, emailData);
      }
    });
  });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          return res.status(401).json({
            error: "Expired link. Try again",
          });
        }
        User.findOne({ resetPasswordLink }).exec((err, user) => {
          console.log(user);
          if (err || !user) {
            return res.status(401).json({
              error: "Something went wrong. Try later",
            });
          }

          const updatedFields = {
            password: newPassword,
            resetPasswordLink: "",
          };

          user = _.extend(user, updatedFields);

          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: errorHandler(err),
              });
            }
            res.json({
              message: `Great! Now you can login with your new password`,
            });
          });
        });
      }
    );
  }
};
