// Mobile network operators in Madagascar. The colours are approximate brand
// colours; change them here to restyle every carrier badge in the app.
export const carriers = [
    {
        id: "yas",
        name: "Yas",
        color: "#FFD100",
        textColor: "#1C1B1F",
        prefixes: ["034", "038", "036"],
    },
    {
        id: "orange",
        name: "Orange",
        color: "#FF7900",
        textColor: "#1C1B1F",
        prefixes: ["032", "037"],
    },
    {
        id: "airtel",
        name: "Airtel",
        color: "#E40000",
        textColor: "#FFFFFF",
        prefixes: ["033", "035"],
    },
];

export function getCarrier(id) {
    return carriers.find((c) => c.id === id) || null;
}

// Guesses the operator of a normalized Malagasy mobile number (03X XX XXX XX).
export function carrierFromNumber(number) {
    if (!/^03\d{8}$/.test(number)) return null;
    const prefix = number.slice(0, 3);
    return carriers.find((c) => c.prefixes.includes(prefix)) || null;
}
