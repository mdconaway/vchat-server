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
        authToken: {
            type: 'string',
            required: false,
            minLength: 30,
            maxLength: 30
        },
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
            minLength: 6
        },
        friends: {
            collection: 'user',
            via: 'id'
        },
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            delete obj.authToken;
            return obj;
        }
    },
    verifyPassword: function (record, password, cb) {
        return bcrypt.compare(password, record.password, cb); //this is also a promise
    },
    changePassword: function(record, oldpassword, newpassword, cb){
        this.verifyPassword(record, oldpassword).then((result) => {
            if(result)
            {
                bcrypt.hash(newpassword, SALT_WORK_FACTOR, function (err, hash) {
                    if(err)
                    {
                        return cb(err);
                    }
                    record.password = hash;
                    record.save(cb);
                });
            }
            else
            {
                cb(new Error('Your old password is incorrect'));
            }
        });
    },
    beforeCreate: function (attrs, cb) {
        bcrypt.hash(attrs.password, SALT_WORK_FACTOR, function (err, hash) {
            attrs.password = hash;
            return cb(err);
        });
    }
};
