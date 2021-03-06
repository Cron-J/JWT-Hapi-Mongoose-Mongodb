
var nodemailer = require("nodemailer"),
    Config = require('../config/config'),
    crypto = require('crypto'),
    algorithm = 'aes-256-ctr';

var privateKey = Config.key.privateKey;

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", {
    service: "Gmail",
    auth: {
        user: Config.email.username,
        pass: Config.email.password
    }
});

exports.decrypt = function(password) {
    return decrypt(password);
};

exports.encrypt = function(password) {
    return encrypt(password);
};

exports.sentMail = function(user) {
    var from = "Sprink.ly Team<" + Config.email.username + ">";
    var mailbody = "Your email id: " + user.userName + " and password: " + decrypt(user.password);
    mail(from, user.userName , "Account Credential", mailbody);
};


// method to decrypt data(password) 
function decrypt(password) {
    var decipher = crypto.createDecipher(algorithm, privateKey);
    var dec = decipher.update(password, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

// method to encrypt data(password)
function encrypt(password) {
    var cipher = crypto.createCipher(algorithm, privateKey);
    var crypted = cipher.update(password, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function mail(from, email, subject, mailbody){
    var mailOptions = {
        from: from, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        //text: result.price, // plaintext body
        html: "<b>" + mailbody + "</b>" // html body
    };

    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
        }
        smtpTransport.close(); // shut down the connection pool, no more messages
    });
}