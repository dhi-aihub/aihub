import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
    const authHeader = req.headers["Authorization"];
    if (!authHeader) {
        return res.status(401).json({ message: "Authentication failed" });
    }
  
    // request auth header: `Authorization: Token + <access_token>`
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Authentication failed" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.userId = user.id;
        next();
    });
}