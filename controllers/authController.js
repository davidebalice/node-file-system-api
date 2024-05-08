const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const catchAsync = require("../middlewares/catchAsync");
const AppError = require("../middlewares/error");
const User = require("../models/userModel");

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  global.token = token;

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = false;

  res.cookie("jwt", token, cookieOptions);

  async function updateToken(id, token) {
    try {
      const user = await User.findByIdAndUpdate(id, { token }).exec();
    } catch (error) {
      console.error("Errore during save token", error);
    }
  }

  user.password = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  user.passwordChangedAt = undefined;

  updateToken(user._id, token);

  res.locals.user = user;

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

const errorLogin = (res) =>
  res.status(404).json({
    status: "error",
    message: "Incorrect username and password",
  });

async function getTokenDb(userId) {
  try {
    const user = await User.findById(userId).select("+token");
    if (user) {
      return user.token;
    } else {
      console.log("Error token");
    }
  } catch (error) {
    console.log("Error token");
  }
}



exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    errorLogin(res);
  }
  
  const user = await User.findOne({ email: email }).select("+password");

  if (!user) {
    errorLogin(res);
  }

  const correct = await user.correctPassword(password, user.password);

  if (!correct) {
    errorLogin(res);
  }
  await createSendToken(user, 200, req, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.clearCookie("jwt");
  res.clearCookie("token");
  res.status(200).json({
    status: "success",
    messag: "successfully logout",
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    if (global.token) {
      token = global.token;
    } else {
      if (req.cookies.jwt) {
        token = req.cookies.jwt;
      }
    }
  }

  if (!token || token === undefined) {
    res.status(400).json({
      status: "error",
      messag: "error login",
    });
  }
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("The token area expired, please login.", 401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError("Yot are changed password, please log in", 401));
    }

    req.user = currentUser;
    res.locals.user = currentUser;
    res.locals.token = token;
    next();
  } catch (err) {
    console.log("err");
    console.error(err);
    res.status(400).json({
      status: "error",
      messag: "error login",
    });
    return next(new AppError("Incorrect email or password", 401));
  }
});

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };


exports.getUserByToken = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt || res.locals.token) {
    try {
      let token = "";
      if (req.cookies.jwt) {
        token = req.cookies.jwt;
      } else {
        token = res.locals.token;
      }

      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      const user = await User.findById(decoded.id).select(
        "-passwordChangedAt -passwordResetExpires -createdAt -passwordResetToken -passwordConfirm"
      );

      if (!user) {
        res.status(400).json({
          status: "error",
          message: "error",
        });
      }

      if (user.changedPasswordAfter(decoded.iat)) {
        res.status(400).json({
          status: "error",
          message: "error",
        });
      }

      res.status(200).json({
        user,
        demo: process.env.DEMO_MODE,
      });
    } catch (err) {
      res.status(400).json({
        status: "error",
        message: "error:" + err,
      });
    }
  }
  next();
});
