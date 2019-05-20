import {ManagerStore} from '@/stores';
import links from '@/routes/urls';
import React, {Fragment, Component, SyntheticEvent} from "react";
import {inject, observer} from "mobx-react";
import MainInfo from './Tabs/MainInfo';
import Tasks from './Tabs/Tasks';
import Risks from './Tabs/Risks';
import Gantt from './Tabs/Gantt';
import Team from './Tabs/Team';
import Crash from './Tabs/Crash';
import {FormComponentProps} from "antd/lib/form/Form";
import {
  Icon,
  Layout,
  Menu,
  Tabs,
  Form,
  Button, Col, Row
} from 'antd';
import {RouteComponentProps, withRouter, Link} from "react-router-dom";

const { Header, Sider, Content } = Layout;
const TabPane = Tabs.TabPane;

import './Project.css';
import actions from "@/actions";


type Props = {
  managerStore : ManagerStore
};

type State = {
  isUpdating : boolean,
  openTaskView : boolean
};

@inject('managerStore')
@observer
class Project extends Component<Props & RouteComponentProps & FormComponentProps, State>{

  handleLogout = () => {
    actions.logout();
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
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
                  <div className="title">Project {this.props.managerStore.project.title}</div>
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
              <Tabs
                defaultActiveKey="1"
              >
                <TabPane tab="Main Info" key="1">
                  <MainInfo managerStore={this.props.managerStore} projectId={(this.props.match.params as any).projectId}/>
                </TabPane>
                <TabPane tab="Tasks" key="2">
                  <Tasks managerStore={this.props.managerStore} projectId={(this.props.match.params as any).projectId}/>
                </TabPane>
                <TabPane tab="Risks" key="3">
                  <Risks managerStore={this.props.managerStore} projectId={(this.props.match.params as any).projectId}/>
                </TabPane>
                <TabPane tab="Team" key="4">
                  <Team managerStore={this.props.managerStore} projectId={(this.props.match.params as any).projectId}/>
                </TabPane>
                <TabPane tab="Gantt Diagram" key="5" style={{ height : '80vh'}}>
                  <Gantt managerStore={this.props.managerStore} projectId={(this.props.match.params as any).projectId}/>
                </TabPane>
                <TabPane tab="Crash" key="6">
                  <Crash managerStore={this.props.managerStore} projectId={(this.props.match.params as any).projectId}/>
                </TabPane>
              </Tabs>
            </Content>
          </Layout>
        </Layout>
      </Fragment>
    );
  }

}

export default Form.create<Props>()(withRouter(Project));