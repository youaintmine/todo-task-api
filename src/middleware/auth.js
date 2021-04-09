const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id:decoded._id, 'tokens.token' : token})

        if(!user) {
            throw new Error()
        }
        //Concatenating these two to the routing parameters
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please Authenticate.' })
    }

    // console.log('Auth Middleware')
    // next()
}

module.exports = auth