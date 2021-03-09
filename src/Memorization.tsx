import * as api from './APIBible';
import React from 'react';
import {EditDistance, Result} from "./EditDistance";
import _ from 'lodash';

type Props = {
    chapter: api.RecentChapter,
    onSetProgress: (chapter: api.RecentChapter) => void,
}

type State = {
    current?: TreeNode,
    comparer: EditDistance,
    result: Result
    mistake?: string,
    showVerse: boolean,
    text: Array<string>,
}

class TreeNode {
    parent?: TreeNode;
    left?: TreeNode;
    right?: TreeNode;
    text: string;
    startVerse: number;
    endVerse: number;

    constructor(verses: string[], startVerse: number, endVerse: number, parent?: TreeNode) {
        this.text = verses.slice(startVerse, endVerse).join("").trim();
        this.startVerse = startVerse;
        this.endVerse = endVerse;
        this.parent = parent;
        if (endVerse - startVerse > 1) {
            var midVerse = Math.ceil((endVerse + startVerse) / 2);
            this.left = new TreeNode(verses, startVerse, midVerse, this);
            this.right = new TreeNode(verses, midVerse, endVerse, this);
        }
    }
}

export default class Memorization extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.textEntered = this.textEntered.bind(this);
        this.next = this.next.bind(this);
        this.setVerse = this.setVerse.bind(this);
    }

    componentDidMount() {
        this.props.chapter.chapter.getText().then(text => {
            var tree: TreeNode = new TreeNode(text, 1, text.length);
            var change = true;
            while (change) {
                change = false;
                if (tree.left && tree.left.endVerse >= this.props.chapter.progress.end && tree.left.startVerse <= this.props.chapter.progress.end) {
                    tree = tree.left;
                    change = true;
                }
                if (tree.right && tree.right.startVerse <= this.props.chapter.progress.start && tree.right.endVerse >= this.props.chapter.progress.end) {
                    tree = tree.right;
                    change = true;
                }
            }
            this.setState({text, current: tree, showVerse: false})
            this.setVerse()
        });
    }

    textEntered(event: React.ChangeEvent<HTMLInputElement>) {
        var res = this.state.comparer.feed(event.target.value);
        this.setState({result: res});
        event.target.value = "";
    }

    setVerse(tree?: TreeNode) {
        if (!tree) {
            tree = this.state.current;
        }
        var comparer = new EditDistance(tree.text);
        var result = comparer.getBest();
        this.setState({current: tree, comparer, result})
    }

    next() {
        var current = this.state.current;
        if (current.parent) {
            if (current.parent.left == current) {
                current = current.parent.right;
                while (current.left) {
                    current = current.left;
                }
            } else {
                current = current.parent;
            }
            this.props.onSetProgress({chapter: this.props.chapter.chapter, progress: {start: current.startVerse, end:current.endVerse}});
            this.setVerse(current);
        }
    }

    render() {
        var state = this.state;
        if (state) {
            if (state.current && state.result) {
                if (state.showVerse) {
                    return (
                        <div>
                            <div>{this.state.current.text}</div>
                            <div><button onClick={() => {
                                this.setState({showVerse: false})
                                this.setVerse()
                            }}>Memorize</button></div>
                        </div>);
                }
                var options;
                var finished = state.result.lengthOfTarget == state.current.text.length;
                if (finished) {
                    var message;
                    if (state.result.penalty == 0) {
                        message = "Perfect!";
                    } else {
                        message = "You made " + state.result.penalty + " mistakes. Try again or continue?";
                    }
                    const suggestedTypoAllotment = (state.current.endVerse - state.current.startVerse) * 4;
                    options = (
                        <div>
                            <div>{message}</div>
                            <div>
                                {state.current.parent && <button onClick={this.next} ref={ref => {if (ref && state.result.penalty < suggestedTypoAllotment) ref.focus()}}>Next Section</button>}
                                <button ref={ref => {if (ref && state.result.penalty >= suggestedTypoAllotment) ref.focus()}} onClick={() => this.setVerse()}>Reset</button>
                            </div>
                        </div>);
                } else {
                    options = 
                        <div>
                            <div>
                                <button onClick={() => this.setState({showVerse: true})}>Show Verse</button>
                                <button onClick={this.next}>Skip</button>
                            </div>
                            <div>
                                <button onClick={() => this.setState({current: this.state.current.left})} disabled={!this.state.current.left}>Focus First Half</button>
                            </div>
                            <div>
                                <button onClick={() => this.setState({current: this.state.current.right})} disabled={!this.state.current.right}>Focus Second Half</button>
                            </div>
                        </div>;
                }
                var edits = _.map(state.result.edits, (edit) => {
                    switch(edit.typ) {
                        case "match":
                        case "extra whiteSpace":
                            return edit.targetText;
                        case "delete":
                            return <del className="error">{edit.inputText}</del>;
                        case "insert":
                            //Use Boxes to represent missed characters without revealing them
                            return <span className="error">{finished ? edit.targetText : '\u2610'.repeat(edit.targetText.length)}</span>;
                    }
                });
                return (
                    <div>
                        Enter Verses {state.current.startVerse}-{state.current.endVerse - 1}:
                        {state.current.startVerse > 1 && <div className="error">{state.text[state.current.startVerse - 1]}...</div>}
                        <div>
                            {edits}{finished ? null : <input autoFocus type="text" onChange={this.textEntered} />}
                        </div>
                        ...{state.current.endVerse + 1 < state.text.length && <div className="error">{state.text[state.current.endVerse + 1]}</div>}
                        <div>
                            {options}
                        </div>
                        {this.props.chapter.chapter.version.copyRight}
                    </div>);
            }
        } else {
            return "Loading Verse";
        }
        return null;
    }
}
