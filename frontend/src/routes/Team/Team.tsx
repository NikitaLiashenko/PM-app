import {ManagerStore} from '@/stores';
import links from '@/routes/urls';
import actions from '@/actions';
import React, {Fragment, Component, SyntheticEvent} from 'react';
import {inject, observer} from 'mobx-react';
import {
  Col,
  Row,
  Input,
  Button,
  Badge,
  Icon,
  Divider,
  Typography,
  Radio,
  Table,
  Layout, Menu
} from 'antd';
import {RouteComponentProps, withRouter, Link} from "react-router-dom";
import Highlighter from 'react-highlight-words';
import moment from 'moment';

const {Text} = Typography;
const {Header, Sider, Content} = Layout;

import './Team.css';
import {Project} from "@/services/projectService";

type Props = {
  managerStore : ManagerStore
};

enum RowSize {
  default = "default",
  small = "medium",
  medium = "high"
}

type State = {
  workersLoading : boolean,
  tableRowSize : RowSize,
  expandedRowRender : any,
  searchText : string
};

const expandedRowRender = (record : any) => <p>{record.skills.join(', ')}</p>;

@inject('managerStore')
@observer
class Team extends Component<Props & RouteComponentProps, State>{
  state = {
    workersLoading : false,
    tableRowSize : RowSize.default,
    expandedRowRender : '',
    searchText : ''
  };

  searchInput : Input | null;

  constructor(props : any) {
    super(props);
    this.searchInput = null;
  }

  componentWillMount(): void {
    this.setState({
      workersLoading : true
    });
    actions.cleanWorkers();
    actions.getAllProjects()
      .then(() => actions.getAllWorkers())
      .then(() => {
        this.setState({
          workersLoading : false
        });
      })
      .catch(error => {
        this.setState({
          workersLoading : false
        });
        console.error(error);
      })
  }

  handleSizeChange = (event : any) => {
    this.setState({
      tableRowSize : event.target.value
    });
  };

  handleSearch = (selectedKeys : any, confirm : any) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0]
    });
  };

  handleReset = (clearFilters : any) => {
    clearFilters();
    this.setState({
      searchText: ''
    });
  };

  getColumnSearchProps = (dataIndex : any) => ({
    //@ts-ignore
    filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters,}) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => { this.searchInput = node; }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => this.handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered : any) => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value : any, record : any) => {
      if(dataIndex === 'name'){
        return `${record.firstName} ${record.lastName}`.toString().toLowerCase().includes(value.toLowerCase());
      }
      return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
    },
    onFilterDropdownVisibleChange: (visible : any) => {
      if (visible) {
        setTimeout(() => (this.searchInput as Input).select());
      }
    },
    render: (text : any, record : any) => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={dataIndex === 'name' ? `${record.firstName} ${record.lastName}` : text.toString()}
      />
    ),
  });

  handleLogout = () => {
    actions.logout();
  };

  render() {
    const columns = [
      {
        title : 'Name',
        key : 'name',
        render : (text : any, record : any) => `${record.firstName} ${record.lastName}`,
        ...this.getColumnSearchProps('name')
      },
      {
        title : 'Main skill',
        key : 'main-skill',
        dataIndex : 'mainSkill',
        ...this.getColumnSearchProps('mainSkill')
      },
      {
        title : 'Seniority level',
        key : 'seniority',
        dataIndex : 'seniorityLevel',
        ...this.getColumnSearchProps('seniorityLevel')
      },
      {
        title : 'Location',
        key : 'location',
        dataIndex : 'location',
        ...this.getColumnSearchProps('location')
      },
      {
        title : 'Project',
        key : 'project',
        render : (text : any, record : any) => {
          if(!record.project || !record.project.endDate){
            return '';
          }
          const projectEndDate = moment(record.project.endDate);
          if(moment().diff(projectEndDate) > 0){
            return '';
          }
          console.log(record.firstName, record.project.projectId);
          const project = this.props.managerStore.projectsList.find(project => project.projectId === record.project.projectId);
          if(!project){
            return '';
          }
          return (project as Project).title;
        }
      },
      {
        title : 'Vacation',
        key : 'vacation',
        render : (text : any, record : any) => {
          if(!record.vacations || !record.vacations.length){
            return '';
          }
          return record.vacations.map((vacation : any) => `${vacation.startDate} - ${vacation.endDate}`)
        }
      }
    ];
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
            <Menu mode="inline" theme="dark" defaultSelectedKeys={['2']}>
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
              <Menu.Item key="4">
                <Link to={links.rateCard}>
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
                  <div className="title">Team</div>
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
                      <Col span={24} style={{height : '100%'}}>
                        <div style={{height : '100%'}}>
                          <Row>
                            <Col span={23}>
                              <Text className="projects-title">Team</Text>
                              <Badge count={this.props.managerStore.team.length}
                                     style={{
                                       backgroundColor: '#fff',
                                       color: '#999',
                                       boxShadow: '0 0 0 1px #d9d9d9 inset',
                                       marginBottom : '5px'
                                     }} />
                            </Col>
                            <Col span={1}>
                              <Icon type="plus" key="plus" style={{fontSize : '20px', cursor : 'pointer'}}/>
                            </Col>
                          </Row>
                          <Divider />
                          <Radio.Group size="default" value={this.state.tableRowSize} onChange={this.handleSizeChange.bind(this)}>
                            <Radio.Button value="default">Default</Radio.Button>
                            <Radio.Button value="middle">Middle</Radio.Button>
                            <Radio.Button value="small">Small</Radio.Button>
                          </Radio.Group>
                          <Table
                            bordered={false}
                            loading={this.state.workersLoading}
                            expandedRowRender={expandedRowRender}
                            //@ts-ignore
                            size={this.state.tableRowSize}
                            columns={columns}
                            dataSource={this.props.managerStore.team}
                            rowKey={record => record.username as string}
                          ></Table>
                        </div>
                      </Col>
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

export default withRouter(Team);