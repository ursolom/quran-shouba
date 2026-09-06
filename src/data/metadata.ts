/**
 * metadata.ts
 * Extremely fast page → { surahName, juzNumber } using binary search on surahs.
 * Memory: only small arrays (115 entries), no 605-item table.
 */
import surahsData from "./quran-surahs.json";

export interface PageMetadata {
  surahName: string;
  juzNumber: number;
  pageNumber: number;
}

interface SurahEntry {
  number: number;
  name: string;
  type: string;
  ayat: number;
  parts: { part: number; startPage: number; endPage: number }[];
}

const surahs = surahsData as SurahEntry[];
const TOTAL_SURAHS = surahs.length;

const surahStartPages: number[] = new Array(TOTAL_SURAHS);
const surahNames: string[] = new Array(TOTAL_SURAHS);
const surahPartsList: { part: number; startPage: number; endPage: number }[][] =
  new Array(TOTAL_SURAHS);

for (let i = 0; i < TOTAL_SURAHS; i++) {
  const s = surahs[i];
  surahNames[i] = s.name;
  surahStartPages[i] = s.parts[0].startPage;
  surahPartsList[i] = s.parts;
}

function findSurahIndex(page: number): number {
  let low = 0;
  let high = TOTAL_SURAHS - 1;
  let result = 0;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (surahStartPages[mid] <= page) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return result;
}

export function getPageMetadata(pageIndex: number): PageMetadata {
  if (pageIndex < 0 || pageIndex >= 604) {
    return {
      surahName: "غير معروف",
      juzNumber: 1,
      pageNumber: pageIndex + 1,
    };
  }

  const pageNumber = pageIndex + 1;

  const surahIdx = findSurahIndex(pageNumber);
  const surah = surahs[surahIdx];
  const parts = surahPartsList[surahIdx];

  let juzNumber = 1;

  for (const p of parts) {
    if (pageNumber >= p.startPage && pageNumber <= p.endPage) {
      juzNumber = p.part;
      break;
    }
  }

  return {
    surahName: surah.name,
    juzNumber,
    pageNumber,
  };
}
