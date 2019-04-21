import {ManagerStore} from '@/stores';
import actions from '@/actions';
import React, {Component} from 'react';
import {observer} from "mobx-react";
import 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_marker';
import {Task} from '@/services/taskService';

type Props = {
  managerStore : ManagerStore,
  projectId : string
};

type State = {};

@observer
class Gantt extends Component<Props, State>{
  ganttContainer : any;

  componentDidMount(){
    actions.getProjectTasks(this.props.projectId)
      .then(() => {
        gantt.config.xml_date = '%Y-%m-%d';
        gantt.init(this.ganttContainer);
        let data : Array<object> = [];
        let links : Array<object> = [];

        this.props.managerStore.tasks.forEach(task => {
          data.push({
            id : (task.orderId as number) + 1,
            text : task.summary,
            start_date : task.startDate,
            end_date : task.endDate,
            duration : task.estimateMax,
            progress : task.progress,
            isOnCriticalPath : task.isOnCritPath
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

        gantt.parse({data, links});
      })
      .catch(console.error);

  }

  render() {
    return(
      <div style={{ height : '100%', width : '100%'}} ref={input => (this.ganttContainer = input)}>
      </div>
    );
  }
}

export default Gantt;