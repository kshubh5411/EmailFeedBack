const mongoose= require('mongoose');
const recipient=require('./recipient');

const surveySchema= new mongoose.Schema(
    {
       title:String,
       body:String,
       subjects:String,
       recipients:[recipient],
       yes:{type:Number,default:0},
       no:{type:Number,default:0},
       _user:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
       dateSent:Date,
       dateRespond:Date
    }
);

module.exports= mongoose.model("Survey",surveySchema);