import {ManagerStore} from '@/stores';
import actions from '@/actions';
import React, {Fragment, Component, SyntheticEvent} from "react";
import {observer} from "mobx-react";
import moment from 'moment';
import utils from '@/utils';
import {FormComponentProps} from "antd/lib/form/Form";

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Icon,
  Typography
} from 'antd';

const {TextArea} = Input;
const {Title} = Typography;

type Props = {
  managerStore : ManagerStore,
  projectId : string
};

type State = {
  isUpdating : boolean,
  isCriticalPathCounted : boolean,
  isCriticalPathLoading : boolean,
  areProjectDatesCounted : boolean,
  areProjectDatesLoading : boolean
};

@observer
class MainInfo extends Component<Props & FormComponentProps, State> {
  state = {
    isUpdating : false,
    isCriticalPathCounted : false,
    isCriticalPathLoading : false,
    areProjectDatesCounted : false,
    areProjectDatesLoading : false
  };

  componentWillMount(): void {
    actions.cleanProject();
    actions.getProject(this.props.projectId)
      .catch(console.error);
  }

  handleProjectUpdate(e : SyntheticEvent){
    e.preventDefault();
    if(this.props.form.isFieldsTouched()){
      this.props.form.validateFields((err, values) => {
        if(!err){
          this.setState({
            isUpdating : true
          });

          values.startDate = values.startDate.format('YYYY-MM-DD');

          if(values.endDate){
            values.endDate = values.endDate.format('YYYY-MM-DD')
          }

          utils.omitNilAndEmptyStrings(values);

          console.log(values);
          actions.updateProject(values, this.props.projectId)
            .then(() => {
              this.setState({
                isUpdating : false
              })
            })
            .catch(actionError => {
              console.error(actionError);
            })
        }
      });
    }
  }

  handleCountCriticalPath(e : SyntheticEvent){
    e.preventDefault();

    this.setState({
      isCriticalPathLoading : true
    });
    actions.countCriticalPath()
      .then(() => {
        this.setState({
          isCriticalPathCounted : true,
          isCriticalPathLoading : false
        })
      })
      .catch(error => {
        console.error(error);
      });
  }

  handleCountProjectDates(e : SyntheticEvent){
    e.preventDefault();

    this.setState({
      areProjectDatesLoading : true
    });
    actions.getProjectTeam()
      .then(() => {
        return actions.countProjectDates();
      })
      .then(() => {
        this.setState({
          areProjectDatesCounted : true,
          areProjectDatesLoading : false
        });
        return actions.getProject(this.props.projectId as string);
      })
      .catch(error => {
        console.error(error);
      });
  }

  render(){
    const { getFieldDecorator } = this.props.form;
    return(
      <Row type="flex" justify="space-between" align="top">
        <Col span={12}>
          <Form layout="vertical" onSubmit={this.handleProjectUpdate.bind(this)}>
            <Form.Item label="Title">
              {getFieldDecorator('title', {
                rules: [
                  {
                    required: true,
                    message: 'Please input the title of project!'
                  }
                ],
                initialValue : this.props.managerStore.project.title
              })(
                <Input/>
              )}
            </Form.Item>
            <Form.Item label="Description">
              {getFieldDecorator('description', {
                initialValue : this.props.managerStore.project.description
              })(
                <TextArea/>
              )}
            </Form.Item>
            <Form.Item label="Start Date">
              {this.props.managerStore.project.startDate ?
                getFieldDecorator('startDate', {
                  initialValue : moment(this.props.managerStore.project.startDate)
                })(
                  <DatePicker className="full-width"/>
                ) :
                getFieldDecorator('startDate')(
                  <DatePicker className="full-width"/>
                )
              }
            </Form.Item>
            <Form.Item label="End Date">
              {this.props.managerStore.project.endDate ?
                getFieldDecorator('endDate', {
                  initialValue : moment(this.props.managerStore.project.endDate)
                })(
                  <DatePicker className="full-width" disabled={true}/>
                ) :
                getFieldDecorator('endDate')(
                  <DatePicker className="full-width" disabled={true}/>
                )
              }
            </Form.Item>
            <Form.Item label="Duration">
              {getFieldDecorator('projectDuration', {
                initialValue : this.props.managerStore.project.projectDuration
              })(
                <InputNumber min={0} className="full-width" disabled={true}/>
              )}
            </Form.Item>
            <Form.Item label="Overhead cost per day">
              {getFieldDecorator('overheadCost', {
                rules: [
                  {
                    required: true,
                    message: 'Please input overhead cost of the project!'
                  }
                ],
                initialValue : this.props.managerStore.project.overheadCostPerDay
              })(
                <InputNumber min={0} className="full-width"/>
              )}
            </Form.Item>
            <Form.Item label="Project cost">
              {getFieldDecorator('projectCost', {
                initialValue : this.props.managerStore.project.projectCost
              })(
                <InputNumber min={0} className="full-width" disabled/>
              )}
            </Form.Item>
            <Form.Item>
              <Row justify="end">
                <Col offset={19}>
                  <Button type="primary" icon="check" loading={this.state.isUpdating} htmlType="submit">
                    Update Project
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <div className="full-width">
            <div className="content-container">
              <Row type="flex" justify="center" align="middle">
                <Icon type={this.state.isCriticalPathLoading ? "loading" : "check"}
                      className={this.state.isCriticalPathCounted ? 'green-icon' : 'grey-icon'}
                      onClick={this.handleCountCriticalPath.bind(this)}
                ></Icon>
                <Title level={1} style={{margin: 'auto 0'}}>Critical path</Title>
              </Row>
              <Row type="flex" justify="center" align="middle">
                <Icon type={this.state.areProjectDatesLoading ? "loading" : "check"}
                      className={this.state.areProjectDatesCounted ? 'green-icon' : 'grey-icon'}
                      onClick={this.handleCountProjectDates.bind(this)}
                ></Icon>
                <Title level={1} style={{margin: 'auto 0'}}>Project dates</Title>
              </Row>
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}

export default Form.create<Props>()(MainInfo);