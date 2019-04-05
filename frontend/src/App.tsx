import React, { Component, Fragment } from 'react';
import Main from '@/routes/Main/Main';
import NotFound from '@/routes/NotFound/NotFound';
import Login from '@/routes/Login/Login';
// import RootRedirect from '@/routes/RootRedirect';
import { BrowserRouter, Route, Switch} from 'react-router-dom';
// import PrivateRoute from '@/routes/PrivateRoute';
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
              <Route exact={true} path={links.notFound} component={NotFound}/>
            </Switch>
          </BrowserRouter>
        </Fragment>
    );
  }
}

export default App;
