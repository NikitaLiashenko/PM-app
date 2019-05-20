import {ManagerStore} from '@/stores';
import actions from '@/actions';
import React, {Fragment, Component, SyntheticEvent} from "react";
import {observer} from 'mobx-react';
import {FormComponentProps} from 'antd/lib/form/Form';
import {Risk} from '@/services/riskService';
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
import {Task} from "@/services/taskService";

const {Text, Title, Paragraph} = Typography;
const {TextArea} = Input;
const {Option} = Select;

type Props = {
  managerStore : ManagerStore,
  projectId : string
};

type State = {
  openRiskView : boolean,
  isRiskLoading : boolean,
  areRisksLoading : boolean,
  riskId : string,
  openRiskModal : boolean,
  confirmLoading : boolean
};

@observer
class Risks extends Component<Props & FormComponentProps, State> {
  state = {
    openRiskView : false,
    isRiskLoading : false,
    areRisksLoading : false,
    riskId : '',
    openRiskModal : false,
    confirmLoading : false
  };

  componentWillMount(): void {
    this.setState({
      areRisksLoading : true
    });
    actions.manager.cleanRisks();
    actions.manager.getProjectRisks(this.props.projectId)
      .then(() => {
        this.setState({
          areRisksLoading : false
        });
      })
      .catch(console.error);
  }

  handleShowRisk(riskId : string) {
    this.setState({
      openRiskView : true,
      isRiskLoading : true,
      riskId : ''
    });

    actions.manager.getProjectRisk(this.props.projectId, riskId)
      .then(() => {
        this.setState({
          isRiskLoading : false,
          riskId
        });
      })
      .catch(console.error);
  }

  handleRiskViewClose(){
    actions.manager.cleanRisk();
    this.setState({
      openRiskView : false,
      riskId : ''
    })
  }

  handleRiskEdit(){
    this.setState({
      openRiskModal : true
    })
  }

  handleRiskDelete(){
    actions.manager.deleteProjectRisk()
      .then(() => {
        actions.manager.cleanRisk();
        this.setState({
          riskId : '',
          areRisksLoading : true,
          openRiskView : false
        });
        actions.manager.cleanRisks();
        return actions.manager.getProjectRisks(this.props.projectId);
      })
      .then(() => {
        this.setState({
          areRisksLoading : false
        });
      })
      .catch(console.error);
  }

  handleModalSubmit(e : SyntheticEvent){
    e.preventDefault();
    if(this.props.form.isFieldsTouched()){
      this.props.form.validateFields((err, values) => {
        if(!err){
          this.setState({
            confirmLoading : true
          });

          if(this.state.riskId){
            actions.manager.updateProjectRisk(this.state.riskId, values)
              .then(() => {
                actions.manager.cleanRisks();
                this.setState({
                  openRiskModal : false,
                  areRisksLoading : true
                });
                return actions.manager.getProjectRisks(this.props.projectId)
              })
              .then(() => {
                this.setState({
                  areRisksLoading : false,
                  isRiskLoading : true
                });
                actions.manager.cleanRisk();
                return actions.manager.getProjectRisk(this.props.projectId, this.state.riskId);
              })
              .then(() => {
                this.setState({
                  isRiskLoading : false,
                  confirmLoading : false
                });
                this.props.form.resetFields();
              })
              .catch(console.error);
          } else {
            utils.omitNilAndEmptyStrings(values);
            actions.manager.createProjectRisk(values)
              .then(result => {
                actions.manager.cleanRisks();
                this.setState({
                  riskId : result.riskId,
                  openRiskModal : false,
                  areRisksLoading : true
                });

                return actions.manager.getProjectRisks(this.props.projectId);
              })
              .then(() => {
                this.setState({
                  areRisksLoading : false,
                  confirmLoading : false
                });
                this.props.form.resetFields();
              })
              .catch(console.error);
          }
        }
      });
    }
  }

  handleModalCancel(){
    this.props.form.resetFields();
    this.setState({
      openRiskModal : false
    });
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return(
      <Fragment>
        <Row>
          <Col span={24}>
            <div className="content-container">
              <Row type="flex" justify="space-around" align="top" className="full-height">
                <Col span={12} style={{height : '100%'}}>
                  <Card style={{height : '100%'}} loading={this.state.areRisksLoading}>
                    <div>
                      <Row>
                        <Col span={20}>
                          <Text className="projects-title">Risks</Text>
                          <Badge count={this.props.managerStore.risks.length}
                                 style={{
                                   backgroundColor: '#fff',
                                   color: '#999',
                                   boxShadow: '0 0 0 1px #d9d9d9 inset',
                                   marginBottom : '5px'
                                 }} />
                        </Col>
                        <Col span={4}>
                          <Icon type="plus" key="plus" onClick={this.handleRiskEdit.bind(this)} style={{fontSize : '20px'}}/>
                        </Col>
                      </Row>
                      <Divider />
                      <Row type="flex" justify="start" align="top">
                        {this.props.managerStore.risks.length ?
                          this.props.managerStore.risks.map((element, i) =>
                            <div
                              key={i}
                              className="task"
                              onClick={this.handleShowRisk.bind(this, element.riskId as string)}
                            >
                              <Row type="flex" justify="start" align="middle" style={{height : '100%'}}>
                                <Col span={20}>
                                  <Title level={4} style={{
                                    margin : 0
                                  }}>{element.summary}</Title>
                                </Col>
                                <Col span={4}>
                                  <Text type="secondary">{`${element.probability as number * 100}% `}</Text>
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
                {this.state.openRiskView ?
                  <Col span={11} style={{height : '100%'}}>
                    <Card
                      extra={[
                        <Button type="primary" key="edit" onClick={this.handleRiskEdit.bind(this)} style={{height: '35px', marginRight : '25px'}}>Edit Risk</Button>,
                        <Button type="danger" key="delete" onClick={this.handleRiskDelete.bind(this)} style={{height: '35px', marginRight : '400px'}}>Delete Risk</Button>,
                        <Icon type="close" key="close" onClick={this.handleRiskViewClose.bind(this)} style={{fontSize : '20px'}}/>
                      ]}
                      style={{height : '100%'}}
                      loading={this.state.isRiskLoading}
                    >
                      <Row type="flex" justify="start" align="top" style={{height : '100%'}}>
                        <Col span={24}>
                          <Row>
                            <Col span={24} style={{ height : '55px'}}>
                              <Title level={2}>{this.props.managerStore.risk.summary}</Title>
                            </Col>
                            <Col span={24}>
                              <Row>
                                <Col span={4}>
                                  <Text strong={true}>Probability:</Text>
                                </Col>
                                <Col span={2}>
                                  <Text>{this.props.managerStore.risk.probability as number * 100 || '  '} %</Text>
                                </Col>
                                <Col span={4}>
                                  <Text strong={true}>Impact:</Text>
                                </Col>
                                <Col span={2}>
                                  <Text>{this.props.managerStore.risk.impact || '  '}</Text>
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
                                  <Paragraph>{this.props.managerStore.risk.description}</Paragraph>
                                </Col>
                                <Col span={24}>
                                  <Text strong={true}>Mitigation action:</Text>
                                  <Paragraph>{this.props.managerStore.risk.mitigationAction}</Paragraph>
                                </Col>
                                <Col span={24}>
                                  <Text strong={true}>Resolution cost:</Text>
                                  <Paragraph>{this.props.managerStore.risk.resolutionCost}</Paragraph>
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
          title={this.props.managerStore.risk.riskId ? 'Edit risk' : 'Create risk'}
          centered
          visible={this.state.openRiskModal}
          onOk={(e) => this.handleModalSubmit(e)}
          onCancel={() => this.handleModalCancel()}
          confirmLoading={this.state.confirmLoading}
          okText={this.props.managerStore.risk.riskId ? 'Update' : 'Create'}
        >
          <Form layout="vertical">
            <Form.Item label="Summary">
              {this.props.managerStore.risk.summary ?
                getFieldDecorator('summary', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the risk summary!'
                    }
                  ],
                  initialValue : this.props.managerStore.risk.summary
                })(
                  <Input />
                ) :
                getFieldDecorator('summary', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the risk summary!'
                    }
                  ]
                })(
                  <Input />
                )
              }
            </Form.Item>
            <Form.Item label="Probability" className="half-width">
              {this.props.managerStore.risk.probability ?
                getFieldDecorator('probability', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the risk probability!'
                    }
                  ],
                  initialValue : this.props.managerStore.risk.probability
                })(
                  <InputNumber min={0}
                               max={100}
                               step={0.01}
                               formatter={value => `${value as number * 100}%`}
                               parser={value => parseInt((value as string).replace('%', '')) / 100}
                               className="full-width"
                  />
                ) :
                getFieldDecorator('probability', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the risk probability!'
                    }
                  ]
                })(
                  <InputNumber min={0}
                               max={100}
                               step={0.01}
                               formatter={value => `${value as number * 100}%`}
                               parser={value => parseInt((value as string).replace('%', '')) / 100}
                               className="full-width"
                  />
                )
              }
            </Form.Item>
            <Form.Item label="Description">
              {this.props.managerStore.risk.description ?
                getFieldDecorator('description', {
                  initialValue : this.props.managerStore.risk.description
                })(
                  <TextArea/>
                ) :
                getFieldDecorator('description', {})(
                  <TextArea/>
                )
              }
            </Form.Item>
            <Form.Item label="Risk Impact">
              {this.props.managerStore.risk.impact ?
                getFieldDecorator('impact', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the risk impact!'
                    }
                  ],
                  initialValue : this.props.managerStore.risk.impact
                })(
                  <Select>
                    <Option value="LOW">Low</Option>
                    <Option value="MEDIUM">Medium</Option>
                    <Option value="HIGH">High</Option>
                    <Option value="CRITICAL">Critical</Option>
                  </Select>
                ) :
                getFieldDecorator('impact', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the risk impact!'
                    }
                  ]
                })(
                  <Select>
                    <Option value="LOW">Low</Option>
                    <Option value="MEDIUM">Medium</Option>
                    <Option value="HIGH">High</Option>
                    <Option value="CRITICAL">Critical</Option>
                  </Select>
                )
              }
            </Form.Item>
            <Form.Item label="Mitigation Action">
              {this.props.managerStore.risk.mitigationAction ?
                getFieldDecorator('mitigationAction', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the risk mitigation action!'
                    }
                  ],
                  initialValue : this.props.managerStore.risk.mitigationAction
                })(
                  <Input />
                ) :
                getFieldDecorator('mitigationAction', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the risk mitigation action!'
                    }
                  ]
                })(
                  <Input />
                )
              }
            </Form.Item>
            <Form.Item label="Resolution Cost">
              {this.props.managerStore.risk.resolutionCost ?
                getFieldDecorator('resolutionCost', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the risk resolution cost!'
                    }
                  ],
                  initialValue : this.props.managerStore.risk.resolutionCost
                })(
                  <InputNumber min={0} className="full-width" />
                ) :
                getFieldDecorator('resolutionCost', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input the risk resolution cost!'
                    }
                  ]
                })(
                  <InputNumber min={0} className="full-width" />
                )
              }
            </Form.Item>
          </Form>
        </Modal>
      </Fragment>
    );
  }
}

export default Form.create<Props>()(Risks);