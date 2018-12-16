import * as React from 'react'
import {ChangeEvent, MouseEvent} from 'react';
import Toast from '../../lib/Toast/Toast';
import Requests from '../../types/Requests';
import Configs from '../../types/Configs';
import Settings from '../../types/Settings';
import RequestReceived from '../../types/RequestReceived';
import InputField from '../InputField/InputField';
import Switch from '../Switch/Switch';
import Request from '../../types/Request';
import Textarea from '../Textarea/Textarea';
import Collapsible from '../Collapsible/Collapsible';
import CollapsibleItem from '../Collapsible/CollapsibleItem/CollapsibleItem';
import './Setting.scss'

type State = {
    requests: Requests,
    settings: Settings,
}

type Props = {
    requests?: Requests,
    settings?: Settings,
    configs?: Configs,
};

export default class Setting extends React.Component {
    public toast: Toast;
    public twitch: any;
    public onUpdateConfiguration: () => (e: MouseEvent<HTMLButtonElement>) => void;
    public onUpdateSettings: (update: string) => (e: ChangeEvent<HTMLInputElement>) => void;
    public onToggleActive: (index: number, price: string) => (e: ChangeEvent<HTMLInputElement>) => void;
    public onRequestChange: (index: number, price: string, update: string) => (e: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLTextAreaElement>) => void;
    public onDeleteRequest: (index: number, price: string) => (e: MouseEvent<HTMLButtonElement>) => void;
    public onTestNotifier: () => (e: MouseEvent<HTMLButtonElement>) => void;
    public onCopyNotificationBoxUrl: () => (e: MouseEvent<HTMLAnchorElement>) => void;
    public onOpenStart: () => () => void;
    public notificationBoxUrl: HTMLInputElement;
    public state: State;
    public props: Props;
    public collapsible: HTMLElement;
    public materialize: any;

    constructor(props: Props) {
        super(props);
        this.toast = new Toast();

        // @ts-ignore
        this.twitch = window.Twitch ? window.Twitch.ext : null;
        this.state = {
            requests: props.requests,
            settings: props.settings,
        };

        // @ts-ignore
        this.materialize = M;
        this.collapsible = null;
        this.notificationBoxUrl = null;

        this.onUpdateConfiguration = () => () => this.updateConfiguration();
        this.onUpdateSettings = (update: string) => (e: ChangeEvent<HTMLInputElement>) => this.updateSettings(e, update);
        this.onToggleActive = (index: number, price: string) => (e: ChangeEvent<HTMLInputElement>) => this.toggleActive(e, index, price);
        this.onRequestChange = (index: number, price: string, update: string) => (e: ChangeEvent<HTMLInputElement>) => this.requestChange(e, index, price, update);
        this.onDeleteRequest = (index: number, price: string) => (e: MouseEvent<HTMLButtonElement>) => this.deleteRequest(e, index, price);
        this.onTestNotifier = () => () => this.testNotifier();
        this.onCopyNotificationBoxUrl = () => () => this.copyNotificationBoxUrl();
        this.onOpenStart = () => () => this.openStart();
    }

    requestChange(e: ChangeEvent<HTMLInputElement>, index: number, price: string, update: string) {
        const value = e.target.value;

        this.setState((prevState: State) => {
            let newRequests: Requests = Object.assign({}, prevState.requests);
            if (newRequests[price][newRequests[price].length-1][update].length) {
                newRequests[price].push({title: '', description: '', active: false});
            }

            if (!newRequests[price][index].description.length && !newRequests[price][index].title.length && value.length) {
                newRequests[price][index].active = true;
            }

            if (update === 'title' && !newRequests[price][index].description.length && !value.length) {
                newRequests[price][index].active = false;
            }

            if (update === 'description' && !newRequests[price][index].title.length && !value.length) {
                newRequests[price][index].active = false;
            }

            newRequests[price][index][update] = value;
            return {requests: newRequests};
        });
    }

    async updateConfiguration() {
        const {configs} = this.props;

        let requests: Requests = {};
        Object.keys(this.state.requests).forEach((price) => {
            requests[price] = this.state.requests[price].filter((request) => {
                return !!(request.title.length || request.description.length);
            });
        });

        try {
            //TODO send stuff
            await Promise.all([
            ]);

            this.twitch.send('broadcast', 'application/json', {requests, settings: this.state.settings});

            this.toast.show({html: '<i class="material-icons">done</i>Configurations saved!', classes: 'success'});
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

    deleteRequest(e: MouseEvent<HTMLButtonElement>, index: number, price: string) {
        this.setState((prevState: State) => {
            let newRequests: Requests = Object.assign({}, prevState.requests);

            if (newRequests[price].length-1 === index) {
                newRequests[price][index] = {title: '', description: '', active: false};
            } else {
                newRequests[price].splice(index, 1);
            }

            return {requests: newRequests};
        });
    }

    testNotifier() {
        const {configs} = this.props;

        let requestReceived: RequestReceived = {
            request: {
                title: 'test request',
                description: 'request description',
                active: true
            },
            transaction: {
                displayName: "bits user",
                initiator: "other",
                product: {
                    displayName: "test SKU",
                    sku: "test1000-1",
                    cost: {
                        amount: 1000,
                        type: "bits"
                    },
                },
                transactionId: String(Math.random()),
                userId: "0",
            },
            message: 'Test message',
            pending: false,
            settings: this.state.settings,
        };

        //TODO: send stuff
    }

    copyNotificationBoxUrl() {
        this.notificationBoxUrl.select();
        document.execCommand("copy");

        this.toast.show({html: '<i class="material-icons">done</i>Notification URL copied!', classes: 'success'});
    }

    toggleActive(e: ChangeEvent<HTMLInputElement>, index: number, price: string) {
        let target = e.target;
        this.setState((prevState: State) => {
            let newRequests: Requests = Object.assign({}, prevState.requests);
            newRequests[price][index].active = target.checked;
            return {requests: newRequests};
        });
    }

    openStart() {
        document.querySelectorAll('.materialize-textarea').forEach((el: HTMLElement) => {
            this.materialize.textareaAutoResize(el);
        });
    }

    renderForm(price: string) {
        return this.state.requests[price].map((request: Request, index: number) => {
            return <div key={`request-form-${price}-${index}`} className="clearfix">
                <div className="input-container request-form left">
                    <InputField value={request.title} label="Title" id={`request-form-title-${price}-${index}`} onChange={this.onRequestChange(index, price, 'title')}/>
                    <Textarea value={request.description} label="Description" id={`request-form-description-${price}-${index}`} onChange={this.onRequestChange(index, price, 'description')} />
                </div>
                <button disabled={this.state.requests[price].length-1 === index && !request.title.length && !request.description.length} className="btn waves-effect waves-light delete-request btn-floating left" onClick={this.onDeleteRequest(index, price)}>
                    <i className="material-icons">close</i>
                </button>
                <Switch className="disable-switch" checked={request.active} label="Active" onChange={this.onToggleActive(index, price)}/>
            </div>;
        });
    }

    renderItems() {
        return Object.keys(this.state.requests).map((price: string) => {
            let counter = 0;
            this.state.requests[price].forEach((request) => {
                if (request.title || request.description) {
                    counter++;
                }
            });

            return <CollapsibleItem key={`collapsible-item-${price}`} title={`${price} bits requests (${counter})`}>
                {this.renderForm(price)}
            </CollapsibleItem>
        });
    }

    render() {
        const {configs} = this.props;

        return (
            <div className="config">
                <h2>Requests settings</h2>
                <div className="requests-form">
                    <Collapsible onOpenStart={this.onOpenStart()}>
                        {this.renderItems()}
                    </Collapsible>
                </div>

                <h2>Notifications settings</h2>
                <div className="notification-box">
                    <InputField className="notification-box-url" inputRef={(el) => this.notificationBoxUrl = el} value={`http://bob.com/#/123`} label="Notification box URL (Add as browser source in OBS)" id="notification-box-url" readOnly />

                    <a className="copy-notification-box-url" onClick={this.onCopyNotificationBoxUrl()}><i className="material-icons">insert_link</i> Copy link</a>
                    <button className="btn waves-effect waves-light" onClick={this.onTestNotifier()}>Test notification</button>
                </div>

                <div className="notifications">
                    <Switch checked={this.state.settings.showImage} label="Show image" onChange={this.onUpdateSettings('showImage')}/>
                    <Switch checked={this.state.settings.playSound} label="Play sound" onChange={this.onUpdateSettings('playSound')}/>
                    <Switch checked={this.state.settings.sendChat} label="Send to chat" onChange={this.onUpdateSettings('sendChat')}/>
                </div>
                <div>
                    <button className="btn waves-effect waves-light" onClick={this.onUpdateConfiguration()}>Save settings</button>
                </div>
            </div>
        )
    }
}
