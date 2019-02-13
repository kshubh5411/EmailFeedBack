
module.exports = survey =>
{
   return   `
       <html>
         <div class="container" style="background: orange; text-align: center;" >
             <h3>Do You Fascinated With our Community</h3>
              <p>Please Reply for the Following Question</p>
              <p>${survey.body}</p>
            <div><a href="http://localhost:3000/">Yes</a></div>
            <div><a href="http://localhost:3000/">No</a></div>
          </div>
       </html>
   `
}