module.exports = (...roles) => {
  return (req, res, next) => {
    const userRole = req.currentUser?.role;

    if (roles.includes(userRole)) {
      return next(new Error("Unauthorized role", 401));
    }
    next();
  };
};
