import { writable, get } from 'svelte/store';

const translations = {
    fr: {
        app_title: "USSD",
        search_placeholder: "Rechercher...",
        add_code: "Ajouter un code",
        edit_code: "Modifier le code",
        title: "Titre",
        ussd_code: "Code USSD",
        category: "Catégorie",
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
        categories: {
            all: "Général",
            sms: "SMS",
            call: "Appel",
            internet: "Data",
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
        categories: {
            all: "Samihafa",
            sms: "SMS",
            call: "Antso",
            internet: "Data",
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

export const locale = writable('fr');

export const T = writable(translations.fr);

locale.subscribe(val => {
    T.set(translations[val]);
});

export function setLocale(newLocale) {
    if (translations[newLocale]) {
        locale.set(newLocale);
    }
}
