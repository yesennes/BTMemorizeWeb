import _ from "lodash";
import PriorityQueue from "./PriorityQueue";

export type Edit = {
    typ: string;
    targetText: string;
    inputText: string;
    penalty: number;
}

export class Result {
    edits: Edit[] = [];
    penalty: number = 0;
    lengthOfInput: number = 0;
    lengthOfTarget: number = 0;

    addOrMerge(edit: Edit) {
        if (this.edits.length > 0 && this.edits[this.edits.length - 1].typ == edit.typ) {
            var last = this.edits[this.edits.length - 1];
            last.targetText += edit.targetText;
            last.inputText += edit.inputText;
            last.penalty += edit.penalty;
        } else {
            this.edits.push(edit);
        }
        this.lengthOfInput += edit.inputText.length;
        this.lengthOfTarget += edit.targetText.length;
        this.penalty += edit.penalty;
    }

    clone(): Result {
        var res = _.clone(this);
        res.edits = _.clone(res.edits);
        // The only one that can be edited is the last, so only clone that
        if (res.edits.length > 0) {
            res.edits[res.edits.length - 1] = _.clone(res.edits[res.edits.length - 1]);
        }
        return res;
    }
}

function comparator(a, b) {
    if (a.penalty == b.penalty) { 
        if (a.lengthOfTarget == b.lengthOfTarget) {
            if (a.lengthOfInput == b.lengthOfInput) {
                return a.edits.length < b.edits.length;
            }
            return a.lengthOfInput > b.lengthOfInput;
        }
        return a.lengthOfTarget > b.lengthOfTarget;
    }
    return a.penalty < b.penalty;
}

const equivalentPairs = [
    ["\n", " "],
    ["\u201c", "\""],
    ["\u201D", "\""],
    ["'", "’"],
    ["—", "-"],
];

const equivalents: {[character: string]: {[character: string]: boolean}} = {
};

_.forEach(equivalentPairs, pair => {
    if (!equivalents[pair[0]]) {
        equivalents[pair[0]] = {};
    }
    if (!equivalents[pair[1]]) {
        equivalents[pair[1]] = {}
    }
    equivalents[pair[0]][pair[1]] = true;
    equivalents[pair[1]][pair[0]] = true;
});

export class EditDistance {
    priorityQueue = new PriorityQueue(comparator);
    workspace: { [tarIndex: number]: {[inIndex: number]: Result}} = {};
    target: string;
    input: string = "";
    farthest: number = 0;

    constructor(target) {
        this.target = target;
        this.priorityQueue.push(new Result());
    }

    getBest(): Result {
        return this.priorityQueue.peek();
    }

    feed(input: string): Result {
        this.input += input;
        while (this.priorityQueue.peek().lengthOfInput < this.input.length) {
            this._calculate();
        }
        return this.priorityQueue.peek();
    }

    finish(): Result {
        while (this.priorityQueue.peek().lengthOfInput < this.input.length || this.priorityQueue.peek().lengthOfTarget < this.target.length) {
            this._calculate();
        }
        return this.priorityQueue.peek();
    }

    _calculate() {
        var res = this.priorityQueue.pop();
        var targetChar = this.target[res.lengthOfTarget];
        var inChar = this.input[res.lengthOfInput];
        if (targetChar == inChar || this._checkEqivalents(targetChar, inChar)) {
            res.addOrMerge({typ: "match", targetText: targetChar, inputText: inChar, penalty: 0});
            this._push(res);
        } else if (/\s/.test(targetChar) && res.lengthOfTarget > 0 && /\s/.test(this.target[res.lengthOfTarget - 1])) {
            res.addOrMerge({typ: "extra whiteSpace", targetText: targetChar, inputText: "", penalty: 0});
            this._push(res);
        } else {
            if (inChar) {
                var deletion = res.clone();
                deletion.addOrMerge({typ: "delete", targetText: "", inputText: inChar, penalty: 1});
                this._push(deletion);
            }
            if (targetChar) {
                var insert = res.clone();
                insert.addOrMerge({typ: "insert", targetText: targetChar, inputText: "", penalty: 1});
                this._push(insert);
            }
        }
    }

    _checkEqivalents(a: string, b: string): boolean{
        return equivalents[a] && equivalents[a][b];
    }

    _push(res: Result) {
        if (!this.workspace[res.lengthOfTarget]) {
            this.workspace[res.lengthOfTarget] = {};
        }
        if (res.lengthOfTarget > this.farthest) {
            this.farthest = res.lengthOfTarget;
        } else if (this.farthest - res.lengthOfTarget > 30) {
            return;
        }
        var existing = this.workspace[res.lengthOfTarget][res.lengthOfInput];
        if (!existing || comparator(existing, res)) {
            this.workspace[res.lengthOfTarget][res.lengthOfInput] = res;
            this.priorityQueue.push(res);
        }
    }
}

