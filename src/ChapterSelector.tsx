import * as api from './APIBible';
import React from 'react';
import _ from "lodash";

type State = {
    versionSelected: api.Version,
    bookSelected?: api.Book,
    chapterSelected?: api.Chapter,
}

export default class ChapterSelector extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            versionSelected: api.versions[0],
        }

        this._onVersionSelected = this._onVersionSelected.bind(this)
    }

    async onComponentDidMount() {
        this._onVersionSelected(api.versions[0].id);
    }

    async _onVersionSelected(version: string) {
        
    }

    render(){
        const versionSelector = _.map(api.versions, (version) =>
            <option value={version.id}>{version.name}</option>
        )
        return (
            <div className="App">
                <div>Select a chapter to get started:</div>
                <select name="Version" onChange=this._onVersionSelected>
                    {versionSelector}
                </select>
            </div>
        );
    }
}
