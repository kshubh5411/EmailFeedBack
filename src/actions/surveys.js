import axios from 'axios';

export const fetchSurvey = () =>
 {
     return async (dispatch)=>{
         const response= await axios.get('/api/surveys',{
            headers: { 'x-auth': localStorage.getItem('x-auth') }});
         dispatch({type:'FETCH_SURVEYS',payload:response.data});
     }
 }
 