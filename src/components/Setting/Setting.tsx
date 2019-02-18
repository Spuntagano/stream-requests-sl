import * as React from 'react'
import {ChangeEvent, MouseEvent} from 'react';
import Toast from '../../lib/Toast/Toast';
import Request from '../../types/Request';
import Configs from '../../types/Configs';
import Settings from '../../types/Settings';
import Authentication from '../../lib/Authentication/Authentication';
import Feed from './Feed/Feed';
import Options from './Options/Options';
import RequestsForm from './RequestsForm/RequestsForm';
import './Setting.scss'

type State = {
    requests: Array<Request>,
    settings: Settings,
    tab: string
}

type Props = {
    requests?: Array<Request>,
    settings?: Settings,
    configs?: Configs,
    authentication?: Authentication,
    sourceLoaded?: boolean
};

export default class Setting extends React.Component {
    public toast: Toast;
    public onUpdateOptions: () => (e: MouseEvent<HTMLButtonElement>) => void;
    public onUpdateRequests: () => (e: MouseEvent<HTMLButtonElement>) => void;
    public onUpdateSettings: (update: string) => (e: ChangeEvent<HTMLInputElement>) => void;
    public onToggleActive: (index: number) => (e: ChangeEvent<HTMLInputElement>) => void;
    public onRequestChange: (index: number, update: string) => (e: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLTextAreaElement>) => void;
    public onPaypalEmailChange: () => (e: ChangeEvent<HTMLInputElement>) => void;
    public onDeleteRequest: (index: number) => (e: MouseEvent<HTMLButtonElement>) => void;
    public onCopyNotificationBoxUrl: () => (e: MouseEvent<HTMLAnchorElement>) => void;
    public onSetTab: (tab: string) => () => void;
    public notificationBoxUrl: HTMLInputElement;
    public state: State;
    public props: Props;
    public collapsible: HTMLElement;
    public materialize: any;

    constructor(props: Props) {
        super(props);
        this.toast = new Toast();

        // @ts-ignore
        this.state = {
            requests: props.requests,
            settings: props.settings,
            tab: 'options'
        };

        // @ts-ignore
        this.materialize = M;
        this.collapsible = null;
        this.notificationBoxUrl = null;

        this.onUpdateOptions = () => () => this.updateOptions();
        this.onUpdateRequests = () => () => this.updateRequests();
        this.onUpdateSettings = (update: string) => (e: ChangeEvent<HTMLInputElement>) => this.updateSettings(e, update);
        this.onToggleActive = (index: number) => (e: ChangeEvent<HTMLInputElement>) => this.toggleActive(e, index);
        this.onRequestChange = (index: number, update: string) => (e: ChangeEvent<HTMLInputElement>) => this.requestChange(e, index, update);
        this.onPaypalEmailChange = () => (e: ChangeEvent<HTMLInputElement>) => this.paypalEmailChange(e);
        this.onDeleteRequest = (index: number,) => (e: MouseEvent<HTMLButtonElement>) => this.deleteRequest(e, index);
        this.onCopyNotificationBoxUrl = () => () => this.copyNotificationBoxUrl();
        this.onSetTab = (tab: string) => () => this.setTab(tab);
    }

    requestChange(e: ChangeEvent<HTMLInputElement>, index: number, update: string) {
        const value = e.target.value;

        this.setState((prevState: State) => {
            let newRequests: Array<Request> = [...prevState.requests];
            if (newRequests[newRequests.length-1][update].length) {
                newRequests.push({title: '', description: '', active: false, price: ''});
            }

            if (!newRequests[index].description.length && !newRequests[index].title.length && value.length) {
                newRequests[index].tab = true;
            }

            if (update === 'title' && !newRequests[index].description.length && !value.length) {
                newRequests[index].tab = false;
            }

            if (update === 'description' && !newRequests[index].title.length && !value.length) {
                newRequests[index].tab = false;
            }

            newRequests[index][update] = value;
            return {requests: newRequests};
        });
    }

    paypalEmailChange(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;

        this.setState((prevState: State) => {
            let newSettings: Settings = Object.assign({}, prevState.settings);
            newSettings.paypalEmail = value;

            return {settings: newSettings};
        });
    }

    async updateOptions() {
        const {configs, authentication} = this.props;

        if (!this.state.settings.paypalEmail) {
            this.toast.show({html: '<i class="material-icons">done</i>Please enter your paypal email', classes: 'error'});
            return;
        }

        const displayName = authentication.getStreamlabs().profiles.streamlabs.name;

        try {
            await Promise.all([
                authentication.makeCall(`${configs.relayURL}/setting`, 'POST', {settings: this.state.settings, displayName})
            ]);

            this.toast.show({html: '<i class="material-icons">done</i>Configurations saved!', classes: 'success'});
        } catch(e) {
            this.toast.show({html: '<i class="material-icons">done</i>Error saving configurations', classes: 'error'});
        }
    }

    async updateRequests() {
        const {configs, authentication} = this.props;

        let requests: Array<Request> = [];
        this.state.requests.forEach(() => {
            requests = this.state.requests.filter((request) => {
                return !!(request.title.length || request.description.length);
            });
        });

        const displayName = authentication.getStreamlabs().profiles.streamlabs.name;

        try {
            await Promise.all([
                authentication.makeCall(`${configs.relayURL}/request`, 'POST', {requests, displayName}),
            ]);

            this.toast.show({html: '<i class="material-icons">done</i>Requests saved!', classes: 'success'});
        } catch(e) {
            this.toast.show({html: '<i class="material-icons">done</i>Error saving configurations', classes: 'error'});
        }
    }

    updateSettings(e: ChangeEvent<HTMLInputElement>, update: string) {
        let target = e.target;
        this.setState((prevState: State) => {
            let newSettings: Settings = Object.assign({}, prevState.settings);
            newSettings[update] = target.checked;

            return {settings: newSettings};
        });
    }

    deleteRequest(e: MouseEvent<HTMLButtonElement>, index: number) {
        this.setState((prevState: State) => {
            let newRequests: Array<Request> = [...prevState.requests];
            newRequests.splice(index, 1);

            return {requests: newRequests};
        });
    }

    copyNotificationBoxUrl() {
        this.notificationBoxUrl.select();
        document.execCommand("copy");

        this.toast.show({html: '<i class="material-icons">done</i>Notification URL copied!', classes: 'success'});
    }

    toggleActive(e: ChangeEvent<HTMLInputElement>, index: number) {
        let target = e.target;
        this.setState((prevState: State) => {
            let newRequests: Array<Request> = [...prevState.requests];
            newRequests[index].tab = target.checked;
            return {requests: newRequests};
        });
    }

    setTab(tab: string) {
        this.setState(() => {
            return {
                tab: tab
            }
        });
    }

    render() {
        const {configs, authentication, sourceLoaded} = this.props;

        console.log(sourceLoaded);

        return (
            <div className="setting">
                <header>
                    <ul className="clearfix">
                        <li className={(this.state.tab === 'options') ? 'menu active' : 'menu'} onClick={this.onSetTab('options')}>Settings</li>
                        <li className={(this.state.tab === 'requests') ? 'menu active' : 'menu'} onClick={this.onSetTab('requests')}>Requests</li>
                        <li className={(this.state.tab === 'feed') ? 'menu active' : 'menu'} onClick={this.onSetTab('feed')}>Feed</li>
                        {sourceLoaded && <li className="in source">Source in current scene</li>}
                        {!sourceLoaded && <li className="out source">Source not in current scene</li>}
                    </ul>
                </header>

                {this.state.tab === 'options' && <Options
                  onPaypalEmailChange={this.onPaypalEmailChange}
                  onUpdateSettings={this.onUpdateSettings}
                  onUpdateOptions={this.onUpdateOptions}
                  authentication={authentication}
                  configs={configs}
                  settings={this.state.settings}
                />}

                {this.state.tab === 'requests' && <RequestsForm
                  requests={this.state.requests}
                  configs={configs}
                  authentication={authentication}
                  onRequestChange={this.onRequestChange}
                  onDeleteRequest={this.onDeleteRequest}
                  onToggleActive={this.onToggleActive}
                  onUpdateRequests={this.onUpdateRequests}
                />}

                {this.state.tab === 'feed' && <Feed
                  authentication={authentication}
                  configs={configs}
                  settings={this.state.settings}
                />}
            </div>
        )
    }
}
