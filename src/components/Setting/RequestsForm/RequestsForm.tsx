import * as React from 'react'
import Request from '../../../types/Request';
import Configs from '../../../types/Configs';
import InputField from '../../InputField/InputField';
import Switch from '../../Switch/Switch';
import Textarea from '../../Textarea/Textarea';
import Authentication from '../../../lib/Authentication/Authentication';
import {ChangeEvent, MouseEvent} from 'react';
import './RequestsForm.scss'

type Props = {
    requests: Array<Request>,
    configs: Configs,
    authentication: Authentication,
    onRequestChange: (index: number, update: string) => (e: ChangeEvent<HTMLInputElement>|ChangeEvent<HTMLTextAreaElement>) => void,
    onDeleteRequest: (index: number) => (e: MouseEvent<HTMLButtonElement>) => void,
    onToggleActive: (index: number) => (e: ChangeEvent<HTMLInputElement>) => void,
    onUpdateRequests: () => (e: MouseEvent<HTMLButtonElement>) => void
};

export default class RequestsForm extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    renderForm() {
        const {onRequestChange, onToggleActive, onDeleteRequest, requests} = this.props;

        return requests.map((request: Request, index: number) => {
            return <div key={`request-form-${index}`} className="clearfix">
                <div className="input-container request-form left">
                    <InputField value={request.title} label="Title" id={`request-form-title-${index}`} onChange={onRequestChange(index, 'title')}/>
                    <Textarea value={request.description} label="Description" id={`request-form-description-${index}`} onChange={onRequestChange(index, 'description')} />
                    <InputField className="price" type="number" step="1" value={request.price} label="Price" id={`request-form-price-${index}`} onChange={onRequestChange(index, 'price')}/>
                    <Switch className="disable-switch" checked={request.active} label="Active" onChange={onToggleActive(index)}/>
                </div>
                <button disabled={requests.length-1 === index && !request.title.length && !request.description.length} className="btn waves-effect waves-light delete-request btn-floating left" onClick={onDeleteRequest(index)}>
                    <i className="material-icons">close</i>
                </button>
            </div>;
        });
    }

    render() {
        const {onUpdateRequests} = this.props;

        return (
            <div className="requests-form">
                {this.renderForm()}

                <div>
                    <button className="btn waves-effect waves-light" onClick={onUpdateRequests()}>Save requests</button>
                </div>
            </div>
        )
    }
}
