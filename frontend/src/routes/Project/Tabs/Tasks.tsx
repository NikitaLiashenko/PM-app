import {ManagerStore} from '@/stores';
import actions from '@/actions';
import React, {Fragment, Component, SyntheticEvent} from 'react';
import {observer} from 'mobx-react';
import {FormComponentProps} from "antd/lib/form/Form";
import {Task} from "@/services/taskService";
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
  Button,
  Modal,
  Select
} from 'antd';
import utils from '@/utils';

const {Text, Title, Paragraph} = Typography;
const {TextArea} = Input;
const {Option} = Select;

type Props = {
  managerStore : ManagerStore,
  projectId : string
};

type State = {
  openTaskView : boolean,
  isTaskLoading : boolean,
  areTasksLoading : boolean,
  taskId : string,
  openTaskModal : boolean,
  confirmLoading : boolean
};

@observer
class Tasks extends Component<Props & FormComponentProps, State>{
  state = {
    openTaskView : false,
    isTaskLoading : false,
    areTasksLoading : false,
    taskId : '',
    openTaskModal : false,
    confirmLoading : false
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
        return actions.getProjectTeam();
      })
      .catch(console.error);
  }

  handleShowTask(taskId : string){
    this.setState({
      openTaskView : true,
      isTaskLoading : true,
      taskId : ''
    });

    actions.getProjectTask(this.props.projectId, taskId)
      .then(() => {
        this.setState({
          isTaskLoading : false,
          taskId
        });
      })
      .catch(actionError => {
        console.error(actionError);
      });
  }

  handleTaskViewClose() {
    actions.cleanTask();
    this.setState({
      openTaskView : false,
      taskId : ''
    })
  }

  handleTaskEdit(){
    this.setState({
      openTaskModal : true
    })
  }

  handleTaskDelete(){
    actions.deleteProjectTask()
      .then(() => {
        actions.cleanTask();
        this.setState({
          taskId : '',
          areTasksLoading : true,
          openTaskView : false
        });
        actions.cleanTasks();
        return actions.getProjectTasks(this.props.projectId);
      })
      .then(() => {
        this.setState({
          areTasksLoading : false
        });
      })
      .catch(actionError => {
        console.error(actionError);
      });
  }

  handleModalSubmit(e : SyntheticEvent){
    e.preventDefault();

    if(this.props.form.isFieldsTouched()) {
      this.props.form.validateFields((err, values) => {
        if(!err){
          console.log(JSON.stringify(values));
          this.setState({
            confirmLoading : true
          });

          if(this.state.taskId) {
            actions.updateProjectTask(this.state.taskId, values)
              .then(() => {
                actions.cleanTasks();
                this.setState({
                  openTaskModal: false,
                  areTasksLoading: true
                });
                return actions.getProjectTasks(this.props.projectId);
              })
              .then(() => {
                this.setState({
                  areTasksLoading: false,
                  isTaskLoading: true
                });
                actions.cleanTask();
                return actions.getProjectTask(this.props.projectId, this.state.taskId);
              })
              .then(() => {
                this.setState({
                  isTaskLoading: false,
                  confirmLoading: false
                })
              })
              .catch(error => {
                console.error(error);
              });
          } else {
            if(!values.predecessor){
              values.predecessor = [];
            }
            utils.omitNilAndEmptyStrings(values);
            actions.createProjectTask(values)
              .then(result => {
                actions.cleanTasks();
                this.setState({
                  taskId : result.taskId,
                  openTaskModal: false,
                  areTasksLoading: true
                });
                return actions.getProjectTasks(this.props.projectId);
              })
              .then(() => {
                this.setState({
                  areTasksLoading: false,
                  confirmLoading : false
                });
                this.props.form.resetFields();
              })
              .catch(error => {
                console.error(error);
              });
          }
        }
      });
    }
  }

  handleModalCancel(){
    this.props.form.resetFields();
    this.setState({
      openTaskModal : false
    });
  }

  render(){
    const { getFieldDecorator } = this.props.form;
    return(
      <Fragment>
        <Row>
          <Col span={24}>
            <div className="content-container">
              <Row type="flex" justify="space-around" align="top" className="full-height">
                <Col span={12} style={{height : '100%'}}>
                  <Card style={{height : '100%'}} loading={this.state.areTasksLoading}>
                    <div>
                      <Row>
                        <Col span={20}>
                          <Text className="projects-title">Tasks</Text>
                          <Badge count={this.props.managerStore.tasks.length}
                                 style={{
                                   backgroundColor: '#fff',
                                   color: '#999',
                                   boxShadow: '0 0 0 1px #d9d9d9 inset',
                                   marginBottom : '5px'
                                 }} />
                        </Col>
                        <Col span={4}>
                          <Icon type="plus" key="plus" onClick={this.handleTaskEdit.bind(this)} style={{fontSize : '20px'}}/>
                        </Col>
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
                                  <Text type="secondary">{`${element.estimateMax} d`}</Text>
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
                        <Button type="primary" key="edit" onClick={this.handleTaskEdit.bind(this)} style={{height: '35px', marginRight : '25px'}}>Edit Task</Button>,
                        <Button type="danger" key="delete" onClick={this.handleTaskDelete.bind(this)} style={{height: '35px', marginRight : '400px'}}>Delete Task</Button>,
                        <Icon type="close" key="close" onClick={this.handleTaskViewClose.bind(this)} style={{fontSize : '20px'}}/>
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
                                  <Text>{this.props.managerStore.task.estimateMin || '  '} d</Text>
                                </Col>
                                <Col span={4}>
                                  <Text strong={true}>Estimate Max:</Text>
                                </Col>
                                <Col span={2}>
                                  <Text>{this.props.managerStore.task.estimateMax || '  '} d</Text>
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
                                <Col span={24}>
                                  <Text strong={true}>Progress:</Text>
                                  <Paragraph>{this.props.managerStore.task.progress as number * 100}%</Paragraph>
                                </Col>
                                <Col span={24}>
                                  <Text strong={true}>Predecessors:</Text>
                                  {this.props.managerStore.task.predecessor && (this.props.managerStore.task.predecessor as Array<string>).map((element, i) => {
                                    const task = (this.props.managerStore.tasks as Array<Task>).find(task => task.taskId === element);
                                    if(!task){
                                      throw Error('Task match failed')
                                    }
                                    return <Paragraph key={i}>{task.summary}</Paragraph>
                                  })}
                                </Col>
                                <Col span={24}>
                                  <Text strong={true}>Assignee:</Text>
                                  {this.props.managerStore.task.assignee ? (
                                    <Paragraph>{[this.props.managerStore.task.assignee].map(assignee => {
                                      const worker = this.props.managerStore.projectTeam.find(worker => worker.username === assignee);
                                      //@ts-ignore
                                      return `${worker.firstName} ${worker.lastName}`;
                                    })}</Paragraph>
                                  ) : (
                                    <Paragraph></Paragraph>
                                  )}
                                </Col>
                              </Row>
                            </Col>
                          </Row>
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

        <Modal
          title={this.props.managerStore.task.taskId ? 'Edit task' : 'Create task'}
          centered
          visible={this.state.openTaskModal}
          onOk={(e) => this.handleModalSubmit(e)}
          onCancel={() => this.handleModalCancel()}
          confirmLoading={this.state.confirmLoading}
          okText={this.props.managerStore.task.taskId ? 'Update' : 'Create'}
          bodyStyle={{
            height : '60vh',
            overflowY : 'scroll'
          }}
        >
          <Form layout="vertical">
            <Form.Item label="Summary">
              {this.props.managerStore.task.summary ?
                getFieldDecorator('summary', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task summary!'
                    }
                  ],
                  initialValue : this.props.managerStore.task.summary
                })(
                  <Input />
                ) :
                getFieldDecorator('summary', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task summary!'
                    }
                  ]
                })(
                  <Input />
                )
              }
            </Form.Item>
            <Form.Item label="Estimate Min" className="half-width">
              {this.props.managerStore.task.estimateMin ?
                getFieldDecorator('estimateMin', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task minimum estimate!'
                    }
                  ],
                  initialValue : this.props.managerStore.task.estimateMin
                })(
                  <InputNumber min={0} className="full-width" />
                ) :
                getFieldDecorator('estimateMin', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task minimum estimate!'
                    }
                  ]
                })(
                  <InputNumber min={0} className="full-width" />
                )
              }
            </Form.Item>
            <Form.Item label="Estimate Max" className="half-width">
              {this.props.managerStore.task.estimateMax ?
                getFieldDecorator('estimateMax', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task maximum estimate!'
                    }
                  ],
                  initialValue : this.props.managerStore.task.estimateMax
                })(
                  <InputNumber min={0} className="full-width" />
                ) :
                getFieldDecorator('estimateMax', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task maximum estimate!'
                    }
                  ]
                })(
                  <InputNumber min={0} className="full-width" />
                )
              }
            </Form.Item>
            <Form.Item label="Description">
              {this.props.managerStore.task.description ?
                getFieldDecorator('description', {
                  initialValue : this.props.managerStore.task.description
                })(
                  <TextArea/>
                ) :
                getFieldDecorator('description', {})(
                  <TextArea/>
                )
              }
            </Form.Item>
            <Form.Item label="Task Type">
              {this.props.managerStore.task.taskType ?
                getFieldDecorator('taskType', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task type!'
                    }
                  ],
                  initialValue : this.props.managerStore.task.taskType
                })(
                  <Select>
                    <Option value="Task">Task</Option>
                    <Option value="Milestone">Milestone</Option>
                  </Select>
                ) :
                getFieldDecorator('taskType', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task type!'
                    }
                  ]
                })(
                  <Select>
                    <Option value="Task">Task</Option>
                    <Option value="Milestone">Milestone</Option>
                  </Select>
                )
              }
            </Form.Item>
            <Form.Item label="Work Type">
              {this.props.managerStore.task.workType ?
                getFieldDecorator('workType', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task work type!'
                    }
                  ],
                  initialValue : this.props.managerStore.task.workType
                })(
                  <Select>
                    <Option value="Backend">Backend</Option>
                    <Option value="Frontend">Frontend</Option>
                    <Option value="Android">Android</Option>
                    <Option value="IOS">IOS</Option>
                    <Option value="QA">QA</Option>
                    <Option value="DevOps">DevOps</Option>
                  </Select>
                ) :
                getFieldDecorator('workType', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task work type!'
                    }
                  ]
                })(
                  <Select>
                    <Option value="Backend">Backend</Option>
                    <Option value="Frontend">Frontend</Option>
                    <Option value="Android">Android</Option>
                    <Option value="IOS">IOS</Option>
                    <Option value="QA">QA</Option>
                    <Option value="DevOps">DevOps</Option>
                  </Select>
                )
              }
            </Form.Item>
            <Form.Item label="Task Cost">
              {this.props.managerStore.task.taskCost ?
                getFieldDecorator('taskCost', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task cost!'
                    }
                  ],
                  initialValue : this.props.managerStore.task.taskCost
                })(
                  <InputNumber min={0} className="full-width" />
                ) :
                getFieldDecorator('taskCost', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task cost!'
                    }
                  ]
                })(
                  <InputNumber min={0} className="full-width" />
                )
              }
            </Form.Item>
            <Form.Item label="Crash Cost">
              {this.props.managerStore.task.crashCost ?
                getFieldDecorator('crashCost', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task crash cost!'
                    }
                  ],
                  initialValue : this.props.managerStore.task.crashCost
                })(
                  <InputNumber min={0} className="full-width" />
                ) :
                getFieldDecorator('crashCost', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task crash cost!'
                    }
                  ]
                })(
                  <InputNumber min={0} className="full-width" />
                )
              }
            </Form.Item>
            <Form.Item label="Progress">
              {this.props.managerStore.task.progress ?
                getFieldDecorator('progress', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task progress!'
                    }
                  ],
                  initialValue : this.props.managerStore.task.progress
                })(
                  <InputNumber min={0}
                               max={100}
                               step={0.01}
                               formatter={value => `${value as number * 100}%`}
                               parser={value => parseInt((value as string).replace('%', '')) / 100}
                               className="full-width"
                  />
                ) :
                getFieldDecorator('progress', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the task progress!'
                    }
                  ]
                })(
                  <InputNumber min={0}
                               max={100}
                               step={0.01}
                               formatter={value => `${value as number * 100}%`}
                               parser={value => parseInt((value as string).replace('%', '')) / 100}
                               className="full-width" />
                )
              }
            </Form.Item>
            <Form.Item label="Predecessors:">
              {
                this.props.managerStore.task.predecessor ?
                  getFieldDecorator('predecessor', {
                    rules: [
                      {
                        message: 'Please input the task predecessors!',
                        type : "array"
                      }
                    ],
                    initialValue : this.props.managerStore.task.predecessor
                  })(
                    <Select mode="multiple">
                      {this.props.managerStore.tasks && this.props.managerStore.tasks.map((element, i) => {
                        if(element.taskId !== this.props.managerStore.task.taskId){
                          return <Option key={i} value={element.taskId}>{element.summary}</Option>
                        }
                      })}
                    </Select>
                  )
                :
                  getFieldDecorator('predecessor', {
                    rules: [
                      {
                        message: 'Please input the task predecessors!',
                        type : "array"
                      }
                    ]
                  })(
                    <Select mode="multiple">
                      {this.props.managerStore.tasks && this.props.managerStore.tasks.map((element, i) => {
                        if(element.taskId !== this.props.managerStore.task.taskId){
                          return <Option key={i} value={element.taskId}>{element.summary}</Option>
                        }
                      })}
                    </Select>
                  )
              }
            </Form.Item>
            <Form.Item label="Assignee:">
              {
                this.props.managerStore.task.assignee ?
                  getFieldDecorator('assignee', {
                    rules: [
                      {
                        message: 'Please input the task assignee!'
                      }
                    ],
                    initialValue : this.props.managerStore.task.assignee
                  })(
                    <Select>
                      {this.props.managerStore.projectTeam && this.props.managerStore.projectTeam.map((element, i) => {
                        return <Option key={i} value={element.username}>{`${element.firstName} ${element.lastName}`}</Option>
                      })}
                    </Select>
                  )
                  :
                  getFieldDecorator('assignee', {
                    rules: [
                      {
                        message: 'Please input the task assignee!'
                      }
                    ]
                  })(
                    <Select>
                      {this.props.managerStore.projectTeam && this.props.managerStore.projectTeam.map((element, i) => {
                        return <Option key={i} value={element.username}>{`${element.firstName} ${element.lastName}`}</Option>
                      })}
                    </Select>
                  )
              }
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default Form.create<Props>()(Tasks);