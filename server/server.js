require('./config/config');
const path = require('path');
const _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const port = process.env.PORT;
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));
app.use(bodyParser.json());


//Routes handle
require('./routes/auth')(app);
require('./routes/billingRoutes')(app);



app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'))
})

app.listen(port, () => {
  console.log(`started up at port ${port}`);
});

module.exports = {app};
