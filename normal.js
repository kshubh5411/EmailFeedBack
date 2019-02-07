require("./config/config");

const path = require("path");
const _ = require("lodash");
var express = require("express");
var bodyParser = require("body-parser");
var randomstring = require("randomstring");
var { ObjectID } = require("mongodb");
const moment = require("moment");
const axios = require("axios");

const { mongoose } = require("./db/mongoose");
const { User } = require("./models/user");
const { Profile } = require("./models/profile");
const { UserType } = require("./models/userType");
const { Employee } = require("./models/employee");
const { Client } = require("./models/client");
const { Passbook } = require("./models/passbook");
const { Transaction } = require("./models/transaction");
const { Tarikh } = require("./models/tarikh");
const { ClientFile } = require("./models/clientFile");
const { TemplateFile } = require("./models/templateFile");
const { ClientDoc } = require("./models/clientDoc");
const { Support } = require("./models/support");
const { Event } = require("./models/event");
const { Ad } = require("./models/ad");
const { StateInfo } = require("./models/stateInfo");
const { Message } = require("./models/message");
const { AppFeature } = require("./models/appFeature");
const { Appointment } = require("./models/appointment");
const { authenticate } = require("./middleware/authenticate");
const { sendVerifyMail } = require("./misc/sendgrid");
const { uploadImage, uploadFile } = require("./misc/multer");
require("./misc/cron");

const app = express();
const server = require("http").createServer(app);
const port = process.env.PORT;
const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//app feature
app.get("/app/feature", authenticate, (req, res) => {
  AppFeature.find()
    .then(features => {
      res.send({ features });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

// add new app feature
app.post("/app/feature", authenticate, (req, res) => {
  const body = _.pick(req.body, [
    "title",
    "description",
    "usesTitle",
    "usesPoints"
  ]);
  console.log(body);
  new AppFeature(body)
    .save()
    .then(feature => {
      res.send({ feature });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//edit app feature
app.patch("/app/feature/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  const body = _.pick(req.body, [
    "title",
    "description",
    "usesTitle",
    "usesPoints"
  ]);
  AppFeature.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(feature => {
      if (!feature) {
        res.status(404).send();
      }
      res.send({ feature });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

app.delete("/app/feature/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  AppFeature.findByIdAndRemove(id)
    .then(feature => {
      if (!feature) {
        res.status(404).send();
      }
      res.status(200).send();
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//profile search
app.get("/profile/search/:name", (req, res) => {
  const regex = new RegExp(escapeRegex(req.params.name), "gi");
  Profile.find({ fullName: regex })
    .select({ bio: 1, fullName: 1, dpUrl: 1, _creator: 1 })
    .then(profiles => {
      res.send({ profiles });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send(e);
    });
});

//Case search
app.get("/case/search/:searchBy/:value", authenticate, (req, res) => {
  const searchBy = req.params.searchBy;
  const value = req.params.value;
  const regex = new RegExp(escapeRegex(value), "gi");
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  const body = { _creator };
  if (searchBy === "fullName") {
    body[searchBy] = regex;
  } else {
    body[searchBy] = value;
  }
  Client.find(body)
    .then(clients => {
      res.send({ clients });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//send text sms to client
app.post("/sms/:clientId", authenticate, (req, res) => {
  const _client = req.params.clientId;
  if (!ObjectID.isValid(_client)) {
    return res.status(404).send();
  }
  const { mobile, text } = req.body;
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  axios
    .get(
      `http://jumbosms.shlrtechnosoft.com/websms/sendsms.aspx?userid=mayankmodi&password=mayank@051&sender=MANGLA&mobileno=${mobile}&msg=${text}`
    )
    .then(response => {
      const responseMessage = response.data;
      if (responseMessage.toLowerCase().indexOf("success") !== -1) {
        new Message({
          mobile,
          text,
          _client,
          _creator,
          createdAt: moment().valueOf()
        }).save();
        return res.status(200).send();
      }
      res.status(400).send();
    });
});

//get all messages
app.get("/sms/:clientId", authenticate, (req, res) => {
  const _client = req.params.clientId;
  if (!ObjectID.isValid(_client)) {
    return res.status(404).send();
  }
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  Message.find({ _client, _creator })
    .then(messages => {
      res.send({ messages });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//Register employee
app.post("/employee", authenticate, (req, res) => {
  const body = _.pick(req.body, [
    "firstName",
    "lastName",
    "email",
    "mobile",
    "altMobile",
    "address",
    "password"
  ]);
  body._creator = req.user._id;
  new Employee(body)
    .save()
    .then(employee => {
      new User({
        fullName: `${body.firstName} ${body.lastName}`,
        email: body.email,
        mobile: body.mobile,
        password: body.password,
        active: true,
        _creator: req.user._id,
        userType: 13
      }).save();
      res.send({ employee });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//employee doc update
app.patch("/employee/:id", authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, [
    "firstName",
    "lastName",
    "email",
    "mobile",
    "altMobile",
    "address"
  ]);
  Employee.findOneAndUpdate(
    {
      _id: id,
      _creator: req.user._id
    },
    {
      $set: body
    },
    { new: true }
  )
    .then(employee => {
      if (!employee) {
        return res.status(404).send();
      }
      res.send({ employee });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//get employees list
app.get("/employee", authenticate, (req, res) => {
  Employee.find({ _creator: req.user._id })
    .then(employees => {
      res.send({ employees });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//Register client
app.post("/client", authenticate, (req, res) => {
  const body = _.pick(req.body, [
    "fullName",
    "fatherName",
    "address",
    "mobile",
    "altMobile",
    "antiClient_fullName",
    "antiClient_fatherName",
    "antiClient_address",
    "antiClient_mobile",
    "antiClient_altMobile",
    "subject"
  ]);
  body._creator = req.user._id;

  Client.find()
    .distinct("caseId")
    .then(caseIds => {
      let newCaseId;
      if (caseIds.length) {
        newCaseId = Math.max(...caseIds) + 1;
      } else {
        newCaseId = 1253;
      }
      body.caseId = newCaseId;
      return new Client(body).save().then(client => {
        res.send({ client });
        return new Passbook({
          _client: client._id,
          _creator: req.user._id
        }).save();
      });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//client doc update
app.patch("/client/:id", authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, [
    "fullName",
    "fatherName",
    "address",
    "mobile",
    "altMobile",
    "antiClient_fullName",
    "antiClient_fatherName",
    "antiClient_address",
    "antiClient_mobile",
    "antiClient_altMobile",
    "subject",
    "caseNo",
    "caseClosed"
  ]);
  Client.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: body },
    { new: true }
  )
    .populate("assignTo")
    .then(client => {
      if (!client) {
        return res.status(404).send();
      }
      res.send({ client });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//assign client case to employee
app.patch("/client/assign/:id", authenticate, (req, res) => {
  const id = req.params.id;
  const { assignTo } = req.body;
  Client.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: { assignTo } },
    { new: true }
  )
    .populate("assignTo")
    .then(client => {
      if (!client) {
        res.status(404).send();
      }
      res.send({ client });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//list of all clients
app.get("/client", authenticate, (req, res) => {
  Client.find({ _creator: req.user._id })
    .populate("assignTo")
    .then(clients => {
      res.send({ clients });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//get a client passbook
app.get("/passbook/:clientId", authenticate, (req, res) => {
  const _client = req.params.clientId;
  if (!ObjectID.isValid(_client)) {
    return res.status(404).send();
  }
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  Passbook.findOne({ _creator, _client })
    .then(passbook => {
      if (!passbook) {
        return res.status(404).send();
      }
      return Transaction.find({ _creator, _client })
        .select({
          action: 1,
          amount: 1,
          reason: 1,
          balance: 1,
          _id: 1,
          createdAt: 1
        })
        .then(transactions => {
          passbook = passbook.toObject();
          passbook.transactions = transactions;
          return passbook;
        });
    })
    .then(passbook => {
      res.send({ passbook });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//new transaction update to passbook
app.patch("/passbook/:clientId", authenticate, (req, res) => {
  const _client = req.params.clientId;
  if (!ObjectID.isValid(_client)) {
    return res.status(404).send();
  }
  const { action, amount, reason, balance } = req.body;
  const _creator = req.user._creator ? req.user._creator : req.user._id; //account holder is either parent or sub advocate
  Passbook.findOneAndUpdate(
    { _client, _creator },
    { $set: { balance: balance } },
    { new: true }
  )
    .then(passbook => {
      if (!passbook) {
        return res.status(404).send();
      }
      new Transaction({
        action,
        amount,
        reason,
        balance,
        _creator,
        _client: _client,
        createdAt: moment().valueOf()
      }).save();
      res.send({ currentBalance: passbook.balance });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//get advocate passbook
app.get("/passbook-advocate", authenticate, (req, res) => {
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  Transaction.find({ _creator })
    .populate("_client")
    .then(transactions => {
      res.send({ passbook: transactions });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//list of all tarikhs(all clients)
app.get("/tarikh", authenticate, (req, res) => {
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  Tarikh.find({ _creator })
    .populate("_client", "caseId")
    .then(tarikhs => {
      res.send({ tarikhs });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//list of all tarikhs of a client
app.get("/tarikh/:clientId", authenticate, (req, res) => {
  const _client = req.params.clientId;
  if (!ObjectID.isValid(_client)) {
    return res.status(404).send();
  }
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  Tarikh.find({ _creator, _client })
    .then(tarikhs => {
      res.send({ tarikhs });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//create new tarikh
app.post("/tarikh/:clientId", authenticate, (req, res) => {
  const _client = req.params.clientId;
  if (!ObjectID.isValid(_client)) {
    return res.status(404).send();
  }
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  const body = _.pick(req.body, ["reason", "date", "startTime", "endTime"]);
  body._creator = _creator;
  body._client = _client;
  new Tarikh(body)
    .save()
    .then(tarikh => {
      return Tarikh.populate(tarikh, { path: "_client", select: "caseId" });
    })
    .then(tarikh => {
      res.send({ tarikh });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//tarikh update (client appeared or not appeared)
app.patch("/tarikh/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  const body = _.pick(req.body, ["appeared", "conclusion"]);
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  Tarikh.findOneAndUpdate({ _id: id, _creator }, { $set: body }, { new: true })
    .then(tarikh => {
      if (!tarikh) {
        return res.status(404).send();
      }
      res.send({ tarikh });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send(e);
    });
});

//get list of all state infos
app.get("/state", authenticate, (req, res) => {
  StateInfo.find()
    .then(infos => {
      res.send({ infos });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//add State informations
app.post("/state", authenticate, (req, res) => {
  const body = _.pick(req.body, ["state", "cities"]);
  new StateInfo(body)
    .save()
    .then(info => {
      res.send({ info });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//update state infos
app.patch("/state/:id", authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ["state", "cities"]);
  StateInfo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(info => {
      if (!info) {
        return res.status(404).send();
      }
      res.send({ info });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//delete state info
app.delete("/state/:id", authenticate, (req, res) => {
  const id = req.params.id;

  StateInfo.findByIdAndRemove(id)
    .then(info => {
      if (!info) {
        return res.status(404).send();
      }
      res.send({ info });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//get events list
app.get("/event/:court?", authenticate, (req, res) => {
  const court = req.params.court;
  const query = court ? { court } : { _creator: req.user._id };
  Event.find(query)
    .then(events => {
      res.send({ events });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//add event on calender
app.post("/event/:court?", authenticate, (req, res) => {
  const { title, description, start, end, state, city } = req.body;
  const court = req.params.court;
  const query = court
    ? { title, description, start, end, state, city, court }
    : { title, description, start, end, _creator: req.user._id };
  new Event(query)
    .save()
    .then(newEvent => {
      res.send({ newEvent });
    })
    .catch(e => {
      res.status(400).send(e);
      console.log(e);
    });
});

//get case files of a client
app.get("/clientfile/:clientId", authenticate, (req, res) => {
  const _client = req.params.clientId;
  if (!ObjectID.isValid(_client)) {
    return res.status(404).send();
  }
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  ClientFile.find({ _creator, _client })
    .then(files => {
      res.send({ files });
    })
    .catch(e => {
      res.status(400).send();
    });
});

//create new case file
app.post("/clientfile/:clientId", authenticate, (req, res) => {
  const _client = req.params.clientId;
  if (!ObjectID.isValid(_client)) {
    return res.status(404).send();
  }
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  const body = _.pick(req.body, ["name", "text"]);
  body.createdAt = moment().valueOf();
  body._client = _client;
  body._creator = _creator;
  new ClientFile(body)
    .save()
    .then(file => {
      res.send({ file });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//edit a client case file
app.patch("/clientfile/:id", authenticate, (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    return res.status(404).send();
  }
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  const body = _.pick(req.body, ["name", "text"]);
  ClientFile.findOneAndUpdate({ _id, _creator }, { $set: body }, { new: true })
    .then(file => {
      if (!file) {
        return res.status(404).send();
      }
      res.send({ file });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//delete case file
app.delete("/clientfile/:id", authenticate, (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    return res.status(404).send();
  }
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  ClientFile.findOneAndRemove({ _creator, _id })
    .then(file => {
      if (!file) {
        return res.status(404).send();
      }
      res.send({ file });
    })
    .catch(e => {
      res.status(400).send();
    });
});

//get templatefile of an advocate
app.get("/templatefile", authenticate, (req, res) => {
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  TemplateFile.find({ _creator })
    .then(files => {
      res.send({ files });
    })
    .catch(e => {
      res.status(400).send();
    });
});

//create new template file
app.post("/templatefile", authenticate, (req, res) => {
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  const body = _.pick(req.body, ["name", "text"]);
  body.createdAt = moment().valueOf();
  body._creator = _creator;
  new TemplateFile(body)
    .save()
    .then(file => {
      res.send({ file });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//edit a template file
app.patch("/templatefile/:id", authenticate, (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    return res.status(404).send();
  }
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  const body = _.pick(req.body, ["name", "text"]);
  TemplateFile.findOneAndUpdate(
    { _id, _creator },
    { $set: body },
    { new: true }
  )
    .then(file => {
      if (!file) {
        return res.status(404).send();
      }
      res.send({ file });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//delete template file
app.delete("/templatefile/:id", authenticate, (req, res) => {
  const _id = req.params.id;
  if (!ObjectID.isValid(_id)) {
    return res.status(404).send();
  }
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  TemplateFile.findOneAndRemove({ _creator, _id })
    .then(file => {
      if (!file) {
        return res.status(404).send();
      }
      res.send({ file });
    })
    .catch(e => {
      res.status(400).send();
    });
});

//get client docs
app.get("/clientdoc/:clientId", authenticate, (req, res) => {
  const _client = req.params.clientId;
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  ClientDoc.find({ _creator, _client })
    .then(docs => {
      res.send({ docs });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//add new client docs
app.post("/clientdoc/:clientId", authenticate, (req, res) => {
  const _client = req.params.clientId;
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  uploadFile(req, res, err => {
    if (err) {
      res.status(400).send(err);
    } else {
      if (req.file == undefined) {
        res.status(400).send("Error: No File Selected!");
      } else {
        const body = { name: req.body.name };
        body.url = `${req.file.filename}`;
        body.createdAt = moment().valueOf();
        body._client = _client;
        body._creator = _creator;
        new ClientDoc(body)
          .save()
          .then(doc => {
            res.send({ doc });
          })
          .catch(e => {
            console.log(e);
            res.status(400).send();
          });
      }
    }
  });
});

//delete client doc
app.delete("/clientdoc/:id", authenticate, (req, res) => {
  const _id = req.params.id;
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  ClientDoc.findOneAndRemove({ _id, _creator })
    .then(doc => {
      if (!doc) {
        return res.status(404).send();
      }
      res.send({ doc });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//transfer case
app.post("/transfercase/:clientId", authenticate, (req, res) => {
  const _client = req.params.clientId;
  if (!ObjectID.isValid(_client)) {
    return res.status(404).send();
  }
  const _creator = req.user._creator ? req.user._creator : req.user._id;
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(404).send();
      }
      return Client.findOne({ _id: _client, _creator }).then(client => {
        if (!client) {
          return res.status(404).send();
        }
        client = client.update({
          $set: { _creator: user._id },
          $unset: { assignTo: 1 }
        });
        const passbook = Passbook.findOneAndUpdate(
          { _client, _creator },
          { $set: { _creator: user._id } }
        );
        const transaction = Transaction.update(
          { _client, _creator },
          { $set: { _creator: user._id } },
          { multi: true }
        );
        const tarikh = Tarikh.findOneAndUpdate(
          { _client, _creator },
          { $set: { _creator: user._id } }
        );
        const clientFile = ClientFile.findOneAndUpdate(
          { _client, _creator },
          { $set: { _creator: user._id } }
        );
        const clientDoc = ClientDoc.findOneAndUpdate(
          { _client, _creator },
          { $set: { _creator: user._id } }
        );
        return Promise.all([
          client,
          passbook,
          transaction,
          tarikh,
          clientFile,
          clientDoc
        ]);
      });
    })
    .then(() => {
      res.status(200).send();
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//get ads
app.get("/advertise", authenticate, (req, res) => {
  Ad.find()
    .populate("_creator", "fullName")
    .then(ads => {
      res.send({ ads });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//post advertisement
app.post("/advertise", authenticate, (req, res) => {
  uploadFile(req, res, err => {
    if (err) {
      return res.status(400).send(err);
      console.log(err);
    } else {
      const body = _.pick(req.body, ["title", "description"]);
      body._creator = req.user._id;
      if (req.file) {
        body.fileName = req.file.filename;
      }
      new Ad(body).save().then(
        ad => {
          res.send({ ad });
        },
        err => {
          res.status(400).send(err);
          console.log(err);
        }
      );
    }
  });
});

//update ad by admin
app.post("/advertise/:id", authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ["approve", "active", "duration"]);
  Ad.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(ad => {
      res.send({ ad });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//get all issues
app.get("/support", authenticate, (req, res) => {
  Support.find()
    .populate([
      {
        path: "reply._repliedBy",
        select: "fullName mobile"
      },
      {
        path: "_creator",
        select: "fullName mobile"
      }
    ])
    .then(queries => {
      res.send({ queries });
    })
    .then(e => {
      console.log(e);
      res.status(400).send();
    });
});

//get all issues raised by individual user
app.get("/support/me", authenticate, (req, res) => {
  Support.find({ _creator: req.user._id })
    .populate([
      {
        path: "reply._repliedBy",
        select: "fullName mobile"
      },
      {
        path: "_creator",
        select: "fullName mobile"
      }
    ])
    .then(queries => {
      res.send({ queries });
    })
    .then(e => {
      console.log(e);
      res.status(400).send();
    });
});

//post support
app.post("/support", authenticate, (req, res) => {
  const { category, query } = req.body;
  const queriedAt = new Date().getTime();
  new Support({ category, query, queriedAt, _creator: req.user._id })
    .save()
    .then(query => {
      return Support.populate(query, { path: "_creator", select: "fullName" });
    })
    .then(query => {
      res.send({ query });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//reply to a query in support by admin or sub-admin
app.patch("/support/reply/:id", authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ["text"]);
  body._repliedBy = req.user._id;
  body.repliedAt = new Date().getTime();
  return Support.findByIdAndUpdate(
    id,
    { $push: { reply: body } },
    { new: true }
  )
    .populate([
      {
        path: "reply._repliedBy",
        select: "fullName mobile"
      },
      {
        path: "_creator",
        select: "fullName mobile"
      }
    ])
    .then(query => {
      res.send({ query });
    })
    .catch(e => {
      res.status(e => {
        res.status(400).send(e);
      });
    });
});

//admin to get list of userTypes as array
app.get("/usertype/list", authenticate, (req, res) => {
  // need some validation here to allow only admin to get list, do it later
  UserType.find()
    .then(userTypes => {
      res.send({ userTypes });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

//admin to create a new user Type
app.post("/usertype/create", (req, res) => {
  const body = _.pick(req.body, ["name", "description"]);
  UserType.find()
    .distinct("type")
    .then(types => {
      let newType;
      if (types.length) {
        newType = Math.max(...types) + 1;
      } else {
        newType = 1;
      }
      body.type = newType;
      new UserType(body).save().then(doc => {
        res.send({ userType: doc });
      });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

// edit userType's name and description
app.patch("/userType/edit/:id", (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ["description", "name", "authority"]);
  UserType.findOneAndUpdate({ _id: id }, { $set: body }, { new: true })
    .then(type => {
      res.send({ body, userType: type });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send(e);
    });
});

//admin to remove a user Type
app.delete("/usertype/remove/:id", authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  UserType.findByIdAndRemove(id)
    .then(userType => {
      if (!userType) {
        return res.status(404).send({ userType });
      }
      User.update(
        { userType: userType.type },
        { userType: 16 },
        { multi: true }
      ).then(data => {
        console.log(data);
      });
      res.status(200).send();
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//admin to get list of all users
app.get("/users/list", authenticate, (req, res) => {
  User.find()
    .then(users => {
      res.send({ users });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//admin to activate or assign usertype to a user
app.post("/users/adminupdate/:id", authenticate, (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, [
    "active",
    "accountLocked",
    "userType",
    "accountExpiresOn"
  ]);
  User.findById(id)
    .then(user => {
      if (!user) {
        return res.status(400).send();
      }

      //create default profile with basic data, if exists will update
      //will be useful if user signUp as normal user and admin change it to advocate-basic
      if (user.userType !== body.userType && body.userType === 9) {
        const query = { _creator: user._id };
        const update = {
          $set: {
            fullName: user.fullName,
            contactInfo: {
              mobile: user.mobile
            }
          }
        };
        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        Profile.findOneAndUpdate(query, update, options).catch(e =>
          console.log(e, "error in saving profile!")
        );
      }

      return user.update({
        $set: body
      });
    })
    .then(() => {
      res.status(200).send();
    })
    .catch(e => {
      res.status(400).send();
    });
});

//SignUp route
app.post("/users", (req, res) => {
  var body = _.pick(req.body, ["fullName", "email", "mobile", "password"]);
  body.accountExpiresOn = moment()
    .add(7, "day")
    .valueOf();
  body.secretToken = randomstring.generate(); //to verify email
  if (req.body.userType === 9) {
    //signup as advocate basic
    body.userType = 9;
  }
  var user = new User(body);

  const to = body.email;
  const text = `copy and paste the following code: ${body.secretToken}`;
  const subject = "Verify your account on npaGuru";

  sendVerifyMail(to, subject, text);

  user
    .save()
    .then(user => {
      res.status(200).send({ email: user.email });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//verify account by sending an email with randomString
app.post("/verifyaccount", (req, res) => {
  const secretToken = req.body.secretToken.trim();
  User.findOne({ secretToken })
    .then(user => {
      if (!user) {
        return res.status(404).send();
      }

      //create default profile with basic data
      const query = { _creator: user._id };
      const update = {
        $set: {
          fullName: user.fullName,
          contactInfo: {
            mobile: user.mobile
          }
        }
      };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      Profile.findOneAndUpdate(query, update, options).catch(e =>
        console.log(e, "error in saving profile!")
      );

      return user.update({
        $set: {
          secretToken: "",
          active: true
        }
      });
    })
    .then(() => {
      res.status(200).send();
    })
    .catch(e => {
      res.status(400).send();
    });
});

// POST /users/login {email, password}
app.post("/users/login", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);

  User.findByCredentials(body.email, body.password)
    .then(user => {
      const accountExpired = new Date().getTime() > user.accountExpiresOn;
      if (!user.active) {
        return res
          .status(400)
          .send({ accountActive: false, email: user.email });
      } else if (user.accountLocked) {
        return res.status(400).send({ accountLocked: true });
      } else if (accountExpired) {
        return res.status(400).send({ accountExpired: true });
      }
      return user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send(e);
    });
});

//forgot password || resend code
app.post("/sendVerificationCode", (req, res) => {
  const { email, action } = req.body;
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(404).send();
      }
      const secretToken = randomstring.generate();

      const to = req.body.email;

      let subject, text;
      if (action === "resend") {
        subject = "Verify your account on npaGuru";
        text = `copy and paste the following code: ${secretToken}`;
      } else if (action === "forgot") {
        subject = "reset password on npaGuru";
        text =
          "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
          "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
          "https://advoart.com" +
          "/reset/" +
          secretToken +
          "\n\n" +
          "If you did not request this, please ignore this email and your password will remain unchanged.\n";
      }

      sendVerifyMail(to, subject, text);
      return user.update({
        $set: {
          secretToken
        }
      });
    })
    .then(() => {
      res.status(200).send();
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//reset password
app.post("/reset/:secretToken", (req, res) => {
  const secretToken = req.params.secretToken;
  User.findOne({ secretToken })
    .then(user => {
      if (!user) {
        return res.status(404).send();
      }
      user.password = req.body.password;
      user.secretToken = "";
      return user.save();
    })
    .then(() => {
      res.status(200).send();
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//reset password for authenticated user
app.post("/reset", authenticate, (req, res) => {
  User.findOne({ _id: req.user._id })
    .then(user => {
      if (!user) {
        return res.status(404).send();
      }
      user.password = req.body.password;
      return user.save();
    })
    .then(() => {
      res.status(200).send();
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//update profile status to true
app.get("/user/profilestatus", authenticate, (req, res) => {
  User.findByIdAndUpdate(req.user._id, { profileStatus: true })
    .then(() => {
      res.status(200).send();
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//this route will return a individual authenticated user
//need to write more clear code here, will do it later
app.get("/users/me", authenticate, (req, res) => {
  UserType.findOne({ type: req.user.userType })
    .then(userType => {
      const data = {
        user: req.user,
        authority: userType.authority,
        dashboardInfo: {}
      };
      const allPromises = [];
      const loginDetailsUpadte = User.findByIdAndUpdate(
        req.user._id,
        { $push: { loginDetail: new Date().getTime() } },
        { new: true }
      );
      allPromises.push(loginDetailsUpadte);
      if (userType.type === 9) {
        const totalAssociates = User.find({ _creator: req.user._id })
          .count()
          .then(count => {
            data.dashboardInfo.totalAssociates = count;
          });
        const totalCases = Client.find({ _creator: req.user._id })
          .count()
          .then(count => {
            data.dashboardInfo.totalCases = count;
          });
        allPromises.push(totalAssociates);
        allPromises.push(totalCases);
      }

      return Promise.all(allPromises).then(() => data);
    })
    .then(data => {
      res.send(data);
    })
    .catch(e => {
      console.log(e);
      res.status(400).send();
    });
});

//logout
app.delete("/users/me/token", authenticate, (req, res) => {
  req.user.removeToken(req.token).then(
    () => {
      res.status(200).send();
    },
    () => {
      res.status(400).send();
    }
  );
});

//get profile informations
app.get("/profile/:id", (req, res) => {
  const id = req.params.id;
  Profile.findOne({ _creator: id })
    .populate("_creator", "email")
    .then(profile => {
      if (!profile) {
        return res.status(404).send();
      }
      res.send({ profile });
    })
    .catch(e => {
      console.log(e);
      res.status(400).send(e);
    });
});

//profile image update
app.patch("/profile/image", authenticate, (req, res) => {
  uploadImage(req, res, err => {
    if (err) {
      console.log(err);
      return res.status(400).send(err);
    } else {
      if (!req.file.filename) {
        return res.status(400).send("Error: No file Selected!");
      }
      const _creator = req.user._id;
      const query = { _creator };
      const update = { $set: { _creator, dpUrl: req.file.filename } };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      Profile.findOneAndUpdate(query, update, options)
        .populate("_creator", "email")
        .then(profile => {
          res.send({ dpUrl: profile.dpUrl });
        })
        .catch(e => {
          res.status(400).send();
          console.log(e);
        });
    }
  });
});

//profile info update
app.patch("/profile/:infoSection", authenticate, (req, res) => {
  const infoSection = req.params.infoSection;
  const updateData = {};
  updateData[infoSection] = req.body[infoSection];
  if (infoSection === "bio") {
    // sending fullName under bio section, so we need to separate it
    updateData.fullName = req.body[infoSection].fullName;
  }
  const _creator = req.user._id;
  const query = { _creator };
  const update = { $set: updateData };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  Profile.findOneAndUpdate(query, update, options)
    .populate("_creator", "email")
    .then(profile => {
      if (infoSection === "bio" && req.user.fullName !== profile.fullName) {
        User.findByIdAndUpdate(_creator, {
          $set: { fullName: profile.fullName }
        }).catch(e => console.log(e, "error: update users doc"));
      }
      if (
        infoSection === "contactInfo" &&
        req.user.mobile !== profile.contactInfo.mobile
      ) {
        User.findByIdAndUpdate(_creator, {
          $set: { mobile: profile.contactInfo.mobile }
        }).catch(e => console.log(e, "error: update users doc"));
      }
      res.send({ profile });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//get all appointments
app.get("/appointment", authenticate, (req, res) => {
  Appointment.find({ appointmentTo: req.user._id })
    .populate([
      {
        path: "_creator",
        select: "fullName mobile"
      }
    ])
    .then(appointments => {
      res.send({ appointments });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//book an appointment
app.post("/appointment/:appointmentTo", authenticate, (req, res) => {
  const appointmentTo = req.params.appointmentTo;
  const body = _.pick(req.body, [
    "date",
    "startTime",
    "endTime",
    "description"
  ]);
  body.appointmentTo = appointmentTo;
  body._creator = req.user._id;
  new Appointment(body)
    .save()
    .then(appointment => {
      res.send({ appointment });
    })
    .catch(e => {
      res.status(400).send();
      console.log(e);
    });
});

//client dashboard
app.get("/dashboard/client/:id", authenticate, (req, res) => {
  const id = req.params.id;
  const userId = req.user._id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  const dashboardData = {};
  const files = ClientFile.find({ _creator: userId, _client: id })
    .select("name")
    .then(files => {
      dashboardData.files = files;
    });
  const docs = ClientDoc.find({ _creator: userId, _client: id })
    .select("name url")
    .then(docs => {
      dashboardData.docs = docs;
    });
  const tarikhs = Tarikh.find({ _creator: userId, _client: id })
    .select("date appeared")
    .then(tarikhs => {
      dashboardData.tarikhs = tarikhs;
      dashboardData.tarikhsCount = tarikhs.length;
      let appearedCount = 0,
        notAppearedCount = 0;
      tarikhs.forEach(tarikh => {
        if (tarikh.date < moment().valueOf()) {
          if (tarikh.appeared === true) {
            appearedCount += 1;
          } else if (tarikh.appeared === false) {
            notAppearedCount += 1;
          }
        }
      });
      dashboardData.appearedCount = appearedCount;
      dashboardData.notAppearedCount = notAppearedCount;
    });
  const passbook = Passbook.find({ _creator: userId, _client: id })
    .select("balance")
    .then(passbook => {
      dashboardData.balance = passbook.balance;
    });
  const message = Message.find({ _creator: userId, _client: id })
    .count()
    .then(count => {
      dashboardData.messageCount = count;
    });
  Promise.all([files, docs, tarikhs, passbook, message])
    .then(() => {
      res.send({ dashboardData });
    })
    .catch(e => console.log(e));
});

//Cause List
app.get("/causeList", authenticate, (req, res) => {
  const date = req.body.date;
  Tarikh.find({ _creator: req.user._id })
    .where("date")
    .gt(
      moment(date)
        .sod()
        .valueOf()
    )
    .lt(
      moment(date)
        .endOf()
        .valueOf()
    )
    .populate("_client")
    .exec()
    .then(docs => {
      const allPromises = [];
      const data = {};
      const causeList = [];
      docs.forEach(doc => {
        const clientId = doc._client._id.toString();
        data.clientId = {};
        data.clientId.ClientInfo = doc._client;
        const next = Tarikh.find({
          date: { $gte: doc.date },
          _client: doc._client._id
        })
          .sort({ date: 1 })
          .limit(1)
          .exec()
          .then(next => {
            data.clientId.nextTarikh = {
              date: next.date,
              reason: next.reason,
              conclusion: next.conclusion
            };
          });
        const prev = Tarikh.find({
          date: { $lte: doc.date },
          _client: doc._client._id
        })
          .sort({ date: -1 })
          .limit(1)
          .exec()
          .then(prev => {
            data.clientId.prevTarikh = {
              date: prev.date,
              reason: prev.reason,
              conclusion: prev.conclusion
            };
          });

        allPromises.push(next);
        allPromises.push(prev);
      });
      Promise.all(allPromises).then(() => {
        Object.keys(data).forEach(clientId => {
          causeList.push(data[clientId]);
        });
        res.send({ causeList });
      });
    })
    .catch(e => {
        res.status(400).send();
        console.log(e)
    });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

server.listen(port, () => {
  console.log(`started up at port ${port}`);
});

module.exports = { app };
