import * as api from './APIBible';
import React from 'react';
import _ from "lodash";

type State = {
    versionSelected: api.Version,
    bookSelected: number,
    chapterSelected: number,
}

export default class ChapterSelector extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            versionSelected: api.defaultVersion,
            bookSelected: 0,
            chapterSelected: 0,
        }
    }

    async componentDidMount() {
        this._onVersionSelected(api.defaultVersion.id);
    }

    async _onVersionSelected(versionId: string) {
        const version = api.versionsById[versionId];
        await version.getBooks();
        this.setState({versionSelected: version});
    }

    _onBookSelected(bookIndex: number) {
        this.setState({bookSelected: bookIndex});
    }

    render(){
        const versionSelector = _.map(api.versionsList, (version) =>
            <option key={version.id} value={version.id} selected={version == this.state.versionSelected}>{version.name}</option>
        );

        let bookSelector = null;
        let chapterSelector = null;
        if (this.state.versionSelected.books) {
            bookSelector = _.map(this.state.versionSelected.books, (book, index) =>
                <option key={index} value={index} selected={index == this.state.bookSelected}>{book.name}</option>
            );

            const chapters = this.state.versionSelected.books[this.state.bookSelected].chapters;
            chapterSelector = _.map(chapters, (chapter, index) =>
                <option key={index} value={index} selected={index == this.state.chapterSelected}>{chapter.number}</option>
            );
        }


        return (
            <div className="App">
                <select name="Version" onChange={event => this._onVersionSelected(event.target.value)}>
                    {versionSelector}
                </select>
                <select name="Book" onChange={event => this._onBookSelected(parseInt(event.target.value))}>
                    {bookSelector}
                </select>
                <select name="Chapter" onChange={event => this.setState({chapterSelected: parseInt(event.target.value)})}>
                    {chapterSelector}
                </select>
            </div>
        );
    }
}
