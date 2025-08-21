#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OBJECT_NAME = process.argv[2] || 'C/2025 N1'; // official designation for 3I/ATLAS

function fetchEphemeris() {
  const startDate = new Date().toISOString().split('T')[0];
  const stopDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const params = new URLSearchParams({
    format: 'json',
    COMMAND: `'${OBJECT_NAME}'`,
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTORS',
    OUT_UNITS: 'KM-S',
    OBJ_DATA: 'NO',
    CENTER: '500@0',
    START_TIME: `'${startDate}'`,
    STOP_TIME: `'${stopDate}'`,
    STEP_SIZE: `'1 d'`,
    CSV_FORMAT: 'YES'
  });

  const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${params.toString()}`;
  let json;
  try {
    const response = execSync(`curl -s "${url}"`, { encoding: 'utf8' });
    json = JSON.parse(response);
  } catch (err) {
    console.error('Failed to retrieve or parse data', err);
    process.exit(1);
  }

  const result = json.result || '';
  const section = result.split('$$SOE')[1]?.split('$$EOE')[0];
  const records = [];

  if (section) {
    const lines = section.trim().split('\n');
    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 8) {
        records.push({
          timestamp: parts[1],
          position: [Number(parts[2]), Number(parts[3]), Number(parts[4])],
          velocity: [Number(parts[5]), Number(parts[6]), Number(parts[7])]
        });
      }
    }
  }

  fs.mkdirSync(path.join(__dirname, '..', 'public', 'data'), { recursive: true });
  const output = {
    fetchedAt: new Date().toISOString(),
    target: OBJECT_NAME,
    data: records
  };
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'data', '3I_atlas.json'), JSON.stringify(output, null, 2));
  console.log(`Saved ${records.length} records for ${OBJECT_NAME}`);
}

fetchEphemeris();
