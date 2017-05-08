/**
 * stripAuthToken
 *
 * @module      :: Policy
 * @description :: Simple policy that strips out auth tokens so they cant be overwritten by the client
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

import { util } from 'sails-ember-rest';

export default function(req, res, next){
    let data = util.parseValues( req, User );
    
    if(data)
    {
        delete data.authToken;
        req.body = {
            user: data
        };
    }
    next();
};
