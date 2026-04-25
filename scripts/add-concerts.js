#!/usr/bin/env node
// Run: node scripts/add-concerts.js
// Requires: NOTION_TOKEN and NOTION_DATABASE_ID env vars (or edit the constants below)

const { Client } = require('@notionhq/client');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID  = process.env.NOTION_DATABASE_ID || '8c37d9cc981240749eb469b49b128229';

if (!NOTION_TOKEN) {
  console.error('Set NOTION_TOKEN env var before running.');
  process.exit(1);
}
const LOCATION     = 'Paradise Green Gazebo, Stratford';

const concerts = [
  { band: 'Stratford Community Concert Band', date: '2026-06-16' },
  { band: 'Tangled Vine',                     date: '2026-06-23' },
  { band: 'Signature Band',                   date: '2026-06-30' },
  { band: 'Marc Berger and Ride',             date: '2026-07-07' },
  { band: 'Loubird',                          date: '2026-07-14' },
  { band: 'Stratford Community Concert Band', date: '2026-07-21' },
  { band: 'Kathy Thompson Band',              date: '2026-07-28' },
  { band: "T and T Dreamin'",                 date: '2026-08-04' },
  { band: 'Afinke',                           date: '2026-08-11' },
  { band: 'Leigh Henry & Jazzmattaz',         date: '2026-08-18' },
  { band: 'Backbeat Music',                   date: '2026-08-25' },
  { band: 'Flannel Clad Masses',              date: '2026-09-01' },
  { band: 'Big Beat Band',                    date: '2026-09-08' },
];

async function main() {
  const notion = new Client({ auth: NOTION_TOKEN });

  // Discover database schema
  console.log('Fetching database schema...');
  const db = await notion.databases.retrieve({ database_id: DATABASE_ID });
  const props = db.properties;

  // Find title property (always type "title")
  const titleProp = Object.entries(props).find(([, v]) => v.type === 'title')?.[0];
  // Find date property
  const dateProp  = Object.entries(props).find(([, v]) => v.type === 'date')?.[0];
  // Find location property (rich_text or select containing "location" in name)
  const locationProp = Object.entries(props).find(([k, v]) =>
    (v.type === 'rich_text' || v.type === 'select') &&
    k.toLowerCase().includes('loc')
  )?.[0];

  console.log(`\nDetected properties:`);
  console.log(`  Title    → "${titleProp}"`);
  console.log(`  Date     → "${dateProp}"`);
  console.log(`  Location → "${locationProp}"`);
  console.log(`\nAll properties: ${Object.entries(props).map(([k,v]) => `${k} (${v.type})`).join(', ')}\n`);

  if (!titleProp) {
    console.error('Could not find a title property. Aborting.');
    process.exit(1);
  }

  let added = 0;
  for (const { band, date } of concerts) {
    const properties = {
      [titleProp]: { title: [{ text: { content: band } }] },
    };

    if (dateProp) {
      properties[dateProp] = { date: { start: `${date}T19:00:00`, time_zone: 'America/New_York' } };
    }

    if (locationProp) {
      const locType = props[locationProp].type;
      if (locType === 'rich_text') {
        properties[locationProp] = { rich_text: [{ text: { content: LOCATION } }] };
      } else if (locType === 'select') {
        properties[locationProp] = { select: { name: LOCATION } };
      }
    }

    await notion.pages.create({ parent: { database_id: DATABASE_ID }, properties });
    console.log(`✓ Added: ${band} — ${date}`);
    added++;
  }

  console.log(`\nDone! Added ${added} events.`);
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
