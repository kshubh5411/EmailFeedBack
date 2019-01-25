var {User} = require('./../models/user');

var authenticate = (req, res, next) => {
  var token = req.header('x-auth');

  User.findByToken(token).then((user) => {
    if(!user) {
      //return Promise.reject();  //
      return res.status(401).send({error:"You must Log in"});
    }

    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
      res.status(401).send({error:"Hey Please log in"});    //401 means authentication is required
  });
};

module.exports = {authenticate};
