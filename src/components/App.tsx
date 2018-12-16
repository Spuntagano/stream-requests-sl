import * as React from 'react'
import Requests from '../types/Requests';
import Settings from '../types/Settings';
import Toast from '../lib/Toast/Toast';
import Configs from '../types/Configs';
import Loading from './Loading/Loading';
import {ReactElement} from 'react';
import configs from '../../configs';
import Streamlabs from '../types/Streamlabs';

type State = {
    configured: boolean,
    requests: Requests,
    settings: Settings,
    streamlabs: Streamlabs
    configs: Configs
}

type Props = {
    showLoading?: boolean,
    children: JSX.Element|Array<JSX.Element>
}

export default class App extends React.Component {
    public twitch: any;
    public state: State;
    public props: Props;
    public toast: Toast;

    constructor(props: Props) {
        super(props);

        const url = new URL(window.location.href);
        const state = url.searchParams.get('state');

        this.toast = new Toast();
        this.state = {
            configured: false,
            requests: {},
            settings: {},
            streamlabs: {},
            configs: configs[state],
        }
    }

    componentDidMount() {
        // @ts-ignore
        window.Streamlabs.init().then(streamlabs => {
            this.setState(() => {
                return {
                    streamlabs,
                    configured: true
                }
            });
        });
    }

    render() {
        const {showLoading, children} = this.props;

        const childrens = React.Children.map(children, (child: ReactElement<any>) => {
            return React.cloneElement(child, {
                requests: this.state.requests,
                settings: this.state.settings,
                configs: this.state.configs,
                streamlabs: this.state.streamlabs,
            });
        });

        return (
            <div className="app">
                {this.state.configured && childrens}
                {(showLoading && !this.state.configured) && <Loading />}
            </div>
        )

    }
}
