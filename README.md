## Inspiration

Creating custom AI chatbots often involves tedious setup, technical integration, and limited personality customization. We wanted to change that. Inspired by tools like Botpress and the rise of RAG-based systems, we envisioned a simple platform where anyone — technical or not — could build, test, and integrate powerful, taste-aware bots in just a few minutes. Our goal was to make chatbot creation feel more like crafting a personality than configuring a machine.

## What it does

TasteBot Studio is a no-code platform that allows users to build AI-powered chatbots tailored to their website, use-case, and brand voice. 

Users simply:
- Enter the bot’s name, website, and description
- Upload a reference file (e.g. manuals, guides)
- Choose if the bot should have voice support
- Enable recommendation capabilities using Qloo
- Select supported languages
- Define the bot’s persona: tone, audience, keywords, and purpose

Once created, bots can be:
- Tested with real-time Q&A
- Shared via public links
- Embedded on websites with fully customizable UI (colors, headers, chat styles)
- Easily edited, updated, or deleted

The bots leverage RAG (Retrieval-Augmented Generation) techniques with a memory layer for optimized performance, and respond intelligently using uploaded documents or context, making them useful for customer support, onboarding, recommendations, and more.

## Demo

Here's a live flow of the TasteBot AI bot creation and integration process:  
👉 [View the Miro Board Demo](https://miro.com/app/board/uXjVIuknKD0=/?moveToWidget=3458764636202573637&cot=10)

## How we built it

- **Frontend**: Built with React, providing a clean and interactive interface for bot creation, preview, testing, and sharing.
- **Backend**: Node.js and Express.js, with APIs to manage bots, files, memory cache, and user configurations.
- **RAG Engine**: Used embedding and vector similarity search (via tools like Pinecone or FAISS) to extract relevant answers from uploaded documents.
- **Voice Support**: Web Speech API integration for real-time voice input and responses.
- **Recommendations**: Integrated with the Qloo API to offer contextual recommendations based on taste profiles.
- **Embedding**: Generated embeddable JS widgets with customizable UI, previewable before deployment.

## Challenges we ran into

- Optimizing RAG response speed while keeping context accuracy high
- Designing an intuitive flow for non-technical users to define complex bot behaviors
- Building a scalable memory layer that caches prior queries to avoid redundant computation
- Integrating dynamic voice support and multi-language capabilities smoothly across platforms
- Ensuring bot embed previews rendered exactly as they would on user websites

## Accomplishments that we're proud of

- Created a truly end-to-end bot-building experience that takes under 3 minutes
- Seamlessly blended taste-based recommendations, voice input, and persona-based response styling
- Enabled real-time preview and embed with full customization
- Built a flexible system that can scale from simple FAQ bots to complex, document-aware assistants

## What we learned

- Simplicity is key — users don’t want to deal with configs or APIs; they want instant results
- Memory + RAG is a powerful combo for speed and accuracy
- Persona design matters — a bot with the right tone and purpose enhances user trust and engagement
- Embedding AI assistants in websites should be as easy as copy-paste — and now it is

## What's next for TasteBot Studio - AI Chatbots Powered by Personality & Taste

- Launching a template gallery for industry-specific bots (e.g. travel, e-commerce, education)
- Adding support for multimedia files like images or PDFs as knowledge inputs
- Training custom fine-tuned models per bot for more nuanced behavior
- Enabling analytics dashboards to monitor user interactions and bot performance
- Building Slack, WhatsApp, and Discord integrations for omni-channel support
- Introducing collaborative bot editing and team-based access controls

TasteBot Studio is just getting started — our mission is to democratize bot creation and let everyone design bots with flavor, personality, and purpose.
