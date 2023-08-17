const express = require('express');
const app = express();
const rateLimiter = require('./rateLimiterMiddleware'); 

const port = process.env.PORT || 8000;

app.use(express.json());

app.get('/ping', rateLimiter, (req, res) => {
    res.status(200).json({
        success: true,
        message: "pong"
    })
})

app.listen(port, () => {
    console.log("Server running at port ", port);
})