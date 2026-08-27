const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, 'src/data/search.ts');
let content = fs.readFileSync(p, 'utf-8');

// The file currently has: export const Juz: [number, number][] = { [0, 0], [1, 1] };
// We need to replace the outer { } with [ ]
content = content.replace(/export const Juz: \[number, number\]\[\] = \{([\s\S]*?)\};/g, 'export const Juz: [number, number][] = [$1];');
content = content.replace(/export const HizbQaurter: \[number, number\]\[\] = \{([\s\S]*?)\};/g, 'export const HizbQaurter: [number, number][] = [$1];');
content = content.replace(/export const Manzil: \[number, number\]\[\] = \{([\s\S]*?)\};/g, 'export const Manzil: [number, number][] = [$1];');
content = content.replace(/export const Ruku: \[number, number\]\[\] = \{([\s\S]*?)\};/g, 'export const Ruku: [number, number][] = [$1];');
content = content.replace(/export const Page: \[number, number\]\[\] = \{([\s\S]*?)\};/g, 'export const Page: [number, number][] = [$1];');
content = content.replace(/export const Sajda: \[number, number, string\]\[\] = \{([\s\S]*?)\};/g, 'export const Sajda: [number, number, string][] = [$1];');

fs.writeFileSync(p, content);
console.log("Fixed arrays!");
