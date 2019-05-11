import links from '@/routes/urls';
import { AuthStore } from '@/stores';
import actions from '@/actions';
import {Form, Row, Col, Button, Icon, Input, notification, Spin, Card, Checkbox} from 'antd';
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
      <Row className="full-height content-background">
        <Col span={24}>
          <div className="content-container">
            <Row type="flex" justify="space-around" align="middle" className="full-height">
              <Col span={6}>
                <Card className="center">
                  <div className="login-title">Sign In</div>
                  <Form onSubmit={this.login} className="full-width">
                    <Form.Item>
                      {getFieldDecorator('email', {
                        rules : [
                          {
                            required : true,
                            message : 'Please enter a valid email address'
                          }
                        ]
                      })(
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} className="login-input full-width" placeholder="Your email" size="large" />
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
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} className="login-input full-width" type="password" placeholder="Your password" size="large" />
                      )}
                    </Form.Item>
                    <Form.Item style={{marginTop : '24px'}}>
                      <Button shape="round" loading={isLoading} icon="login" htmlType="submit" className="login-form-button">
                        Sign in
                      </Button>
                      <div className="invite-sign-up">No account? <Link to={links.signup}>Sign Up</Link></div>
                    </Form.Item>
                  </Form>
                </Card>
                <div className="full-width card-footer">
                  <Row type="flex" justify="space-around" align="middle">
                    <Col span={12}>
                      <div className="social-sign-in">or Sign In with:</div>
                      <Row type="flex" justify="space-around" align="middle">
                        <Icon type="facebook" className="social-icon" />
                        <Icon type="twitter" className="social-icon"/>
                        <Icon type="google-plus" className="social-icon"/>
                      </Row>
                    </Col>
                  </Row>
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