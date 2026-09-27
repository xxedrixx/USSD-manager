import { describe, expect, it } from "vitest";
import {
    fillTemplate,
    formatAmount,
    formatNumber,
    getPlaceholders,
    normalizeAmount,
    normalizeNumber,
    parseTemplate,
    placeholderKind,
    validateTemplate,
    validateValue,
} from "./placeholders";
import { carrierFromNumber } from "./carriers";
import { mergeOrder } from "./order";
import { presets } from "./presets";

describe("placeholders", () => {
    it("detects the kind from the name, in French and Malagasy too", () => {
        expect(placeholderKind("number")).toBe("number");
        expect(placeholderKind("Numéro agent")).toBe("number");
        expect(placeholderKind("laharana")).toBe("number");
        expect(placeholderKind("montant")).toBe("amount");
        expect(placeholderKind("vola")).toBe("amount");
        expect(placeholderKind("forfait")).toBe("text");
    });

    it("parses literal text and placeholders in order", () => {
        expect(parseTemplate("*1*{number}*{amount}#")).toEqual([
            { text: "*1*" },
            { placeholder: "number", kind: "number" },
            { text: "*" },
            { placeholder: "amount", kind: "amount" },
            { text: "#" },
        ]);
    });

    it("lists a repeated placeholder once", () => {
        expect(getPlaceholders("#144#8*{number}*{number}*{amount}#")).toEqual([
            { name: "number", kind: "number" },
            { name: "amount", kind: "amount" },
        ]);
        expect(getPlaceholders("*123#")).toEqual([]);
    });

    it("fills every occurrence", () => {
        expect(
            fillTemplate("#144#8*{number}*{number}*{amount}#", {
                number: "0321234567",
                amount: "5000",
            }),
        ).toBe("#144#8*0321234567*0321234567*5000#");
    });

    it("rejects malformed templates", () => {
        expect(validateTemplate("")).toBe("required");
        expect(validateTemplate("*1*{number*2#")).toBe("unbalanced");
        expect(validateTemplate("*1*number}#")).toBe("unbalanced");
        expect(validateTemplate("*1*{ }#")).toBe("empty_placeholder");
        expect(validateTemplate("*1*{number}#")).toBeNull();
    });
});

describe("values", () => {
    it("normalizes phone numbers", () => {
        expect(normalizeNumber("034 12 345 67")).toBe("0341234567");
        expect(normalizeNumber("+261 34 12 345 67")).toBe("0341234567");
        expect(normalizeNumber("261341234567")).toBe("0341234567");
        expect(normalizeNumber("00261-34-12-345-67")).toBe("0341234567");
        expect(normalizeNumber("12345")).toBe("12345");
    });

    it("normalizes amounts", () => {
        expect(normalizeAmount("10 000")).toBe("10000");
        expect(normalizeAmount("0050")).toBe("50");
        expect(normalizeAmount("abc")).toBe("");
    });

    it("validates values", () => {
        expect(validateValue("number", "")).toBe("required");
        expect(validateValue("number", "034123")).toBe("phone_length");
        expect(validateValue("number", "0341234567")).toBeNull();
        expect(validateValue("number", "123456")).toBeNull(); // cash point id
        expect(validateValue("number", "12a")).toBe("digits_only");
        expect(validateValue("amount", "0")).toBe("amount_zero");
        expect(validateValue("amount", "1000")).toBeNull();
        expect(validateValue("text", "1*2")).toBe("invalid_chars");
    });

    it("formats for display", () => {
        expect(formatNumber("0341234567")).toBe("034 12 345 67");
        expect(formatNumber("12345")).toBe("12345");
        expect(formatAmount("1000000")).toBe("1 000 000");
    });

    it("guesses the carrier from the prefix", () => {
        expect(carrierFromNumber("0341234567").id).toBe("yas");
        expect(carrierFromNumber("0321234567").id).toBe("orange");
        expect(carrierFromNumber("0331234567").id).toBe("airtel");
        expect(carrierFromNumber("12345")).toBeNull();
    });
});

describe("presets", () => {
    it("are sorted into send and withdraw", () => {
        for (const p of presets) {
            expect(["SEND", "WITHDRAW"]).toContain(p.category);
        }
    });

    it("are all valid templates asking for a number and an amount", () => {
        for (const p of presets) {
            expect(validateTemplate(p.code)).toBeNull();
            expect(getPlaceholders(p.code).map((x) => x.kind)).toEqual([
                "number",
                "amount",
            ]);
        }
    });
});

describe("mergeOrder", () => {
    const all = [1, 2, 3, 4, 5].map((id) => ({ id }));

    it("moves a subset between its own slots only", () => {
        // Tab showing 2, 4, 5 reordered to 5, 2, 4.
        const merged = mergeOrder(all, [{ id: 5 }, { id: 2 }, { id: 4 }]);
        expect(merged.map((x) => x.id)).toEqual([1, 5, 3, 2, 4]);
    });

    it("keeps every item", () => {
        const merged = mergeOrder(all, [...all].reverse());
        expect(merged.map((x) => x.id)).toEqual([5, 4, 3, 2, 1]);
    });
});
