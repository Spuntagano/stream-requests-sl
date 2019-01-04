import * as React from 'react';
import {MouseEvent} from 'react';
import Collection from '../Collection/Collection';
import Card from '../Card/Card';
import Request from '../../types/Request';
import {ChangeEvent} from 'react';
import Textarea from '../Textarea/Textarea';
import CollectionItem from '../Collection/CollectionItem/CollectionItem';
import configs from '../../../configs';
import Configs from '../../types/Configs';
import User from '../../types/User';
import Settings from '../../types/Settings';
import Toast from '../../lib/Toast/Toast';
import '../../sass/simple-grid.scss';
import './Purchase.scss';

type Props = {
    match: any,
    settings: Settings
}

type State = {
    index: number,
    showInfo: boolean,
    message: string,
    user: User,
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

    constructor(props: Props) {
        super(props);
        // @ts-ignore
        this.toast = new Toast();
        this.form = null;
        this.onShowRequest = (index: number) => (e: MouseEvent<HTMLAnchorElement>) => this.showRequest(e, index);
        this.onShowRequests = () => () => this.showRequests();
        this.onMessageChange = () => (e: ChangeEvent<HTMLTextAreaElement>) => this.messageChange(e);

        const url = new URL(window.location.href);
        const state = url.searchParams.get('state') || 'released';
        this.configs = configs[state];

        this.state = {
            index: null,
            showInfo: false,
            message: '',
            user: {
                displayName: '',
                userId: ''
            },
            requests: [],
            settings: {}
        }
    }

    async componentDidMount() {
        try {
            let promises: any = await Promise.all([
                fetch(`${this.configs.relayURL}/request/${this.props.match.params.userId}`),
                fetch(`${this.configs.relayURL}/user/${this.props.match.params.userId}`),
                fetch(`${this.configs.relayURL}/setting/${this.props.match.params.userId}`)
            ]);

            let requests = (await promises[0].json()).requests;
            let user = (await promises[1].json()).user;
            let settings = (await promises[2].json()).settings;

            this.setState(() => {
                return {
                    requests,
                    user,
                    settings
                }
            });
        } catch (e) {
            this.toast.show({html: '<i class="material-icons">done</i>Error loading requests', classes: 'error'});
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
                    secondaryContent={`${request.price}$`}
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
            <div className="app dark-theme">
                <div className="panel container">
                    <div className="row">
                        <div className="col-12">
                            <h2>Stream Requests</h2>
                            <p>Stream request is a new way to interact with the streamer. It allows viewers to exchange bits for requests listed below.</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6 col-sm-12">
                            <Collection title="Request List">
                                {this.renderCollectionItems()}
                            </Collection>
                        </div>
                        <div className={`col-6 col-sm-12 scale-transition ${this.state.showInfo ? 'scale-in' : 'scale-out'}`}>
                            {this.state.showInfo && <Card
                              title={this.state.requests[this.state.index].title}
                              subtitle={`${this.state.requests[this.state.index].price}$`}
                              onClose={this.onShowRequests()}
                              mainAction={{
                                  text: 'Request',
                                  onClick: () => {this.form.submit()}
                              }}
                              >
                              <p className="description">{this.state.requests[this.state.index].description}</p>
                              <form ref={el => this.form = el} action={this.configs.ipnURL} method="post">
                                <input type="hidden" name="business" value={this.state.settings.paypalEmail} />
                                <input type="hidden" name="cmd" value="_xclick" />
                                <input type="hidden" name="notify_url" value={`${this.configs.relayURL}/paypal-callback`} />
                                <input type="hidden" name="item_name" value={this.state.requests[this.state.index].title} />
                                <input type="hidden" name="custom" value={JSON.stringify({message: this.state.message, userId: match.params.userId, displayName: this.state.user.displayName})} />
                                <input type="hidden" name="amount" value={this.state.requests[this.state.index].price} />
                                <input type="hidden" name="currency_code" value="USD" />
                                <input type="hidden" name="no_shipping" value="1" />
                                <input type="hidden" name="return" value={`${this.configs.returnURL}#/${match.params.userId}`} />
                                <input type="hidden" name="cancel_return" value={`${this.configs.returnURL}#/${match.params.userId}`} />
                              </form>
                              <Textarea value={this.state.message} label="Message" id="request-message" maxLength={150} onChange={this.onMessageChange()} />
                            </Card>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
