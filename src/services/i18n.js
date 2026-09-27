import { writable } from 'svelte/store';
import { Preferences } from '@capacitor/preferences';

const translations = {
    fr: {
        app_title: "USSD",
        search_placeholder: "Rechercher...",
        add_code: "Ajouter un code",
        edit_code: "Modifier le code",
        title: "Titre",
        ussd_code: "Code USSD",
        category: "Catégorie",
        carrier: "Opérateur",
        carrier_none: "Aucun",
        confirm_delete: "Supprimer ce code ?",
        delete: "Supprimer",
        cancel: "Annuler",
        save: "Enregistrer",
        dial: "Appeler",
        execute: "Exécuter",
        enter_details: "Entrer les détails",
        add_first_code: "Ajoutez votre premier code",
        no_codes_added: "Aucun code ajouté pour le moment.",
        no_codes_found: "Aucun code trouvé pour cette catégorie.",
        placeholder_hint: "Pour ce qui change à chaque fois (numéro, montant), ajoutez un champ : il sera demandé avant d'appeler.",
        preview: "Aperçu",
        dialer_hint: "Le code s'ouvre dans le composeur : vérifiez-le avant d'appeler.",
        carrier_mismatch: "Ce numéro semble être un numéro {carrier}.",
        transfer: {
            title: "Partager / Importer",
            share: "Partager",
            share_hint: "Les {n} codes affichés, à envoyer par WhatsApp, Bluetooth…",
            share_file: "Partager le fichier",
            copy: "Copier",
            copied: "Copié",
            import: "Importer",
            paste: "Collez ici des codes partagés…",
            choose_file: "Choisir un fichier",
            none: "Aucun code reconnu.",
            new: "{n} nouveau(x)",
            duplicates: "{n} déjà présent(s)",
            invalid: "{n} ignoré(s)",
            warning: "Vérifiez chaque code avant d'importer : un code peut envoyer de l'argent ou renvoyer vos appels vers un autre numéro.",
            forwarding: "Renvoi d'appel",
            fixed_number: "Numéro fixe dans le code",
            import_button: "Importer ({n})"
        },
        errors: {
            required: "Obligatoire",
            unbalanced: "Une accolade { } n'est pas fermée.",
            empty_placeholder: "Un champ { } n'a pas de nom.",
            digits_only: "Chiffres uniquement",
            phone_length: "Un numéro doit avoir 10 chiffres.",
            amount_zero: "Le montant doit être supérieur à 0.",
            invalid_chars: "Les caractères * # { } ne sont pas permis."
        },
        categories: {
            all: "Général",
            sms: "SMS",
            call: "Appel",
            internet: "Data",
            money: "Money",
            send: "Envoi",
            withdraw: "Retrait",
            favorites: "Favoris"
        },
        empty_state: "Aucun code enregistré. Appuyez sur + pour ajouter.",
        no_matches: "Aucun résultat trouvé.",
        loading: "Chargement...",
        variables: {
            number: "Numéro",
            amount: "Montant",
            description: "Description"
        }
    },
    mg: {
        app_title: "USSD",
        search_placeholder: "Hitady...",
        add_code: "Hampiditra kaody",
        edit_code: "Hanova kaody",
        title: "Lohateny",
        ussd_code: "Kaody USSD",
        category: "Sokajy",
        carrier: "Operatera",
        carrier_none: "Tsy misy",
        confirm_delete: "Hamafa ity kaody ity ?",
        delete: "Hamafa",
        cancel: "Aoka ihany",
        save: "Hitahiry",
        dial: "Hiantso",
        execute: "Alefa",
        enter_details: "Ampidiro ny antsipiriany",
        add_first_code: "Hampiditra ny kaody voalohany",
        no_codes_added: "Tsy mbola misy kaody nampidirina.",
        no_codes_found: "Tsy nahitana kaody tamin'ity sokajy ity.",
        placeholder_hint: "Ho an'izay miova isaky ny mampiasa (laharana, vola), ampio sehatra iray : hangatahina alohan'ny hiantsoana izy.",
        preview: "Topi-maso",
        dialer_hint: "Hisokatra ao amin'ny fiantsoana ny kaody : hamarino alohan'ny hiantsoana.",
        carrier_mismatch: "Toa laharana {carrier} ity laharana ity.",
        transfer: {
            title: "Mizara / Hampiditra",
            share: "Mizara",
            share_hint: "Ireo kaody {n} miseho, alefa amin'ny WhatsApp, Bluetooth…",
            share_file: "Mizara ny rakitra",
            copy: "Adikao",
            copied: "Voadika",
            import: "Hampiditra",
            paste: "Apetaho eto ireo kaody nozaraina…",
            choose_file: "Hisafidy rakitra",
            none: "Tsy nisy kaody fantatra.",
            new: "{n} vaovao",
            duplicates: "{n} efa misy",
            invalid: "{n} tsy noraisina",
            warning: "Hamarino tsirairay ny kaody alohan'ny hampidirana : mety handefa vola na hamindra ny antso any amin'ny laharana hafa ny kaody iray.",
            forwarding: "Famindrana antso",
            fixed_number: "Misy laharana raikitra",
            import_button: "Hampiditra ({n})"
        },
        errors: {
            required: "Tsy maintsy fenoina",
            unbalanced: "Misy { } tsy voahidy.",
            empty_placeholder: "Misy sehatra { } tsy manana anarana.",
            digits_only: "Isa ihany",
            phone_length: "Tokony ho isa 10 ny laharana.",
            amount_zero: "Tokony ho mihoatra ny 0 ny vola.",
            invalid_chars: "Tsy azo ampiasaina ny * # { }."
        },
        categories: {
            all: "Rehetra",
            sms: "SMS",
            call: "Antso",
            internet: "Data",
            money: "Vola",
            send: "Mandefa vola",
            withdraw: "Misintona vola",
            favorites: "Tianao"
        },
        empty_state: "Tsy misy kaody voatahiry. Tsindrio ny + raha hanampy.",
        no_matches: "Tsy nahitana vokany.",
        loading: "Eo am-pikarohana...",
        variables: {
            number: "Laharana",
            amount: "Vola",
            description: "Fanazavana"
        }
    }
};

const LOCALE_KEY = 'locale';

export const locale = writable('fr');

export const T = writable(translations.fr);

locale.subscribe(val => {
    T.set(translations[val]);
    if (typeof document !== 'undefined') document.documentElement.lang = val;
});

export function setLocale(newLocale) {
    if (translations[newLocale]) {
        locale.set(newLocale);
        Preferences.set({ key: LOCALE_KEY, value: newLocale }).catch(() => {});
    }
}

// Restores the language chosen on a previous launch.
export async function loadLocale() {
    try {
        const { value } = await Preferences.get({ key: LOCALE_KEY });
        if (value && translations[value]) locale.set(value);
    } catch {
        // Keep the default language.
    }
}
