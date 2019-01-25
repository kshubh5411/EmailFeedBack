var mongoose = require('mongoose');

var userCreditSchema = new mongoose.Schema(
    {
        user_id:mongoose.Schema.Types.ObjectId,
        credit:{type:Number,default:0}
    }
)
const userCredit = mongoose.model("usercredit",userCreditSchema);
module.exports ={ userCredit };