import * as React from 'react'
import {ReactElement} from 'react';

type Props = {
    className?: string,
    children: JSX.Element|Array<JSX.Element>
}

export default class Div extends React.Component {
    public props: Props;

    constructor(props: Props) {
        super(props);
    }

    render() {
        const {children, className} = this.props;

        const childrens = React.Children.map(children, (child: ReactElement<any>) => {
            return React.cloneElement(child, {
                ...this.props
            });
        });

        return (
            <div className={className}>
                {childrens}
            </div>
        )
    }
}
