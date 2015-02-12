var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
  * @module  User
  * @description contain the details of Attribute  
*/

var User = new Schema({
  
  /** 
    userName. It can only contain valid email id, should be unique, is required and indexed.
  */
  userName : { type: String, unique: true, required: true },

  /** 
    password. It can only contain string, is required field.
  */
  password : { type: String, required: true },

   /** 
    Scope. It can only contain string, is required field, and should have value from enum array.
  */
  scope: {
      type: String,
      enum: ['Customer'],
      required: true
  },

  /** 
    propertyId. It can only contain string.
  */
  isVerified : { type: Boolean, default: false }

  
});

User.statics.saveUser= function(requestData, callback) {
    var user = new this(requestData);
    user.save(callback);
};

User.statics.findUser= function(userName, callback) {
    this.findOne({userName:userName},callback);
};

var user = mongoose.model('user', User);

/** export schema */
module.exports = {
    User : user
};