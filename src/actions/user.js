import axios from 'axios';

 const addCredit = user =>(
 {
     type:"ADD_CREDIT",
     user
 })
 export const fetchCredit = ()=>
 {
     return async (dispatch,getState)=>
     {
         const response=await axios.get('/user/credit',{ 
         headers: { 'x-auth': localStorage.getItem('x-auth') }});
         dispatch(addCredit(response.data));
     }
 }
 export const handleToken = token =>
 {
     return async (dispatch,getState)=>{
        const response= await axios.post('/api/stripe',token,{ 
        headers: { 'x-auth': localStorage.getItem('x-auth') }});
        dispatch(addCredit(response.data));
     }
 }

 