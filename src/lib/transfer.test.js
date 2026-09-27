import { describe, expect, it } from "vitest";
import {
    parseCodes,
    risksOf,
    serializeCodes,
    splitDuplicates,
} from "./transfer";

const codes = [
    {
        id: 7,
        title: "Envoi MVola",
        code: "#111*1*2*{number}*{amount}#",
        category: "SEND",
        carrier: "yas",
        is_favorite: 1,
        display_order: 3,
    },
    { id: 8, title: "Solde", code: "*123#", category: "ALL", carrier: "" },
];

describe("export / import", () => {
    it("round-trips without ids, favorites or order", () => {
        const parsed = parseCodes(serializeCodes(codes));
        expect(parsed.invalid).toBe(0);
        expect(parsed.codes).toEqual([
            {
                title: "Envoi MVola",
                code: "#111*1*2*{number}*{amount}#",
                category: "SEND",
                carrier: "yas",
            },
            { title: "Solde", code: "*123#", category: "ALL", carrier: "" },
        ]);
    });

    it("finds the codes inside a pasted chat message", () => {
        const text = `Voici mes codes :\n${serializeCodes(codes)}\nBonne journée`;
        expect(parseCodes(text).codes).toHaveLength(2);
    });

    it("accepts a plain list", () => {
        expect(parseCodes('[{"title":"A","code":"*1#"}]').codes).toEqual([
            { title: "A", code: "*1#", category: "ALL", carrier: "" },
        ]);
    });

    it("skips invalid entries and fixes unknown category or carrier", () => {
        const parsed = parseCodes(
            JSON.stringify([
                { title: "", code: "*1#" },
                { title: "Bad braces", code: "*1*{number#" },
                { title: "Letters", code: "*1*abc#" },
                { title: "Odd", code: "*2#", category: "X", carrier: "Y" },
            ]),
        );
        expect(parsed.invalid).toBe(3);
        expect(parsed.codes).toEqual([
            { title: "Odd", code: "*2#", category: "ALL", carrier: "" },
        ]);
    });

    it("returns null when there is nothing to import", () => {
        expect(parseCodes("bonjour")).toBeNull();
        expect(parseCodes('{"a":1}')).toBeNull();
        expect(parseCodes("")).toBeNull();
    });
});

describe("splitDuplicates", () => {
    it("drops codes already saved or repeated in the import", () => {
        const imported = [
            { title: "Solde bis", code: "*123#" },
            { title: "New", code: "*5#" },
            { title: "New again", code: "*5#" },
        ];
        const { fresh, duplicates } = splitDuplicates(imported, codes);
        expect(fresh.map((c) => c.title)).toEqual(["New"]);
        expect(duplicates).toBe(2);
    });
});

describe("risksOf", () => {
    it("flags call forwarding and fixed phone numbers", () => {
        expect(risksOf("**21*0341234567#")).toEqual([
            "forwarding",
            "fixed_number",
        ]);
        expect(risksOf("*61*{number}#")).toEqual(["forwarding"]);
        expect(risksOf("#111*1*2*0341234567*5000#")).toEqual(["fixed_number"]);
        expect(risksOf("#111*1*2*{number}*{amount}#")).toEqual([]);
        expect(risksOf("##21#")).toEqual([]);
    });
});
