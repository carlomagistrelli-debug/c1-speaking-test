# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A Cambridge C1 Speaking Test Part 2 practice tool. Single-file app: everything (HTML, CSS, JS) lives in `index.html` (~2000 lines). No build system, no dependencies, no package manager.

**Live URL:** https://carlomagistrelli-debug.github.io/c1-speaking-test/

To test locally, open `index.html` in a browser — or serve it via any static file server (e.g. `python3 -m http.server`). SpeechRecognition requires HTTPS or localhost; file:// will not work for the microphone features.

## Navigation model

Sections are `<section id="...">` elements inside `<div id="main">`. All are `display:none` by default; exactly one carries `.active` at a time.

```js
function showOnly(id) {
  document.querySelectorAll('#main section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
```

Every user-facing transition calls `showOnly(sectionId)`.

## Section flow

**1st Candidate path:**
`mode-section` → `topic-section` (or `upload-section`) → `role-section` → `pick-section` → `examiner-prompt-section` → `activity-first` → `transcript-section` → `second-answer-section` → `assessment-section`

**2nd Candidate path:**
`mode-section` → `topic-section` (or `upload-section`) → `role-section` → `display-section` → `examiner-prompt-2nd-section` → `second-listening-section` → `examiner-question-2nd-section` → `second-speaking-section` → `second-result-section` → `assessment-section`

## Key constants and shared state

| Symbol | Value / meaning |
|---|---|
| `TOTAL = 3` | Total images fetched/uploaded |
| `CHOOSE = 2` | Images used in the activity |
| `CIRCUMFERENCE = 263.89` | `2π×42` — used by every SVG circular timer ring |
| `allImages` | `[{ src, creditHtml }]` — populated by Unsplash fetch or file upload, shared globally |
| `currentTopic` | Object `{ label, emoji, query }` from `TOPICS`; `null` when using uploads |
| `firstChosenImages` | The two images chosen by 1st Candidate; persists into `second-answer-section` |

## Content data

All scripted content is in three plain-object maps keyed by `topic.query`:

- **`SPEECHES`** — long ~200-word compare-and-contrast text read by TTS (1st candidate listening step)
- **`EXAMINER_PROMPTS`** — `{ task, question2nd, answer2nd }` per topic
- Fallback objects `SPEECH_FALLBACK` and `EXAMINER_PROMPT_FALLBACK` handle upload flow (no topic)

`getExaminerPrompt(topic)` and `generateSpeech(topic)` are the accessors — pass `currentTopic`.

## Browser APIs used

- **`SpeechRecognition` / `webkitSpeechRecognition`** — transcription (1st and 2nd candidate speaking steps). `continuous: true`, `interimResults: true`, `lang: 'en-GB'`. On Android Chrome, `no-speech` errors are expected; `onend` restarts recognition while the timer is running.
- **`SpeechSynthesis`** — TTS for examiner prompts and the app's 1st-candidate speech. Voice selection prefers `en-GB` Google voice, falls back to any `en-GB`, then any `en`. `onboundary` drives word-by-word text reveal in the UI.
- **`localStorage`** key `c1_transcripts` — array of `{ date, duration, transcript }` entries.

## Assessment section

Shown after both flows. Contains:
- **`CHECKLIST`** — role-keyed (`'1st'` / `'2nd'`) arrays of self-check items (checkboxes)
- **`SCALES`** — four Cambridge marking scales (`gv`, `dm`, `pron`, `global`), each with 6 band descriptors (0–5). Selecting bands drives an average-band summary display.

## Circular timers

Every timer uses the same SVG pattern: a `<circle>` with `stroke-dasharray="263.89"` and `stroke-dashoffset` animated from `263.89` (empty) toward `0` (full). The ring ID and associated text ID differ per section (e.g. `timer-ring`/`timer-text`, `ep-timer-ring`/`ep-timer-text`, `second-timer-ring`/`second-timer-text`). Colour transitions: green → orange (≥80% of soft limit) → red (≥100%).

## Deployment

Push to `main` branch; GitHub Pages serves `index.html` directly. No CI, no build step.
