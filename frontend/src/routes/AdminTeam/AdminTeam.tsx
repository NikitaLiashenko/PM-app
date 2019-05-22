import {AdminStore} from '@/stores';
import links from '@/routes/urls';
import actions from '@/actions';
import React, {Fragment, Component, SyntheticEvent} from 'react';
import {FormComponentProps} from "antd/lib/form/Form";
import {Worker} from "@/services/workerService";
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
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
  Layout,
  Menu,
  Form,
  Modal,
  Select, DatePicker
} from 'antd';
import {RouteComponentProps, withRouter, Link} from "react-router-dom";
import Highlighter from 'react-highlight-words';
import moment from 'moment';

const {Text} = Typography;
const {Header, Sider, Content} = Layout;
const {Option} = Select;

import './AdminTeam.css';
import {Project} from "@/services/projectService";

type Props = {
  adminStore : AdminStore
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
  searchText : string,
  openWorkerView : boolean,
  worker : Worker,
  confirmLoading : boolean
};

const expandedRowRender = (record : any) => <p>{record.skills.join(', ')}</p>;

@inject('adminStore')
@observer
class Team extends Component<Props & RouteComponentProps & FormComponentProps, State>{
  state = {
    workersLoading : false,
    tableRowSize : RowSize.default,
    expandedRowRender : '',
    searchText : '',
    worker : {},
    openWorkerView : false,
    confirmLoading : false
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
    actions.admin.cleanWorkers();
    actions.admin.getAllProjects()
      .then(() => actions.admin.getAllWorkers())
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

  handleEditTask = (username : string) => {
    const worker : Worker = toJS(this.props.adminStore.workers.find(worker => worker.username === username) as Worker);
    this.setState({
      worker,
      openWorkerView : true
    })
  };

  handleModalCancel(){
    this.setState({
      openWorkerView : false,
      worker : {}
    });
    this.props.form.resetFields();
  }

  handleCreateWorker = () => {
    this.props.form.resetFields();
    this.setState({
      openWorkerView : true,
      worker : {}
    });
  };

  handleModalSubmit(e : SyntheticEvent) {
    e.preventDefault();
    if(this.props.form.isFieldsTouched()){
      this.props.form.validateFields((err, values) => {
        if(!err){
          this.setState({
            confirmLoading : true
          });
        }

        if((this.state.worker as any).firstName) {

          if ((this.state.worker as any).vacations) {
            //@ts-ignore
            this.state.worker.vacations.forEach(vacation => {
              vacation.startDate = vacation.startDate.format('YYYY-MM-DD');
              vacation.endDate = vacation.endDate.format('YYYY-MM-DD');
            });
          }

          const username = (this.state.worker as any).username;
          delete (this.state.worker as any).username;

          actions.admin.updateWorker(username, this.state.worker)
            .then(() => actions.admin.getAllWorkers())
            .then(() => {
              this.setState({
                confirmLoading : false,
                openWorkerView : false,
                worker : {}
              })
            })
            .catch(error => {
              console.error(error);
              this.setState({
                confirmLoading : false,
                openWorkerView : false,
                worker : {}
              })
            });
        } else {
          console.log(values);
          const vacations : Array<any> = [];
          const worker : any = {};
          Object.keys(values).forEach(field => {
            if(field.includes('vacation')){
              vacations.push({
                startDate : values[field][0].format('YYYY-MM-DD'),
                endDate : values[field][1].format('YYYY-MM-DD')
              })
            } else {
              worker[field] = values[field];
            }
            worker.vacations = vacations;
          });

          actions.admin.createWorker(worker)
            .then(() => actions.admin.getAllWorkers())
            .then(() => {
              this.setState({
                confirmLoading : false,
                openWorkerView : false,
                worker : {}
              })
            })
            .catch(error => {
              console.error(error);
              this.setState({
                confirmLoading : false,
                openWorkerView : false,
                worker : {}
              })
            });
        }
      })
    }
  }

  addVacation = () => {
    const worker : any = this.state.worker;
    if(worker.vacations){
      worker.vacations.push({
        startDate : moment(),
        endDate : moment()
      });
    } else {
      worker.vacations = [
        {
          startDate : moment(),
          endDate : moment()
        }
      ];
    }
    this.setState({
      worker
    });
  };

  removeVacation = (index : number) => {
    const worker : any = this.state.worker;
    worker.vacations.splice(index, 1);
    this.setState({
      worker
    })
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
          const project = this.props.adminStore.projects.find(project => project.projectId === record.project.projectId);
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
          return record.vacations.map((vacation : any) => `${vacation.startDate} - ${vacation.endDate}; `)
        }
      },
      {
        title : '',
        key : 'edit',
        //@ts-ignore
        render : (text : any, record : any) => <Icon type="edit" onClick={this.handleEditTask.bind(this, record.username)}></Icon>
      }
    ];

    const {getFieldDecorator} = this.props.form;
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
                              <Badge count={this.props.adminStore.workers.length}
                                     style={{
                                       backgroundColor: '#fff',
                                       color: '#999',
                                       boxShadow: '0 0 0 1px #d9d9d9 inset',
                                       marginBottom : '5px'
                                     }} />
                            </Col>
                            <Col span={1}>
                              <Icon type="plus" key="plus" style={{fontSize : '20px', cursor : 'pointer'}} onClick={this.handleCreateWorker}/>
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
                            dataSource={this.props.adminStore.workers}
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

        <Modal
          //@ts-ignore
          title={this.state.worker.username ? 'Edit worker info' : 'Create worker'}
          centered
          visible={this.state.openWorkerView}
          onOk={(e) => this.handleModalSubmit(e)}
          onCancel={() => this.handleModalCancel()}
          confirmLoading={this.state.confirmLoading}
          //@ts-ignore
          okText={this.state.worker.username ? 'Update' : 'Create'}
          bodyStyle={{
            height : '60vh',
            overflowY : 'scroll'
          }}
        >
          <Form layout="vertical">
            <Form.Item label="First Name">
              {(this.state.worker as any).firstName ?
                getFieldDecorator('firstName', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers first name!'
                    }
                  ],
                  initialValue : (this.state.worker as any).firstName
                })(
                  <Input />
                ) :
                getFieldDecorator('firstName', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers first name!'
                    }
                  ]
                })(
                  <Input />
                )
              }
            </Form.Item>
            <Form.Item label="Last Name">
              {(this.state.worker as any).lastName ?
                getFieldDecorator('lastName', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers last name!'
                    }
                  ],
                  initialValue : (this.state.worker as any).lastName
                })(
                  <Input />
                ) :
                getFieldDecorator('lastName', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers last name!'
                    }
                  ]
                })(
                  <Input />
                )
              }
            </Form.Item>
            <Form.Item label="Location">
              {(this.state.worker as any).location ?
                getFieldDecorator('location', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers location!'
                    }
                  ],
                  initialValue : (this.state.worker as any).location
                })(
                  <Select>
                    <Option value="UK">UK</Option>
                    <Option value="Ukraine">Ukraine</Option>
                    <Option value="Poland">Poland</Option>
                    <Option value="USA">USA</Option>
                  </Select>
                ) :
                getFieldDecorator('location', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers location!'
                    }
                  ]
                })(
                  <Select>
                    <Option value="UK">UK</Option>
                    <Option value="Ukraine">Ukraine</Option>
                    <Option value="Poland">Poland</Option>
                    <Option value="USA">USA</Option>
                  </Select>
                )
              }
            </Form.Item>
            <Form.Item label="Main Skill">
              {(this.state.worker as any).mainSkill ?
                getFieldDecorator('mainSkill', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers main skill!'
                    }
                  ],
                  initialValue : (this.state.worker as any).mainSkill
                })(

                  <Select>
                    <Option value=".NET">.NET</Option>
                    <Option value="Java">Java</Option>
                    <Option value="Android">Android</Option>
                    <Option value="QA Automation">QA Automation</Option>
                    <Option value="iOS">iOS</Option>
                    <Option value="JavaScript">JavaScript</Option>
                    <Option value="Python">Python</Option>
                    <Option value="QA">QA</Option>
                    <Option value="Design">Design</Option>
                    <Option value="Node.JS">Node.JS</Option>
                    <Option value="DevOps">DevOps</Option>
                  </Select>
                ) :
                getFieldDecorator('mainSkill', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers main skill!'
                    }
                  ]
                })(
                  <Select>
                    <Option value=".NET">.NET</Option>
                    <Option value="Java">Java</Option>
                    <Option value="Android">Android</Option>
                    <Option value="QA Automation">QA Automation</Option>
                    <Option value="iOS">iOS</Option>
                    <Option value="JavaScript">JavaScript</Option>
                    <Option value="Python">Python</Option>
                    <Option value="QA">QA</Option>
                    <Option value="Design">Design</Option>
                    <Option value="Node.JS">Node.JS</Option>
                    <Option value="DevOps">DevOps</Option>
                  </Select>
                )
              }
            </Form.Item>
            <Form.Item label="Seniority Level">
              {(this.state.worker as any).seniorityLevel ?
                getFieldDecorator('seniorityLevel', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers seniority level!'
                    }
                  ],
                  initialValue : (this.state.worker as any).seniorityLevel
                })(

                  <Select>
                    <Option value="Senior">Senior</Option>
                    <Option value="Middle">Middle</Option>
                    <Option value="Junior">Junior</Option>
                  </Select>
                ) :
                getFieldDecorator('seniorityLevel', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers seniority level!'
                    }
                  ]
                })(
                  <Select>
                    <Option value="Senior">Senior</Option>
                    <Option value="Middle">Middle</Option>
                    <Option value="Junior">Junior</Option>
                  </Select>
                )
              }
            </Form.Item>
            <Form.Item label="Skills">
              {(this.state.worker as any).skills ?
                getFieldDecorator('skills', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers skills!'
                    }
                  ],
                  initialValue : (this.state.worker as any).skills
                })(

                  <Select mode="tags">
                    <Option value="JDBC">JDBC</Option>
                    <Option value="Spring">Spring</Option>
                    <Option value="OOP">OOP</Option>
                    <Option value="Maven">Maven</Option>
                    <Option value="JVM">JVM</Option>
                    <Option value="Multithreading">Multithreading</Option>
                    <Option value="React">React</Option>
                    <Option value="HTML">HTML</Option>
                    <Option value="CSS">CSS</Option>
                    <Option value="Jest">Jest</Option>
                    <Option value="Responsive design">Responsive design</Option>
                    <Option value="UI">UI</Option>
                    <Option value="UX">UX</Option>
                    <Option value="Java">Java</Option>
                    <Option value="Android SDK">Android SDK</Option>
                    <Option value="TDD">TDD</Option>
                    <Option value="Lint">Lint</Option>
                    <Option value="Android Studio">Android Studio</Option>
                    <Option value="Manual Testing">Manual Testing</Option>
                    <Option value="SDLC">SDLC</Option>
                    <Option value="Functional Testing">Functional Testing</Option>
                    <Option value="Smoke Testing">Smoke Testing</Option>
                    <Option value="Sanity Testing">Sanity Testing</Option>
                    <Option value="Risk Management">Risk Management</Option>
                  </Select>
                ) :
                getFieldDecorator('skills', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input workers skills!'
                    }
                  ]
                })(
                  <Select mode="tags">
                    <Option value="JDBC">JDBC</Option>
                    <Option value="Spring">Spring</Option>
                    <Option value="OOP">OOP</Option>
                    <Option value="Maven">Maven</Option>
                    <Option value="JVM">JVM</Option>
                    <Option value="Multithreading">Multithreading</Option>
                    <Option value="React">React</Option>
                    <Option value="HTML">HTML</Option>
                    <Option value="CSS">CSS</Option>
                    <Option value="Jest">Jest</Option>
                    <Option value="Responsive design">Responsive design</Option>
                    <Option value="UI">UI</Option>
                    <Option value="UX">UX</Option>
                    <Option value="Java">Java</Option>
                    <Option value="Android SDK">Android SDK</Option>
                    <Option value="TDD">TDD</Option>
                    <Option value="Lint">Lint</Option>
                    <Option value="Android Studio">Android Studio</Option>
                    <Option value="Manual Testing">Manual Testing</Option>
                    <Option value="SDLC">SDLC</Option>
                    <Option value="Functional Testing">Functional Testing</Option>
                    <Option value="Smoke Testing">Smoke Testing</Option>
                    <Option value="Sanity Testing">Sanity Testing</Option>
                    <Option value="Risk Management">Risk Management</Option>
                  </Select>
                )
              }
            </Form.Item>
            {(this.state.worker as any).vacations &&
              (this.state.worker as any).vacations.map((vacation : any, i : any) => (
                <Form.Item label={`Vacation ${i+1}`} key={`vacation-${i}`}>
                  {getFieldDecorator(`vacation-${i}`, {
                    initialValue : [moment(vacation.startDate), moment(vacation.endDate)]
                })(
                  <DatePicker.RangePicker style={{width : '93%'}}/>
                  )}
                  <Icon type="minus-circle" onClick={this.removeVacation.bind(this, i)} style={{fontSize : '24px', marginLeft : '5px'}}/>
                </Form.Item>
              ))}
          </Form>
          <Row gutter={24}>
            <Col span={12}>
              <Button type="dashed" onClick={this.addVacation.bind(this)}>
                <Icon type="plus" /> Add vacation
              </Button>
            </Col>
          </Row>
        </Modal>
      </Fragment>
    );
  }
}

export default Form.create<Props>()(withRouter(Team));