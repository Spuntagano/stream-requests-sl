import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Setting from './components/Setting/Setting';
import Feed from './components/Feed/Feed';
import App from './components/App';
import 'materialize-css/dist/js/materialize';
import 'materialize-loader';
import './sass/simple-grid.scss';

ReactDOM.render(
    <div className="row">
        <div className="col-8 col-sm-12">
            <App showLoading>
                <Setting />
            </App>
        </div>
        <div className="col-4 col-sm-12">
            <App showLoading>
                <Feed />
            </App>
        </div>
    </div>,
    document.getElementById('root')
);

// ReactDOM.render(
//     <div>
//         <App showLoading>
//             <Setting />
//             <Feed/>
//         </App>
//     </div>,
//     document.getElementById('root')
// );