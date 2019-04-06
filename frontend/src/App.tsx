import React, { Component, Fragment } from 'react';
import Main from '@/routes/Main/Main';
import NotFound from '@/routes/NotFound/NotFound';
import Login from '@/routes/Login/Login';
import Register from '@/routes/Register/Register';
import ManagerHome from '@/routes/ManagerHome/ManagerHome';
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

              {/*<PrivateRoute role="Manager" component={ManagerHome}/>*/}
              <Route exact={true} path={links.managerHome} component={ManagerHome}/>
              <Route exact={true} path={links.notFound} component={NotFound}/>
            </Switch>
          </BrowserRouter>
        </Fragment>
    );
  }
}

export default App;
