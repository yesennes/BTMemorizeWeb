import './App.css'
import _ from "lodash";
import React from 'react';

const baseUrl = "https://api.scripture.api.bible/v1/";

const key = "7b49bb79780270ec2aa314396b820813"

async function apiFetch(path: string): Promise<any> {
    return (await fetch(baseUrl + path, {
        headers: new Headers({"api-key": key}),
        method: "GET",
    })).json();
}

export interface Chapter {
    name: string;
    number: number;
    getText:() => Promise<Array<string>>;
}

export const superscriptNumbers = "\u00B2\u00B3\u00B9\u2070-\u2079";

let verseRegex = new RegExp(`([${superscriptNumbers}]+)([^${superscriptNumbers}]+)`);

class APIChapter {
    id: string;
    name: string;
    bibleId: string;
    number: number;
    bookId: string;

    constructor(obj: any) {
        this.name = obj.name;
        this.id = obj.id;
        this.bibleId = obj.bibleId;
        this.number = parseInt(obj.number)
        this.bookId = obj.bookId;
    }

    async getText(): Promise<Array<string>> {
        var verses = (await apiFetch(`bibles/${this.bibleId}/chapters/${this.id}?content-type=json`)).content;
        return _.map(verses.match(verseRegex), (verse) => verse[0])
    }
}

export interface Book {
    name: string;
    chapters: Array<Chapter>;
}

class APIBook {
    id: string;
    name: string;
    bibleId: string;
    chapters: Array<Chapter>;

    constructor(obj: any) {
        this.name = obj.name;
        this.id = obj.id;
        this.bibleId = obj.bibleId;
        this.chapters = _.chain(obj.chapters)
            // Filter out introductions etc
            .filter(chapter => !isNaN(chapter.number))
            .map(chapter => new APIChapter(chapter))
            .value();
    }
}


export interface Version {
    name: string;
    books?: Array<Book>;
    getBooks:() => Promise<Array<Book>>;
    copyRight:JSX.Element;
}

class APIVersion {
    name: string;
    id: string;
    books?: Array<Book>;
    copyRight = <div/>;

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
    }

    async getBooks(): Promise<Array<Book>> {
        if (!this.books) {
            const response = await apiFetch("bibles/" + this.id + "/books?include-chapters=true");
            this.books = _.map(response.data, book => new APIBook(book));
        }
        return this.books
    }
}

class ESV {
    name: string= "ESV";
    books: Array<Book>= [
        new ESVBook("Genesis", 50),
        new ESVBook("Exodus", 40),
        new ESVBook("Leviticus", 27),
        new ESVBook("Numbers", 36),
        new ESVBook("Deuteronomy", 34),
        new ESVBook("Joshua", 24),
        new ESVBook("Judges", 21),
        new ESVBook("Ruth", 4),
        new ESVBook("1 Samuel", 31),
        new ESVBook("2 Samuel", 24),
        new ESVBook("1 Kings", 22),
        new ESVBook("2 Kings", 25),
        new ESVBook("1 Chronicles", 29),
        new ESVBook("2 Chronicles", 36),
        new ESVBook("Ezra", 10),
        new ESVBook("Nehemiah", 13),
        new ESVBook("Esther", 10),
        new ESVBook("Job", 42),
        new ESVBook("Psalms", 150),
        new ESVBook("Proverbs", 31),
        new ESVBook("Ecclesiastes", 12),
        new ESVBook("Song of Songs", 8),
        new ESVBook("Isaiah", 66),
        new ESVBook("Jeremiah", 52),
        new ESVBook("Lamentations", 5),
        new ESVBook("Ezekiel", 48),
        new ESVBook("Daniel", 12),
        new ESVBook("Hosea", 14),
        new ESVBook("Joel", 3),
        new ESVBook("Amos", 9),
        new ESVBook("Obadiah", 1),
        new ESVBook("Jonah", 4),
        new ESVBook("Micah", 7),
        new ESVBook("Nahum", 3),
        new ESVBook("Habakkuk", 3),
        new ESVBook("Zephaniah", 3),
        new ESVBook("Haggai", 2),
        new ESVBook("Zechariah", 14),
        new ESVBook("Malachi", 4),
        new ESVBook("Matthew", 28),
        new ESVBook("Mark", 16),
        new ESVBook("Luke", 24),
        new ESVBook("John", 21),
        new ESVBook("Acts", 28),
        new ESVBook("Romans", 16),
        new ESVBook("1 Corinthians", 16),
        new ESVBook("2 Corinthians", 13),
        new ESVBook("Galatians", 6),
        new ESVBook("Ephesians", 6),
        new ESVBook("Philippians", 4),
        new ESVBook("Colossians", 4),
        new ESVBook("1 Thessalonians", 5),
        new ESVBook("2 Thessalonians", 3),
        new ESVBook("1 Timothy", 6),
        new ESVBook("2 Timothy", 4),
        new ESVBook("Titus", 3),
        new ESVBook("Philemon", 1),
        new ESVBook("Hebrews", 13),
        new ESVBook("James", 5),
        new ESVBook("1 Peter", 5),
        new ESVBook("2 Peter", 3),
        new ESVBook("1 John", 5),
        new ESVBook("2 John", 1),
        new ESVBook("3 John", 1),
        new ESVBook("Jude", 1),
        new ESVBook("Revelation", 22),
    ];
    copyRight =<div>(ESV)</div>;

    constructor() {
    }

    async getBooks(): Promise<Array<Book>> {
        return this.books;
    }
}

class ESVBook {
    name: string;
    chapters: Array<Chapter>;

    constructor(name: string, chapters: number) {
        this.name = name;
        this.chapters = [];
        for (var i = 1; i <= chapters; i++) {
            this.chapters.push(new ESVChapter(name, i));
        }
    }
}

var esvRegex = /\[(\d+)]([^\[]*)/g

class ESVChapter {
    name: string;
    book: string;
    number: number;

    constructor(book: string, number: number) {
        this.book = book;
        this.name = number.toString();
        this.number = number;
    }

    async getText() : Promise<Array<string>> {
        var response = await fetch(
            `https://api.esv.org/v3/passage/text/?q=${this.book}+${this.number}&include-passage-reference=false&include-footnotes=false&include-headings=false&include-short-copyright=false`,
            {
                headers: new Headers({"Authorization": "Token 4632229beb9708b657a5a6fb218a396f0bb05fba"}),
                method: "GET",
        });
        if (!response.ok) {
            console.error(response);
        }
        var body = (await response.json());
        var text = body.passages[0];
        var result = []
        var match = esvRegex.exec(text);
        while (match) {
            result[Number(match[1])] = match[2];
            match = esvRegex.exec(text);
        }
        return result;
    }
}

var esv = new ESV();

export const versionsList: Array<Version> = [
    new APIVersion("WEBBE", "7142879509583d59-04"),
    new APIVersion("WEB", "9879dbb7cfe39e4d-04"),
    new APIVersion("ASV", "06125adad2d5898a-01"),
    new APIVersion("KJV", "de4e12af7f28f599-02"),
    esv,
];

export const versionsByName = _.mapKeys(versionsList, (version, index) => version.name);

export const defaultVersion = esv;
