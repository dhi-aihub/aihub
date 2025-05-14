import jwt from "jsonwebtoken";

export function verifyAccessToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ message: "Authentication failed" });
    }
  
    // request auth header: `authorization: Token + <access_token>`
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Authentication failed" });
    }

    jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = {
            id: user.user_id,
            isAdmin: user.is_staff,
        }
        next();
    });
}

export function verifyIsAdmin(req, res, next) {
    if (req.user.isAdmin) {
        next();
    } else {
        return res.status(403).json({ message: "Not authorized to access this resource" });
    }
}