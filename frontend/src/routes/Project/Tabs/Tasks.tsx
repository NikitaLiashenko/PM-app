import {ManagerStore} from '@/stores';
import actions from '@/actions';
import React, {Fragment, Component, SyntheticEvent} from 'react';
import {observer} from 'mobx-react';
import {FormComponentProps} from "antd/lib/form/Form";
import {
  Badge,
  Card,
  Col,
  Divider,
  Form,
  Icon,
  Input,
  InputNumber,
  Row,
  Typography,
  Button
} from 'antd';

const {Text, Title, Paragraph} = Typography;
const {TextArea} = Input;

type Props = {
  managerStore : ManagerStore,
  projectId : string
};

type State = {
  openTaskView : boolean,
  isTaskLoading : boolean,
  areTasksLoading : boolean
};

@observer
class Tasks extends Component<Props & FormComponentProps, State>{
  state = {
    openTaskView : false,
    isTaskLoading : false,
    areTasksLoading : false
  };

  componentWillMount(): void {
    this.setState({
      areTasksLoading : true
    });
    actions.cleanTasks();
    actions.getProjectTasks(this.props.projectId)
      .then(() => {
        this.setState({
          areTasksLoading : false
        });
      })
      .catch(console.error);
  }

  handleShowTask(taskId : string){
    this.setState({
      openTaskView : true,
      isTaskLoading : true
    });

    actions.getProjectTask(this.props.projectId, taskId)
      .then(() => {
        this.setState({
          isTaskLoading : false
        });
      })
      .catch(actionError => {
        console.error(actionError);
      });
  }

  handleTaskViewClose() {
    actions.cleanTask();
    this.setState({
      openTaskView : false
    })
  }

  handleTaskEdit(){}

  handleTaskDelete(){}

  render(){
    const { getFieldDecorator } = this.props.form;
    return(
      <Row>
        <Col span={24}>
          <div className="content-container">
            <Row type="flex" justify="space-around" align="top" className="full-height">
              <Col span={12} style={{height : '100%'}}>
                <Card style={{height : '100%'}} loading={this.state.areTasksLoading}>
                  <div>
                    <Row>
                      <Text className="projects-title">Tasks</Text>
                      <Badge count={this.props.managerStore.tasks.length}
                             style={{
                               backgroundColor: '#fff',
                               color: '#999',
                               boxShadow: '0 0 0 1px #d9d9d9 inset',
                               marginBottom : '5px'
                             }} />
                    </Row>
                    <Divider />
                    <Row type="flex" justify="start" align="top">
                      {this.props.managerStore.tasks.length ?
                        this.props.managerStore.tasks.map((element, i) =>
                          <div
                            key={i}
                            className="task"
                            onClick={this.handleShowTask.bind(this, element.taskId as string)}
                          >
                            <Row type="flex" justify="start" align="middle" style={{height : '100%'}}>
                              <Col span={20}>
                                <Title level={4} style={{
                                  margin : 0
                                }}>{element.summary}</Title>
                              </Col>
                              <Col span={4}>
                                <Text type="secondary">{`${element.estimateMax} h`}</Text>
                              </Col>
                            </Row>
                          </div>
                        ) :
                        ''
                      }
                    </Row>
                  </div>
                </Card>
              </Col>
              {this.state.openTaskView ?
                <Col span={11} style={{height : '100%'}}>
                  <Card
                    extra={[
                      <Button type="primary" onClick={this.handleTaskEdit.bind(this)} style={{height: '35px', marginRight : '25px'}}>Edit Task</Button>,
                      <Button type="danger" onClick={this.handleTaskDelete.bind(this)} style={{height: '35px', marginRight : '400px'}}>Delete Task</Button>,
                      <Icon type="close" onClick={this.handleTaskViewClose.bind(this)} style={{fontSize : '20px'}}/>
                    ]}
                    style={{height : '100%'}}
                    loading={this.state.isTaskLoading}
                  >
                    <Row type="flex" justify="start" align="top" style={{height : '100%'}}>
                      <Col span={24}>
                        <Row>
                          <Col span={24} style={{ height : '55px'}}>
                            <Title level={2}>{this.props.managerStore.task.summary}</Title>
                          </Col>
                          <Col span={24}>
                            <Row>
                              <Col span={4}>
                                <Text strong={true}>Estimate Min:</Text>
                              </Col>
                              <Col span={2}>
                                <Text>{this.props.managerStore.task.estimateMin || '  '} h</Text>
                              </Col>
                              <Col span={4}>
                                <Text strong={true}>Estimate Max:</Text>
                              </Col>
                              <Col span={2}>
                                <Text>{this.props.managerStore.task.estimateMax || '  '} h</Text>
                              </Col>
                            </Row>
                          </Col>
                          <Divider/>
                          <Col span={24}>
                            <Row>
                              <Col span={24}>
                                <Text strong={true}>Description:</Text>
                              </Col>
                              <Col span={24}>
                                <Paragraph>{this.props.managerStore.task.description}</Paragraph>
                              </Col>
                              <Col span={24}>
                                <Text strong={true}>Task type:</Text>
                                <Paragraph>{this.props.managerStore.task.taskType}</Paragraph>
                              </Col>
                              <Col span={24}>
                                <Text strong={true}>Work type:</Text>
                                <Paragraph>{this.props.managerStore.task.workType}</Paragraph>
                              </Col>
                              <Col span={24}>
                                <Text strong={true}>Task cost:</Text>
                                <Paragraph>$ {this.props.managerStore.task.taskCost}</Paragraph>
                              </Col>
                              <Col span={24}>
                                <Text strong={true}>Crash cost:</Text>
                                <Paragraph>$ {this.props.managerStore.task.crashCost}</Paragraph>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        {/*<Form layout="vertical" onSubmit={this.handleTaskUpdate.bind(this)}>*/}
                        {/*  <Form.Item label="Summary">*/}
                        {/*    {getFieldDecorator('summary', {*/}
                        {/*      rules: [*/}
                        {/*        {*/}
                        {/*          required: true,*/}
                        {/*          message: 'Please input task summary!'*/}
                        {/*        }*/}
                        {/*      ],*/}
                        {/*      initialValue : this.props.managerStore.task.summary*/}
                        {/*    })(*/}
                        {/*      <Input/>*/}
                        {/*    )}*/}
                        {/*  </Form.Item>*/}
                        {/*  <Form.Item label="Description">*/}
                        {/*    {getFieldDecorator('description', {*/}
                        {/*      initialValue : this.props.managerStore.task.description*/}
                        {/*    })(*/}
                        {/*      <TextArea/>*/}
                        {/*    )}*/}
                        {/*  </Form.Item>*/}
                        {/*  <Form.Item label="Estimate min">*/}
                        {/*    {getFieldDecorator('estimateMin', {*/}
                        {/*      rules : [*/}
                        {/*        {*/}
                        {/*          required : true,*/}
                        {/*          message : 'Please input task minimal estimate!'*/}
                        {/*        }*/}
                        {/*      ],*/}
                        {/*      initialValue : this.props.managerStore.task.estimateMin*/}
                        {/*    })(*/}
                        {/*      <InputNumber min={0} className="full-width"/>*/}
                        {/*    )}*/}
                        {/*  </Form.Item>*/}
                        {/*</Form>*/}
                      </Col>
                    </Row>
                  </Card>
                </Col> :
                ''
              }
            </Row>
          </div>
        </Col>
      </Row>
    );
  }
}

export default Form.create<Props>()(Tasks);