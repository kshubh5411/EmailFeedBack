const mongoose= require("mongoose");

const recipientSchema=mongoose.Schema(
    {
        email:String,
        respond:{type:Boolean,default:false}
    }
)
const recipient=mongoose.model('recipient',recipientSchema);
module.exports={recipient};