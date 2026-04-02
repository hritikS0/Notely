import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const protect = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  if (!process.env.JWT_SECRET) {
    return res
      .status(500)
      .json({ message: "Server JWT secret is not configured" });
  }

  try {
    const { id, ...user } = jwt.verify(token, process.env.JWT_SECRET);
    if (!id) {
      return res
        .status(401)
        .json({ message: "Not authorized, token payload invalid" });
    }

    req.userId = id;
    req.user = { id, ...user };
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
