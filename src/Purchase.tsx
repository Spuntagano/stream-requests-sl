import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {HashRouter, Route, Switch} from 'react-router-dom';
import Purchase from './components/Purchase/Purchase';
import 'materialize-css/dist/js/materialize';
import 'materialize-loader';

ReactDOM.render((
    <HashRouter>
        <Switch>
            <Route exact path="/:displayName" component={Purchase} />
        </Switch>
    </HashRouter>
), document.getElementById('root'));
