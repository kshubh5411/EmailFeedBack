const {authenticate} = require('../middleware/authenticate');
const {checkCredit}  = require('../middleware/checkcredit');
const Survey      = require('../models/survery');
const Mailer         = require('../services/mailer');
const surveyTemplate = require('../services/emailTemplate/surveyTemplate');

module.exports = app =>
{
   app.get('/api/surveys/userreply',(req,res)=>
   {
      res.send("Thanks For Voting");
   })
   app.post('/api/surveys',authenticate,async(req,res)=>
   {   //console.log(req.body);
       const {title,body,recipients} =req.body;
       const survey= new Survey({
          title,
          body,
          subject:req.body.body,
          recipients:recipients.split(',').map(email=> ({email:email.trim()})),
          _user:req.user._id,
          dateSent:Date.now()
       });

       const mailer =new Mailer(survey,surveyTemplate(survey));
       try{
       await mailer.send();
       await survey.save();
       req.user.credit-=1;
       const user=await req.user.save();
       
       res.send(user);}
       catch(err)
       {  console.log(user);
          res.status(401).send(err);
       }
   })
}  