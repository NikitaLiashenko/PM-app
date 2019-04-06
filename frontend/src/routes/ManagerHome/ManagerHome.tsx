import {ManagerStore} from '@/stores';
import links from '@/routes/urls';
import actions from '@/actions';
import React, {Component, SyntheticEvent} from "react";
import {inject, observer} from 'mobx-react';
import {
  Layout,
  Menu,
  Icon,
  Typography,
  Row,
  Col,
  Divider,
  Badge,
  Card
} from 'antd';
import {RouteComponentProps, withRouter, Link} from "react-router-dom";

const { Header, Sider, Content } = Layout;
const {Text} = Typography;

import './ManagerHome.css';

type Props = {
  managerStore : ManagerStore
};

@inject('managerStore')
@observer
class ManagerHome extends Component<Props & RouteComponentProps>{

  componentWillMount(): void {
    actions.getAllProjects()
    .catch(error => {
      console.error(error);
    });
  }

  render(){
    return(
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
                                  height : '180px'
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
                            <Card className="project-card new-project-card" bodyStyle={{
                              height : '180px'
                            }}>
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
    );
  }
}

export default withRouter(ManagerHome);