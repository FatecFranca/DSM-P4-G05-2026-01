
const authenticateIot = (req, res, next) => {
    const apiKey = req.header("X-API-Key");
    const expected = process.env.IOT_API_KEY;

    if (!expected) {
        return res.status(500).json({ message: "IOT_API_KEY not configured on server" });
    }

    if (!apiKey || apiKey !== expected) {
        return res.status(401).json({ message: "Unauthorized (invalid X-API-Key)" });
    }

    return next();
}

export default authenticateIot;