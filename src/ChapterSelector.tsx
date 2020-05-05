import * as api from './APIBible';
import React from 'react';
import _ from "lodash";

type State = {
    versionSelected: string,
    bookSelected: string?,
    chapterSelected: number?,
}

export default class ChapterSelector extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            versionSelected: api.getVersions()[0],
        }
    }

    _onVersionSelected(version) {

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
