const Redis = require('ioredis');
const moment = require('moment');
const redisClient = new Redis({url: "redis://localhost:6379"});

const RATE_LIMIT_DURATION_IN_SECONDS = 60;
const NUMBER_OF_REQUESTS_ALLOWED = 5;

const rateLimiter = async (req, res, next) => {
    const userId = req.header('user_id');
    const currentTime = moment().unix();

    const result = await redisClient.hgetall(userId);
    console.log(result)
    if(Object.keys(result).length === 0) {
        await redisClient.hset(userId, "createdAt", currentTime, "count", 1)
        return next();
    }
    if(result) {
        let diff = (currentTime - result["createdAt"])

        if(diff > RATE_LIMIT_DURATION_IN_SECONDS) {
            await redisClient.hset(userId, "createdAt", currentTime, "count", 1)
            return next();
        }
    }
    if(result["count"] >= NUMBER_OF_REQUESTS_ALLOWED){
        return res.status(429).json({
            success: false,
            message: "user-ratelimited"
        })
    }
    else {
        await redisClient.hincrby(userId, "count", 1);
        return next();
    }
}   

module.exports = rateLimiter;