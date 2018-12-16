import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Widget from './components/Widget/Widget';
import App from './components/App';
import 'materialize-css/dist/js/materialize';
import 'materialize-loader';

ReactDOM.render(
    <App>
        <Widget />
    </App>,
    document.getElementById('root')
);