import React, {Component, Fragment} from 'react';
import {Row, Col, Button, Input, Icon} from "antd";
import {Link} from "react-router-dom";
import './Main.css';

const listSource = [
  {
    title : 'Collaborate as a team in one place'
  },
  {
    title : 'Plan visually on a timeline'
  },
  {
    title : 'Never miss a deadline'
  }
];

class Main extends Component {
  render() {
    return (
      <Fragment>
        <Row className="full-height">
          <Col span={24}>
            <div className="content-background">
              <Row type="flex" justify="start" align="middle" className="full-height">
                <Col span={12}>
                  <div className="center" style={{paddingLeft : '80px'}}>
                    <h1 className="home-title">Project planning is now visual</h1>
                    <h3 className="home-description">Manage your team's projects from planning</h3>
                    <h3 className="home-description">to execution with a Gantt chart</h3>
                    <Row type="flex" justify="start" align="middle" style={{margin : '32px 0'}}>
                      <Input className="email-input" placeholder="Enter your work email" type="email"/>
                      <Button shape="round" className="join-us-button"><Link to="/signin">Join us</Link></Button>
                    </Row>
                    <Row type="flex" justify="start" align="middle" className="list-row">
                      <Icon type="check-circle" className="check-icon" />
                      <h3 className="list-point">Collaborate as a team in one place</h3>
                    </Row>
                    <Row type="flex" justify="start" align="middle" className="list-row">
                      <Icon type="check-circle" className="check-icon" />
                      <h3 className="list-point">Plan visually on a timeline</h3>
                    </Row>
                    <Row type="flex" justify="start" align="middle" className="list-row">
                      <Icon type="check-circle" className="check-icon" />
                      <h3 className="list-point">Never miss a deadline</h3>
                    </Row>
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

export default Main;