import * as React from 'react';
import {MouseEvent} from 'react';
import Collection from '../Collection/Collection';
import Card from '../Card/Card';
import Request from '../../types/Request';
import {ChangeEvent} from 'react';
import Textarea from '../Textarea/Textarea';
import InputField from '../InputField/InputField';
import CollectionItem from '../Collection/CollectionItem/CollectionItem';
import configs from '../../../configs';
import Configs from '../../types/Configs';
import Settings from '../../types/Settings';
import Toast from '../../lib/Toast/Toast';
import './Purchase.scss';

type Props = {
    match: any,
    settings: Settings
}

type State = {
    index: number,
    showInfo: boolean,
    message: string,
    name: string,
    requests: Array<Request>,
    settings: Settings
}

export default class Purchase extends React.Component {
    public toast: Toast;
    public props: Props;
    public state: State;
    public configs: Configs;
    public form: HTMLFormElement;
    public onShowRequest: (index: number) => (e: MouseEvent<HTMLAnchorElement>) => void;
    public onShowRequests: () => () => void;
    public onMessageChange: () => (e: ChangeEvent<HTMLTextAreaElement>) => void;
    public onNameChange: () => (e: ChangeEvent<HTMLInputElement>) => void;

    constructor(props: Props) {
        super(props);
        // @ts-ignore
        this.toast = new Toast();
        this.form = null;
        this.onShowRequest = (index: number) => (e: MouseEvent<HTMLAnchorElement>) => this.showRequest(e, index);
        this.onShowRequests = () => () => this.showRequests();
        this.onMessageChange = () => (e: ChangeEvent<HTMLTextAreaElement>) => this.messageChange(e);
        this.onNameChange = () => (e: ChangeEvent<HTMLInputElement>) => this.nameChange(e);

        const url = new URL(window.location.href);
        const state = url.searchParams.get('state') || 'released';
        this.configs = configs[state];

        this.state = {
            index: null,
            showInfo: false,
            message: '',
            name: '',
            requests: [],
            settings: {}
        }
    }

    async componentDidMount() {
        try {
            let userStream = await fetch(`${this.configs.relayURL}/user/${this.props.match.params.displayName}`);
            let user = (await userStream.json()).user;

            let promises: any = await Promise.all([
                fetch(`${this.configs.relayURL}/request/${user.userId}`),
                fetch(`${this.configs.relayURL}/setting/${user.userId}`),
            ]);

            let requests = (await promises[0].json()).requests;
            let settings = (await promises[1].json()).settings;

            this.setState(() => {
                return {
                    requests,
                    settings
                }
            });
        } catch (e) {
            this.toast.show({html: '<i class="material-icons">error_outline</i>No requests found', classes: 'error'});
        }
    }

    showRequest(e: MouseEvent<HTMLAnchorElement>, index: number) {
        this.setState(() => {
            return {
                showInfo: true,
                index,
            }
        });
    }

    showRequests() {
        this.setState(() => {
            return {
                showInfo: false,
                message: ''
            }
        });
    }

    messageChange(e: ChangeEvent<HTMLTextAreaElement>) {
        const value = e.target.value;

        this.setState(() => {
            return {message: value};
        });
    }

    nameChange(e: ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;

        this.setState(() => {
            return {name: value};
        });
    }

    renderCollectionItems() {
        let count = 0;
        this.state.requests.forEach((request) => {
        if (request.active) {
                count++;
            }
        });

        if (!count) {
            return <CollectionItem primaryContent="The broadcaster has no active requests for now" full />
        }

        const items: Array<JSX.Element> = [];
        this.state.requests.forEach((request, index) => {
            if (request.active) {
                items.push(<CollectionItem
                    key={`collection-item-${index}`}
                    className="ellipsis"
                    primaryContent={request.title}
                    secondaryContent={`${request.price.toFixed(2)}$`}
                    onClick={this.onShowRequest(index)}
                    ellipsis
                />)
            }
        });

        return items;
    }

    render() {
        const {match} = this.props;

        return (
            <div className="app">
                <div className="purchase">
                    <h2>Stream Requests</h2>
                    <div className="container clearfix">
                        <div className="col-12">
                            <h6>Submit a request to {this.props.match.params.displayName}</h6>
                        </div>
                        <div className="col-6">
                            <input type="text" className="browser-default" value={this.state.name} placeholder="Username" maxLength={20} onChange={this.onNameChange()} />
                            <textarea value={this.state.message} placeholder="Message" maxLength={150} onChange={this.onMessageChange()} />
                        </div>
                        <div className="col-6">
                            <Collection>
                                <div className={`request-container ${this.state.showInfo ? 'show-info' : ''}`}>
                                    {this.renderCollectionItems()}
                                    <div className={`scale-transition ${this.state.showInfo ? 'scale-in' : 'scale-out'}`}>
                                        {this.state.showInfo && <Card
                                        title={this.state.requests[this.state.index].title}
                                        subtitle={`${this.state.requests[this.state.index].price.toFixed(2)}$`}
                                        onClose={this.onShowRequests()}
                                        className="fullscreen"
                                        mainAction={{
                                            text: 'Request',
                                            onClick: () => {this.form.submit()}
                                        }}
                                        >
                                        <p className="description">{this.state.requests[this.state.index].description}</p>
                                        <form ref={el => this.form = el} action={this.configs.ipnURL} method="post">
                                            <input type="hidden" name="business" value={this.state.settings.paypalEmail} />
                                            <input type="hidden" name="cmd" value="_xclick" />
                                            <input type="hidden" name="notify_url" value={`${this.configs.relayURL}/paypal-ipn`} />
                                            <input type="hidden" name="item_name" value={this.state.requests[this.state.index].title} />
                                            <input type="hidden" name="custom" value={JSON.stringify({message: this.state.message, userId: this.state.settings.userId, displayName: this.state.name, index: this.state.index})} />
                                            <input type="hidden" name="amount" value={this.state.requests[this.state.index].price} />
                                            <input type="hidden" name="currency_code" value="USD" />
                                            <input type="hidden" name="no_shipping" value="1" />
                                            <input type="hidden" name="return" value={`${this.configs.returnURL}#/${match.params.displayName}`} />
                                            <input type="hidden" name="cancel_return" value={`${this.configs.returnURL}#/${match.params.displayName}`} />
                                        </form>
                                        </Card>}
                                    </div>
                                </div>
                            </Collection>
                        </div>
                        <div className="col-12">
                            <p className="info">Stream request is a new way to interact with the streamer, it allows viewers to pay for requests listed above. Just enter your username, your message, and select the one you want. An alert will then show up on stream and the broadcaster will execute the request.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
