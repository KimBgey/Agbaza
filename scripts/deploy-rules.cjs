// node scripts/deploy-rules.cjs
const admin = require('firebase-admin')
const fs = require('fs')
const serviceAccount = require('./service-account.json')

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

const source = fs.readFileSync('./firestore.rules', 'utf8')

admin.securityRules().releaseFirestoreRulesetFromSource(source)
  .then(() => { console.log('✓ Firestore rules deployed'); process.exit(0) })
  .catch(err => { console.error('✗', err.message); process.exit(1) })
