import * as React from 'react'
import {ChangeEvent} from 'react';
import './Textarea.scss';

type Props = {
    value: string,
    label: string,
    id: string,
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void,
    maxLength?: number
}

export default class Textarea extends React.Component {
    public props: Props;
    public materialize: any;

    constructor(props: Props) {
        super(props);

        // @ts-ignore
        this.materialize = M;
    }

    componentDidMount() {
        const {id} = this.props;

        this.materialize.textareaAutoResize(document.getElementById(id));
    }

    componentDidUpdate() {
        const {id} = this.props;

        this.materialize.textareaAutoResize(document.getElementById(id));
    }

    render() {
        const {value, label, id, onChange, maxLength} = this.props;

        return (
            <div className="input-field">
                <textarea id={id} className="materialize-textarea" maxLength={maxLength} value={value} onChange={onChange}/>
                <label className={(value) ? 'active' : ''} htmlFor={id}>{label}</label>
            </div>
        )
    }
}
