import React from 'react';
import StripePayments from 'react-stripe-checkout';
import {connect} from 'react-redux';
import {handleToken} from '../actions/user';
class Payments extends React.Component{
    
    render()
    {
        return(
            <StripePayments
            name="FeedyBack"
            description="Pay 5$ for Feedback Response"
            amount={500}
            token={token=>this.props.handleToken(token)}
            stripeKey={process.env.REACT_APP_PUBLISH_KEY}
            />
        )
    }
}
export default connect(null,{handleToken})(Payments);