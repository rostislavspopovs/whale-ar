import { mount } from 'svelte'
import './app.css'
import App from './App-THREEAR.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
