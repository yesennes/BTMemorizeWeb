import ChapterSelector from './ChapterSelector';
import Memorization from './Memorization';
import React from 'react';
import _ from "lodash";
import * as api from './APIBible';

type State = {
    selectedChapter?: api.Chapter,
    selectedVersion?: api.Version,
}

const key = "7b49bb79780270ec2aa314396b820813"

export default class BTMemorize extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
        }
    }

    render(){
        var show;
        if (this.state.selectedChapter) {
            show = <Memorization chapter={this.state.selectedChapter} version={this.state.selectedVersion as api.Version} />;
        } else {
            show = <div>
                       <div>Select a chapter to get started:</div>
                       <ChapterSelector onSelected={(chapter, version) => this.setState({selectedChapter: chapter, selectedVersion: version})} />
                   </div>;
        }
        return (
            <div className="App">
                {show}
            </div>
        );
    }
}
