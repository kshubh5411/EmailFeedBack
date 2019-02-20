import thunk from 'redux-thunk';
import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import authReducer from '../reducers/auth';
import userReducer from '../reducers/user';
import {reducer as ReduxForm} from 'redux-form';

const composeEnhacers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
    const store = createStore(
        combineReducers({
            auth: authReducer,
            user: userReducer,
            form:ReduxForm
        }),
        composeEnhacers(applyMiddleware(thunk))
    )
    return store;
}