const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  signout,
  requireSignin,
  forgotPassword,
  resetPassword,
  preSignup,
  googleLogin,
} = require("../controllers/auth");

// Validator
const { runValidation } = require("../validators");
const {
  userSignupValidator,
  userSigninValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/auth");

router.post("/signup", signup);
router.post("/pre-signup", userSignupValidator, runValidation, preSignup);
router.post("/signin", userSigninValidator, runValidation, signin);
router.post("/google-login", googleLogin);

router.put(
  "/forgot-password",
  forgotPasswordValidator,
  runValidation,
  forgotPassword
);
router.put(
  "/reset-password",
  resetPasswordValidator,
  runValidation,
  resetPassword
);

router.get("/signout", signout);
router.get("/secret", requireSignin, (req, res) => {
  res.json({
    message: "You have access to secret page",
  });
});

module.exports = router;
