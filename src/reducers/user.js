
 export default (state={},action) =>
 {
     switch(action.type){
         case "ADD_CREDIT":
           return action.user
         default :
           return state;

     }
 }