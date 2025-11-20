# AI Audio & Meeting Summarizer

A lightweight web tool that converts audio or video files into structured summaries.  
Upload → Transcription → Summary → Key points → Action items.

## Features

- Audio/video upload (mp3, m4a, wav, mp4, mov, webm)
- Automatic transcription (OpenAI Whisper)
- Summary generation (GPT-4.1-mini)
- Output includes:
    - Summary
    - Key points
    - Action items
    - Decisions
    - Full transcript
- Modes: Meeting, Podcast, Generic

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI Audio API
- OpenAI Responses API

## Setup

```bash
npm install

Create .env.local:

OPENAI_API_KEY=your_key_here


Run locally:

npm run dev
