import * as React from 'react'
import Request from '../types/Request';
import Settings from '../types/Settings';
import Toast from '../lib/Toast/Toast';
import Configs from '../types/Configs';
import Loading from './Loading/Loading';
import {ReactElement} from 'react';
import configs from '../../configs';
import Authentication from '../lib/Authentication/Authentication';

type State = {
    configured: boolean,
    requests: Array<Request>,
    settings: Settings,
    configs: Configs
}

type Props = {
    showLoading?: boolean,
    children: JSX.Element|Array<JSX.Element>
}

export default class App extends React.Component {
    public state: State;
    public props: Props;
    public toast: Toast;
    public authentication: Authentication;

    constructor(props: Props) {
        super(props);

        const url = new URL(window.location.href);
        const state = url.searchParams.get('state') || 'released';
        this.authentication = new Authentication();

        this.toast = new Toast();
        this.state = {
            configured: false,
            requests: [],
            settings: {},
            configs: configs[state],
        }
    }

    componentDidMount() {
        // @ts-ignore
        window.Streamlabs.init().then(async streamlabs => {
            if (!this.state.configured) {
                this.authentication.setToken(streamlabs);

                try {
                    let promises: any = await Promise.all([
                        this.authentication.makeCall(`${this.state.configs.relayURL}/request/${streamlabs.profiles.streamlabs.id}`),
                        this.authentication.makeCall(`${this.state.configs.relayURL}/setting/${streamlabs.profiles.streamlabs.id}`)
                    ]);

                    let requests = (await promises[0].json()).requests;
                    let settings = (await promises[1].json()).settings;

                    requests.push({title: '', description: '', price: '', active: false});

                    this.setState(() => {
                        return {
                            requests,
                            settings,
                            configured: true
                        }
                    });
                } catch (e) {
                    this.toast.show({
                        html: '<i class="material-icons">done</i>Error loading requests',
                        classes: 'error'
                    });
                }
            }
        });
    }

    render() {
        const {showLoading, children} = this.props;

        const childrens = React.Children.map(children, (child: ReactElement<any>) => {
            return React.cloneElement(child, {
                requests: this.state.requests,
                settings: this.state.settings,
                configs: this.state.configs,
                authentication: this.authentication,
            });
        });

        return (
            <div className="app dark-theme">
                {this.state.configured && childrens}
                {(showLoading && !this.state.configured) && <Loading />}
            </div>
        )

    }
}
