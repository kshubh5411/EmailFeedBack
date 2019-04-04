import React from 'react';

export default class SignupForm extends React.Component {
    state = {
        validationError: ''
    }
    onSignupSubmit = (e) => {
        e.preventDefault();
        const fullName = e.target.fullName.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmPassword = e.target.confirmPassword.value;
        if(!fullName) {
            this.setState({validationError: 'full name is required'});
        } else if(!email) {
            this.setState({validationError: 'email is required'});
        } else if (password.length < 6){
            this.setState({validationError: 'minimun 6 alphanumeric character is required for password'});
        } else if (password !== confirmPassword) {
            this.setState({validationError: 'passwords do not match'});
        } else {
            this.setState({validationError: ''});
            console.log({fullName, email, password});
            this.props.startSignUp({fullName, email, password});
        }
    }
    render() {
        return (
            <div>
                {this.state.validationError ? (
                    <span className="errorSpan">{this.state.validationError}</span>
                ) : (
                    <span className="errorSpan">{this.props.signUpError}</span>
                )}
                <form onSubmit={this.onSignupSubmit} className="form">
                    <input className="text-input" type="text" name="fullName" placeholder="full name"/>
                    <input className="text-input" type="email" name="email" placeholder="email"/>
                    <input className="text-input" type="password" name="password" placeholder="password"/>
                    <input className="text-input" type="password" name="confirmPassword" placeholder="confirm password"/>
                    <button className="button">Sign Up</button>
                </form>
                <span>Already have an account? <button onClick={this.props.handleFormDisplay} className="button button--link">Log In</button></span>
            </div>
        )
    }
}
