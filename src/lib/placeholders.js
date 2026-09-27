// USSD templates can contain placeholders such as `#111*1*2*{number}*{amount}#`.
// They are filled in by the user right before dialling. The same placeholder
// may appear several times (e.g. a number typed twice for confirmation); it is
// asked once and replaced everywhere.

const TOKEN = /\{([^{}]*)\}/g;

// Placeholder names (or words inside them) that get a phone-number input.
const NUMBER_WORDS = [
    "number",
    "numero",
    "num",
    "phone",
    "tel",
    "telephone",
    "laharana",
    "recipient",
    "destinataire",
    "beneficiaire",
    "agent",
    "cashpoint",
];

// Placeholder names (or words inside them) that get an amount input.
const AMOUNT_WORDS = ["amount", "montant", "somme", "vola"];

// Placeholders the "add code" form inserts; their labels are translated.
export const NUMBER = "number";
export const AMOUNT = "amount";

function words(name) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .split(/[\s_-]+/)
        .filter(Boolean);
}

// "number", "amount" or "text"
export function placeholderKind(name) {
    const w = words(name);
    if (w.some((x) => NUMBER_WORDS.includes(x))) return "number";
    if (w.some((x) => AMOUNT_WORDS.includes(x))) return "amount";
    return "text";
}

// Splits a template into literal text and placeholder parts, in order.
export function parseTemplate(code) {
    const parts = [];
    let last = 0;
    for (const m of code.matchAll(TOKEN)) {
        if (m.index > last) parts.push({ text: code.slice(last, m.index) });
        const name = m[1].trim();
        parts.push({ placeholder: name, kind: placeholderKind(name) });
        last = m.index + m[0].length;
    }
    if (last < code.length) parts.push({ text: code.slice(last) });
    return parts;
}

// Unique placeholders in order of first appearance.
export function getPlaceholders(code) {
    const seen = new Map();
    for (const part of parseTemplate(code)) {
        if (part.placeholder !== undefined && !seen.has(part.placeholder)) {
            seen.set(part.placeholder, {
                name: part.placeholder,
                kind: part.kind,
            });
        }
    }
    return [...seen.values()];
}

export function hasPlaceholders(code) {
    return getPlaceholders(code).length > 0;
}

// Returns an error key for a template typed by the user, or null if valid.
export function validateTemplate(code) {
    if (!code.trim()) return "required";
    if (/[{}]/.test(code.replace(TOKEN, ""))) return "unbalanced";
    if (getPlaceholders(code).some((p) => p.name === "")) {
        return "empty_placeholder";
    }
    return null;
}

export function fillTemplate(code, values) {
    return code.replace(TOKEN, (match, name) => values[name.trim()] ?? match);
}

// Accepts the ways people write Malagasy numbers: spaces, dashes, +261...
export function normalizeNumber(input) {
    let n = String(input).replace(/[\s().-]/g, "");
    if (n.startsWith("+261")) n = "0" + n.slice(4);
    else if (n.startsWith("00261")) n = "0" + n.slice(5);
    else if (/^261\d{9}$/.test(n)) n = "0" + n.slice(3);
    return n;
}

export function normalizeAmount(input) {
    return String(input)
        .replace(/\D/g, "")
        .replace(/^0+(?=\d)/, "");
}

// Returns an error key for a normalized value, or null if valid.
export function validateValue(kind, value) {
    if (!value) return "required";
    if (kind === "number") {
        if (/\D/.test(value)) return "digits_only";
        // Cash point identifiers can be any length, phone numbers can't.
        if (value.startsWith("03") && value.length !== 10) {
            return "phone_length";
        }
    }
    if (kind === "amount" && Number(value) <= 0) return "amount_zero";
    // These would change the meaning of the USSD command.
    if (/[*#{}]/.test(value)) return "invalid_chars";
    return null;
}

// 0341234567 -> 034 12 345 67
export function formatNumber(number) {
    const m = /^(03\d)(\d{2})(\d{3})(\d{2})$/.exec(number);
    return m ? m.slice(1).join(" ") : number;
}

// 10000 -> 10 000
export function formatAmount(amount) {
    return amount.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
