# Prompt Creator Chatbot

A complete Flask web chatbot powered by Google's Gemini API, with a custom Prompt Creator system prompt and a distinctive dark/neon UI.

## Model

The default configuration uses `gemini-3.1-flash-lite`, the stable Gemini 3.1 Flash-family text model. The model is configurable through `.env`.

## Setup

1. Install Python 3.10+.
2. Create a virtual environment:
   - Windows: `python -m venv .venv`
   - Activate it with `.venv\Scripts\activate`
3. Install dependencies:
   `pip install -r requirements.txt`
4. Copy `.env.example` to `.env`.
5. Put your Gemini API key in `.env`.
6. Run:
   `python app.py`
7. Open `http://127.0.0.1:5000`

## API

`POST /api/chat`

JSON body:
```json
{
  "message": "Create a prompt for a Python coding assistant",
  "history": []
}
```

## Features

- Responsive custom UI
- Prompt Creator branding
- New chat button
- Prompt category quick actions
- Copy response button
- Enter-to-send / Shift+Enter for new line
- Voice input using the browser Web Speech API when supported
- API health endpoint
- Environment-based API key
- Bounded conversation context
- Configurable Gemini model

Never commit your real `.env` or API key.
