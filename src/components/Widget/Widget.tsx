import * as React from 'react';
import './Widget.scss';
import Requests from '../../types/Requests';
import Products from '../../types/Products';
import Settings from '../../types/Settings';
import Configs from '../../types/Configs';
import Streamlabs from '../../types/Streamlabs';
import RequestReceived from '../../types/RequestReceived';

type State = {
    requestsReceived: Array<RequestReceived>,
    displayNotification: boolean
}

type Props = {
    requests?: Requests,
    products?: Products,
    settings?: Settings,
    configs?: Configs,
    streamlabs?: Streamlabs
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
        this.sound = new Audio('/assets/sounds/good-news.mp3');
    }

    componentDidMount() {
        this.connect();
    }

    connect() {
        const {streamlabs} = this.props;

        this.websocket = new WebSocket(streamlabs.settings.WS_URL, streamlabs.profiles.twitch.twitch_id);
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
            let duplicate = false;

            this.state.requestsReceived.forEach((requestReceived) => {
                if (requestReceived.transaction.transactionId === message.requestReceived.transaction.transactionId) {
                    duplicate = true;
                    return;
                }
            });

            if (duplicate) return;

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
        return (
            <div className="app">
                <div className="notification-container">
                    <div className={(this.state.displayNotification) ? "notification-message" : "notification-message hide"}>
                        {!!this.state.requestsReceived.length && this.state.requestsReceived[0].settings.showImage && <img src="/assets/images/gift.png" />}
                        {!!this.state.requestsReceived.length && <div>Thank you <span className="requester-name">{this.state.requestsReceived[0].transaction.displayName}</span> for requesting <span className="request-name">{this.state.requestsReceived[0].request.title}</span> for <span className="request-price">{this.state.requestsReceived[0].transaction.product.cost.amount} {this.state.requestsReceived[0].transaction.product.cost.type}</span> {(this.state.requestsReceived[0].message) ? `Message: ${this.state.requestsReceived[0].message}` : ''}</div>}
                    </div>
                </div>
            </div>
        )
    }
}

export default App;
