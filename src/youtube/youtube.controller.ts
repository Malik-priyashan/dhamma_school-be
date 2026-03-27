import { Controller, Get } from '@nestjs/common';
import fetch from 'node-fetch'; // npm i node-fetch@2
import * as xml2js from 'xml2js'; // npm i xml2js

@Controller('youtube')
export class YoutubeController {
  private readonly channel =
    process.env.YOUTUBE_CHANNEL_ID || '@SiriSumanathissaDhammaSchool';

  @Get()
  async getVideos() {
    try {
      const channelId = await this.resolveChannelId(this.channel);
      if (!channelId) return { error: 'Invalid YouTube channel' };

      const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!res.ok) return { error: `Failed to fetch feed: ${res.status}` };

      const xml = await res.text();
      // xml2js typings may be loose; ensure we get an `unknown` and narrow safely
      const parse = (
        xml2js as unknown as {
          parseStringPromise: (s: string) => Promise<unknown>;
        }
      ).parseStringPromise;
      const parsed: unknown = await parse(xml);

      const isObject = (v: unknown): v is Record<string, unknown> =>
        typeof v === 'object' && v !== null;

      const feed =
        isObject(parsed) && isObject(parsed.feed) ? parsed.feed : undefined;

      const entries: unknown[] =
        feed && Array.isArray(feed.entry) ? (feed.entry as unknown[]) : [];

      const videos = entries
        .map((e) => {
          if (!isObject(e)) return null;
          const id =
            Array.isArray(e['yt:videoId']) &&
            typeof e['yt:videoId'][0] === 'string'
              ? e['yt:videoId'][0]
              : undefined;

          let title: string | undefined;
          if (Array.isArray(e.title) && e.title[0]) {
            const t = e.title[0] as unknown;
            if (isObject(t) && typeof t._ === 'string') title = t._;
            else if (typeof t === 'string') title = t;
          }

          return id ? { id, title: title ?? '' } : null;
        })
        .filter(Boolean) as { id: string; title: string }[];

      return { videos };
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as Record<string, unknown>).message === 'string'
          ? ((err as Record<string, unknown>).message as string)
          : String(err);
      return { error: message || 'Unknown error' };
    }
  }

  private async resolveChannelId(input: string) {
    if (input.startsWith('UC')) return input; // already channel ID

    // fetch page to get channelId
    try {
      const path = input.startsWith('@') ? `/${input}` : `/${input}`;
      const res = await fetch(`https://www.youtube.com${path}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const html = await res.text();
      // Try multiple patterns: explicit channelId, browseId, or canonical /channel/ path
      const idPattern = /"channelId":"(UC[0-9A-Za-z_-]{20,})"/;
      const browsePattern = /"browseId":"(UC[0-9A-Za-z_-]{20,})"/;
      const channelPathPattern = /\/channel\/(UC[0-9A-Za-z_-]{20,})/;

      const match =
        html.match(idPattern) ||
        html.match(browsePattern) ||
        html.match(channelPathPattern);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
