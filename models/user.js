var mongoose = require("mongoose");
var passportLocalMongoose= require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username : {
        type:String,
        unique:true,
        required:true
    },
    password : String,
    name : String,
    lname:String,
    avatar:String,
    avatarId:String,
    instagram:String,
    facebook:String,
    tumblr:String,
    description:String,
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    email:{
        type:String,
        unique:true,
        required:true
    }
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",userSchema);