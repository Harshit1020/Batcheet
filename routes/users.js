const mongoose = require('mongoose')
mongoose.set('strictQuery', true);
var plm = require('passport-local-mongoose');
mongoose.connect("mongodb://localhost/videoChatapp")
.then(function(){
  console.log("connected to db")
})

var userSchema = mongoose.Schema({
  name: String,
  email:String,
  username: String,
  password: String,
  otp: {
    type: String,
    default:'',
  }
})
userSchema.plugin(plm)
module.exports = mongoose.model("user" , userSchema)