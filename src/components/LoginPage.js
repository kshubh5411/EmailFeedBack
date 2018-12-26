import React from 'react';
import { connect } from 'react-redux';
import { startSignUp, startLogin } from '../actions/auth';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export class LoginPage extends React.Component {
    state = {
        showSignupForm: true
    }
    handleFormDisplay = () => {
        this.setState((prevState) => ({
            showSignupForm: !prevState.showSignupForm
        }))
    }
    handleForm
    render() {
        return (
            <div className="box-layout">
                <div className="box-layout__box">
                    <h1 className="box-layout__title">Node + React JWTauth</h1>
                    <p>Get started - it's free.</p>
                    {this.state.showSignupForm ? (
                        <div>
                            <SignupForm 
                                startSignUp={this.props.startSignUp}
                                signUpError={this.props.signUpError}
                                handleFormDisplay={this.handleFormDisplay}
                            />
                        </div>
                    ) : (
                            <div>
                                <LoginForm 
                                    startLogin={this.props.startLogin}
                                    loginError={this.props.loginError}
                                    handleFormDisplay={this.handleFormDisplay}
                                />
                            </div>
                        )}
                </div>
            </div>
        )
    }
}
    
const mapStateToProps = (state) => ({
    loginError: state.auth.error.loginError,
    signUpError: state.auth.error.signUpError
})

const mapDispatchToProps = (dispatch) => ({
    startSignUp: (user) => dispatch(startSignUp(user)),
    startLogin: (user) => dispatch(startLogin(user))
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);