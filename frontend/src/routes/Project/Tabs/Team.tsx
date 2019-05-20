import {ManagerStore} from '@/stores';
import actions from '@/actions';
import React, {Fragment, Component, SyntheticEvent} from 'react';
import {observer} from "mobx-react";
import Highlighter from 'react-highlight-words';
import {FormComponentProps} from 'antd/lib/form/Form';
import {
  Col,
  Row,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Badge,
  Icon,
  Divider,
  Typography,
  Radio,
  Table,
  Modal
} from 'antd';
const {Option} = Select;
const {Text} = Typography;

type Props = {
  managerStore : ManagerStore,
  projectId : string
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
  openCreateTeam : boolean,
  confirmLoading : boolean,
  teamsAmount : number,
  teamPrepared : boolean,
  confirmTeamLoading : boolean
};

const expandedRowRender = (record : any) => <p>{record.skills.join(', ')}</p>;

@observer
class Team extends Component<Props & FormComponentProps, State> {
  state = {
    workersLoading : false,
    tableRowSize : RowSize.default,
    expandedRowRender : '',
    searchText : '',
    openCreateTeam : false,
    confirmLoading : false,
    teamsAmount : 1,
    teamPrepared : true,
    confirmTeamLoading : false
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
    actions.manager.cleanProjectTeam();
    actions.manager.getProjectTeam()
      .then(() => {
        if(!this.props.managerStore.projectTeam.length){
          this.setState({
            teamPrepared : false
          })
        }
        this.setState({
          workersLoading : false
        })
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

  handleOpenCreateTeam(){
    this.setState({
      openCreateTeam : true
    })
  }

  handleCloseCreateTeam(){
    this.props.form.resetFields();
    this.setState({
      openCreateTeam : false
    })
  }

  handleModalSubmit(e : SyntheticEvent){
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if(!err){
        const teamParams = {};
        for(let i = 1; i <= this.state.teamsAmount; i++){
          //@ts-ignore
          teamParams[values[`teamType-${i}`]] = {
            amount : values[`senior-${i}`] + values[`middle-${i}`] + values[`junior-${i}`],
            seniority : {
              Senior : values[`senior-${i}`],
              Middle : values[`middle-${i}`],
              Junior : values[`junior-${i}`]
            },
            mainSkill : values[`mainSkill-${i}`],
            skills : values[`skills-${i}`],
            teamStartDate : this.props.managerStore.project.startDate
          };
        }
        this.setState({
          confirmLoading : true
        });
        actions.manager.prepareProjectTeam(teamParams)
          .then(() => {
            this.setState({
              confirmLoading : false,
              openCreateTeam : false
            });
          })
          .catch(error => {
            console.error(error);
            this.setState({
              confirmLoading : false,
              openCreateTeam : false
            })
          })
      }
    })
  }

  addTeam(){
    const teamsAmount = this.state.teamsAmount;
    this.setState({
      teamsAmount : teamsAmount + 1
    });
  }

  removeTeam(){
    const teamsAmount = this.state.teamsAmount;
    this.setState({
      teamsAmount : teamsAmount - 1
    })
  }

  handleTeamSubmit(){
    this.setState({
      confirmTeamLoading : true
    });
    actions.manager.confirmProjectTeam(this.props.managerStore.projectTeam, this.props.projectId)
      .then(() => {
        this.setState({
          confirmTeamLoading : false,
          teamPrepared : true
        })
      })
      .catch(error => {
        console.error(error);
        this.setState({
          confirmTeamLoading : false
        })
      });
  }

  render() {
    let columns;
    if(this.state.teamPrepared) {
      columns = [
        {
          title: 'Name',
          key: 'name',
          render: (text: any, record: any) => `${record.firstName} ${record.lastName}`,
          ...this.getColumnSearchProps('name')
        },
        {
          title: 'Main skill',
          key: 'main-skill',
          dataIndex: 'mainSkill',
          ...this.getColumnSearchProps('mainSkill')
        },
        {
          title: 'Seniority level',
          key: 'seniority',
          dataIndex: 'seniorityLevel',
          ...this.getColumnSearchProps('seniorityLevel')
        },
        {
          title: 'Location',
          key: 'location',
          dataIndex: 'location',
          ...this.getColumnSearchProps('location')
        },
        {
          title: '',
          key: 'edit',
          render: () => <Icon type="edit" className="edit-team-action"/>
        }
      ];
    } else {
      columns = [
        {
          title: 'Name',
          key: 'name',
          render: (text: any, record: any) => `${record.firstName} ${record.lastName}`,
          ...this.getColumnSearchProps('name')
        },
        {
          title: 'Main skill',
          key: 'main-skill',
          dataIndex: 'mainSkill',
          ...this.getColumnSearchProps('mainSkill')
        },
        {
          title: 'Seniority level',
          key: 'seniority',
          dataIndex: 'seniorityLevel',
          ...this.getColumnSearchProps('seniorityLevel')
        },
        {
          title: 'Location',
          key: 'location',
          dataIndex: 'location',
          ...this.getColumnSearchProps('location')
        },
        {
          title : 'Rating',
          key : 'rating',
          dataIndex : 'rating'
        },
        {
          title: '',
          key: 'edit',
          render: () => <Icon type="edit" className="edit-team-action"/>
        }
      ];
    }


    const teamNumbers = [];
    for(let i = 1; i <= this.state.teamsAmount; i++){
      teamNumbers.push(i);
    }

    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <Row>
          <Col span={24}>
            <div className="content-container">
              <Row type="flex" justify="space-around" align="top" className="full-height">
                <Col span={18} style={{height : '100%'}}>
                  <div style={{height : '100%'}}>
                    <Row>
                      <Col span={23}>
                        <Text className="projects-title">Team</Text>
                        <Badge count={this.props.managerStore.projectTeam.length}
                               style={{
                                 backgroundColor: '#fff',
                                 color: '#999',
                                 boxShadow: '0 0 0 1px #d9d9d9 inset',
                                 marginBottom : '5px'
                               }} />
                      </Col>
                      <Col span={1}>
                        <Icon type="plus" key="plus" style={{fontSize : '20px', cursor : 'pointer'}} onClick={this.handleOpenCreateTeam.bind(this)}/>
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
                      dataSource={this.props.managerStore.projectTeam}
                      rowKey={record => record.username as string}
                    ></Table>
                    <Col span={3} offset={21}>
                      {(!this.state.teamPrepared && this.props.managerStore.projectTeam.length) ?
                        <Button type="primary" loading={this.state.confirmTeamLoading} onClick={this.handleTeamSubmit.bind(this)}>Confirm Team</Button> :
                        ''}
                    </Col>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        <Modal
          title='Create team'
          centered
          visible={this.state.openCreateTeam}
          onOk={(e) => this.handleModalSubmit(e)}
          onCancel={this.handleCloseCreateTeam.bind(this)}
          confirmLoading={this.state.confirmLoading}
          okText='Create team'
          bodyStyle={{
            height : '60vh',
            overflowY : 'scroll'
          }}
          width="50%"
        >
          <Form>
            <Row gutter={24}>
            {teamNumbers.map(i =>
              ([
                <Col span={1} offset={23}>
                  <Icon type="close" onClick={this.removeTeam.bind(this)}/>
                </Col>,
                <Col span={6} key={`teamType-${i}`}>
                  <Form.Item label="Team type">
                    {getFieldDecorator(`teamType-${i}`, {
                      rules : [
                        {
                          required : true,
                          message : 'Team type is required!'
                        }
                      ]
                    })
                    (
                      <Select>
                        <Option value="backend">Backend</Option>
                        <Option value="frontend">Frontend</Option>
                        <Option value="mobile">Mobile</Option>
                        <Option value="qa">QA</Option>
                        <Option value="design">Design</Option>
                        <Option value="devops">DevOps</Option>
                      </Select>
                    )}
                  </Form.Item>
                </Col>,
                <Col span={6} key={`mainSkill-${i}`}>
                  <Form.Item label="Main skill">
                    {getFieldDecorator(`mainSkill-${i}`, {
                      rules : [
                        {
                          required : true,
                          message : 'Main skill is required!'
                        }
                      ]
                    })
                    (
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
                    )}
                  </Form.Item>
                </Col>,
                <Col span={12} key={`skills-${i}`}>
                  <Form.Item label="Skills">
                    {getFieldDecorator(`skills-${i}`, {
                      rules : [
                        {
                          required : true,
                          message : 'Skills are required!'
                        }
                      ]
                    })
                    (
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
                    )}
                  </Form.Item>
                </Col>,
                <Col span={8} key={`senior-${i}`}>
                  <Form.Item label="Senior">
                    {getFieldDecorator(`senior-${i}`, {
                      rules : [
                        {
                          required : true,
                          message : 'Amount of Senior developers is required!'
                        }
                      ],
                      initialValue : 0
                    })
                    (
                      <InputNumber min={0} className="full-width"/>
                    )}
                  </Form.Item>
                </Col>,
                <Col span={8} key={`middle-${i}`}>
                  <Form.Item label="Middle">
                    {getFieldDecorator(`middle-${i}`, {
                      rules : [
                        {
                          required : true,
                          message : 'Amount of Middle developers is required!'
                        }
                      ],
                      initialValue : 0
                    })
                    (
                      <InputNumber min={0} className="full-width"/>
                    )}
                  </Form.Item>
                </Col>,
                <Col span={8} key={`junior-${i}`}>
                  <Form.Item label="Junior">
                    {getFieldDecorator(`junior-${i}`, {
                      rules : [
                        {
                          required : true,
                          message : 'Amount of Junior developers is required!'
                        }
                      ],
                      initialValue : 0
                    })
                    (
                      <InputNumber min={0} className="full-width"/>
                    )}
                  </Form.Item>
                </Col>,
                <Divider/>
              ])
            )}
            </Row>
          </Form>
          <Row gutter={24}>
            <Col span={12}>
              <Button type="dashed" onClick={this.addTeam.bind(this)}>
                <Icon type="plus" /> Add team
              </Button>
            </Col>
          </Row>
        </Modal>
      </Fragment>
    );
  }
}

export default Form.create<Props>()(Team);