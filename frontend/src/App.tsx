import React, { Component, Fragment } from 'react';
import Main from '@/routes/Main/Main';
import NotFound from '@/routes/NotFound/NotFound';
import Login from '@/routes/Login/Login';
import Register from '@/routes/Register/Register';
import ManagerHome from '@/routes/ManagerHome/ManagerHome';
import Project from '@/routes/Project/Project';
import Calendar from '@/routes/Calendar/Calendar';
import Team from '@/routes/Team/Team';
import RateCard from '@/routes/RateCard/RateCard';

import AdminHome from '@/routes/AdminHome/AdminHome';
import AdminTeam from '@/routes/AdminTeam/AdminTeam';
import AdminCalendar from '@/routes/AdminCalendar/AdminCalendar';
// import RootRedirect from '@/routes/RootRedirect';
import { BrowserRouter, Route, Switch} from 'react-router-dom';
import PrivateRoute from '@/routes/PrivateRoute';
import links from '@/routes/urls';
import './App.css';

class App extends Component {
  render() {
    return (
        <Fragment>
          <BrowserRouter>
            <Switch>
              <Route exact={true} path={links.root} component={Main}/>
              <Route exact={true} path={links.signin} component={Login}/>
              <Route exact={true} path={links.signup} component={Register}/>

              <PrivateRoute role="Manager" path={links.managerHome} component={ManagerHome}/>
              <PrivateRoute role="Manager" path={links.managerProject} component={Project}/>
              <PrivateRoute role="Manager" path={links.managerCalendar} component={Calendar}/>
              <PrivateRoute role="Manager" path={links.managerTeam} component={Team}/>
              <PrivateRoute role="Manager" path={links.managerRateCard} component={RateCard}/>
              {/*<Route exact={true} path={links.managerHome} component={ManagerHome}/>*/}
              {/*<Route exact={true} path={links.project} component={Project}/>*/}
              {/*<Route exact={true} path={links.calendar} component={Calendar}/>*/}
              {/*<Route exact={true} path={links.team} component={Team}/>*/}
              {/*<Route exact={true} path={links.rateCard} component={RateCard}/>*/}

              {/*<PrivateRoute role="Admin" path={links.adminHome} component={AdminHome}/>*/}
              <Route exact={true} path={links.adminHome} component={AdminHome}/>
              <Route exact={true} path={links.adminTeam} component={AdminTeam}/>
              <Route exact={true} path={links.adminCalendar} component={AdminCalendar}/>

              <Route exact={true} path={links.notFound} component={NotFound}/>
            </Switch>
          </BrowserRouter>
        </Fragment>
    );
  }
}

export default App;
