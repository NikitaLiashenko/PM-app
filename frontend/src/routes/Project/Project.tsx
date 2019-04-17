import {ManagerStore} from '@/stores';
import links from '@/routes/urls';
import React, {Fragment, Component, SyntheticEvent} from "react";
import {inject, observer} from "mobx-react";
import MainInfo from './Tabs/MainInfo';
import Tasks from './Tabs/Tasks';
import {FormComponentProps} from "antd/lib/form/Form";
import {
  Icon,
  Layout,
  Menu,
  Tabs,
  Form,
} from 'antd';
import {RouteComponentProps, withRouter, Link} from "react-router-dom";

const { Header, Sider, Content } = Layout;
const TabPane = Tabs.TabPane;

import './Project.css';


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
              <div className="title">Project {this.props.managerStore.project.title}</div>
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
                <TabPane tab="Risks" key="3">Content of Tab Pane 3</TabPane>
                <TabPane tab="Team" key="4">Content of Tab Pane 4</TabPane>
                <TabPane tab="Gantt Diagram" key="5">Content of Tab Pane 5</TabPane>
                <TabPane tab="Crash" key="6">Content of Tab Pane 6</TabPane>
              </Tabs>
            </Content>
          </Layout>
        </Layout>
      </Fragment>
    );
  }

}

export default Form.create<Props>()(withRouter(Project));