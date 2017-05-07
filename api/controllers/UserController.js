import { controller } from 'sails-ember-rest';

export default new controller({
    authenticate(req, res){
        const params = req.allParams();
        const username = params.username;
        const password = params.password;
        if(username && password)
        {
            User.findOne({username}).exec((err, record) => {
                if(err)
                {
                    return res.negotiate(err);
                }
                User.verifyPassword(record, password).then((res) => {
                    if(res)
                    {
                        Object.assign(req.session, {
                            authenticated: true,
                            user: record
                        });
                        req.session.save(() => {
                            res.ok({
                                users: [
                                    record.toJSON()
                                ],
                                meta: {
                                    authenticated: true,
                                    id: record.id
                                }
                            });
                        });
                    }
                    else
                    {
                        Object.assign(req.session, {
                            authenticated: false,
                            user: null
                        });
                        req.session.save(() => {
                            res.forbidden({
                                users: [],
                                meta: {
                                    authenticated: false
                                }
                            });
                        });
                    }
                });
            });
        }
        else
        {
            res.badRequest(new Error('You must send a username and a password to authenticate.'));
        }
    }
});
