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
  InputNumber,
  Button
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
  confirmLoading : boolean
};

@inject('managerStore')
@observer
class ManagerHome extends Component<Props & RouteComponentProps & FormComponentProps, State>{

  state = {
    modalVisible : false,
    confirmLoading: false,
  };

  componentWillMount(): void {
    actions.manager.getAllProjects()
    .catch(error => {
      console.error(error);
    });
  }

  handleModalSubmit(e : SyntheticEvent){
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({
          confirmLoading : true
        });
        actions.manager.createNewProject({
          title : values.title,
          description : values.description,
          startDate : values.startDate.format('YYYY-MM-DD'),
          overheadCostPerDay : values.overheadCost,
          ui : {
            color : values.color.hex
          }
        })
          .then(() => {
            this.setState({
              confirmLoading : false,
              modalVisible : false
            });
          })
          .catch((actionError) => {
            console.error(actionError);
          });
      } else {
        console.error(err);
      }
    });
  }

  handleModalCancel(){
    this.props.form.resetFields();
    this.setState({
      modalVisible : false
    })
  }

  openCreateProjectModal(){
    this.setState({
      modalVisible : true
    })
  }

  handleOpenProject(projectId : any) {
    this.props.history.push(`/project/${projectId}`, {projectId});
  };

  handleLogout = () => {
    actions.logout();
  };

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
                <Link to={links.managerTeam}>
                <Icon type="team" />
                <span className="menu-text">Team</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to={links.managerCalendar}>
                <Icon type="calendar" />
                <span className="menu-text">Calendar</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="4">
                <Link to={links.managerRateCard}>
                  <Icon type="dollar" />
                  <span className="menu-text">Rate Card</span>
                </Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Header style={{ background: '#fff', padding: 0 }}>
              <Row>
                <Col span={20}>
                  <div className="title">Home</div>
                </Col>
                <Col span={4}>
                  <Button type="primary" shape="round" onClick={this.handleLogout}>Logout</Button>
                </Col>
              </Row>
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
                      <Col span={20}>
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
                          <Row type="flex" justify="space-between" align="top">
                            {this.props.managerStore.projectsList.length ?
                              this.props.managerStore.projectsList.map((element, i) =>
                                <div key={i}>
                                  <Card className="project-card"
                                        bodyStyle={{
                                          cursor : 'pointer'
                                        }}
                                        onClick={() => this.handleOpenProject(element.projectId)}
                                        cover={<img alt="example" src={`../${i}.jpg`} style={{height : '120px', width : '190px'}}/>}
                                        actions={[<Icon type="setting" />, <Icon type="edit" />, <Icon type="ellipsis" />]}
                                  >
                                    <Card.Meta
                                      title={element.title}
                                    ></Card.Meta>
                                  </Card>
                                </div>) :
                              ``}
                            <div>
                              <Card className="new-project-card"
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
          onOk={(e) => this.handleModalSubmit(e)}
          onCancel={() => this.handleModalCancel()}
          confirmLoading={this.state.confirmLoading}
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
              {getFieldDecorator('startDate', {
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
                <CirclePicker/>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default Form.create<Props>()(withRouter(ManagerHome));