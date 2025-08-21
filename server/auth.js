const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error("❌ JWT_SECRET is not defined");
}


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification failed:", err.message);
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user; 
    next();
  });
};

module.exports = authenticateToken;