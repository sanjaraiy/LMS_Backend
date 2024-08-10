const mongoose = require('mongoose');

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

const User = mongoose.model('user', userSchema);

module.exports = User;
