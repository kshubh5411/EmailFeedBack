const {authenticate} = require('../middleware/authenticate');
const {checkCredit}  = require('../middleware/checkcredit');
const Survey         = require('../models/survery');
const Mailer         = require('../services/mailer');
const surveyTemplate = require('../services/emailTemplate/surveyTemplate');
const  Path          = require('path-parser').default;
const {URL}          = require('url');
const _              = require('lodash');

module.exports = app =>
{
   app.get('/api/surveys/:surveyId/:choice',(req,res)=>
   {
      res.send("Thanks For Voting");
   })

   // SendGrid Webhook=====================
   app.post('/api/surveys/webhook',(req,res)=>
   {
      const p      = new Path('/api/surveys/:surveyId/:choice');
      const events = _.chain(req.body)
         .map(({url,email})=>{
            const pathname = new URL(url).pathname;
            const match    = p.test(pathname);
            if(match)
               return {email,surveyId:match.surveyId,choice:match.choice};
         })
         .compact()
         .uniqBy('email','serveyId')
         .value();
        
         // For Each Events webhook we update the survey ========

         _.forEach(events,(({email,choice,surveyId}) => { 
              Survey.updateOne({
                 _id: surveyId,
                 recipients:{
                   $elemMatch: {email:email,respond:false}
                 }
              },{
                 $inc: {[choice]:1},
                 $set:{'recipients.$.respond':true},
                 dateRespond: new Date()
              }).exec() 
            }))

          res.send({});
   })

   app.get('/api/surveys',authenticate,async(req,res)=>{
      console.log("yeag");
      const surveys = await Survey.find({_user:req.user._id})
       .select({recipients:false});
      res.send(surveys);
      
   })


   app.post('/api/surveys',authenticate,async(req,res)=>
   {  
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
       {  
          res.status(401).send(err);
       }
   })
}  