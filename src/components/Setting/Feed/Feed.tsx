import * as React from 'react'
import RequestReceived from '../../../types/RequestReceived';
import Settings from '../../../types/Settings';
import Configs from '../../../types/Configs';
import Transaction from '../../../types/Transaction';
import Collection from "../../Collection/Collection";
import Toast from "../../../lib/Toast/Toast";
import CollectionItem from '../../Collection/CollectionItem/CollectionItem';
import Authentication from '../../../lib/Authentication/Authentication';
import './Feed.scss';

type State = {
    requestsReceived: Array<RequestReceived>
}

type Props = {
    settings?: Settings,
    configs?: Configs,
    authentication?: Authentication
};

export default class Feed extends React.Component {
    public state: State;
    public props: Props;
    public toast: Toast;
    public websocket: WebSocket;

    public onReplay: (requestReceived: RequestReceived) => () => void;

    constructor(props: Props) {
        super(props);

        this.onReplay = (requestReceived: RequestReceived) => () =>this.replay(requestReceived);

        this.state = {
            requestsReceived: [],
        };
    }

    async componentDidMount() {
        const {authentication, configs, settings} = this.props;

        this.connect();

        try {
            let promise: any = await authentication.makeCall(`${configs.relayURL}/transaction`);
            let transactions = (await promise.json()).transactions;

            let newRequestsReceived: Array<RequestReceived> = [];
            transactions.forEach((transaction: Transaction) => {
                newRequestsReceived.push({
                    transaction,
                    settings
                })
            });

            this.setState(() => {
                return {
                    requestsReceived: newRequestsReceived
                }
            });
        } catch (e) {
            this.toast.show({html: '<i class="material-icons">error_outline</i>Error loading requests', classes: 'error'});
        }
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

                let duplicate = false;
                newRequestsReceived.forEach((requestReceived: RequestReceived) => {
                    if (message.requestReceived.transaction.transactionId === requestReceived.transaction.transactionId) {
                        duplicate = true;
                    }
                });

                if (!duplicate) {
                    newRequestsReceived.unshift(message.requestReceived);
                }

                return {
                    requestsReceived: newRequestsReceived
                };
            });
        } catch (e) {
            console.error('Misformatted message received')
        }
    }

    renderCollectionItems() {
        if (!this.state.requestsReceived.length) {
            return <CollectionItem primaryContent="Incoming requests will appear here" full />
        }

        return this.state.requestsReceived.map((requestReceived, index) => {
            return <CollectionItem
                key={`collection-item-${index}`}
                primaryContent={`${requestReceived.transaction.displayName} requested ${requestReceived.transaction.title} ${(requestReceived.transaction.message) ? 'Message: ' + requestReceived.transaction.message: ''}`}
                secondaryContent={<div><span>${requestReceived.transaction.price.toFixed(2)}$</span><i onClick={this.onReplay(requestReceived)} className="material-icons">replay</i></div>}
            />
        });
    }

    replay(requestReceived: RequestReceived) {
        const {authentication, configs, settings} = this.props;
        requestReceived.settings = settings;

        authentication.makeCall(`${configs.relayURL}/notify`, 'POST', {requestReceived});
    }

    render() {
        return (
            <div className="feed">
                <Collection>
                    {this.renderCollectionItems()}
                </Collection>
            </div>
        )
    }
}
