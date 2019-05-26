import {ManagerStore} from '@/stores';
import actions from '@/actions';
import React, {Fragment, Component, SyntheticEvent} from 'react';
import {observer} from 'mobx-react';
import {
  Col,
  Row,
  Button,
  Icon,
  Divider,
  Typography,
  Table,
  Radio,
  Modal,
  Spin
} from "antd";

import 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_marker';
import {Task} from "@/services/taskService";
import moment from 'moment';

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
  crashLoading : boolean,
  openCrashViewModal : boolean,
  crashViewLoading : boolean,
  crashConfirming : boolean,
  tableRowSize : RowSize,
  crashId : string
};

@observer
class Crash extends Component<Props, State> {
  state = {
    crashLoading : false,
    openCrashViewModal : false,
    crashViewLoading : false,
    crashConfirming : false,
    tableRowSize : RowSize.default,
    crashId : ''
  };

  handleSizeChange = (event : any) => {
    this.setState({
      tableRowSize : event.target.value
    });
  };

  componentWillMount(): void {
    actions.manager.cleanProjectCrash();
    this.setState({
      crashLoading : true
    });
    actions.manager.getProjectCrash(this.props.projectId)
      .then(() => {
        this.setState({
          crashLoading : false
        });
      })
      .catch((error) => {
        console.error(error);
        this.setState({
          crashLoading : false
        });
      });
  }

  ganttContainer : any;

  handleOpenCrashView(crashId : string){
    this.setState({
      crashViewLoading : true,
      openCrashViewModal : true,
      crashId
    });
    actions.manager.cleanProjectStateInCrash();
    actions.manager.getProjectStateInCrash(this.props.projectId, crashId)
      .then(() => {
        return actions.manager.getProjectTeam();
      })
      .then(() => {
        this.setUpGantt();
      })
      .catch(error => {
        console.error(error);
        this.setState({
          crashViewLoading : false
        })
      })
  }

  setUpGantt(){
    gantt.config.xml_date = '%Y-%m-%d';
    gantt.init(this.ganttContainer);
    let data : Array<object> = [];
    let links : Array<object> = [];

    //@ts-ignore
    this.props.managerStore.projectStateInCrash.tasks.forEach(task => {
      data.push({
        taskId : task.taskId as string,
        id : (task.orderId as number) + 1,
        text : task.summary,
        start_date : task.startDate,
        end_date : task.endDate,
        duration : task.estimateMax,
        estimate : task.estimateMax,
        progress : task.progress,
        isOnCriticalPath : task.isOnCritPath,
        assignee : task.assignee ? [task.assignee].map(assignee => {
            const worker = this.props.managerStore.projectTeam.find(worker => worker.username === assignee);
            //@ts-ignore
            return `${worker.firstName} ${worker.lastName}`;
          }) :
          null
      });

      if((task.predecessor as Array<string>).length){
        (task.predecessor as Array<string>).forEach(predecessor => {
          //@ts-ignore
          const predTask = this.props.managerStore.projectStateInCrash.tasks.find(task => task.taskId === predecessor);

          links.push({
            id : links.length + 1,
            source : ((predTask as Task).orderId as number) + 1,
            target : (task.orderId as number) + 1,
            type : '0'
          })
        });
      }
    });

    const date_to_str = gantt.date.date_to_str(gantt.config.task_date);
    const today = new Date();

    gantt.addMarker({
      start_date: today,
      css: "today",
      text: "Today",
      title: "Today: " + date_to_str(today)
    });

    gantt.config.columns = [
      {name : 'text', label : 'Task Name'},
      {name : 'start_date', label : 'Start date', align : 'center'},
      // {name : 'duration', label : 'Duration', align : 'center'},
      {name : 'estimate', label : 'Estimate', align : 'center', template : function(obj : any){ return obj.estimate}},
      {name : 'assignee', label : 'Assignee', align : 'center', template : function(obj : any){ return obj.assignee || 'unassigned'}}
    ];

    gantt.config.duration_unit = "day";
    gantt.config.duration_step = 1;
    gantt.config.select_task  = false;

    gantt.templates.scale_cell_class = function(date : any){
      if(date.getDay() === 0 || date.getDay() === 6){
        return "weekend";
      } else {
        return "working-day"
      }
    };

    gantt.templates.task_cell_class = function(task : any,date : any){
      if(date.getDay() === 0 || date.getDay() === 6){
        return "weekend";
      } else {
        return "working-day"
      }
    };

    gantt.templates.task_class = function(start : any, end : any, task : any){
      if(task.isOnCriticalPath) {
        return "critical";
      } else {
        return 'normal';
      }
    };

    gantt.config.drag_links = false;

    gantt.config.show_progress = true;

    gantt.templates.progress_text=function(start : any, end : any, task : any){
      return `${Math.round(task.progress * 100)}%`;
    };

    gantt.attachEvent("onAfterTaskDrag", function(id, mode, e){
      const task = gantt.getTask(id);
      console.log(task);

      const taskUpdate = {
        progress : Math.round(task.progress * 100) / 100
      };

      actions.manager.updateProjectTask(task.taskId, taskUpdate)
        .catch(console.error);
    });

    gantt.parse({data, links});

    this.setState({
      crashViewLoading: false
    });
  }

  handleModalSubmit(event : SyntheticEvent){
    event.preventDefault();
    this.setState({
      crashConfirming : true
    });
    actions.manager.confirmProjectCrash(this.props.projectId, this.state.crashId)
      .then(() => {
        this.setState({
          crashConfirming : false,
          crashId : '',
          openCrashViewModal : false
        });
        gantt.clearAll();
      })
      .catch(error => {
        console.error(error);
        this.setState({
          crashConfirming : false,
          crashId : '',
          openCrashViewModal : false
        })
      })

  }

  handleCloseModal(){
    this.setState({
      openCrashViewModal : false,
      crashId : ''
    });
    gantt.clearAll();
    this.ganttContainer = null;
  }

  counter = 0;

  mappings : any = {};

  render() {
    const columns : Array<any> = [
      {
        title : 'Crash Id',
        key : 'crashId',
        render : (text : any, record : any) => {
          if(record.crashId === 'initial'){
            return 'Initial';
          }
          if(this.mappings[record.crashId]){
            return `Crash ${this.mappings[record.crashId]}`;
          }
          this.counter++;
          this.mappings[record.crashId] = this.counter;
          return `Crash ${this.counter}`
        },
        width : '10%'
      },
      {
        title : 'Cost',
        key : 'cost',
        dataIndex : 'cost',
        render : (text : any, record : any) => {
          if(!record.cost){
            return <Icon type="minus" />;
          }
          return record.cost as string;
        }
      },
      {
        title : 'Save',
        key : 'save',
        dataIndex : 'save',
        render : (text : any, record : any) => {
          if(!record.save){
            return <Icon type="minus" />;
          }
          return record.save as string;
        }
      },
      {
        title : 'Project Duration',
        key : 'projectDuration',
        dataIndex : 'projectDuration'
      },
      {
        title : 'Project Cost',
        key : 'projectCost',
        dataIndex : 'projectCost'
      }
    ];

    //@ts-ignore
    this.props.managerStore.project.tasks.map(task => {
      columns.push({
        title : task.summary as string,
        key : task.summary as string,
        render : (text : any, record : any) => {
          //@ts-ignore
          return record[task.taskId].estimateMax as string
        }
      })
    });

    columns.push(
      {
        title : '',
        key : 'assign',
        //@ts-ignore
        render : () => <Icon type="check"></Icon>
      }
    );

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
                        <Text className="projects-title">Crash</Text>
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
                      loading={this.state.crashLoading}
                      //@ts-ignore
                      size={this.state.tableRowSize}
                      columns={columns}
                      dataSource={this.props.managerStore.projectCrash}
                      //@ts-ignore
                      rowKey={record => record.crashId as string}
                      pagination={{ pageSize : 5}}
                      onRow={(record, rowIndex) => {
                        return {
                          onClick : () => {
                            this.handleOpenCrashView(record.crashId);
                          }
                        };
                      }}
                      rowClassName={() => "clickable"}
                    ></Table>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        <Modal
          title={<Fragment>
            <Row>
              <Col span={5}>
                <Text>Project Gantt in Crash</Text>
              </Col>
              <Col span={1}>
                <Spin size="small" style={{display : this.state.crashViewLoading ? 'block' : 'none'}}/>
              </Col>
            </Row>
            <Row>
              <Col span={7}>
                <Text>Planned End Date - </Text><Text style={{color : 'red'}}>{moment(this.props.managerStore.project.endDate).format('D MMM YYYY')}</Text>
              </Col>
              <Col span={7}>
                <Text>Crash End Date - </Text><Text style={{color : 'red'}}>{moment(this.props.managerStore.projectStateInCrash.endDate).format('D MMM YYYY')}</Text>
              </Col>
            </Row>
            </Fragment>}
          centered
          visible={this.state.openCrashViewModal}
          onOk={(e) => this.handleModalSubmit(e)}
          onCancel={this.handleCloseModal.bind(this)}
          confirmLoading={this.state.crashConfirming}
          okText='Apply'
          bodyStyle={{
            height : '60vh',
            overflowY : 'scroll'
          }}
          width="50%"
        >
          <div style={{ height : '100%', width : '100%'}} ref={input => (this.ganttContainer = input)}>
          </div>
        </Modal>
      </Fragment>
    );
  }
}

export default Crash;