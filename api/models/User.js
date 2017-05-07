/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const bcrypt = require('bcrypt');
const uuid = require('node-uuid');
const SALT_WORK_FACTOR = 10;

export default {
    attributes: {
        name: {
            type: 'string',
            required: true,
            minLength: 3,
            maxLength: 30
        },
        username: {
            type: 'string',
            required: true,
            unique: true,
            minLength: 3,
            maxLength: 30
        },
        email:{ 
            type: 'email',
            required: true,
            unique: true
        },
        password:{
            type: 'string',
            required: true,
            minLength: 6,
            maxLength: 50
        },
        friends: {
            collection: 'user',
            via: 'id'
        },
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }
    },
    verifyPassword: function (record, password, cb) {
        return bcrypt.compare(password, record.password, cb); //this is also a promise
    },
    changePassword: function(record, password, cb){
        record.password = password;
        record.save(function(err, u) {
            return cb(err, u);
        });
    },
    beforeCreate: function (attrs, cb) {
        bcrypt.hash(attrs.password, SALT_WORK_FACTOR, function (err, hash) {
            attrs.password = hash;
            return cb(err);
        });
    },
    beforeUpdate: function (attrs, cb) {
        if(attrs.password)
        {
            bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                if(err)
                {
                    return cb(err);
                }
                bcrypt.hash(attrs.password, salt, function(err, crypted) {
                    if(err) 
                    {
                        return cb(err);
                    }
                    attrs.password = crypted;
                    return cb();
                });
            });
        }
        else 
        {
            return cb();
        }
    }
};
