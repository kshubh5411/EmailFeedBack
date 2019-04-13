import React from 'react';
import AddButton from '../components/AddnewButton';
import {connect} from 'react-redux';
import {fetchSurvey} from '../actions/surveys';



class DashboardPage extends React.Component{
    componentWillMount()
    {
        this.props.fetchSurvey();
    }
    renderInput()
    {
       return this.props.surveys.map((survey)=>
        {   return(
             <div className="container">
               <div  className="cardSurvey">
                  <h3>{survey.title}</h3>
                  <h6>{survey.subject}</h6>
                  <p>{survey.dateSent}</p>
                  <h5><strong>Yes:</strong>{survey.yes}</h5>
                  <h5><strong>No:</strong>{survey.no}</h5>
               </div>
             </div> )

        })
    }
    render()
    {
       return(
           <div>
              
              <AddButton/>
              {this.renderInput()}
           </div>
       )
    }
}
const mapStateToProps=(state)=>
{
    return {surveys:state.surveys}
}
export default connect(mapStateToProps,{fetchSurvey})(DashboardPage); 