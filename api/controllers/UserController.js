import { controller } from 'sails-ember-rest';
import parallel from 'async/parallel';
import { uid as token } from 'rand-token';

function invalidateSession(req, res, fn) {
    Object.assign(req.session, {
        authenticated: false,
        user: null
    });
    return req.session.save(() => {
        res[fn]({
            users: [],
            meta: {
                authenticated: false
            }
        });
    });
}

export default new controller({
    authenticate(req, res){
        const params = req.allParams();
        const username = params.username;
        const password = params.password;
        const authKey = params.authKey;
        const logout = params.logout;
        if(username && (password || authKey))
        {
            User.findOne({username}).exec((err, record) => {
                if(err)
                {
                    return res.negotiate(err);
                }
                parallel({
                    validPassword: (done) => {
                        User.verifyPassword(record, password, done);
                    },
                    validAuthKey: (done) => {
                        done(null, record.authKey === authKey);
                    }
                },
                (err, result) =>{
                    if(!err && (result.validPassword || result.validAuthKey))
                    {
                        Object.assign(req.session, {
                            authenticated: true,
                            user: record
                        });
                        record.authToken = token(30);
                        parallel({
                            session: (done) => {
                                req.session.save(done);
                            },
                            user: (done) => {
                                record.save(done);
                            }
                        },
                        (err, saves) => {
                            if(err)
                            {
                                return invalidateSession(req, res, 'forbidden');
                            }
                            res.ok({
                                users: [
                                    record.toJSON()
                                ],
                                meta: {
                                    authenticated: true,
                                    id: record.id,
                                    token: record.authToken
                                }
                            });
                        });
                    }
                    else
                    {
                        invalidateSession(req, res, 'forbidden');
                    }
                });
            });
        }
        else if(logout && req.session.authenticated)
        {
            User.findOne(req.session.user.id).exec((err, record) => {
                if(err || !record)
                {
                    return invalidateSession(req, res,'forbidden');
                }
                record.authToken = null;
                record.save(() => {
                    invalidateSession(req, res, 'ok');
                });
            });
        }
        else
        {
            res.badRequest(new Error('You must send a username and a password to authenticate.'));
        }
    }
});
