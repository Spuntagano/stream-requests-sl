import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Setting from './components/Setting/Setting';
import App from './components/App';
import 'materialize-css/dist/js/materialize';
import 'materialize-loader';

ReactDOM.render(
    <App showLoading>
        <Setting />
    </App>,
    document.getElementById('root')
);
