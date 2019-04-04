
import React from 'react';
import { Button, Form, FormGroup, Input, Alert,Label,FormText,FormControl } from "reactstrap";
import {reduxForm,Field} from 'redux-form';
import verifyRecipientList from './VerifyEmails';
import {Link} from 'react-router-dom';

// Custom  Components
const SurveyField = ({input , meta: { error, touched }}) => {
    return(
        <div>
          <Input {...input} style={{ marginBottom: '2px',height:"40px" }} />
          <div  style={{ color:"red",marginBottom: '5px' }}>
            {touched && error}
          </div>
      </div>)
    };


class  SurveyForm extends React.Component{
      render(){
          const {handleSubmit,onSurveySubmit}=this.props;
        return (
             <div className="container" ><h1 style={{textAlign:'center'}}>Enter all The Details</h1>

             <Form onSubmit={handleSubmit(onSurveySubmit)} style={{paddingTop:"7px"}}>

                <FormGroup style={{ display: 'flex', flexDirection: 'column'}}>
                    <Label>Title</Label>
                    <Field  name="title" type="text"  component={SurveyField} />
                </FormGroup>
                <FormGroup style={{ display: 'flex', flexDirection: 'column'}}>
                    <Label>Email</Label>
                    <Field  name="email" type="email"  component={SurveyField} />
                </FormGroup>
                <FormGroup style={{ display: 'flex', flexDirection: 'column'}}>
                    <Label>Body</Label>
                    <Field  name="body" type="text"  component={SurveyField} />

                </FormGroup>
                <FormGroup style={{ display: 'flex', flexDirection: 'column'}}>
                    <Label>Recipients Email</Label>
                    <Field  name="recipients" type="textarea"  component={SurveyField} />
                </FormGroup>
                <div>
                <Link to="/surveys"><Button style={{float:"left", paddingButton:"5px"}} color="danger" size="lg">Cancel</Button>{' '}</Link>
               </div>
                <div>
                   <Button style={{float:"right", paddingButton:"5px"}} color="success" size="lg">Submit</Button>{' '}
                </div>

             </Form>
            </div>
        )
      }
    }
// Validating Error in Redux Form====
 const validate=(value)=>
 {
     const error={};
      const err=verifyRecipientList(value.recipients||'');
      if(err)
       {
           error.recipients=err;
       }
     if (!value.title) {
        error.title= 'Title must Required'
      } 
      
      if (!value.email) {
        error.email = 'Email must Required'
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value.email)) {
        error.email = 'Invalid email address'
      }
      if (!value.body) {
        error.body= 'Body must Required'
      } 
    if(!value.recipients)
       error.recipients='Please Provide Recipients List'
      return error;
 }

export default reduxForm(
    {   validate,     
        form:"surveyForm",
        destroyOnUnmount:false
    }
)(SurveyForm);