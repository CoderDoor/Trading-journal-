# n8n Marketing Workflow - Setup Guide

## Prerequisites

Before importing the workflow, ensure you have:

- [ ] n8n instance running (self-hosted or cloud)
- [ ] OpenAI API key with GPT-4 access
- [ ] GitHub Personal Access Token

## Step 1: Import Workflow

1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Select `workflow.json` from this folder
4. The workflow will appear in your n8n dashboard

## Step 2: Configure Credentials

### OpenAI API
1. Go to **Settings** → **Credentials** → **Add Credential**
2. Select **OpenAI API**
3. Enter your API key from https://platform.openai.com/api-keys
4. Name it: `OpenAI API`
5. Save

### GitHub Token
1. Go to **Settings** → **Credentials** → **Add Credential**
2. Select **Header Auth**
3. Name: `GitHub Token`
4. Header Name: `Authorization`
5. Header Value: `token YOUR_GITHUB_PAT`
6. Save

## Step 3: Configure the Workflow

### Update Repository Settings
1. Open the workflow
2. Click on the **Configuration** node
3. Update these values:
   ```javascript
   github_repo: 'your-repo-name',
   github_owner: 'your-username',
   github_branch: 'main',
   product_url: 'https://your-product.com'
   ```
4. Save

## Step 4: Enable Distribution Nodes (Optional)

The following nodes are disabled by default. Enable and configure as needed:

### Twitter/X
1. Create Twitter Developer credentials
2. Add credential in n8n
3. Enable the "Post to Twitter" node
4. Link your Twitter credential

### LinkedIn
1. Create LinkedIn API app
2. Add credential in n8n
3. Enable the "Post to LinkedIn" node
4. Link your LinkedIn credential

### Google Sheets (for tracking)
1. Create a Google Sheet for tracking
2. Add Google credential in n8n
3. Enable the "Save to Google Sheets" node
4. Link to your spreadsheet

### SendGrid (for email)
1. Create SendGrid account
2. Add API key in n8n
3. Enable the "Send Email" node
4. Configure sender email

## Step 5: Test the Workflow

1. Click **Execute Workflow** button
2. Watch each node execute in sequence
3. Check the output at "Output: Marketing Package" node
4. Review generated content

## Step 6: Schedule (Optional)

To run on a schedule:
1. Replace "Manual Trigger" with "Schedule Trigger"
2. Configure cron expression (e.g., `0 9 * * 1` for Monday 9 AM)
3. Activate the workflow

## Troubleshooting

### GitHub API Errors
- Ensure token has `repo` scope
- Check repository name is correct
- Verify branch exists

### OpenAI Errors
- Check API key is valid
- Ensure you have GPT-4 access
- Monitor rate limits

### Empty Responses
- Check if README.md exists in repo
- Verify JSON parsing in code nodes
- Review LLM prompt quality

## Customization

### Add More Files to Analyze
Edit the workflow to fetch additional files:
- `src/` folder contents
- API route files
- Configuration files

### Change LLM Model
In each OpenAI node:
- GPT-4o (recommended - best quality)
- GPT-4o-mini (faster, cheaper)
- GPT-3.5-turbo (fastest, cheapest)

### Add New Channels
1. Add new distribution node
2. Connect to "Compile All Content" output
3. Configure credential
4. Map content fields

## Support

For issues or improvements, check:
- n8n Community: https://community.n8n.io
- OpenAI Docs: https://platform.openai.com/docs
