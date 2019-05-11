import links from '@/routes/urls';
import {AuthStore} from '@/stores';
import actions from '@/actions';
import {Form, Row, Col, Button, Icon, Input, Spin, Card, Checkbox} from 'antd';
import {FormComponentProps} from "antd/lib/form/Form";
import {inject, observer} from 'mobx-react';
import React, {Component, SyntheticEvent} from 'react';
import {Link, RouteComponentProps, withRouter} from "react-router-dom";
import './Register.css';

type Props = {
  authStore: AuthStore
};

type State = {
  isLoading: boolean,
  confirmDirty : boolean
};

@inject('authStore')
@observer
class Register extends Component<Props & RouteComponentProps & FormComponentProps, State> {
  state = {
    isLoading: false,
    confirmDirty : false
  };

  register = (e: SyntheticEvent) => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({isLoading: true});

        actions.register({
          ...values
        })
        .then(() => {
          this.setState({isLoading: false});
          this.props.history.push({
            pathname: links.signin,
            state: {
              message: 'Please check your email and verify email address'
            }
          });
        })
        .catch(actionError => {
          this.setState({isLoading : false});
          console.error(actionError);

          this.props.form.setFields({
            email: {
              value: values.email,
              errors: [new Error(actionError)]
            }
          });
        });
      }
    });
  };

  handleConfirmBlur = (e : any) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  compareToFirstPassword = (rule : any, value : any, callback : any) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule : any, value : any, callback : any) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };


  render(){
    const {getFieldDecorator} = this.props.form;
    const {isLoading} = this.state;
    return (
      <Row className="full-height content-background">
        <Col span={24}>
          <div className="content-container">
            <Row type="flex" justify="space-around" align="middle" className="full-height">
              <Col span={6}>
                <Card className="center">
                  <div className="register-title">Sign Up</div>
                  <Form onSubmit={this.register}>
                    <Form.Item>
                      {getFieldDecorator('email', {
                        rules : [
                          {
                            required : true,
                            message : 'Please enter a valid email address'
                          }
                        ]
                      })(
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} className="register-input full-width" placeholder="Your email" size="large"/>
                      )}
                    </Form.Item>
                    <Form.Item>
                      {getFieldDecorator('password', {
                        rules : [
                          {
                            required : true,
                            message : 'Please input your password'
                          },
                          {
                            validator: this.validateToNextPassword,
                          }
                        ]
                      })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} className="register-input full-width" type="password" placeholder="Your password" size="large" />
                      )}
                    </Form.Item>
                    <Form.Item>
                      {getFieldDecorator('confirm', {
                        rules : [
                          {
                            required : true,
                            message : 'Please confirm your password'
                          },
                          {
                            validator: this.compareToFirstPassword,
                          }
                        ]
                      })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} className="register-input full-width" type="password" placeholder="Confirm password" size="large"/>
                      )}
                    </Form.Item>
                    <Checkbox className="terms-conditions">Accept the <a>Terms and Conditions</a></Checkbox>
                    <Form.Item style={{marginTop : '24px'}}>
                      <Button shape="round" loading={isLoading} icon="arrow-up" htmlType="submit" className="register-form-button" onBlur={this.handleConfirmBlur}>
                        Sign Up
                      </Button>
                      <div className="invite-sign-in">Have an account? <Link to={links.signin}>Sign In</Link></div>
                    </Form.Item>
                  </Form>
                </Card>
                <div className="full-width card-footer">
                  <Row type="flex" justify="space-around" align="middle">
                    <Col span={12}>
                      <div className="social-sign-in">or Sign Up with:</div>
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

export default Form.create<Props>()(withRouter(Register));