import * as React from 'react';
import './Widget.scss';
import Request from '../../types/Request';
import Products from '../../types/Products';
import Settings from '../../types/Settings';
import Configs from '../../types/Configs';
import RequestReceived from '../../types/RequestReceived';
import Authentication from '../../lib/Authentication/Authentication';

type State = {
    requestsReceived: Array<RequestReceived>,
    displayNotification: boolean
}

type Props = {
    requests?: Array<Request>,
    products?: Products,
    settings?: Settings,
    configs?: Configs,
    authentication?: Authentication
};

class App extends React.Component {
    public websocket: WebSocket;
    public state: State;
    public props: Props;
    public interval: any;
    public sound: any;

    constructor(props: Props) {
        super(props);

        this.state = {
            requestsReceived: [],
            displayNotification: false
        };

        this.shiftRequest = this.shiftRequest.bind(this);
        this.showRequest = this.showRequest.bind(this);
        this.connect = this.connect.bind(this);
        this.sound = new Audio(`${props.configs.cdnBasePath}/assets/sounds/good-news.mp3`);
    }

    componentDidMount() {
        this.connect();
    }

    connect() {
        const {authentication, configs} = this.props;
        const streamlabs = authentication.getStreamlabs();

        this.websocket = new WebSocket(configs.wsURL, streamlabs.profiles.streamlabs.id);
        this.websocket.onclose = () => this.onClose();
        this.websocket.onopen = () => this.onOpen();
        this.websocket.onmessage = (evt: MessageEvent) => this.onMessage(evt);
    }

    onClose() {
        let reconnectTime = Math.random()*3000 + 2000;
        console.log(`Disconnected, reconnecting in ${Math.floor(reconnectTime/1000)}s`);

        setTimeout(() => {
            this.connect();
        }, reconnectTime);
    }

    onOpen() {
        console.log('Connected');
    }

    onMessage(evt: MessageEvent) {
        try {
            let message = JSON.parse(evt.data);

            this.setState((prevState: State) => {
                let newRequestsReceived: Array<RequestReceived> = [...prevState.requestsReceived];
                newRequestsReceived.push(message.requestReceived);

                if (!prevState.requestsReceived.length) {
                    this.interval = setInterval(this.shiftRequest, 10000);
                    this.showRequest();
                }

                return {
                    requestsReceived: newRequestsReceived
                };
            });
        } catch (e) {
            console.error('Misformatted message received')
        }
    }

    showRequest() {
        setTimeout(() => {
            if (this.state.requestsReceived[0].settings.playSound) {
                this.sound.play();
            }

            this.setState(() => {
                return {displayNotification: true}
            })
        }, 2000);

        setTimeout(() => {
            this.setState(() => {
                return {displayNotification: false}
            })
        }, 8000);
    }

    shiftRequest() {
        this.setState((prevState: State) => {
            let newRequestsReceived: Array<RequestReceived> = [...prevState.requestsReceived];
            newRequestsReceived.shift();

            if (!newRequestsReceived.length) {
                clearInterval(this.interval);
            }

            if (newRequestsReceived.length) {
                this.showRequest();
            }

            return {
                requestsReceived: newRequestsReceived
            };
        });
    }

    render() {
        const {configs} = this.props;

        return (
            <div className="app">
                <div className="notification-container">
                    <div className={(this.state.displayNotification) ? "notification-message" : "notification-message hide"}>
                        {!!this.state.requestsReceived.length && this.state.requestsReceived[0].settings.showImage && <img src={`${configs.cdnBasePath}/assets/images/gift.png`} />}
                        {!!this.state.requestsReceived.length && <div>Thank you <span className="requester-name">{this.state.requestsReceived[0].transaction.displayName}</span> for requesting <span className="request-name">{this.state.requestsReceived[0].transaction.title}</span> for <span className="request-price">{this.state.requestsReceived[0].transaction.price}$</span> {(this.state.requestsReceived[0].transaction.message) ? `Message: ${this.state.requestsReceived[0].transaction.message}` : ''}</div>}
                    </div>
                </div>
            </div>
        )
    }
}

export default App;
