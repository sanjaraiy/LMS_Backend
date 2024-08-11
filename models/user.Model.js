const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
   fullName: {
     type: String,
     required: [true, 'Name is required'],
     minLength: [5, 'Name must be at least 5 characters'],
     maxLength: [50, 'Name should be less than 50 characters'],
     lowercase: true,
     trim: true,
   },
   email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please fill in a valid email address']
   },
   password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [8, 'Password must be at least 8 characters'],
    select: false,
   },
   avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      }
   },
   role: {
    type: String,
    enum: ['USER','ADMIN'],
    default: 'USER'
   },
   forgetPasswordToken: String,
   forgetPasswordExpiry: Date,

},{timestamps: true});

userSchema.pre('save',  async function(next){
  if(!this.isModified('password')){
     return next();
  }

  this.password = await bcryptjs.hash(this.password, 10);

})

userSchema.methods = {
    generateJWTToken: async function(){
        return await jwt.sign({
            id: this._id,
            email: this.email,
            subscription: this.subscription,
            role: this.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY,
        }
    )
    },

    comparePassword: async function(plainTextPassword){
      return await bcryptjs.compare(plainTextPassword,this.password);

    },

    generatePasswordResetToken: async function() {
        const resetToken = crypto.randomBytes(20).toString('hex');

        this.forgetPasswordToken = crypto
                                    .createHash('sha256')
                                    .update(resetToken)
                                    .digest('hex')
        this.forgetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now

        return resetToken;
    }
}


const User = mongoose.model('user', userSchema);

module.exports = User;
