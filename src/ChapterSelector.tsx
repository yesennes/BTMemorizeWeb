import * as api from './APIBible';
import React from 'react';
import _ from "lodash";

type State = {
    versionSelected: api.Version,
    bookSelected?: api.Book,
    chapterSelected?: api.Chapter,
}

type Props = {
    onSelected: (chapter: api.Chapter, version: api.Version) => void,
}

export default class ChapterSelector extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            versionSelected: api.defaultVersion,
        }
    }

    async componentDidMount() {
        this._onVersionSelected(api.defaultVersion);
    }

    async _onVersionSelected(version: api.Version) {
        const books = await version.getBooks();
        let bookSelected;
        if (this.state.bookSelected) {
            bookSelected = _.find(books, book => this.state.bookSelected && this.state.bookSelected.name == book.name) as api.Book;
        }
        if (!bookSelected) {
            bookSelected = books[0];
        }
        let chapterSelected;
        if (this.state.chapterSelected) {
            chapterSelected = _.find(bookSelected.chapters, chapter => this.state.chapterSelected && this.state.chapterSelected.number == chapter.number) as api.Chapter;
        }
        if (!chapterSelected) {
            chapterSelected = bookSelected.chapters[0];
        }
        this.setState({versionSelected: version, bookSelected, chapterSelected});
    }

    async _onBookSelected(bookIndex: number) {
        const bookSelected = (await this.state.versionSelected.getBooks())[bookIndex];
        let chapterSelected;
        if (this.state.chapterSelected) {
            chapterSelected = _.find(bookSelected.chapters, chapter => this.state.chapterSelected && this.state.chapterSelected.number == chapter.number) as api.Chapter;
        }
        if (!chapterSelected) {
            chapterSelected = bookSelected.chapters[0];
        }
        this.setState({bookSelected, chapterSelected});
    }

    render(){
        const versionSelector = _.map(api.versionsList, (version) =>
            <option key={version.name} value={version.name} selected={version == this.state.versionSelected}>{version.name}</option>
        );

        let bookSelector = null;
        let chapterSelector = null;
        if (this.state.versionSelected.books) {
            bookSelector = _.map(this.state.versionSelected.books, (book, index) =>
                <option key={book.name} value={index} selected={this.state.bookSelected && book.name == this.state.bookSelected.name}>{book.name}</option>
            );

            if (this.state.bookSelected) {
                const chapters = this.state.bookSelected.chapters;
                chapterSelector = _.map(chapters, (chapter, index) =>
                    <option key={chapter.number} value={index} selected={this.state.chapterSelected && chapter.number == this.state.chapterSelected.number}>{chapter.number}</option>
                );
            }
        }


        return (
            <div className="App">
                <select name="Version" onChange={event => this._onVersionSelected(api.versionsByName[event.target.value])}>
                    {versionSelector}
                </select>
                <select name="Book" onChange={event => this._onBookSelected(parseInt(event.target.value))}>
                    {bookSelector}
                </select>
                <select name="Chapter" onChange={event => {
                        this.setState({chapterSelected: this.state.bookSelected && this.state.bookSelected.chapters[parseInt(event.target.value)]})
                    }}>
                    {chapterSelector}
                </select>
                <div>
                    <button type="button" onClick={event => this.props.onSelected(this.state.chapterSelected as api.Chapter, this.state.versionSelected as api.Version)}>Select</button>
                </div>
            </div>
        );
    }
}
