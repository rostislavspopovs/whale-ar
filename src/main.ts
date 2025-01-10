import { mount } from 'svelte'
import './app.css'
import App from './App-AFrame.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
