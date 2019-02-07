const mongoose= require("mongoose");

const recipientSchema=new mongoose.Schema(
    {
        email:String,
        respond:{type:Boolean,default:false}
    }
)
module.exports= recipientSchema;