import { defineConfig } from 'vite'
import packageInfo from './package.json'

export default defineConfig({
    base: packageInfo.homepage,
})