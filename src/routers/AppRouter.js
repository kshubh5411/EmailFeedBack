import React from 'react';
import { Router, Route, Switch} from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import createHistory from 'history/createBrowserHistory'
import Dashboard from '../components/Dashboard';
import NotFoundPage from '../components/NotFoundPage';
import LoginPage from '../components/LoginPage';
import NewSurvey from '../components/NewSurvey';

export const history = createHistory();

const AppRouter = () => ( 
    <Router history={history}>
        <div>
            <Switch>
                <PublicRoute path="/" component={LoginPage} exact={true}/>
                <PrivateRoute exact path="/surveys" component={Dashboard} /> 
                <PrivateRoute path="/surveys/new" component={NewSurvey} />
                <Route component={NotFoundPage} />
            </Switch>
        </div>
    </Router>
);

export default AppRouter;
