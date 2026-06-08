/**
 * Enrich Firestore exercises with ExerciseDB muscle data + YouTube tutorial videos.
 *
 * Usage:
 *   node --env-file=.env scripts/enrich-exercises.js
 *   node --env-file=.env scripts/enrich-exercises.js --dry-run
 *   node --env-file=.env scripts/enrich-exercises.js --limit 20
 *   node --env-file=.env scripts/enrich-exercises.js --youtube-only   (skip ExerciseDB pass)
 *
 * Requires:
 *   VITE_RAPIDAPI_KEY    — ExerciseDB via RapidAPI (500 req/day free)
 *   VITE_YOUTUBE_API_KEY — YouTube Data API v3 (100 searches/day = 10 000 units/day)
 *   scripts/service-account.json
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore }        from 'firebase-admin/firestore'
import { readFileSync }        from 'fs'

// ── Firebase Admin ────────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(
  readFileSync(new URL('./service-account.json', import.meta.url), 'utf8')
)
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// ── Config ────────────────────────────────────────────────────────────────────
const RAPIDAPI_KEY   = process.env.VITE_RAPIDAPI_KEY
const YOUTUBE_KEY    = process.env.VITE_YOUTUBE_API_KEY
const EXERCISEDB     = 'https://exercisedb.p.rapidapi.com'
const EXERCISEDB_HDR = {
  'X-RapidAPI-Key':  RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
}

const args         = process.argv.slice(2)
const DRY_RUN      = args.includes('--dry-run')
const YOUTUBE_ONLY = args.includes('--youtube-only')
const limitIdx     = args.indexOf('--limit')
const LIMIT        = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// ── ExerciseDB helpers ────────────────────────────────────────────────────────
function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
}

/** Strip common equipment prefixes so "EZ Bar Curl" → "curl" etc. */
function simplifyName(name) {
  return name
    .replace(/^(barbell|dumbbell|cable|machine|lever|sled|ez bar|ez|kettlebell|smith machine|resistance band) +/i, '')
    .replace(/ +(barbell|dumbbell|cable|machine)$/i, '')
    .trim()
}

function bestMatch(results, targetName) {
  if (!results.length) return null
  const norm = normalize(targetName)
  const exact    = results.find(r => normalize(r.name) === norm)
  if (exact) return exact
  const contains = results.find(r =>
    normalize(r.name).includes(norm) || norm.includes(normalize(r.name))
  )
  return contains ?? results[0]
}

async function searchExerciseDB(name) {
  const encoded = encodeURIComponent(normalize(name))
  const res = await fetch(`${EXERCISEDB}/exercises/name/${encoded}?limit=5`, { headers: EXERCISEDB_HDR })
  if (res.status === 429) throw new Error('ExerciseDB rate limit — wait and retry')
  if (!res.ok) throw new Error(`ExerciseDB HTTP ${res.status}`)
  return res.json()
}

/** Try exact name, then simplified name (removes equipment prefix). */
async function findExercise(englishName) {
  let results = await searchExerciseDB(englishName)
  if (!results.length) {
    const simple = simplifyName(englishName)
    if (simple.toLowerCase() !== normalize(englishName)) {
      await sleep(300)
      results = await searchExerciseDB(simple)
    }
  }
  return results
}

// ── YouTube helper ────────────────────────────────────────────────────────────
async function searchYouTube(exerciseName) {
  if (!YOUTUBE_KEY) return null
  const q   = encodeURIComponent(`${exerciseName} tutorial form`)
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=3&relevanceLanguage=en&videoDuration=medium&key=${YOUTUBE_KEY}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`YouTube API ${res.status}: ${body?.error?.message || res.statusText}`)
  }
  const data = await res.json()
  const videoId = data.items?.[0]?.id?.videoId || null
  const title   = data.items?.[0]?.snippet?.title || ''
  return { videoId, title }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (!RAPIDAPI_KEY && !YOUTUBE_ONLY) {
    console.error('Error: VITE_RAPIDAPI_KEY not set in .env')
    process.exit(1)
  }
  if (!YOUTUBE_KEY) {
    console.warn('Warning: VITE_YOUTUBE_API_KEY not set — YouTube step will be skipped')
  }

  console.log(`Mode    : ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  console.log(`Limit   : ${LIMIT === Infinity ? 'all' : LIMIT}`)
  console.log(`YouTube : ${YOUTUBE_KEY ? 'enabled' : 'disabled'}\n`)

  const snapshot  = await db.collection('agbaza_exercises').get()
  const toEnrich  = snapshot.docs
    .map(d => ({ _docId: d.id, ...d.data() }))
    .filter(e => !e.youtubeVideoId && e.name_en)

  console.log(`Found ${toEnrich.length} exercises without YouTube video\n`)

  let processed = 0, enriched = 0, skipped = 0

  for (const ex of toEnrich) {
    if (processed >= LIMIT) break

    console.log(`[${processed + 1}/${Math.min(toEnrich.length, LIMIT)}] ${ex.name_en}`)

    const update = {}

    // ── Step 1: ExerciseDB muscle data (skip if already done or --youtube-only) ──
    if (!ex.enriched_at && !YOUTUBE_ONLY && RAPIDAPI_KEY) {
      try {
        const results = await findExercise(ex.name_en)
        if (!results.length) {
          console.log('  ExerciseDB ↳ no match')
        } else {
          const match = bestMatch(results, ex.name_en)
          console.log(`  ExerciseDB ↳ "${match.name}" | target: ${match.target}`)

          Object.assign(update, {
            exercisedb_id:    match.id,
            targetMuscle:     match.target || null,
            secondaryMuscles: match.secondaryMuscles || [],
            enriched_at:      new Date().toISOString(),
          })
        }
        await sleep(400)
      } catch (err) {
        console.error(`  ExerciseDB ↳ error: ${err.message}`)
        if (err.message.includes('rate limit')) await sleep(60_000)
        else await sleep(2_000)
      }
    }

    // ── Step 2: YouTube tutorial video ────────────────────────────────────────
    if (YOUTUBE_KEY) {
      try {
        const result = await searchYouTube(ex.name_en)
        if (result?.videoId) {
          console.log(`  YouTube   ↳ ${result.title.slice(0, 60)}`)
          update.youtubeVideoId = result.videoId
        } else {
          console.log('  YouTube   ↳ no result')
        }
        await sleep(300)
      } catch (err) {
        console.error(`  YouTube   ↳ error: ${err.message}`)
      }
    }

    // ── Step 3: Write to Firestore ────────────────────────────────────────────
    Object.keys(update).forEach(k => (update[k] == null) && delete update[k])

    if (Object.keys(update).length > 0) {
      if (!DRY_RUN) {
        await db.collection('agbaza_exercises').doc(ex._docId).update(update)
        const flags = [update.targetMuscle && '🎯', update.youtubeVideoId && '▶'].filter(Boolean).join(' ')
        console.log(`  Firestore ↳ updated ${flags}`)
        enriched++
      } else {
        console.log(`  [DRY RUN] would write: targetMuscle=${update.targetMuscle} videoId=${update.youtubeVideoId}`)
        enriched++
      }
    } else {
      skipped++
    }

    processed++

    if (processed % 10 === 0 && processed < toEnrich.length) {
      console.log('\n── 5s pause ──\n')
      await sleep(5_000)
    } else {
      await sleep(600)
    }
  }

  console.log(`\n═══════════════════════════════`)
  console.log(`Processed : ${processed}`)
  console.log(`Enriched  : ${enriched}`)
  console.log(`Skipped   : ${skipped}`)
  console.log(`═══════════════════════════════`)
}

main().catch(err => { console.error(err); process.exit(1) })
