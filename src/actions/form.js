import {history} from '../routers/AppRouter';
import {User} from './user';
import axios from 'axios';
//FETCH USER
export const fetchUser = user =>(
    {
        type:"FETCH_USER",
        user
    })
   
export const surveySubmit = values=>{
    console.log(values);
    return async(dispatch)=>{
        const res=await axios.post('/api/surveys',values,{headers: { 'x-auth': localStorage.getItem('x-auth')}});
            console.log(res.data);
        dispatch(fetchUser(res.data));
        history.push('/surveys');
    }
    
};