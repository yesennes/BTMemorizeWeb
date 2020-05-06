import _ from "lodash";

const baseUrl = "https://api.scripture.api.bible/v1/";

const key = "7b49bb79780270ec2aa314396b820813"

async function apiFetch(path: string): Promise<any> {
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

    constructor(obj: any) {
        this.name = obj.name;
        this.id = obj.id;
        this.bibleId = obj.bibleId;
        this.number = parseInt(obj.number)
        this.bookId = obj.bookId;
    }
}

export class Book {
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
            .map(chapter => new Chapter(chapter))
            .value();
    }
}



export class Version {
    name: string;
    id: string;
    books?: Array<Book>;

    constructor(name: string, id: string) {
        this.name = name;
        this.id = id;
    }

    async getBooks(): Promise<Array<Book>> {
        if (!this.books) {
            const response = await apiFetch("bibles/" + this.id + "/books?include-chapters=true");
            this.books = _.map(response.data, book => new Book(book));
        }
        return this.books
    }
}

export const versionsList = [
    new Version("WEBBE", "7142879509583d59-04"),
    new Version("WEB", "9879dbb7cfe39e4d-04"),
    new Version("ASV", "06125adad2d5898a-01"),
    new Version("KJV", "de4e12af7f28f599-02"),
];

export const versionsById = _.mapKeys(versionsList, (version, index) => version.id);

export const defaultVersion = versionsById["7142879509583d59-04"]
