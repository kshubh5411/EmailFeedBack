import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {startLogout} from '../actions/auth';
import Payments from './Payments';
import onAuthStateChanged from '../app';
import {fetchUser} from '../actions/user';

class Header extends React.Component{
    
    componentDidMount()
    {
       this.props.fetchUser();
    }

    onClick=()=>
    {
        this.props.startLogout();
    }
    render()
    {
        
        console.log(this.props.credit);
        return(
            <header className="header">
             <div className="content-container">
               <div className="header__content">
                    <Link to="/dashboard" className="header__title">
                        <h1>React-node-auth</h1>
                    </Link>
                    <li><Payments/></li> 
                    <button>Credit:{this.props.credit}</button>
                    <button className="button button--link" onClick={this.onClick}>Logout</button>
               </div>
             </div>
            </header>   )
    }
}


const mapStateToProps =(state)=>
{
   return{ credit:state.user.credit}
}

export default connect(mapStateToProps,{startLogout,fetchUser})(Header);