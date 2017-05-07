/**
 * selfOnly
 *
 * @module      :: Policy
 * @description :: Simple policy that only allows users to edit their own object
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */

import { util } from 'sails-ember-rest';

export default function(req, res, next){
    let pk = util.requirePk( req );
    // User is allowed, proceed to the next policy, 
    // or if this is the last policy, the controller
    if (req.session.authenticated && req.session.user.id == pk) 
    {
        return next();
    }

    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    return res.forbidden('You are not permitted to perform this action.');
};
