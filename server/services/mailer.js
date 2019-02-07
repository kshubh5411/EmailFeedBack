// We have defined a mailer class so as to send all the mail from the recipient list===
const sendgrid =require('sendgrid');
const helper= sendgrid.mail;

const keys= require('../config/prod');

class Mailer extends helper.Mail{
    constructor({subjects,recipients},content)
    {
       super();
       this.from_email= new helper.Email("no-reply@feedyback.com");
       this.subjects=subjects;
       this.body=new helper.Content('text/html',content);
       this.recipients=this.formatAddresses(recipients);
    }

}
module.exports=Mailer