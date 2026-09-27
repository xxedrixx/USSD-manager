<p align="center">
  <img src="https://github.com/xxedrixx/USSD-manager/blob/e33a2a3fce7043ce895dc14faa4749de0726b4cd/Screenshot_00001.png" width="250"/>
  <img src="https://github.com/xxedrixx/USSD-manager/blob/8c0d8105190e51796e12fbf0896a3ec5fa6c5b14/Screenshot_00002.png" width="250"/>
</p>

# USSD Manager

Save the USSD codes you use (balance, SMS/data bundles, mobile money) and dial them with one tap. French and Malagasy.

Codes are yours: add, edit, reorder (drag) or delete any of them. Tapping a code opens the phone's dialer with the code typed in; you press call yourself.

## Codes with changing values

For mobile money, the number and the amount change every time. Put them in the code as placeholders:

```
#111*1*4*1*{number}*{amount}#
```

When adding a code, the **+ Numéro** and **+ Montant** buttons insert them (the phone keyboard has no `{ }` keys). Before dialing, the app asks for each value, checks it (phone numbers need 10 digits, amounts are digits only), warns when the number belongs to another operator, and shows the final code.

- A placeholder used twice (e.g. a number typed twice to confirm) is asked once.
- Any other name works too, e.g. `{forfait}`. Names containing `numero`, `laharana`, `agent`... get a phone field; `montant`, `vola`... an amount field.
- Values are never remembered between two uses.

Cash withdrawal codes for MVola (Yas), Orange Money and Airtel Money are added on first launch, in the **Money** tab. They come from `src/lib/presets.js`. Operators and their badge colours are in `src/lib/carriers.js`.

## Development

```
npm install
npm run dev     # browser, with sample data kept in memory
npm test        # unit tests (placeholders, reordering, presets)
npm run build
```

## Android

```
npm run build
npx cap sync android
npx cap open android   # build / run from Android Studio
```

The app works fully offline: fonts and icons are bundled, nothing is loaded from the internet.
