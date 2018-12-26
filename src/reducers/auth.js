const authReducerDefaultState = {
    error: {
        loginError: '',
        signUpError: ''
    }
}

export default (state = authReducerDefaultState, action) => {
    switch(action.type) {
        case 'LOGIN': 
            return {
                ...state,
                ...action.user
            }
        case 'LOGOUT':
            return {
                ...authReducerDefaultState
            }
        case 'ALERT':
            return {
                ...state,
                error: action.error
            }
        default: 
            return state;
    }
}