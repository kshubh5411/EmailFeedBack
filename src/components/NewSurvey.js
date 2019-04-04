import React from 'react'
import SurveyForm from './SurveyForm';
import SurveyReview from './SurveyReview';
import {reduxForm} from 'redux-form';
class NewSurvey extends React.Component
{
     state={
        formSubmit:false
    }

   renderInput()
   {
       if(this.state.formSubmit)
       {
           return(
               <div><SurveyReview
                 onCancel={()=>this.setState({formSubmit:false})}
               />
               </div>
           )
       }
       return(
              <div><SurveyForm onSurveySubmit={()=>this.setState({formSubmit:true})}/></div>
             )
   }
    render()
    {
        return(
                <div>{this.renderInput()}</div>
              )
    }
}
export default reduxForm( {form:"surveyForm"}) (NewSurvey);