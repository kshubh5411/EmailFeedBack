
const checkCredit =(req,res,next)=>
{
    if(req.user.credit<1)
    {
        return res.status(403).send({error:"Please Credit Your Balance"});
    }
    next();
}
module.exports={checkCredit};