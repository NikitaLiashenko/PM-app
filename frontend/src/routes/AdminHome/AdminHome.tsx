import {AdminStore} from '@/stores';
import links from '@/routes/urls';
import actions from '@/actions';
import React, {Fragment, Component, SyntheticEvent} from 'react';
import {inject, observer} from "mobx-react";
import {
  Layout,
  Menu,
  Icon,
  Typography,
  Row,
  Col,
  Divider,
  Card,
  Button,
  Statistic
} from "antd";
import moment from 'moment';
import {Chart, Axis, Geom, Tooltip, Legend} from "bizcharts";
import {Project} from "@/services/projectService";

import {RouteComponentProps, withRouter, Link} from "react-router-dom";

const {Header, Sider, Content} = Layout;
const {Text} = Typography;

import './AdminHome.css';

type Props = {
  adminStore : AdminStore
}

type State = {
  allWorkersCardLoading : boolean,
  allLocationsCardLoading : boolean,
  allProjectsLoading : boolean
};

@inject('adminStore')
@observer
class AdminHome extends Component<Props & RouteComponentProps, State>{
  state = {
    allWorkersCardLoading : false,
    allLocationsCardLoading : false,
    allProjectsLoading : false
  };

  mainSkills : Array<any> = [];

  activeProjects : Array<Project> = [];

  cols = {
    amount: { alias: 'Workers' },
    name: { alias: 'Technology' }
  };

  handleLogout = () => {
    actions.logout();
  };

  componentWillMount(): void {
    actions.admin.cleanWorkers();
    this.setState({
      allWorkersCardLoading : true,
      allLocationsCardLoading : true,
      allProjectsLoading : true
    });
    actions.admin.getAllWorkers()
      .then(() => {
        const workers = this.props.adminStore.workers;
        const mainSkills : Array<any> = [];

        workers.forEach(worker => {
          const skillIndex = mainSkills.findIndex(mainSkill => mainSkill.name === worker.mainSkill);
          if(skillIndex >= 0){
            mainSkills[skillIndex].amount++;
          } else {
            mainSkills.push({
              name : worker.mainSkill,
              amount : 1
            });
          }
        });

        this.mainSkills = mainSkills;

        this.setState({
          allWorkersCardLoading : false
        });
      })
      .catch(error => {
        console.error(error);
        this.setState({
          allWorkersCardLoading : false
        });
      });

    actions.admin.cleanCalendars();
    actions.admin.getAllCalendars()
      .then(() => {
        this.setState({
          allLocationsCardLoading : false
        });
      })
      .catch(error => {
        console.error(error);
        this.setState({
          allLocationsCardLoading : false
        });
      });

    actions.admin.cleanProjects();
    actions.admin.getAllProjects()
      .then(() => {
        this.props.adminStore.projects.forEach(project => {
          if(project.startDate && project.endDate){
            const projectStart = moment(project.startDate);
            const projectEnd = moment(project.endDate);

            if(projectStart.diff(moment(), 'days') < 0 &&
            projectEnd.diff(moment(), 'days') > 0){
              this.activeProjects.push(project);
            }
          }
        });


        this.setState({
          allProjectsLoading : false
        });
      })
      .catch(error => {
        console.error(error);
        this.setState({
          allProjectsLoading : false
        });
      });
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
            <Menu mode="inline" theme="dark" defaultSelectedKeys={['1']}>
              <Menu.Item key="1">
                <Link to={links.adminHome}>
                  <Icon type="home"/>
                  <span className="menu-text">Home</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link to={links.adminTeam}>
                  <Icon type="team"/>
                  <span className="menu-text">Team</span>
                </Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to={links.adminCalendar}>
                  <Icon type="calendar"/>
                  <span className="menu-text">Calendar</span>
                </Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Header style={{background: '#fff', padding: 0}}>
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
              backgroundColor: 'white'
            }}
            >
              <Row>
                <Col span={24}>
                  <div className="content-container">
                    <Row gutter={16} style={{marginBottom : '16px'}}>
                      <Col span={6}>
                        <Card
                          loading={this.state.allWorkersCardLoading}
                          style={{height : '158px'}}
                        >
                          <Statistic
                            title="Total workers"
                            value={this.props.adminStore.workers.length}
                            precision={0}
                            prefix={<Icon type="user" />}
                            style={{height : '80px'}}
                          />
                          <div className="chart-card-footer">
                            <span className="chart-card-footer-text">Across all locations</span>
                          </div>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card
                          loading={this.state.allWorkersCardLoading}
                          style={{height : '158px'}}
                        >
                          <Statistic
                            title="Workers without project"
                            value={this.props.adminStore.workers.filter(worker => {
                              if(!worker.project){
                                return true;
                              }
                              const projectEndDate = moment(worker.project.endDate);

                              if(projectEndDate.diff(moment(), 'days') <= 0) {
                                return true;
                              }

                              return false;
                            }).length}
                            precision={0}
                            prefix={<Icon type="user" />}
                            style={{height : '80px'}}
                          />
                          <div className="chart-card-footer">
                            <span className="chart-card-footer-text">Across all locations</span>
                          </div>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card
                          loading={this.state.allWorkersCardLoading}
                          style={{height : '158px'}}
                        >
                          <Statistic
                            title="Active vacations"
                            value={this.props.adminStore.workers.filter(worker => {
                              if(!worker.vacations || !worker.vacations.length){
                                return false;
                              }

                              worker.vacations.forEach(vacation => {
                                const vacationStartDate = moment(vacation.startDate);
                                const vacationEndDate = moment(vacation.endDate);

                                if(vacationStartDate.diff(moment(), 'days') < 0 &&
                                vacationEndDate.diff(moment(), 'days') > 0){
                                  return true;
                                }
                              });

                              return false;
                            }).length}
                            precision={0}
                            prefix={<Icon type="compass" />}
                            style={{height : '80px'}}
                          />
                          <div className="chart-card-footer">
                            <span className="chart-card-footer-text">Across all locations</span>
                          </div>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card
                          loading={this.state.allLocationsCardLoading}
                          style={{height : '158px'}}
                        >
                          <Statistic
                            title="Total locations"
                            value={this.props.adminStore.calendars.length}
                            precision={0}
                            prefix={<Icon type="global" />}
                            style={{height : '80px'}}
                          />
                          <div className="chart-card-footer">
                            <span className="chart-card-footer-text">Around the globe</span>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{marginBottom : '16px'}}>
                      <Col span={6}>
                        <Card
                          loading={this.state.allProjectsLoading}
                          style={{height : '158px'}}
                        >
                          <Statistic
                            title="Total projects"
                            value={this.props.adminStore.projects.length}
                            precision={0}
                            prefix={<Icon type="project" />}
                            style={{height : '80px'}}
                          />
                          <div className="chart-card-footer">
                            <span className="chart-card-footer-text">Across all locations</span>
                          </div>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card
                          loading={this.state.allProjectsLoading}
                          style={{height : '158px'}}
                        >
                          <Statistic
                            title="Active projects"
                            value={this.activeProjects.length}
                            precision={0}
                            prefix={<Icon type="project" />}
                            style={{height : '80px'}}
                          />
                          <div className="chart-card-footer">
                            <span className="chart-card-footer-text">Across all locations</span>
                          </div>
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card
                          style={{height : '158px'}}
                          className="create-statistic-card"
                          bodyStyle={{height : '100%'}}
                        >
                          <div className="center" style={{height : '100%'}}>
                            <Icon type="plus" style={{fontSize : '24px'}}/>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                    <Row>
                      <Card
                        bodyStyle={{
                          height : '480px'
                        }}
                      >
                        <Row type="flex" justify="space-between" align="middle">
                          {!this.state.allWorkersCardLoading &&
                            [<Col span={16}>
                              <Chart height={400} data={this.mainSkills} scale={this.cols}>
                                <Axis name="name" />
                                <Axis name="amount" />
                                <Legend position="bottom-center"/>
                                <Tooltip />
                                <Geom type="interval" position="name*amount" color="name" />
                              </Chart>
                            </Col>,
                            <Col span={8}>
                              <div className="ranking-container">
                                <Text>Technology ranking</Text>
                                <ul className="ranking-list">
                                  {this.mainSkills.sort((a, b) => a.amount < b.amount ? 1 : -1).map((element, index) => (
                                    <li key={element.name}>
                                      <span className={`ranking-item-number ${index < 3 ? 'top-3' : ''}`}>
                                        {index + 1}
                                      </span>
                                      <span className="ranking-item-title">
                                        {element.name}
                                      </span>
                                      <span className="ranking-item-value">
                                        {element.amount}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </Col>]
                            }
                        </Row>
                      </Card>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Content>
          </Layout>
        </Layout>
      </Fragment>
    );
  }
}

export default withRouter(AdminHome);