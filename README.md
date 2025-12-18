# UK Regulatory Intelligence MCP

Track UK regulatory publications, parliamentary activity, and compliance changes across multiple sectors.

## Installation

### For Users

```bash
mcpb install uk-regulatory-intelligence.mcp
```

Or install from this directory:
```bash
mcpb install .
```

Then configure sectors in Claude Desktop:
```json
{
  "mcpServers": {
    "uk-regulatory-intelligence": {
      "command": "mcpb",
      "args": ["run", "uk-regulatory-intelligence"],
      "env": {
        "SECTORS": "social-care"
      }
    }
  }
}
```

### For Developers

```bash
# Install mcpb
npm install -g @anthropic-ai/mcpb

# Install dependencies
npm install

# Pack the MCP
mcpb pack

# This creates: uk-regulatory-intelligence-1.0.0.mcp
```

## Sectors Supported

- `social-care` - CQC, DHSC, care homes, domiciliary care
- `education` - Ofsted, DfE, schools, SEND
- `legal` - SRA, Law Society, solicitors
- `charities` - Charity Commission, governance
- `local-authority` - DLUHC, councils
- `recruitment` - Employment agencies
- `construction` - HSE, building safety

Configure multiple sectors:
```json
"SECTORS": "social-care,education,legal"
```

## Tools Available

1. **search_publications** - Search regulatory publications
2. **get_parliamentary_questions** - Find parliamentary Q&As
3. **get_regulatory_calendar** - View upcoming changes
4. **generate_monthly_digest** - Monthly summary
5. **list_configured_sectors** - Show configuration

## Data Source

Gov.uk API: https://www.gov.uk/api/search.json

## License

MIT
