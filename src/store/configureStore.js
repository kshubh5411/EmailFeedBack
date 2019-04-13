import thunk from 'redux-thunk';
import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import authReducer from '../reducers/auth';
import userReducer from '../reducers/user';
import surveysReducer from '../reducers/surveys';
import {reducer as ReduxForm} from 'redux-form';

const composeEnhacers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
    const store = createStore(
        combineReducers({
            auth: authReducer,
            user: userReducer,
            form:ReduxForm,
            surveys:surveysReducer,
        }),
        composeEnhacers(applyMiddleware(thunk))
    )
    return store;
}