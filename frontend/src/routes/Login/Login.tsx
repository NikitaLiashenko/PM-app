import links from '@/routes/urls';
import { AuthStore } from '@/stores';
import actions from '@/actions';
import {Form, Row, Col, Button, Icon, Input, notification} from 'antd';
import {FormComponentProps} from "antd/lib/form/Form";
import {inject, observer} from 'mobx-react';
import React, {Component, SyntheticEvent} from 'react';
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import './Login.css';

type Props = {
  authStore : AuthStore
};

@inject('authStore')
@observer
class Login extends Component<Props & RouteComponentProps & FormComponentProps> {

  login = (e : SyntheticEvent) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err){

        actions.login({
          ...values
        })
        .then((role) => {
          if(role === 'Manager'){
            this.props.history.push(links.managerHome);
          } else {
            this.props.history.push(links.adminHome);
          }
        })
        .catch((actionError) => {
          console.error(actionError);

          this.props.form.setFields({
            email : {
              value : values.email,
              errors : [new Error(actionError)]
            }
          });
        });
      }
    });
  };

  componentDidMount(): void {
    if(this.props.location.state && this.props.location.state.message){
      notification.success({
        message: 'Verify email',
        description: 'Please click on the link that has just been sent to your email account to verify your email and finish the registration process.'
      });
    }
  }

  render(){
    const { getFieldDecorator } = this.props.form;
    const {isLoading} = this.props.authStore;

    return(
      <Row className="full-height">
        <Col span={24}>
          <div className="content-container">
            <Row type="flex" justify="space-around" align="middle" className="full-height">
              <Col span={12}>
                <div className="home-center">
                  <div className="login-title">Login</div>
                  <Form onSubmit={this.login}>
                    <Form.Item>
                      {getFieldDecorator('email', {
                        rules : [
                          {
                            required : true,
                            message : 'Please enter a valid email address'
                          }
                        ]
                      })(
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} className="login-input" placeholder="Email" />
                      )}
                    </Form.Item>
                    <Form.Item>
                      {getFieldDecorator('password', {
                        rules : [
                          {
                            required : true,
                            message : 'Please input your password'
                          }
                        ]
                      })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} className="login-input" type="password" placeholder="Password" />
                      )}
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" disabled={isLoading} htmlType="submit" className="login-form-button">
                        Log in
                      </Button>
                      <br/>
                      Or <Link to={links.signup}>register now!</Link>
                    </Form.Item>
                  </Form>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    );
  }
}

export default Form.create<Props>()(withRouter(Login));