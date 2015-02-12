var Joi = require('joi'),
    Boom = require('boom'),
    Common = require('./common'),
    Config = require('../config/config'),
    Jwt = require('jsonwebtoken'),
    User = require('../model/user').User;

var privateKey = Config.key.privateKey;

exports.create = {
    validate: {
        payload: {
            userName: Joi.string().email().required(),
            password: Joi.string().required()
        }
    },
    handler: function(request, reply) {
        request.payload.password = Common.encrypt(request.payload.password);
        request.payload.scope = "Customer";
        User.saveUser(request.payload, function(err, user) {
            if (!err) {
                Common.sentMail(user);
                reply("Please confirm your email id by clicking on link in email");
            } else {
                if (11000 === err.code || 11001 === err.code) {
                    reply(Boom.forbidden("please provide another user email"));
                } else reply(Boom.forbidden(err)); // HTTP 403
            }
        });
    }
};

exports.login = {
    validate: {
        payload: {
            userName: Joi.string().email().required(),
            password: Joi.string().required()
        }
    },
    handler: function(request, reply) {
        User.findUser(request.payload.userName, function(err, user) {
            if (!err) {
                if (user === null) return reply(Boom.forbidden("invalid username or password"));
                if (request.payload.password === Common.decrypt(user.password)) {

                    var tokenData = {
                        userName: user.userName,
                        scope: [user.scope],
                        id: user._id
                    };
                    var res = {
                        username: user.userName,
                        scope: user.scope,
                        token: Jwt.sign(tokenData, privateKey)
                    };

                    reply(res);
                } else reply(Boom.forbidden("invalid username or password 2"));
            } else {
                if (11000 === err.code || 11001 === err.code) {
                    reply(Boom.forbidden("please provide another user email"));
                } else reply(Boom.forbidden(err)); // HTTP 403
            }
        });
    }
};

exports.getMyDetails = {
    auth: {
        strategy: 'token',
        scope: ['Customer']
    },
    handler: function(request, reply) {
        Jwt.verify(request.headers.authorization.split(" ")[1], privateKey, function(err, decoded) {
            reply(decoded);
        });
    }
};