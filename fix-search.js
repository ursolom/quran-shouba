const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, 'src/data/search.ts');
let content = fs.readFileSync(p, 'utf-8');

// Replace {sura, aya} with [sura, aya]
// We match {number, number}
content = content.replace(/\{\s*(\d+)\s*,\s*(\d+)\s*\}/g, '[$1, $2]');

// For Sajda which has {number, number, "string"}
content = content.replace(/\{\s*(\d+)\s*,\s*(\d+)\s*,\s*("[^"]+")\s*\}/g, '[$1, $2, $3]');

// Add export keywords and type definitions
content = content.replace(/const Juz =/g, 'export const Juz: [number, number][] =');
content = content.replace(/const HizbQaurter =/g, 'export const HizbQaurter: [number, number][] =');
content = content.replace(/const Manzil =/g, 'export const Manzil: [number, number][] =');
content = content.replace(/const Ruku =/g, 'export const Ruku: [number, number][] =');
content = content.replace(/const Page =/g, 'export const Page: [number, number][] =');
content = content.replace(/const Sajda =/g, 'export const Sajda: [number, number, string][] =');

fs.writeFileSync(p, content);
console.log("Done");
