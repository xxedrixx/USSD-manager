// Sharing codes between phones: the app exports a small JSON file and imports
// it back (from a file, or pasted text).
import { validateTemplate } from "./placeholders";
import { getCarrier } from "./carriers";

export const CATEGORIES = ["ALL", "SMS", "CALL", "INTERNET", "SEND", "WITHDRAW"];
const MAX_CODES = 500;

export function serializeCodes(codes) {
    return JSON.stringify(
        {
            app: "ussd-manager",
            version: 1,
            codes: codes.map(({ title, code, category, carrier }) => ({
                title,
                code,
                category: category || "ALL",
                ...(carrier ? { carrier } : {}),
            })),
        },
        null,
        2,
    );
}

// Returns { codes, invalid } or null when the text holds no codes at all.
// Text around the JSON is ignored (e.g. a chat message copied whole).
export function parseCodes(text) {
    const data = extractJson(text);
    const list = Array.isArray(data) ? data : data?.codes;
    if (!Array.isArray(list)) return null;

    const codes = [];
    let invalid = Math.max(0, list.length - MAX_CODES);
    for (const item of list.slice(0, MAX_CODES)) {
        const code = normalizeEntry(item);
        if (code) codes.push(code);
        else invalid++;
    }
    return { codes, invalid };
}

function extractJson(text) {
    const s = String(text).trim();
    try {
        return JSON.parse(s);
    } catch {
        const start = s.search(/[[{]/);
        const end = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
        if (start === -1 || end <= start) return undefined;
        try {
            return JSON.parse(s.slice(start, end + 1));
        } catch {
            return undefined;
        }
    }
}

function normalizeEntry(item) {
    if (!item || typeof item !== "object") return null;
    const title =
        typeof item.title === "string" ? item.title.trim().slice(0, 100) : "";
    const code = typeof item.code === "string" ? item.code.trim() : "";
    if (!title || code.length > 200 || validateTemplate(code)) return null;
    // Outside its {placeholders}, a USSD code is only digits, * # and +.
    if (/[^0-9*#+]/.test(code.replace(/\{[^{}]*\}/g, ""))) return null;
    return {
        title,
        code,
        category: CATEGORIES.includes(item.category) ? item.category : "ALL",
        carrier: getCarrier(item.carrier) ? item.carrier : "",
    };
}

// Splits imported codes into new ones and ones already saved (same code).
export function splitDuplicates(imported, existing) {
    const seen = new Set(existing.map((c) => c.code.trim()));
    const fresh = [];
    let duplicates = 0;
    for (const c of imported) {
        if (seen.has(c.code)) {
            duplicates++;
        } else {
            seen.add(c.code);
            fresh.push(c);
        }
    }
    return { fresh, duplicates };
}

// Things worth a second look in a code received from someone else.
export function risksOf(code) {
    const risks = [];
    // Registering call forwarding (*21*, **21*, *61*, ...) sends your calls
    // to the number in the code.
    if (/^\*{1,2}(21|61|62|67|002|004)\*/.test(code)) risks.push("forwarding");
    // A money code normally asks for the number; a fixed one always pays it.
    if (/03\d{8}/.test(code.replace(/\{[^{}]*\}/g, " "))) {
        risks.push("fixed_number");
    }
    return risks;
}
