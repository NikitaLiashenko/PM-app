import links from '@/routes/urls';
import React, {Component, Fragment, SyntheticEvent} from "react";
import {
  Col,
  Row,
  Input,
  InputNumber,
  Button,
  Icon,
  Divider,
  Typography,
  Table,
  Layout,
  Form,
  Menu,
  Badge
} from "antd";
import {RouteComponentProps, withRouter, Link} from 'react-router-dom';
import {FormComponentProps} from "antd/lib/form/Form";

const {Text} = Typography;
const {Header, Sider, Content} = Layout;

import './RateCard.css';
import actions from "@/actions";

//@ts-ignore
const EditableContext = React.createContext();

//@ts-ignore
const EditableRow = ({form, index, ...props}) => (
  <EditableContext.Provider value={form}>
    <tr {...props}/>
  </EditableContext.Provider>
);

//@ts-ignore
const EditableFormRow = Form.create()(EditableRow);

type CellProps = {
  record : object,
  handleSave : any,
  editable : boolean,
  dataIndex : string,
  title : string
};

type CellState = {
  editing : boolean
};

class EditableCell extends Component<CellProps & FormComponentProps, CellState>{
  state = {
    editing : false
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({editing}, () => {
      if(editing){
        //@ts-ignore
        this.input.focus();
      }
    });
  };

  save = (e : SyntheticEvent) => {
    const {record, handleSave} = this.props;

    //@ts-ignore
    this.form.validateFields((error, values) => {
      if(error && error[e.currentTarget.id]){
        return ;
      }

      this.toggleEdit();
      handleSave({...record, ...values});
    })
  };

  render(){
    const {editing} = this.state;
    const {editable, dataIndex, title, record, handleSave, ...restProps} = this.props;

    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {(form : any) => {
              //@ts-ignore
              this.form = form;
              return editing ? (
                <Form.Item style={{margin : 0}}>
                  {form.getFieldDecorator(dataIndex, {
                    rules : [
                      {
                        required : true,
                        message : `${title} is required.`
                      }
                    ],
                    //@ts-ignore
                    initialValue : record[dataIndex]
                  })(
                    <Input
                      //@ts-ignore
                      ref={node => (this.input = node)}
                      onPressEnter={this.save}
                      onBlur={this.save}
                    />
                  )}
                </Form.Item>
              ) : (
                <div
                  className="editable-cell-value-wrap"
                  style={{paddingRight : 24}}
                  onClick={this.toggleEdit}
                >
                  {restProps.children}
                </div>
              );
            }}
          </EditableContext.Consumer>
        ) : (
          restProps.children
        )}
      </td>
    );
  }
}

type tableProps = {};

type tableState = {
  data : Array<any>,
  count : number
};

class EditableTable extends Component<tableProps, tableState>{
  constructor(props : any){
    super(props);
    //@ts-ignore
    this.columns = [
      {
        title : 'Qualification',
        dataIndex : 'qualification',
        editable : true
      },
      {
        title : 'Rate',
        dataIndex : 'rate',
        editable : true
      },
      {
        title : 'Overtime',
        dataIndex : 'overtime',
        editable : true
      },
      {
        title : 'Onsite rate',
        dataIndex : 'onsiteRate',
        editable : true
      },
      {
        title : 'Onsite overtime',
        dataIndex : 'onsiteOvertime',
        editable : true
      },
      {
        title : 'operation',
        dataIndex : 'operation',
        render : (text : string, record : any) =>
          this.state.data.length >= 1 ? (
            <a onClick={() => this.handleDelete(record.key)}>Delete</a>
          ) :
            null
      }
    ];
  }

  state = {
    data : [],
    count : 0
  };

  handleDelete = (key : any) => {
    const data = [...this.state.data];
    this.setState({
      //@ts-ignore
      data : data.filter(item => item.key !== key)
    })
  };

  handleAdd = () => {
    const {data, count} = this.state;
    const newData = {
      key : count,
      qualification : '',
      rate : '',
      overtime : '',
      onsiteRate : '',
      onsiteOvertime : ''
    };
    this.setState({
      data : [...data , newData],
      count : count + 1
    })
  };

  handleSave = (row : any) => {
    const newData = [...this.state.data];
    //@ts-ignore
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    //@ts-ignore
    newData.splice(index, 1, {...item, ...row});
    this.setState({data : newData});
  };

  render() {
    const {data} = this.state;
    const components = {
      body : {
        row : EditableFormRow,
        cell : EditableCell
      }
    };
    //@ts-ignore
    const columns = this.columns.map(col => {
      if(!col.editable){
        return col;
      }
      return {
        ...col,
        onCell : (record : any) => ({
          record,
          editable : col.editable,
          dataIndex : col.dataIndex,
          title : col.title,
          handleSave : this.handleSave
        })
      };
    });

    return (
      <div>
        <Button onClick={this.handleAdd} type="primary" style={{marginBottom : 16}}>
          Add rate
        </Button>
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={data}
          columns={columns}
        />
      </div>
    );
  }
}

type Props = {};

type State = {};

class RateCard extends Component<Props & RouteComponentProps, State>{

  handleLogout = () => {
    actions.logout();
  };

  render() {
    return(
      <Fragment>
        <Layout className="full-height">
          <Sider
            breakpoint="lg"
            collapsedWidth="0"
            theme="dark"
            width={'15%'}
          >
            <div className="logo">ProPlanner</div>
            <Menu mode="inline" theme="dark" defaultSelectedKeys={['4']}>
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
                  <div className="title">Rate Card</div>
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
                              <Text className="projects-title">Rates</Text>
                            </Col>
                          </Row>
                          <Divider />

                          <EditableTable/>
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


export default withRouter(RateCard);