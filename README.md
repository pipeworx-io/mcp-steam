# @pipeworx/steam

[Steam Web API](https://steamcommunity.com/dev) MCP — public Steam profile + game + news data. Free key.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Auth

- Platform: `PLATFORM_STEAM_KEY`. BYO: `?_apiKey=…`.

## Tools

- `resolve_vanity_url(vanityurl)` — username → steamid64
- `player_summary(steamid)` — profile summary
- `player_summaries(steamids)` — bulk profile (comma-sep)
- `friend_list(steamid, relationship?)` — friends
- `owned_games(steamid, include_appinfo?, include_played_free?)` — owned games
- `recently_played(steamid, count?)` — recent games
- `player_achievements(steamid, appid, l?)` — achievements for a game
- `player_stats(steamid, appid)` — user stats for a game
- `player_level(steamid)` — Steam level
- `player_bans(steamids)` — VAC/community bans
- `app_news(appid, count?, maxlength?)` — app news feed
- `app_details(appids, cc?, l?)` — store page detail (Steam Store, not Web API)
- `app_list()` — full app list (large)
- `current_player_count(appid)` — current concurrent players

## Data source

`https://api.steampowered.com`, `https://store.steampowered.com/api`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "steam": {
      "url": "https://gateway.pipeworx.io/steam/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Steam data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
