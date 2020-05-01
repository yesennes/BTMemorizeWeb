import _ from "lodash";

const versionToId = {
    "WEBBE": "7142879509583d59-04",
    "WEB": "9879dbb7cfe39e4d-04",
    "ASV": "06125adad2d5898a-01",
    "RV": "40072c4a5aba4022-01",
    "KJV": "de4e12af7f28f599-02",
}

export function getVersions(): Array<string> {
    return _.keys(versionToId);
}
