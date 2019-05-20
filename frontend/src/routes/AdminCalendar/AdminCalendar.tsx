import {AdminStore} from '@/stores';
import links from '@/routes/urls';
import actions from '@/actions';
import React, {Fragment, Component} from 'react';
import {inject, observer} from "mobx-react";
import {
  Layout,
  Menu,
  Icon,
  Typography,
  Tabs,
  Button, Col, Row
} from 'antd';
import CalendarView from '../Calendar/CalendarView';

import {RouteComponentProps, withRouter, Link} from "react-router-dom";

const {Header, Sider, Content} = Layout;
const {Text} = Typography;
const TabPane = Tabs.TabPane;

import './AdminCalendar.css';

type Props = {
  adminStore : AdminStore
};

@inject('adminStore')
@observer
class Calendar extends Component<Props & RouteComponentProps> {

  componentWillMount(): void {
    actions.admin.getAllCalendars()
      .catch(console.error);
  }

  handleLogout = () => {
    actions.logout();
  };

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
                <Link to={links.adminHome}>
                  <Icon type="home" />
                  <span className="menu-text">Home</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link to={links.adminTeam}>
                  <Icon type="team" />
                  <span className="menu-text">Team</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to={links.adminCalendar}>
                  <Icon type="calendar" />
                  <span className="menu-text">Calendar</span>
                </Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Header style={{ background: '#fff', padding: 0 }}>
              <Row>
                <Col span={20}>
                  <div className="title">Calendar</div>
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
              <Tabs defaultActiveKey="1">
                {this.props.adminStore.calendars.length ?
                  this.props.adminStore.calendars.map((calendar, i) =>
                    <TabPane tab={calendar.location} key={`${i + 1}`} style={{ height : '80vh'}}>
                      <CalendarView store={this.props.adminStore} holidays={calendar.holidays} location={calendar.location as string}/>
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