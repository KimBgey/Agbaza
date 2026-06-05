// Run: node generate-icons.js
// Creates icon-192.png and icon-512.png from icon.svg
// Requires: npm install sharp
import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('./icon.svg')
await sharp(svg).resize(192, 192).png().toFile('icon-192.png')
await sharp(svg).resize(512, 512).png().toFile('icon-512.png')
console.log('Icons generated!')
