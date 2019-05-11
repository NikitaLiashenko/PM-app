import {ManagerStore} from '@/stores';
import actions from '@/actions';
import React, {Fragment, Component, SyntheticEvent} from 'react';
import {observer} from "mobx-react";
import {Worker} from '@/services/workerService';
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
  Table
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
  searchText : string
};

const expandedRowRender = (record : any) => <p>{record.skills.join(', ')}</p>;

@observer
class Team extends Component<Props & FormComponentProps, State> {
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
    actions.cleanProjectTeam();
    actions.getProjectTeam()
      .then(() => {
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
        title : '',
        key : 'edit',
        render : () => <Icon type="edit" className="edit-team-action"/>
      }
    ];

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
                      dataSource={this.props.managerStore.projectTeam}
                      rowKey={record => record.username as string}
                    ></Table>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default Form.create<Props>()(Team);