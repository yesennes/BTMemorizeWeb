import ChapterSelector from './ChapterSelector';
import React from 'react';
import _ from "lodash";

import * as api from './APIBible';

type State = {
}

const key = "7b49bb79780270ec2aa314396b820813"

export default class BTMemorize extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
        }
    }

    render(){
        return (
            <div className="App">
                <div>Select a chapter to get started:</div>
                <ChapterSelector />
            </div>
        );
    }
}
