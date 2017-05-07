/**
 * stripFalsePasswords
 *
 * @module      :: Policy
 * @description :: Simple policy that strips out falsey password values`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

import { util } from 'sails-ember-rest';

export default function(req, res, next){
    let data = util.parseValues( req, User );
    
    if(data && !data.password)
    {
        delete data.password;
        req.body = {
            user: data
        };
    }
    next();
};
