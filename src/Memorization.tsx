import * as api from './APIBible';
import React from 'react';
import {EditDistance, Result} from "./EditDistance";
import _ from 'lodash';

type Props = {
    chapter: api.Chapter
    version: api.Version
}

type State = {
    current?: TreeNode,
    comparer: EditDistance,
    result: Result
    mistake?: string,
    showVerse: boolean,
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
    nextButton: React.RefObject<HTMLButtonElement> = React.createRef();
    constructor(props: Props) {
        super(props);
        this.textEntered = this.textEntered.bind(this);
        this.next = this.next.bind(this);
        this.setVerse = this.setVerse.bind(this);
    }

    componentDidMount() {
        this.props.chapter.getText().then(text => {
            var tree: TreeNode = new TreeNode(text, 1, text.length);
            while (tree.left) {
                tree = tree.left;
            }
            this.setState({current: tree, showVerse: false})
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
                                {state.current.parent && <button autoFocus={state.result.penalty < suggestedTypoAllotment} onClick={this.next} ref={this.nextButton}>Next Section</button>}
                                <button autoFocus={state.result.penalty >= suggestedTypoAllotment} onClick={() => this.setVerse()}>Reset</button>
                            </div>
                        </div>);
                } else {
                    options = 
                        <div>
                            <button onClick={() => this.setState({showVerse: true})}>Show Verse</button>
                            <button onClick={this.next}>Skip</button>
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
                            return <ins className="error">{finished ? edit.targetText : '\u25A1'.repeat(edit.targetText.length)}</ins>;
                    }
                });
                return (
                    <div>
                        Enter Verses {state.current.startVerse}-{state.current.endVerse - 1}:
                        <div>
                            {edits}{finished ? null : <input autoFocus type="text" onChange={this.textEntered} />}
                        </div>
                        <div>
                            {options}
                        </div>
                        {this.props.version.copyRight}
                    </div>);
            }
        } else {
            return "Loading Verse";
        }
        return null;
    }
}
