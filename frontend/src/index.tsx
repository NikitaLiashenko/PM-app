import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {configure} from 'mobx';
import {Provider as MobxProvider} from 'mobx-react';
// import { ThemeProvider } from 'styled-components';
import stores from './stores';
// import themes from './themes';
// import './themes/globals.css;

configure({ enforceActions : 'observed'});

ReactDOM.render(
    <MobxProvider {...stores}>
        <App />
    </MobxProvider>,
    document.getElementById('root')
);