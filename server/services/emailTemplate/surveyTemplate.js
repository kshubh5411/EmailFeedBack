const domurl= require('../../config/prod');
module.exports = survey =>
{
   return   `
       <html>
         <div class="container" style="background: orange; text-align: center;" >
             <h3>Do You Fascinated With our Community</h3>
              <p>Please Reply for the Following Question</p>
              <p>${survey.body}</p>
            <div><a href="${domurl.DOMAIN_URL}/api/surveys/userreply">Yes</a></div>
            <div><a href="${domurl.DOMAIN_URL}/api/surveys/userreply">No</a></div>
          </div>
       </html>
   `
}