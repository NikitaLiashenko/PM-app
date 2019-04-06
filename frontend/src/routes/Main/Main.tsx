import React, {Component, Fragment} from 'react';
import {Row, Col, Button} from "antd";
import {Link} from "react-router-dom";
import './Main.css';

class Main extends Component {
  render() {
    return (
      <Fragment>
        <Row className="full-height">
          <Col span={24}>
            <div className="content-background">
              <Row type="flex" justify="space-around" align="middle" className="full-height">
                <Col span={12}>
                  <div className="center">
                    <h1 className="home-title">Join the ProPlanner</h1>
                    <p className="home-description">next-generation project management application</p>
                    <Button className="getting-started-button"><Link to="/signin">Get started</Link></Button>
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