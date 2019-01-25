var {authenticate} = require('../middleware/authenticate');
var {ObjectID} = require('mongodb');
const bcrypt = require('bcryptjs');
var {mongoose} = require('../db/mongoose');
var {User} = require('../models/user');
const _ = require('lodash');


module.exports =(app)=>
{
    app.post('/users', (req,res) => {
        var body = _.pick(req.body, ['fullName', 'email', 'password']);
        var user = new User(body);
      
        user.save().then(() => {
            return user.generateAuthToken();
        }).then((token) => {
          res.header('x-auth', token).send(user);
        }).catch((e) => {
          res.status(400).send(e);
        });
      });
      
      //this route will return a individual authenticated user
      app.get('/users/me', authenticate, (req, res) => {
        res.send(req.user);
      });
      
      // POST /users/login {email, password}
      app.post('/users/login', (req, res) => {
        var body = _.pick(req.body, ['email', 'password']);
      
        User.findByCredentials(body.email, body.password).then((user) => {
          return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
          });
        }).catch((e) => {
          res.status(400).send();
        });
      });
      
      app.delete('/users/me/token', authenticate, (req, res) => {
        req.user.removeToken(req.token).then(() => {
          res.status(200).send();
        }, () => {
          res.status(400).send();
        });
      });
      
}