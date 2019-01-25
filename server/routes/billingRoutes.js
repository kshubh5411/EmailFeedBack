const key    =  require('../config/prod');
const stripe =  require('stripe')(key. STRIPE_SECRET_KEY);
const _= require('lodash');
var {authenticate} = require('../middleware/authenticate');
module.exports = app =>
{
    app.post('/api/stripe',authenticate,async(req,res)=>
    {
        const charge =await stripe.charges.create({
            amount:500,
            currency:'usd',
            description:'5$ for EmailFeedBack',
            source:req.body.id
        });

        req.user.credit+=5;
        const user= await req.user.save();
        res.send(_.pick(user,['_id', 'credit']));

   });
   app.get('/user/credit',authenticate,(req,res)=>
   {
      res.send(_.pick(req.user,['_id', 'credit']));
   })
}