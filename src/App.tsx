import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as api from './APIBible';

import _ from "lodash";

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
        const versionSelector = _.map(api.getVersions(), (version) =>
            <option value={version}>{version}</option>
        )
        return (
            <div className="App">
                <div>Select a chapter to get started:</div>
                <select name="Version">
                    {versionSelector}
                </select>
            </div>
        );
    }
}
