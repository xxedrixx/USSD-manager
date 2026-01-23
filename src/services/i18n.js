import { writable, get } from 'svelte/store';

const translations = {
    fr: {
        app_title: "USSD",
        search_placeholder: "Rechercher...",
        add_code: "Ajouter un code",
        edit_code: "Modifier le code",
        title: "Titre",
        ussd_code: "Code USSD",
        carrier: "Opérateur",
        folder: "Dossier",
        no_folder: "Aucun dossier",
        add_carrier: "Ajouter un opérateur",
        confirm_delete: "Supprimer cet opérateur ?",
        delete: "Supprimer",
        contact_linked: "Contact lié",
        select_contact: "Choisir un contact",
        cancel: "Annuler",
        save: "Enregistrer",
        dial: "Appeler",
        execute: "Exécuter",
        enter_details: "Entrer les détails",
        folders: {
            general: "Général",
            banking: "Banque",
            mobile_money: "Mobile Money",
            utilities: "Utilitaires"
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
        carrier: "Tambajotra",
        folder: "Lahatahiry",
        no_folder: "Tsy misy lahatahiry",
        add_carrier: "Hampiditra tambajotra",
        confirm_delete: "Hamafa ity tambajotra ity ?",
        delete: "Hamafa",
        contact_linked: "Fifandraisana",
        select_contact: "Misafidy fifandraisana",
        cancel: "Aoka ihany",
        save: "Hitahiry",
        dial: "Hiantso",
        execute: "Alefa",
        enter_details: "Ampidiro ny antsipiriany",
        folders: {
            general: "Samihafa",
            banking: "Banky",
            mobile_money: "Vola Mobaly",
            utilities: "Jiro sy Rano"
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
