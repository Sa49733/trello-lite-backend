const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

    // Remove "Bearer " from the header
    const token = authHeader.split(" ")[1];

    console.log("TOKEN =", token);
    console.log("SECRET =", process.env.JWT_SECRET);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED =", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    console.log("JWT ERROR =", error.message);

    return res.status(401).json({
      message: "Invalid Token",
    });
  }
};

module.exports = protect;