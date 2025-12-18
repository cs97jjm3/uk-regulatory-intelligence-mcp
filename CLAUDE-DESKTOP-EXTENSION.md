# Claude Desktop Extension - One-Click Install

Create a `.claudedesktop` file for true one-click installation.

## What is a Claude Desktop Extension?

A `.claudedesktop` file is a packaged MCP server that users can double-click to install directly into Claude Desktop. No command line needed!

Read more: https://www.anthropic.com/engineering/desktop-extensions

## Creating the Extension Package

### Step 1: Run the Packaging Script

Double-click: `create-extension.bat`

Or run in PowerShell:
```powershell
cd C:\Users\james\Documents\uk-regulatory-intelligence-mcp
.\create-extension.bat
```

This creates: **`uk-regulatory-intelligence.claudedesktop`**

### Step 2: Distribute the .claudedesktop File

Users can now:
1. Download `uk-regulatory-intelligence.claudedesktop`
2. Double-click it
3. Claude Desktop automatically installs it!

## What Gets Packaged

The `.claudedesktop` file contains:
- `extension.json` - Extension manifest
- `mcp.json` - MCP configuration
- `package.json` - Dependencies
- `index.js` - Server code
- `icon.png` - Icon
- `README.md` - Documentation
- `LICENSE` - License

## Extension Configuration

The `extension.json` defines:

```json
{
  "name": "uk-regulatory-intelligence",
  "displayName": "UK Regulatory Intelligence",
  "description": "Track UK regulatory publications...",
  "version": "1.0.0",
  "publisher": "James Blair",
  "icon": "icon.png",
  "mcp": {
    "command": "node",
    "args": ["index.js"],
    "env": {
      "SECTORS": "social-care"
    }
  },
  "installation": {
    "steps": [
      {
        "type": "npm_install"
      }
    ]
  }
}
```

## How Users Install

### Method 1: Double-Click (Easiest!)

1. Download `uk-regulatory-intelligence.claudedesktop`
2. Double-click it
3. Claude Desktop opens and installs automatically
4. Done!

### Method 2: From Claude Desktop

1. Open Claude Desktop
2. Go to Settings → Extensions
3. Click "Install from file"
4. Select `uk-regulatory-intelligence.claudedesktop`
5. Done!

## Configuring Sectors After Installation

Users can configure sectors in Claude Desktop:

1. Settings → Extensions
2. Find "UK Regulatory Intelligence"
3. Click configure/settings
4. Change `SECTORS` environment variable

Or edit the config file directly:
`%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "uk-regulatory-intelligence": {
      "env": {
        "SECTORS": "social-care,education,legal"
      }
    }
  }
}
```

## Distributing to Your Team

Share the `.claudedesktop` file via:
- Email attachment
- Shared drive
- Internal wiki/portal
- GitHub releases
- Claude MCP registry (if public)

Everyone gets the same one-click install experience!

## File Structure

```
uk-regulatory-intelligence.claudedesktop  (ZIP file with .claudedesktop extension)
├── extension.json      # Extension manifest
├── mcp.json           # MCP configuration
├── package.json       # Dependencies
├── index.js           # Server code (5 tools, 7 sectors)
├── icon.png           # 512x512 icon
├── README.md          # Documentation
└── LICENSE            # MIT license
```

## Testing the Extension

Before distributing:

1. Create the extension: `.\create-extension.bat`
2. Double-click `uk-regulatory-intelligence.claudedesktop`
3. Check it installs in Claude Desktop
4. Test the tools work
5. Uninstall and reinstall to verify

## Updating the Extension

When you make changes:

1. Update `version` in `extension.json`
2. Update `version` in `package.json`
3. Update `version` in `mcp.json`
4. Run `create-extension.bat` again
5. Distribute the new `.claudedesktop` file

Users can install the new version over the old one.

## Advantages of .claudedesktop Format

✅ **One-click install** - No command line needed
✅ **Automatic npm install** - Dependencies handled automatically
✅ **Professional distribution** - Clean, branded package
✅ **Easy updates** - Just distribute new .claudedesktop file
✅ **Team-friendly** - Non-technical users can install
✅ **Portable** - Single file to share

## Publishing Options

### Internal Distribution
- Share file on company shared drive
- Email to team members
- Add to internal tools portal

### Public Distribution
- GitHub releases
- Claude MCP registry
- npm package
- Your website

## Support

Users who need help can:
1. Check the README.md (included in extension)
2. View Claude Desktop logs: `%APPDATA%\Claude\logs\`
3. Contact you (listed as publisher)

## Quick Reference

```powershell
# Create extension package
.\create-extension.bat

# The output file
uk-regulatory-intelligence.claudedesktop

# To test locally
# Just double-click the .claudedesktop file
```

That's it! True one-click installation for your team. 🚀
