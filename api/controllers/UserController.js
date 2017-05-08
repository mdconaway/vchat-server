import { controller } from 'sails-ember-rest';
import parallel from 'async/parallel';
import { uid as token } from 'rand-token';

function invalidateSession(req, res) {
    Object.assign(req.session, {
        authenticated: false,
        user: null
    });
    return req.session.save(() => {
        res.forbidden({
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
                (result) =>{
                    if(result.validPassword || result.validAuthKey)
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
                        (saves) => {
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
                        invalidateSession(req, res);
                    }
                });
            });
        }
        else if(logout && req.session.authenticated)
        {
            req.session.user.authToken = null;
            req.session.user.save(() => {
                invalidateSession(req, res);
            });
        }
        else
        {
            res.badRequest(new Error('You must send a username and a password to authenticate.'));
        }
    }
});
