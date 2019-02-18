import * as React from 'react'
import {ChangeEvent, MouseEvent} from 'react';
import Toast from '../../../lib/Toast/Toast';
import Configs from '../../../types/Configs';
import Settings from '../../../types/Settings';
import RequestReceived from '../../../types/RequestReceived';
import InputField from '../../InputField/InputField';
import Switch from '../../Switch/Switch';
import Authentication from '../../../lib/Authentication/Authentication';
import './Options.scss'

type State = {
    tab: string
}

type Props = {
    settings: Settings,
    configs: Configs,
    authentication: Authentication,
    onUpdateSettings: (update: string) => (e: ChangeEvent<HTMLInputElement>) => void;
    onUpdateOptions: () => (e: MouseEvent<HTMLButtonElement>) => void;
    onPaypalEmailChange: () => (e: ChangeEvent<HTMLInputElement>) => void;
};

export default class Options extends React.Component {
    public toast: Toast;
    public onTestNotifier: () => (e: MouseEvent<HTMLButtonElement>) => void;
    public onCopyNotificationBoxUrl: () => (e: MouseEvent<HTMLAnchorElement>) => void;
    public notificationBoxUrl: HTMLInputElement;
    public state: State;
    public props: Props;
    public materialize: any;

    constructor(props: Props) {
        super(props);
        this.toast = new Toast();

        // @ts-ignore
        this.state = {
            tab: 'settings'
        };

        // @ts-ignore
        this.materialize = M;
        this.notificationBoxUrl = null;

        this.onTestNotifier = () => () => this.testNotifier();
        this.onCopyNotificationBoxUrl = () => () => this.copyNotificationBoxUrl();
    }

    testNotifier() {
        const {authentication, configs, settings} = this.props;

        let requestReceived: RequestReceived = {
            transaction: {
                title: 'test request',
                displayName: "test user",
                price: 100,
                transactionId: String(Math.random()),
                userId: '0',
                message: 'Test message',
            },
            settings: settings,
        };

        authentication.makeCall(`${configs.relayURL}/notify`, 'POST', {requestReceived});
    }

    copyNotificationBoxUrl() {
        this.notificationBoxUrl.select();
        document.execCommand("copy");

        this.toast.show({html: '<i class="material-icons">done</i>Notification URL copied!', classes: 'success'});
    }


    render() {
        const {configs, settings, authentication, onUpdateOptions, onUpdateSettings, onPaypalEmailChange} = this.props;

        return (
            <div className="options">
              <div className="notification-box">
                <InputField className="notification-box-url" type="email" inputRef={(el) => this.notificationBoxUrl = el} value={`${configs.purchaseURL}/#/${authentication.getStreamlabs().profiles.streamlabs.id}`} label="This is the link to make requests to your channel" id="notification-box-url" readOnly />

                <a className="copy-notification-box-url" onClick={this.onCopyNotificationBoxUrl()}><i className="material-icons">insert_link</i> Copy link</a>
                <button className="btn waves-effect waves-light" onClick={this.onTestNotifier()}>Test notification</button>
              </div>

              <div className="notifications">
                <Switch checked={settings.showImage} label="Show image" onChange={onUpdateSettings('showImage')}/>
                <Switch checked={settings.playSound} label="Play sound" onChange={onUpdateSettings('playSound')}/>
                <Switch checked={settings.profanityFilter} label="Profanity filter" onChange={onUpdateSettings('profanityFilter')}/>
              </div>

              <InputField className="paypal-email" value={settings.paypalEmail} label="Your paypal email" id="paypal-email" onChange={onPaypalEmailChange()} />

              <div>
                <button className="btn waves-effect waves-light" onClick={onUpdateOptions()}>Save settings</button>
              </div>
            </div>
        )
    }
}
