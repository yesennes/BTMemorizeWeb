import * as api from './APIBible';
import React from 'react';
import _ from 'lodash';

type Props = {
    chapter: api.Chapter
    version: api.Version
}

type State = {
    text?: Array<string>,
}

export default class Memorization extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.props.chapter.getText().then(text => this.setState({text}));
    }

    render() {
        return (<div>
            {_.map(this.state.text, (verse, index) => <div key={index}>{verse}</div>)}
            {this.props.version.copyRight}
            </div>);
    }
}
