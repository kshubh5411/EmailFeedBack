const {authenticate} = require('../middleware/authenticate');
const {checkCredit}  = require('../middleware/checkcredit');
const Survey      = require('../models/survery');
const Mailer         = require('../services/mailer');
const surveyTemplate = require('../services/emailTemplate/surveyTemplate');

module.exports = app =>
{
   app.post('/api/surveys',authenticate,checkCredit,(req,res)=>
   {
       const {title,body,recipients} =req.body;
       const survey= new Survey({
          title,
          body,
          subject:req.body.subject,
          recipients:recipients.split(',').map(email=> ({email:email.trim()})),
          _user:req.user._id,
          dateSent:Date.now()
       });

       const mailer =new Mailer(survey,surveyTemplate(survey));
       mailer.send().then(resp=>
        {
            console.lof(resp);
        });
   })
}  