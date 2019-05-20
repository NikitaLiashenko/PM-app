import {ManagerStore} from '@/stores';
import actions from '@/actions';
import React, {Component} from 'react';
import {observer} from "mobx-react";
import 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_marker';
import {Task} from '@/services/taskService';
import {
  Col,
  Divider,
  Row,
  Typography,
  Spin
} from "antd";

const {Text} = Typography;

type Props = {
  managerStore : ManagerStore,
  projectId : string
};

type State = {
  isGanttLoading : boolean
};

@observer
class Gantt extends Component<Props, State>{
  ganttContainer : any;

  state = {
    isGanttLoading : false
  };

  componentDidMount(){
    this.setState({
      isGanttLoading : true
    });
    actions.manager.getProjectTasks(this.props.projectId)
      .then(() => actions.manager.getProjectTeam())
      .then(() => {
        gantt.config.xml_date = '%Y-%m-%d';
        gantt.init(this.ganttContainer);
        let data : Array<object> = [];
        let links : Array<object> = [];

        this.props.managerStore.tasks.forEach(task => {
          data.push({
            taskId : task.taskId as string,
            id : (task.orderId as number) + 1,
            text : task.summary,
            start_date : task.startDate,
            end_date : task.endDate,
            duration : task.estimateMax,
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
              const predTask = this.props.managerStore.tasks.find(task => task.taskId === predecessor);

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
          {name : 'duration', label : 'Duration', align : 'center'},
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
          isGanttLoading : false
        })
      })
      .catch(error => {
        console.error(error);
        this.setState({
          isGanttLoading : false
        })
      });

  }

  render() {
    return(
      <Row>
        <Col span={24}>
          <div className="content-container">
            <Row type="flex" justify="space-around" align="top" className="full-height">
              <Col span={18} style={{height : '100%'}}>
                <div style={{height : '100%'}}>
                  <Row>
                    <Col span={23}>
                      <Row>
                        <Col span={3}>
                          <Text className="projects-title">Gantt Chart</Text>
                        </Col>
                        <Col span={1}>
                          <Spin style={{display : this.state.isGanttLoading ? 'block' : 'none', marginTop : 5}}></Spin>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                  <div style={{ height : '100%', width : '100%'}} ref={input => (this.ganttContainer = input)}></div>
                </div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    );
  }
}

export default Gantt;