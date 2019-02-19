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
    configs: Configs,
    theme: string,
    sourceLoaded: boolean
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
    public streamlabsOBS: any;

    public onDetectAppSource: () => () => void;
    public onSourceAdded: () => (appSource: any) => void;

    constructor(props: Props) {
        super(props);

        const url = new URL(window.location.href);
        const state = url.searchParams.get('state') || 'released';
        this.authentication = new Authentication();

        // @ts-ignore
        this.streamlabsOBS = window.streamlabsOBS;

        this.toast = new Toast();
        this.state = {
            configured: false,
            requests: [],
            settings: {},
            configs: configs[state],
            theme: 'night',
            sourceLoaded: false
        };

        this.onDetectAppSource = () => () => this.detectAppSource();
        this.onSourceAdded = () => (appSource: any) => this.sourceAdded(appSource);
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
                        html: '<i class="material-icons">error_outline</i>Error loading requests',
                        classes: 'error'
                    });
                }
            }
        });

        if (this.streamlabsOBS) {
            this.streamlabsOBS.apiReady.then(() => {
                this.streamlabsOBS.v1.Theme.getTheme().then((theme: any) => {
                    this.themeUpdate(theme);
                });

                this.streamlabsOBS.v1.Theme.themeChanged((theme: any) => {
                    this.themeUpdate(theme);
                });

                this.onDetectAppSource()();
                this.streamlabsOBS.v1.Sources.sourceAdded(this.onSourceAdded());
                this.streamlabsOBS.v1.Scenes.sceneAdded(this.onDetectAppSource());
                this.streamlabsOBS.v1.Sources.sourceRemoved(this.onDetectAppSource());
                this.streamlabsOBS.v1.Scenes.sceneRemoved(this.onDetectAppSource());
                this.streamlabsOBS.v1.Sources.sourceUpdated(this.onDetectAppSource());
                this.streamlabsOBS.v1.Scenes.sceneSwitched(this.onDetectAppSource());
            });
        }
    }

    async sourceAdded(appSource: any) {
        let sources = await this.streamlabsOBS.v1.Sources.getAppSources();
        let sourceLoaded = false;

        sources.forEach((source: any) => {
            if (source.id === appSource.id) {
                sourceLoaded = true
            }
        });

        this.setState(() => {
            return {sourceLoaded};
        })
    }

    async detectAppSource() {
        if (this.streamlabsOBS) {
            let sourceLoaded = false;
            let scene = await this.streamlabsOBS.v1.Scenes.getActiveScene();
            let sources = await this.streamlabsOBS.v1.Sources.getAppSources();

            if (!sources.length || !scene.nodes.length) {
                sourceLoaded = false
            }

            let nodes: any = [];
            scene.nodes.forEach(async (node: any) => {
                if (node.type === 'folder') {
                    await this.getNodes(node, nodes);
                } else if (node.type === 'scene_item') {
                    nodes.push(node);
                }
            });

            nodes.forEach((node: any) => {
                sources.forEach((source: any) => {
                    if (node.sourceId === source.id) {
                        sourceLoaded = true
                    }
                });
            });

            this.setState(() => {
                return {sourceLoaded};
            })
        }
    }

    async getNodes(node: any, nodes: any) {
        node.childrenIds.forEach(async (id: any) => {
            let item = await this.streamlabsOBS.v1.Scenes.getSceneItem(id);

            if (item) {
                if (item.type === 'scene_item') {
                    nodes.push(item);
                } else if (item.type === 'folder') {
                    this.getNodes(item, nodes)
                }
            }
        })
    }

    themeUpdate(theme: string) {
        this.setState(() => {
            return {
                theme
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
                sourceLoaded: this.state.sourceLoaded
            });
        });

        return (
            <div className={`app clearfix ${(this.state.theme === 'night') ? 'night-theme' : ''}`}>
                {this.state.configured && childrens}
                {(showLoading && !this.state.configured) && <Loading />}
            </div>
        )
    }
}
