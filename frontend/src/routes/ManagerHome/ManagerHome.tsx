import {ManagerStore} from '@/stores';
import links from '@/routes/urls';
import actions from '@/actions';
import React, {Fragment, Component, SyntheticEvent} from "react";
import {inject, observer} from 'mobx-react';
import {FormComponentProps} from "antd/lib/form/Form";
import {
  Layout,
  Menu,
  Icon,
  Typography,
  Row,
  Col,
  Divider,
  Badge,
  Card,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber
} from 'antd';

import {CirclePicker} from 'react-color';
import {RouteComponentProps, withRouter, Link} from "react-router-dom";

const { Header, Sider, Content } = Layout;
const {Text} = Typography;

import './ManagerHome.css';

type Props = {
  managerStore : ManagerStore
};

type State = {
  modalVisible : boolean,
  project : object,
  modalOkEnabled : boolean
};

@inject('managerStore')
@observer
class ManagerHome extends Component<Props & RouteComponentProps & FormComponentProps, State>{

  state = {
    modalVisible : false,
    project : {},
    modalOkEnabled : false
  };

  componentWillMount(): void {
    actions.getAllProjects()
    .catch(error => {
      console.error(error);
    });
  }

  handleModalSubmit(){

  }

  handleModalCancel(){
    this.props.form.resetFields();
    this.setState({
      project : {},
      modalVisible : false
    })
  }

  openCreateProjectModal(){
    this.setState({
      modalVisible : true
    })
  }

  render(){
    const { getFieldDecorator } = this.props.form;
    return(
      <Fragment>
        <Layout className="full-height">
          <Sider
            breakpoint="lg"
            collapsedWidth="0"
            theme="dark"
            width={'15%'}
          >
            <div className="logo">ProPlanner</div>
            <Menu mode="inline" theme="dark" defaultSelectedKeys={['1']}>
              <Menu.Item key="1">
                <Link to={links.managerHome}>
                <Icon type="home" />
                <span className="menu-text">Home</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Icon type="team" />
                <span className="menu-text">Team</span>
              </Menu.Item>
              <Menu.Item key="3">
                <Icon type="calendar" />
                <span className="menu-text">Calendar</span>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Header style={{ background: '#fff', padding: 0 }}>
              <div className="title">Home</div>
            </Header>
            <Content style={{
              padding: 24,
              minHeight: 280,
              backgroundColor : 'white'
            }}
            >
              <Row>
                <Col span={24}>
                  <div className="content-container">
                    <Row type="flex" justify="space-around" align="top" className="full-height">
                      <Col span={12}>
                        <div>
                          <Row>
                            <Text className="projects-title">Projects</Text>
                            <Badge count={this.props.managerStore.projectsList.length}
                                   style={{
                                     backgroundColor: '#fff',
                                     color: '#999',
                                     boxShadow: '0 0 0 1px #d9d9d9 inset',
                                     marginBottom : '5px'
                                   }} />
                          </Row>
                          <Divider />
                          <Row type="flex" justify="start" align="top">
                            {this.props.managerStore.projectsList.length ?
                              this.props.managerStore.projectsList.map((element, i) =>
                                <div key={i}>
                                  <Card className="project-card" bodyStyle={{
                                    height : '180px',
                                    cursor : 'pointer'
                                  }} style={{ backgroundColor : element.ui.color}}>
                                    <Row type="flex" justify="space-around" align="middle" style={{height : '100%'}}>
                                      <Col span={12}>
                                      <div className="center">

                                        <Icon type="project" rotate={-90} style={{ fontSize : '32px', color : "white"}}/>

                                      </div>
                                      </Col>
                                    </Row>
                                  </Card>
                                  <Row type="flex" justify="space-around">
                                    <Text className="project-card-title">{element.title}</Text>
                                  </Row>
                                </div>) :
                              ``}
                            <div>
                              <Card className="project-card new-project-card"
                                    bodyStyle={{
                                      height : '180px',
                                      cursor : 'pointer'
                                    }}
                                    onClick={() => this.openCreateProjectModal()}>
                                <Row type="flex" justify="space-around" align="middle" style={{height : '100%'}}>
                                  <Col span={12}>
                                    <div className="center">

                                      <Icon type="plus" style={{ fontSize : '32px'}}/>

                                    </div>
                                  </Col>
                                </Row>
                              </Card>
                              <Row type="flex" justify="space-around">
                                <Text className="project-card-title">Create Project</Text>
                              </Row>
                            </div>
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Content>
          </Layout>
        </Layout>

        <Modal
          title="Create project"
          centered
          visible={this.state.modalVisible}
          onOk={() => this.handleModalSubmit()}
          onCancel={() => this.handleModalCancel()}
          okButtonProps={{ disabled: this.state.modalOkEnabled }}
          okText="Create"
        >
          <Form layout="vertical">
            <Form.Item label="Title">
              {getFieldDecorator('title', {
                rules: [
                  {
                    required: true,
                    message: 'Please input the title of project!'
                  }
                ],
              })(
                <Input />
              )}
            </Form.Item>
            <Form.Item label="Description">
              {getFieldDecorator('description')(<Input.TextArea />)}
            </Form.Item>
            <Form.Item
              label="Project start date"
            >
              {getFieldDecorator('date-picker', {
                rules: [
                  {
                    // type: 'object',
                    required: true,
                    message: 'Please select project start date!'
                  }
                ]
              })(
                <DatePicker className="full-width"/>
              )}
            </Form.Item>
            <Form.Item label="Overhead cost per day">
              {getFieldDecorator('overheadCost', {
                rules: [
                  {
                    required: true,
                    message: 'Please input overhead cost of the project!'
                  }
                ],
              })(
                <InputNumber min={0} className="full-width"/>
              )}
            </Form.Item>
            <Form.Item label="Project color">
              {getFieldDecorator('color', {
                rules: [
                  {
                    required: true,
                    message: 'Please select project color!'
                  }
                ],
              })(
                <CirclePicker />
              )}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default Form.create<Props>()(withRouter(ManagerHome));