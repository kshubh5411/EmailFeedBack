import axios from 'axios';
import onAuthStateChanged from '../app'; 

export const alert = (error) => ({
    type: 'ALERT',
    error
})

export const login = (user) => ({
    type: 'LOGIN',
    user
})

export const startSignUp = (user) => {
    return (dispatch) => {
        return axios.post('/users', {
            ...user
        }).then((response) => {
            localStorage.setItem('x-auth', response.headers['x-auth'])
            onAuthStateChanged();
        }).catch((e) => {
            dispatch(alert({signUpError: 'Email has already been taken'}))
        })
    }
}

export const startLogin =  (user) => {
    return (dispatch) => {
        return axios.post('/users/login', {
            ...user
        }).then((response) => {
            localStorage.setItem('x-auth', response.headers['x-auth'])
            onAuthStateChanged();
        }).catch((e) => {
            dispatch(alert({loginError: 'Email or password is incorrect'}))
        })
    }
}

export const logout = () => ({
    type: 'LOGOUT',
})

export const startLogout = () => {
    return () => {
        return axios({
            method:'get',
            url:'/users/me/token',
            headers: {'x-auth': localStorage.getItem('x-auth')}
          }).then(() => {
            localStorage.removeItem('x-auth');
            onAuthStateChanged();
          })
    }
}
