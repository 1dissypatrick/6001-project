const authenticateUser = (req, res, next) => {
    const username = req.headers.username; // Expect the username from headers

    console.log('Received username in headers:', username); // Debug log

    if (!username) {
        return res.status(401).send('Access denied. Username not provided.');
    }

    req.username = username; // Attach username to the request object
    next();
};

module.exports = authenticateUser;
