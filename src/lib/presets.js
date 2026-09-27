// Mobile money codes added once on first launch (and once for existing users
// after updating). Users can edit or delete them like any other code.
export const presets = [
    {
        title: "Envoi MVola",
        code: "#111*1*2*{number}*{amount}#",
        category: "SEND",
        carrier: "yas",
    },
    {
        title: "Envoi Orange Money",
        code: "#144*1*{number}*{amount}#",
        category: "SEND",
        carrier: "orange",
    },
    {
        title: "Envoi Airtel Money",
        code: "*436*2*1*1*{number}*{amount}#",
        category: "SEND",
        carrier: "airtel",
    },
    {
        title: "Airtel Money vers Orange Money",
        code: "*436*2*2*{number}*{amount}#",
        category: "SEND",
        carrier: "airtel",
    },
    {
        title: "Airtel Money vers MVola",
        code: "*436*2*3*{number}*{amount}#",
        category: "SEND",
        carrier: "airtel",
    },
    // Cash withdrawal at an agent / cash point, from the "Retrait Rapide" app.
    {
        title: "Retrait MVola",
        code: "#111*1*4*1*{number}*{amount}#",
        category: "WITHDRAW",
        carrier: "yas",
    },
    {
        title: "Retrait Orange Money",
        code: "#144#8*{number}*{number}*{amount}#",
        category: "WITHDRAW",
        carrier: "orange",
    },
    {
        title: "Retrait Airtel Money",
        code: "*436*4*{number}*{amount}*12#",
        category: "WITHDRAW",
        carrier: "airtel",
    },
];
