// Mobile money codes added once on first launch (and once for existing users
// after updating). Users can edit or delete them like any other code.
// Cash withdrawal at an agent / cash point, taken from the "Retrait Rapide" app.
export const presets = [
    {
        title: "Retrait MVola",
        code: "#111*1*4*1*{number}*{amount}#",
        category: "MONEY",
        carrier: "yas",
    },
    {
        title: "Retrait Orange Money",
        code: "#144#8*{number}*{number}*{amount}#",
        category: "MONEY",
        carrier: "orange",
    },
    {
        title: "Retrait Airtel Money",
        code: "*436*4*{number}*{amount}*12#",
        category: "MONEY",
        carrier: "airtel",
    },
];
