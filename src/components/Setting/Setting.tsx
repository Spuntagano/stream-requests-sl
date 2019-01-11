import * as React from 'react'
import {ChangeEvent, MouseEvent} from 'react';
import Toast from '../../lib/Toast/Toast';
import Request from '../../types/Request';
import Configs from '../../types/Configs';
import Settings from '../../types/Settings';
import RequestReceived from '../../types/RequestReceived';
import InputField from '../InputField/InputField';
import Switch from '../Switch/Switch';
import Textarea from '../Textarea/Textarea';
import Authentication from '../../lib/Authentication/Authentication';
import Collapsible from '../Collapsible/Collapsible';
import CollapsibleItem from '../Collapsible/CollapsibleItem/CollapsibleItem';
import './Setting.scss'

type State = {
    requests: Array<Request>,
    settings: Settings,
}

type Props = {
    requests?: Array<Request>,
    settings?: Settings,
    configs?: Configs,
    authentication?: Authentication
};

export default class Setting extends React.Component {
    public toast: Toast;
    public twitch: any;
    public onUpdateConfiguration: () => (e: MouseEvent<HTMLButtonElement>) => void;
    public onUpdateSettings: (update: string) => (e: ChangeEvent<HTMLInputElement>) => void;
    public onToggleActive: (index: number) => (e: ChangeEvent<HTMLInputElement>) => void;
    public onRequestChange: (index: number, update: string) => (e: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLTextAreaElement>) => void;
    public onPaypalEmailChange: () => (e: ChangeEvent<HTMLInputElement>) => void;
    public onDeleteRequest: (index: number) => (e: MouseEvent<HTMLButtonElement>) => void;
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
        this.onToggleActive = (index: number) => (e: ChangeEvent<HTMLInputElement>) => this.toggleActive(e, index);
        this.onRequestChange = (index: number, update: string) => (e: ChangeEvent<HTMLInputElement>) => this.requestChange(e, index, update);
        this.onPaypalEmailChange = () => (e: ChangeEvent<HTMLInputElement>) => this.paypalEmailChange(e);
        this.onDeleteRequest = (index: number,) => (e: MouseEvent<HTMLButtonElement>) => this.deleteRequest(e, index);
        this.onTestNotifier = () => () => this.testNotifier();
        this.onCopyNotificationBoxUrl = () => () => this.copyNotificationBoxUrl();
        this.onOpenStart = () => () => this.openStart();
    }

    requestChange(e: ChangeEvent<HTMLInputElement>, index: number, update: string) {
        const value = e.target.value;

        this.setState((prevState: State) => {
            let newRequests: Array<Request> = [...prevState.requests];
            if (newRequests[newRequests.length-1][update].length) {
                newRequests.push({title: '', description: '', active: false, price: 0});
            }

            if (!newRequests[index].description.length && !newRequests[index].title.length && value.length) {
                newRequests[index].active = true;
            }

            if (update === 'title' && !newRequests[index].description.length && !value.length) {
                newRequests[index].active = false;
            }

            if (update === 'description' && !newRequests[index].title.length && !value.length) {
                newRequests[index].active = false;
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

    async updateConfiguration() {
        const {configs, authentication} = this.props;

        if (!this.state.settings.paypalEmail) {
            this.toast.show({html: '<i class="material-icons">done</i>Please enter your paypal email', classes: 'error'});
            return;
        }

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
                authentication.makeCall(`${configs.relayURL}/setting`, 'POST', {settings: this.state.settings, displayName})
            ]);

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

    deleteRequest(e: MouseEvent<HTMLButtonElement>, index: number) {
        this.setState((prevState: State) => {
            let newRequests: Array<Request> = [...prevState.requests];
            newRequests.splice(index, 1);

            return {requests: newRequests};
        });
    }

    testNotifier() {
        const {authentication, configs} = this.props;

        let requestReceived: RequestReceived = {
            transaction: {
                title: 'test request',
                displayName: "bits user",
                price: 100,
                transactionId: String(Math.random()),
                userId: '0',
                message: 'Test message',
            },
            settings: this.state.settings,
        };

        authentication.makeCall(`${configs.relayURL}/notify`, 'POST', {requestReceived});
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
            newRequests[index].active = target.checked;
            return {requests: newRequests};
        });
    }

    openStart() {
        document.querySelectorAll('.materialize-textarea').forEach((el: HTMLElement) => {
            this.materialize.textareaAutoResize(el);
        });
    }

    renderForm() {
        return this.state.requests.map((request: Request, index: number) => {
            return <div key={`request-form-${index}`} className="clearfix">
                <div className="input-container request-form left">
                    <InputField value={request.title} label="Title" id={`request-form-title-${index}`} onChange={this.onRequestChange(index, 'title')}/>
                    <Textarea value={request.description} label="Description" id={`request-form-description-${index}`} onChange={this.onRequestChange(index, 'description')} />
                    <InputField className="price" type="number" step="1" value={request.price} label="Price" id={`request-form-price-${index}`} onChange={this.onRequestChange(index, 'price')}/>
                </div>
                <button disabled={this.state.requests.length-1 === index && !request.title.length && !request.description.length} className="btn waves-effect waves-light delete-request btn-floating left" onClick={this.onDeleteRequest(index)}>
                    <i className="material-icons">close</i>
                </button>
                <Switch className="disable-switch" checked={request.active} label="Active" onChange={this.onToggleActive(index)}/>
            </div>;
        });
    }

    render() {
        const {configs, authentication} = this.props;

        return (
            <div className="config">
                <h2>Settings</h2>
                <div className="notification-box">
                    <InputField className="notification-box-url" type="email" inputRef={(el) => this.notificationBoxUrl = el} value={`${configs.purchaseURL}/#/${authentication.getStreamlabs().profiles.streamlabs.id}`} label="This is the link to make requests to your channel" id="notification-box-url" readOnly />

                    <a className="copy-notification-box-url" onClick={this.onCopyNotificationBoxUrl()}><i className="material-icons">insert_link</i> Copy link</a>
                    <button className="btn waves-effect waves-light" onClick={this.onTestNotifier()}>Test notification</button>
                </div>

                <div className="notifications">
                    <Switch checked={this.state.settings.showImage} label="Show image" onChange={this.onUpdateSettings('showImage')}/>
                    <Switch checked={this.state.settings.playSound} label="Play sound" onChange={this.onUpdateSettings('playSound')}/>
                    <Switch checked={this.state.settings.profanityFilter} label="Profanity filter" onChange={this.onUpdateSettings('profanityFilter')}/>
                </div>

                <InputField className="paypal-email" value={this.state.settings.paypalEmail} label="Your paypal email" id="paypal-email" onChange={this.onPaypalEmailChange()} />

                <div className="requests-form">
                    <Collapsible onOpenStart={this.onOpenStart()}>
                        <CollapsibleItem title="Request list" className="active">
                            {this.renderForm()}
                        </CollapsibleItem>
                    </Collapsible>
                </div>

                <div>
                    <button className="btn waves-effect waves-light" onClick={this.onUpdateConfiguration()}>Save settings</button>
                </div>
            </div>
        )
    }
}
