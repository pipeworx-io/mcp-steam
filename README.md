# @pipeworx/steam

[Steam Web API](https://steamcommunity.com/dev) MCP — public Steam profile + game + news data. Free key.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/steam/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Steam data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
