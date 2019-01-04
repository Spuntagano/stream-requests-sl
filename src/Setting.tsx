import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Setting from './components/Setting/Setting';
import Feed from './components/Feed/Feed';
import Div from './components/Div/Div';
import App from './components/App';
import 'materialize-css/dist/js/materialize';
import 'materialize-loader';
import './sass/simple-grid.scss';

ReactDOM.render(
    <div className="row">
        <App showLoading>
            <Div className="col-8 col-sm-12">
                <Setting />
            </Div>
            <Div className="col-4 col-sm-12">
                <Feed />
            </Div>
        </App>
    </div>,
    document.getElementById('root')
);
