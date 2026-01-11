# n8n Marketing Automation Workflow

## Overview
This n8n workflow automatically markets your product by:
1. Analyzing your source code with AI
2. Generating a marketing strategy
3. Creating content for multiple channels
4. Distributing content automatically
5. Tracking performance and optimizing

## Quick Start

### Prerequisites
- n8n instance (self-hosted or cloud)
- OpenAI API key (or Claude/Gemini)
- GitHub Personal Access Token
- Social media API credentials (optional)

### Installation
1. Import `workflow.json` into n8n
2. Configure credentials in n8n
3. Set your GitHub repository URL
4. Activate the workflow

## Workflow Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIGGER (Manual/Webhook)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 1: CODE INGESTION                         │
│  - Fetch README.md, package.json, key files from GitHub     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 2: LLM CODE ANALYSIS                      │
│  - Understand product, features, USP, target audience       │
│  - Output: Marketing Brief JSON                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 3: MARKETING STRATEGY                     │
│  - Generate 30-day marketing plan                           │
│  - Decide channels, content types, frequency                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 4: CONTENT CREATION                       │
│  - Twitter threads, LinkedIn posts, Reddit copy             │
│  - Email campaigns, landing page copy                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 5: DISTRIBUTION                           │
│  - Post to Twitter, LinkedIn, Reddit                        │
│  - Send emails, update Notion/Docs                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 6: TRACKING & OPTIMIZATION                │
│  - Track engagement, clicks, conversions                    │
│  - Feed back to AI for improvement                          │
└─────────────────────────────────────────────────────────────┘
```

## Files Included
- `workflow.json` - Main n8n workflow
- `prompts/` - LLM prompts for each step
- `schemas/` - JSON schemas for data passing
- `README.md` - This file

## Configuration

### Required Credentials
| Credential | Purpose |
|------------|---------|
| OpenAI API | Code analysis, content generation |
| GitHub Token | Repository access |
| Twitter API | X/Twitter posting |
| LinkedIn API | LinkedIn posting |
| SendGrid API | Email campaigns |
| Google Sheets | Analytics tracking |

### Environment Variables
```
OPENAI_API_KEY=your_openai_key
GITHUB_TOKEN=your_github_token
TWITTER_BEARER_TOKEN=your_twitter_token
```

## Usage

1. **Manual Trigger**: Click "Execute Workflow" in n8n
2. **Webhook Trigger**: POST to webhook URL with repo info
3. **Scheduled**: Set up cron schedule for regular runs

## License
MIT
