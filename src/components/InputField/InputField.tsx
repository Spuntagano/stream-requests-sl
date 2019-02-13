import * as React from 'react'
import {ChangeEvent} from 'react';
import './InputField.scss';

type Props = {
    value: string,
    label: string,
    id: string,
    className?: string,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    readOnly?: boolean,
    inputRef?: (el: HTMLInputElement) => void,
    type?: string,
    step?: string,
    maxLength?: number
}

export default class InputField extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {value, label, id, onChange, readOnly, inputRef, className, type, step, maxLength} = this.props;

        return (
            <div className={`input-field ${className}`}>
                <input ref={inputRef} readOnly={readOnly} maxLength={maxLength} id={id} type={type || 'text'} value={value} step={step} onChange={onChange}/>
                <label className={(value) ? 'active' : ''} htmlFor={id}>{label}</label>
            </div>
        )
    }
}
