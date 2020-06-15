const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Userschema = mongoose.Schema( {
    name :{
        type: String,
        required: true,
        trim: true
    },
    email :{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if(!validator.isEmail(value)) {
                throw new error ({error : 'Invalid email...!'})
            }
        }
    },
    password : {
        type: String,
        required: true,
        minLength: 8
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

Userschema.pre('save',async function(next) {
    //Hash the password
    const user = this
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
} )

Userschema.methods.generateAuthToken = async function() {
    //generate auth token for user
    const user= this
    const token = jwt.sign({_id: user._id} , process.env.JWT_KEY)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

Userschema.statics.findByCredentials = async (email, password) => {
    //search user
    const user = await User.findOne({email})
    if(!user) {
        throw new Error({error: 'Invalid login credentials'})
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if(!isPasswordMatch) {
        throw new Error({error : 'invalid credentials....!'})
    }
    return user
}

const User= mongoose.model('User', Userschema)

module.exports  = User