import _ from "lodash";

const baseUrl = "https://api.scripture.api.bible/v1/";

const key = "7b49bb79780270ec2aa314396b820813"

async function apiFetch(path: string) {
    return (await fetch(baseUrl + path, {
        headers: new Headers({"api-key": key}),
        method: "GET",
    })).json();
}


export class Chapter {
    id: string;
    name: string;
    bibleId: string;
    number: number;
    bookId: string;

    constructor(name: string, id: string, bibleId: string, number:string, bookId: string) {
        this.name = name;
        this.id = id;
        this.bibleId = bibleId;
        this.number = parseInt(number)
        this.bookId = bookId;
    }
}

export class Book {
    id: string;
    name: string;
    bibleId: string;
    chapters: Array<Chapter>;

    constructor(name: string, id: string, bibleId: string, chapters: any) {
        this.name = name;
        this.id = id;
        this.bibleId = bibleId;
        // @ts-ignore
        this.chapters = _.map(chapters, chapter => new Chapter(...chapter));
    }
}



export class Version {
    name: string;
    id: string;
    books: Array<Book>? = null;

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
    }

    async getBooks(): Array<Book> {
        if (!this.books) {
            response = await apiFetch("bibles/" + this.id + "/books");
            this.books = _.map(response.data, book => new Book(...book));
        }
        return this.books
    }
}

export const versions = [
    new Version("WEBBE", "7142879509583d59-04"),
    new Version("WEB", "9879dbb7cfe39e4d-04"),
    new Version("ASV", "06125adad2d5898a-01"),
    new Version("RV", "40072c4a5aba4022-01"),
    new Version("KJV", "de4e12af7f28f599-02"),
];

