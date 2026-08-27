const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, 'src/data/quran-surahs.json');
let content = fs.readFileSync(p, 'utf-8');

// The file has lines like: {0, 7, 5, 1, "الفاتحة", "Al-Faatiha", "The Opening", "Meccan"},
// We want to turn them into valid JSON objects.
let jsonArray = [];

const regex = /\{(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\}/g;
let match;
while ((match = regex.exec(content)) !== null) {
    jsonArray.push({
        Start: parseInt(match[1]),
        Ayahs: parseInt(match[2]),
        Order: parseInt(match[3]),
        Surah_Number: parseInt(match[4]),
        Surah_Name_Arabic: match[5],
        Surah_Name_English: match[6],
        Meaning: match[7],
        Place_of_Revelation: match[8]
    });
}

fs.writeFileSync(p, JSON.stringify(jsonArray, null, 2));
console.log("Fixed quran-surahs.json!");
