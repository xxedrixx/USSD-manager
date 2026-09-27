import { mount } from 'svelte'
// Bundled so text renders the same without an internet connection.
import '@fontsource-variable/inter'
import './app.css'
import App from './App.svelte'

const app = mount(App, {
    target: document.getElementById('app'),
})

export default app
