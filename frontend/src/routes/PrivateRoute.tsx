import links from '@/routes/urls';
import stores from '@/stores';
import React, {Component} from 'react';
import {Redirect} from "react-router";
import {Route} from "react-router-dom";

const PrivateRoute = ({component : Component, ...rest} : any) => {
  const isAccessible = (role : string) : boolean => {
    return role === stores.authStore.role;
  };

  const renderComponent = (props : any) => {
    return isAccessible(props.role) ?
      (<Component {...props}/>) :
      (<Redirect to={links.root}/>);
  };

  return <Route exact={true} {...rest} render={() => renderComponent(rest)}/>
};

export default PrivateRoute;