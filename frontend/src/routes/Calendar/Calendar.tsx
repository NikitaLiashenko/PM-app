import {ManagerStore} from '@/stores';
import links from '@/routes/urls';
import actions from '@/actions';
import React, {Fragment, Component} from 'react';
import {inject, observer} from "mobx-react";
import {
  Layout,
  Menu,
  Icon,
  Typography,
  Tabs
} from 'antd';
import CalendarView from './CalendarView';

import {RouteComponentProps, withRouter, Link} from "react-router-dom";

const {Header, Sider, Content} = Layout;
const {Text} = Typography;
const TabPane = Tabs.TabPane;

import './Calendar.css';

type Props = {
  managerStore : ManagerStore
};

@inject('managerStore')
@observer
class Calendar extends Component<Props & RouteComponentProps> {

  componentWillMount(): void {
    actions.getAllCalendars()
      .catch(console.error);
  }

  render() {
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
            <Menu mode="inline" theme="dark" defaultSelectedKeys={['3']}>
              <Menu.Item key="1">
                <Link to={links.managerHome}>
                  <Icon type="home" />
                  <span className="menu-text">Home</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link to={links.team}>
                  <Icon type="team" />
                  <span className="menu-text">Team</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to={links.calendar}>
                  <Icon type="calendar" />
                  <span className="menu-text">Calendar</span>
                </Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Header style={{ background: '#fff', padding: 0 }}>
              <div className="title">Calendar</div>
            </Header>
            <Content style={{
              padding: 24,
              minHeight: 280,
              backgroundColor : 'white'
            }}
            >
              <Tabs defaultActiveKey="1">
                {this.props.managerStore.calendars.length ?
                  this.props.managerStore.calendars.map((calendar, i) =>
                  <TabPane tab={calendar.location} key={`${i + 1}`} style={{ height : '80vh'}}>
                    <CalendarView managerStore={this.props.managerStore} holidays={calendar.holidays} location={calendar.location as string}/>
                  </TabPane>):
                ''}
              </Tabs>
            </Content>
          </Layout>
        </Layout>
      </Fragment>
    );
  }
}

export default withRouter(Calendar);