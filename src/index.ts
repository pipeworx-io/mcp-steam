interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Steam Web API MCP.
 */


const WEB = 'https://api.steampowered.com';
const STORE = 'https://store.steampowered.com/api';
const UA = 'pipeworx-mcp-steam/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  { name: 'resolve_vanity_url', description: 'Vanity URL → SteamID64.', inputSchema: { type: 'object', properties: { vanityurl: { type: 'string' } }, required: ['vanityurl'] } },
  { name: 'player_summary', description: 'Profile summary.', inputSchema: { type: 'object', properties: { steamid: { type: 'string' } }, required: ['steamid'] } },
  { name: 'player_summaries', description: 'Bulk profile.', inputSchema: { type: 'object', properties: { steamids: { type: 'string' } }, required: ['steamids'] } },
  { name: 'friend_list', description: 'Friends.', inputSchema: { type: 'object', properties: { steamid: { type: 'string' }, relationship: { type: 'string' } }, required: ['steamid'] } },
  {
    name: 'owned_games',
    description: 'Owned games.',
    inputSchema: {
      type: 'object',
      properties: { steamid: { type: 'string' }, include_appinfo: { type: 'boolean' }, include_played_free: { type: 'boolean' } },
      required: ['steamid'],
    },
  },
  { name: 'recently_played', description: 'Recent games.', inputSchema: { type: 'object', properties: { steamid: { type: 'string' }, count: { type: 'number' } }, required: ['steamid'] } },
  {
    name: 'player_achievements',
    description: 'Achievements for a game.',
    inputSchema: { type: 'object', properties: { steamid: { type: 'string' }, appid: { type: 'number' }, l: { type: 'string' } }, required: ['steamid', 'appid'] },
  },
  { name: 'player_stats', description: 'User stats for a game.', inputSchema: { type: 'object', properties: { steamid: { type: 'string' }, appid: { type: 'number' } }, required: ['steamid', 'appid'] } },
  { name: 'player_level', description: 'Steam level.', inputSchema: { type: 'object', properties: { steamid: { type: 'string' } }, required: ['steamid'] } },
  { name: 'player_bans', description: 'VAC/community bans.', inputSchema: { type: 'object', properties: { steamids: { type: 'string' } }, required: ['steamids'] } },
  {
    name: 'app_news',
    description: 'App news feed.',
    inputSchema: { type: 'object', properties: { appid: { type: 'number' }, count: { type: 'number' }, maxlength: { type: 'number' } }, required: ['appid'] },
  },
  {
    name: 'app_details',
    description: 'Store page detail (Steam Store API).',
    inputSchema: { type: 'object', properties: { appids: { type: 'string' }, cc: { type: 'string' }, l: { type: 'string' } }, required: ['appids'] },
  },
  { name: 'app_list', description: 'Full app list (large).', inputSchema: { type: 'object', properties: {} } },
  { name: 'current_player_count', description: 'Current concurrent players.', inputSchema: { type: 'object', properties: { appid: { type: 'number' } }, required: ['appid'] } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  const needsKey = name !== 'app_details' && name !== 'app_list';
  if (needsKey && !apiKey) {
    throw new Error('Steam Web API requires a key. Set PLATFORM_STEAM_KEY or pass ?_apiKey=… (free at https://steamcommunity.com/dev/apikey).');
  }
  const get = async (url: string) => {
    const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
    if (res.status === 401 || res.status === 403) throw new Error('Steam: invalid API key.');
    if (!res.ok) throw new Error(`Steam: ${res.status}`);
    return res.json();
  };
  const reqNum = (k: string, ex: string) => {
    const v = args[k];
    if (v == null || typeof v !== 'number') throw new Error(`Required argument "${k}" is missing. Pass a number like ${ex}.`);
    return v;
  };
  const url = (path: string, p: URLSearchParams) => `${WEB}${path}?${p}`;
  switch (name) {
    case 'resolve_vanity_url': {
      const p = new URLSearchParams({ key: apiKey!, vanityurl: reqStr(args, 'vanityurl', '"gabelogannewell"') });
      return get(url('/ISteamUser/ResolveVanityURL/v1/', p));
    }
    case 'player_summary': {
      const p = new URLSearchParams({ key: apiKey!, steamids: reqStr(args, 'steamid', '"76561197960287930"') });
      return get(url('/ISteamUser/GetPlayerSummaries/v2/', p));
    }
    case 'player_summaries': {
      const p = new URLSearchParams({ key: apiKey!, steamids: reqStr(args, 'steamids', '"76561197960287930,…"') });
      return get(url('/ISteamUser/GetPlayerSummaries/v2/', p));
    }
    case 'friend_list': {
      const p = new URLSearchParams({ key: apiKey!, steamid: reqStr(args, 'steamid', '"<id>"') });
      if (args.relationship) p.set('relationship', String(args.relationship));
      return get(url('/ISteamUser/GetFriendList/v1/', p));
    }
    case 'owned_games': {
      const p = new URLSearchParams({ key: apiKey!, steamid: reqStr(args, 'steamid', '"<id>"') });
      if (args.include_appinfo != null) p.set('include_appinfo', args.include_appinfo ? '1' : '0');
      if (args.include_played_free != null) p.set('include_played_free_games', args.include_played_free ? '1' : '0');
      return get(url('/IPlayerService/GetOwnedGames/v1/', p));
    }
    case 'recently_played': {
      const p = new URLSearchParams({ key: apiKey!, steamid: reqStr(args, 'steamid', '"<id>"') });
      if (args.count != null) p.set('count', String(args.count));
      return get(url('/IPlayerService/GetRecentlyPlayedGames/v1/', p));
    }
    case 'player_achievements': {
      const p = new URLSearchParams({ key: apiKey!, steamid: reqStr(args, 'steamid', '"<id>"'), appid: String(reqNum('appid', '440')) });
      if (args.l) p.set('l', String(args.l));
      return get(url('/ISteamUserStats/GetPlayerAchievements/v1/', p));
    }
    case 'player_stats': {
      const p = new URLSearchParams({ key: apiKey!, steamid: reqStr(args, 'steamid', '"<id>"'), appid: String(reqNum('appid', '440')) });
      return get(url('/ISteamUserStats/GetUserStatsForGame/v2/', p));
    }
    case 'player_level': {
      const p = new URLSearchParams({ key: apiKey!, steamid: reqStr(args, 'steamid', '"<id>"') });
      return get(url('/IPlayerService/GetSteamLevel/v1/', p));
    }
    case 'player_bans': {
      const p = new URLSearchParams({ key: apiKey!, steamids: reqStr(args, 'steamids', '"<id>,<id>"') });
      return get(url('/ISteamUser/GetPlayerBans/v1/', p));
    }
    case 'app_news': {
      const p = new URLSearchParams({ appid: String(reqNum('appid', '440')) });
      if (args.count != null) p.set('count', String(args.count));
      if (args.maxlength != null) p.set('maxlength', String(args.maxlength));
      return get(url('/ISteamNews/GetNewsForApp/v2/', p));
    }
    case 'app_details': {
      const p = new URLSearchParams({ appids: reqStr(args, 'appids', '"440"') });
      if (args.cc) p.set('cc', String(args.cc));
      if (args.l) p.set('l', String(args.l));
      const res = await fetch(`${STORE}/appdetails?${p}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
      if (!res.ok) throw new Error(`Steam Store: ${res.status}`);
      return res.json();
    }
    case 'app_list':
      return get(`${WEB}/ISteamApps/GetAppList/v2/`);
    case 'current_player_count': {
      const p = new URLSearchParams({ appid: String(reqNum('appid', '440')) });
      return get(url('/ISteamUserStats/GetNumberOfCurrentPlayers/v1/', p));
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
