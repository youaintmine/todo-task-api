const express = require('express')
const multer = require('multer')
const auth = require('../middleware/auth')
const User = require('../models/user')
const sharp = require('sharp')
const { sendWelcomeEmail, cancelEmail } = require('../emails/account')
const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    
        try{
            await user.save()
            sendWelcomeEmail(user.email, user.name)
            const token = await user.generateAuthToken()
            res.status(201).send({user, token})
        } catch (e) {
            console.log(e)
            res.status(400).send(e)
        }
        
    
        // user.save().then(()=>{
        //     res.status(201).send(user)
        // }).catch((e)=>{
        //     res.status(400).send(e)
        // })
        
    })


router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})   // : user.getPublicProfile()
        // console.log(user)
        // res.status(200).send(user)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})
    

router.get('/users/me', auth ,async (req, res) => {

    //This already is authenticated and hence will always contain one's own profile
    //Note that in the authenticate we've used user to save it to req.user
    //Hnece its accessible here
    res.send(req.user)

    //This will leave exposed data hence
    // try{
    //     const users = await User.find({})
    //     res.send(users)
    // } catch (e) {
    //     res.status(500).send()
    // }

    //Above code but using promises async await
    // .then((users) => {
    //     res.status(200).send(users)
    // }).catch((e) =>{
    //     res.status(400).send(e)
    // })
})
    
// 

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me',auth ,async (req, res) =>{
    // const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password','age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid Updates!'})
    }
    try {
        // const user = await User.findByIdAndUpdate(req.params.id)

        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        
        //This portion is not needed as we are authenticated

        // if(!user) {
        //     return res.status(404).send("Can't find user by ID")
        // }
    
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me',auth ,async (req, res)=>{
    try {

        
        //There's literally no need to check if the user exists since we just checked it out
        // const user = await User.findByIdAndDelete(req.user._id)
    
        // if(!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove()
        cancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})


const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please provide a valid image file'))
        }
        cb(undefined, true)
    }
})


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    // req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error : error.message})
})

router.delete('/users/me/avatar', auth, async(req, res) =>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) =>{
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router
