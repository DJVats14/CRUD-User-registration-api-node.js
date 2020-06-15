const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/users', async (req, res)=> {
    //create new user
    try{
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async(req, res)=> {
    //login a registered user
    try{
        const {email, password} = req.body
        const user = await User.findByCredentials(email, password)
        if(!user) {
            return res.status(401).send({error: 'login failed!..check credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch(error) {
        res.status(400).send(error)
    }
})

router.get('/users/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/users/me/logout', auth, async (req, res) => {
    //log out
    try{
        req.users.token = req.user.tokens.filter((token) => {
            return token.token !=req.token
        })
        await req.user.save()
        res.send()
    }catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/logoutall', auth, async(req, res)=> {
    //log out of all devices
    try{
        req.users.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch(error) {
        res.status(500).send(error)
    }
})

module.exports = router

/*req.on('error', function(err) {
    if (err.code === "ECONNRESET") {
        console.log("Timeout occurs");
        return;
    }
    //handle normal errors
});*/