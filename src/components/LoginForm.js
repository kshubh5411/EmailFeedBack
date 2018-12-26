import React from 'react';

export default class LoginForm extends React.Component {
    onLoginSubmit = (e) => {
        e.preventDefault();
        this.props.startLogin({
            email: e.target.email.value,
            password: e.target.password.value
        });
    }
    render() {
        return (
            <div>
                {this.props.loginError && <span className="errorSpan">{this.props.loginError}</span>}
                <form onSubmit={this.onLoginSubmit} className="form">
                    <input className="text-input" type="email" name="email" placeholder="email" />
                    <input className="text-input" type="password" name="password" placeholder="password" />
                    <button className="button">Login</button>
                </form>
                <span>Need an account? <button onClick={this.props.handleFormDisplay} className="button button--link">Sign Up</button></span>
            </div>
        )
    }
}