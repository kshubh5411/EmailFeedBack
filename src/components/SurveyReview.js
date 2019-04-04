import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import {connect} from 'react-redux';
import {surveySubmit} from '../actions/form'

class ModalExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: true
    };
    this.toggle = this.toggle.bind(this);
  }
  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }
  render() {
      //console.log(this.props.formvalue.title)
    return (
      <div>
        
        <Modal  isOpen={this.state.modal} fade={false} toggle={this.toggle && this.props.onCancel} className={this.props.className}>
          <ModalHeader toggle={this.toggle  && this.props.onCancel}><strong>Review Your Details</strong></ModalHeader>
          <ModalBody>
            <h4>Title</h4>
              <p>{this.props.formvalue.title}</p>
            <h4>Email</h4>
              <p>{this.props.formvalue.email}</p>
            <h4>Body</h4>
              <p>{this.props.formvalue.body}</p>
            <h4>Recipients Email List</h4>
              <p>{this.props.formvalue.recipients}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="danger"   onClick={this.toggle && this.props.onCancel}>BACK</Button>{' '}
            <Button color="primary"  onClick={()=>this.props.surveySubmit(this.props.formvalue)}>SEND</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
const mapStateToProps=(state)=>
{
    return{
        formvalue:state.form.surveyForm.values
    }
}
export default  connect(mapStateToProps,{surveySubmit})(ModalExample);