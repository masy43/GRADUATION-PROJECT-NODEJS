const httpStatusText = require("../utils/httpStatusText");

const globalErrorHandler = (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || httpStatusText.Error;

  if (process.env.NODE_ENV === "development") {
    errorsInDevelopment(err, res);
  } else {
    errorsInProduction(err, res);
  }
};

const formatErrorMessage = (message) => {
  return message
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
};

const errorsInDevelopment = (err, res) => {
  const formattedMessage = formatErrorMessage(err.message);
  res.status(err.statusCode).json({
    status: err.status,
    httpCode: err.statusCode,
    message: formattedMessage,
    data: null, 
    error: err,
    stack: err.stack,
  });
};

const errorsInProduction = (err, res) => {
  const formattedMessage = formatErrorMessage(err.message);
  res.status(err.statusCode).json({
    status: err.status,
    httpCode: err.statusCode,
    message: formattedMessage,
    data: null, 
  });
};

module.exports = globalErrorHandler;
