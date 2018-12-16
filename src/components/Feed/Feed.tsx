import * as React from 'react'
import Requests from '../../types/Requests';
import Products from '../../types/Products';
import Product from '../../types/Product';
import RequestReceived from '../../types/RequestReceived';
import Transaction from '../../types/Transaction';
import Settings from '../../types/Settings';
import Configs from '../../types/Configs';
import Collection from "../Collection/Collection";
import './Feed.scss';
import CollectionItem from '../Collection/CollectionItem/CollectionItem';
import Streamlabs from '../../types/Streamlabs';

type State = {
    requestsReceived: Array<RequestReceived>,
}

type Props = {
    requests?: Requests,
    products?: Products,
    settings?: Settings,
    configs?: Configs,
    streamlabs?: Streamlabs
};

export default class Feed extends React.Component {
    public twitch: any;
    public state: State;
    public props: Props;

    constructor(props: Props) {
        super(props);

        // @ts-ignore
        this.twitch = window.Twitch ? window.Twitch.ext : null;
        this.state = {
            requestsReceived: [],
        };
    }

    componentDidMount() {
        const {configs} = this.props;

        if (this.twitch) {
            //TODO: load requests
        }
    }

    componentWillUnmount() {
        if (this.twitch) {
            this.twitch.unlisten('broadcast');
        }
    }

    transactionComplete(transaction: Transaction) {
        const {products, requests, settings} = this.props;

        let index = -1;
        let price = '';
        let valid = false;

        Object.keys(products).forEach((p: string) => {
            products[p].forEach((product: Product, i: number) => {
                if (transaction.product.sku === product.sku) {
                    index = i;
                    price = p.toString();
                    valid = true;
                }
            })
        });

        if (!valid) throw('Invalid transaction');

        const requestReceived: RequestReceived = {
            request: requests[price][index],
            settings: settings,
            transaction,
            message: null,
            pending: true,
        };

        this.setState((prevState: State) => {
            let newRequestsReceived: Array<RequestReceived> = [...prevState.requestsReceived];
            newRequestsReceived.unshift(requestReceived);

            return {requestsReceived: newRequestsReceived};
        });
    }

    renderCollectionItems() {
        let count = 0;
        this.state.requestsReceived.forEach((requestReceived) => {
            if (!requestReceived.pending) {
                count++;
            }
        });

        if (!count) {
            return <CollectionItem primaryContent="The broadcaster has no active requests for now" full />
        }

        if (!this.state.requestsReceived.length) {
            return <CollectionItem primaryContent="Incoming requests will appear here" full />
        }

        return this.state.requestsReceived.map((requestReceived, index) => {
            if (!requestReceived.pending) {
                return <CollectionItem
                    key={`collection-item-${index}`}
                    primaryContent={`${requestReceived.transaction.displayName} requested ${requestReceived.request.title} ${(requestReceived.message) ? 'Message: ' + requestReceived.message: ''}`}
                    secondaryContent={`${requestReceived.transaction.product.cost.amount} ${requestReceived.transaction.product.cost.type}`}
                />
            }
        });
    }

    render() {
        return (
            <div className="live-config">
                <Collection
                    title="Stream Requests"
                    tooltip="Keep this window open for notifications to show."
                >
                    {this.renderCollectionItems()}
                </Collection>
            </div>
        )
    }
}
