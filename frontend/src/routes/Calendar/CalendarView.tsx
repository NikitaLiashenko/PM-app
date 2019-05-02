import React, {Fragment, Component, SyntheticEvent} from 'react';
import {ManagerStore} from '@/stores';
import actions from '@/actions';
import {observer} from 'mobx-react';
import moment from 'moment';
import {FormComponentProps} from "antd/lib/form/Form";
import {Holiday} from "@/services/calendarService";

import {
  Button,
  Col,
  Form,
  Input,
  Icon,
  Typography,
  DatePicker,
  Row,
  Modal
} from 'antd';
import BigCalendar from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import calendarActions from "@/actions/calendarActions";

const {Title} = Typography;

type Props = {
  holidays : Array<Holiday>,
  location : string,
  managerStore : ManagerStore
};

type State = {
  openEventModal : boolean,
  holiday : Holiday,
  confirmLoading : boolean
};

@observer
class CalendarView extends Component<Props & FormComponentProps, State> {
  state = {
    openEventModal : false,
    confirmLoading : false,
    holiday : {
      date : '',
      description : ''
    }
  };

  handleDaySelect(e : any) {
    const startDate = moment(e.start).format('YYYY-MM-DD');
    this.setState({
      holiday : {
        date : startDate,
        description : ''
      },
      openEventModal : true
    })
  }

  handleModalSubmit(e : SyntheticEvent){
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if(!err){
        this.setState({
          confirmLoading : true
        });

        const calendar = this.props.managerStore.calendars.find(calendar => calendar.location === this.props.location);

        // @ts-ignore
        const holidays = [...calendar.holidays];

        holidays.push({
          date : moment(values.date).format('YYYY-MM-DD'),
          description : values.description
        });

        actions.updateLocationCalendar(this.props.location, {holidays})
          .then(() => {
            this.setState({
              confirmLoading : false,
              openEventModal : false
            });
            return actions.getAllCalendars()
          })
          .catch(console.error);
      }
    });
  }

  handleModalCancel(){
    this.props.form.resetFields();
    this.setState({
      holiday : {
        date : '',
        description : ''
      },
      openEventModal : false
    })
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <Fragment>
        <Row>
          <Col span={24}>
            <div className="content-container">
              <Row type="flex" justify="space-around" align="top" className="full-height">
                <Col span={12} style={{height : '80%'}}>
                  <BigCalendar
                    selectable
                    localizer={BigCalendar.momentLocalizer(moment)}
                    events={this.props.holidays.map(holiday => ({
                      title : holiday.description,
                      start : new Date(holiday.date),
                      end : new Date(holiday.date),
                      allDay : true
                    }))}
                    onSelectSlot={this.handleDaySelect.bind(this)}
                  />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        <Modal
          title='Create new holiday'
          centered
          visible={this.state.openEventModal}
          onOk={(e) => this.handleModalSubmit(e)}
          onCancel={() => this.handleModalCancel()}
          confirmLoading={this.state.confirmLoading}
          okText='Create'
        >
          <Form.Item label="Date">
            {getFieldDecorator('date', {
              initialValue : moment(this.state.holiday.date),
              rules : [
                {
                  required : true,
                  message : 'Holiday date should be specified!'
                }
              ]
            })(
              <DatePicker className="full-width"/>
            )}
          </Form.Item>
          <Form.Item label="Description">
            {getFieldDecorator('description', {
              rules : [
                {
                  required : true,
                  message : 'Holiday description should be specified!'
                }
              ]
            })(
              <Input/>
            )}
          </Form.Item>
        </Modal>
      </Fragment>
    );
  }
}

export default Form.create<Props>()(CalendarView);