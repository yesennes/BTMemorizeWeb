import './App.css';
import ChapterSelector from './ChapterSelector';
import Memorization from './Memorization';
import React from 'react';
import _ from "lodash";
import * as api from './APIBible';

const recentChaptersKey = "recentChapters";

type State = {
    selectedChapter?: api.RecentChapter,
    recentChapters: Array<api.RecentChapter>,
}

export default class BTMemorize extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.selectChapter = this.selectChapter.bind(this);
        this.removeRecent = this.removeRecent.bind(this);
        this.setProgress = this.setProgress.bind(this);
        this.state = {recentChapters:[]};
    }

    async componentDidMount() {
        const dehydratedChapters = JSON.parse(window.localStorage.getItem(recentChaptersKey));
        if (dehydratedChapters) {
            const chapters = [];
            try {
                for (const recent of dehydratedChapters) {
                    const book = _.find((await api.versionsByName[recent.chapter.version].getBooks()), book => book.name == recent.chapter.book);
                    chapters.push({chapter: book.chapters[recent.chapter.chapter - 1], progress: recent.progress});
                }
                this.setState({recentChapters: chapters});
            } catch (error) {
                //Recover from invalid data in local storage by deleting it.
                console.error("Failed to load stored chapters", error)
                localStorage.removeItem(recentChaptersKey);
            }
        }
    }

    removeRecent(recent: api.RecentChapter) {
        const newRecents = _.filter(this.state.recentChapters, a => a != recent);
        this._setRecents(newRecents);
    }

    selectChapter(selected: api.RecentChapter) {
        this.setState({selectedChapter: selected});
        for (const i in this.state.recentChapters) {
            const recent = this.state.recentChapters[i];
            if (recent.chapter == selected.chapter) {
                if (recent.progress == selected.progress) {
                    return;
                } else {
                    const newRecents = [...this.state.recentChapters]
                    newRecents[i] = selected;
                    this._setRecents(newRecents);
                    return;
                }
            }
        }
        const newRecents = [...this.state.recentChapters];
        newRecents.push(selected);
        this._setRecents(newRecents);
    }

    setProgress(recent: api.RecentChapter) {
        const index = _.findIndex(this.state.recentChapters, chapter => chapter.chapter == recent.chapter);
        const copy = [...this.state.recentChapters];
        if (index < 0 ){
            copy.push(recent);
        } else {
            copy[index] = recent;
        }
        this._setRecents(copy);
    }

    _setRecents(recents: Array<api.RecentChapter>) {
        this.setState({recentChapters: recents});
        const dehydrated = _.map(recents,
            recent => ({chapter: {version: recent.chapter.version.name, book: recent.chapter.book.name, chapter: recent.chapter.number}, progress: recent.progress}));
        window.localStorage.setItem(recentChaptersKey, JSON.stringify(dehydrated));
    }

    render(){
        var show;
        if (this.state.selectedChapter) {
            show = <Memorization chapter={this.state.selectedChapter} onSetProgress={this.setProgress}/>;
        } else {
            show = <div>
                       <div>Select a chapter to get started:</div>
                       <ChapterSelector recentChapters={this.state.recentChapters} onSelected={this.selectChapter} onRecentRemoved={this.removeRecent} />
                   </div>;
        }
        return (
            <div className="App">
                {show}
            </div>
        );
    }
}
