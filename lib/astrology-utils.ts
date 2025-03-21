export interface PlanetData {
    name: string;
    RA: number;
    DEC: number;
    LON: number;
    LAT: number;
    Constellation: string;
}

export interface VedicPlanet {
  name: string;
  RA: number;                // Raw Right Ascension (decimal degrees)
  DEC: number;               // Raw Declination (decimal degrees)
  tropicalLongitude: number; // Tropical ecliptic longitude
  siderealLongitude: number; // Sidereal ecliptic longitude (after ayanamsa correction)
  zodiac: string;            // Zodiac sign (calculated from sidereal longitude)
  nakshatra: string;         // Nakshatra (calculated from sidereal longitude)
  pada: number;              // Pada (calculated from sidereal longitude)
  constellation: string;
}

const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta',
    'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

export function calculateLahiriAyanamsaFromJD(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const ayanamsa =
    24.04225 +
    1.396971278 * T -
    0.0003086 * T * T +
    T ** 3 / 49931 -
    T ** 4 / 15300 -
    T ** 5 / 2000000;

  return ayanamsa;
}

// function getZodiacSign(longitude: number): string {
//     return ZODIAC[Math.floor(longitude / 30)];
// }

function getNakshatra(longitude: number): string {
    const normalizedLon = longitude % 360;
  return NAKSHATRAS[Math.floor(normalizedLon / (360 / 27))];
}

function getPada(longitude: number): number {
    const segment = 360 / 27; // 13.3333°
  const nakshatraLon = longitude % segment;
  return Math.floor(nakshatraLon / (segment / 4)) + 1;
}

/**
 * Converts tropical ecliptic longitude to sidereal by subtracting the ayanamsa.
 * @param tropical - Tropical longitude in degrees.
 * @param ayanamsa - Ayanamsa in degrees (default 24.0 for Lahiri).
 * @returns Sidereal longitude in degrees.
 */

export function equatorialToEcliptic(ra: number, dec: number, epsilon = 23.44): number {
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const epsilonRad = (epsilon * Math.PI) / 180;
  const lambda = Math.atan2(
    Math.sin(raRad) * Math.cos(epsilonRad) + Math.tan(decRad) * Math.sin(epsilonRad),
    Math.cos(raRad)
  );
  let lambdaDeg = (lambda * 180) / Math.PI;
  if (lambdaDeg < 0) lambdaDeg += 360;
  return lambdaDeg;
}

export function getZodiacSign(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const index = Math.floor(longitude / 30) % 12;
  return signs[index];
}

/**
 * Calculates the Lagna (Ascendant) using a simplified approximation.
 * This function uses UT from birthTime and adjusts for the observer's longitude.
 * Note: This is a simplified calculation and may not be accurate for all charts.
 * @param birthTime - The birth time as a Date object.
 * @param longitude - The observer's longitude in degrees.
 * @returns The ascendant zodiac sign.
 */
export function calculateLagna(birthTime: Date, longitude: number): string {
  // A very simplified approach: assume Local Sidereal Time (LST) in hours is UT (in hours) + (longitude / 15).
  const utHours = birthTime.getUTCHours() + birthTime.getUTCMinutes() / 60;
  const lstHours = (utHours + longitude / 15) % 24;
  // For demonstration, divide the 24-hour LST into 12 signs (each sign roughly corresponds to 2 hours).
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const index = Math.floor(lstHours / 2) % 12;
  return signs[index];
}


export function getSunZodiacWestern(birthDate: Date): string {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1; // JavaScript months: 0-11

  // These date ranges follow the common tropical zodiac boundaries:
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
  return "";
}

export interface HorizonsData {
  jd: number;
  planets: PlanetData[];
}

export interface PlanetData {
  name: string;
  RA: number;    // Right Ascension in degrees
  DEC: number;   // Declination in degrees
  LON: number;   // Ecliptic longitude in degrees
  LAT: number;   // Ecliptic latitude (0 for Sun)
  Constellation: string;
}

export interface HorizonsData {
  jd: number;         // Julian Date
  planets: PlanetData[];
}

export interface PlanetData {
  name: string;
  RA: number;
  DEC: number;
  LON: number;
  LAT: number;
  Constellation: string;
}

export interface HorizonsData {
  jd: number;
  planets: PlanetData[];
}

export function processRawHorizonsData(rawText: string): HorizonsData {
  const startMarker = '$$SOE';
  const endMarker = '$$EOE';
  const startIndex = rawText.indexOf(startMarker);
  const endIndex = rawText.indexOf(endMarker);
  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Ephemeris markers not found in NASA data");
  }

  const dataBlock = rawText
    .slice(startIndex + startMarker.length, endIndex)
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (dataBlock.length === 0) {
    throw new Error("No ephemeris data found.");
  }

  // Use the first line to extract JD and planet data.
  const firstLine = dataBlock[0];
  const cleanLine1 = firstLine.replace('*m', '').replace('*', '').trim();
    const cleanLine2 = cleanLine1.replace('N', '').replace('*', '').trim();
    const parts = cleanLine2.split(/\s+/);

  if (parts.length < 8) {
    throw new Error(`Insufficient data in ephemeris line: ${parts.length} parts; expected at least 8 for JD, RA (h m s), DEC (d m s).`);
  }

  // Extract JD from parts[0]
  const jd = parseFloat(parts[0]);
  if (isNaN(jd)) {
    throw new Error("Failed to parse JD from data.");
  }

  // Correct indices for RA and DEC:
  // parts[2] = RA hours, parts[3] = RA minutes, parts[4] = RA seconds,
  // parts[5] = DEC degrees, parts[6] = DEC minutes, parts[7] = DEC seconds.
  const raHours = parseFloat(parts[1]);
  const raMinutes = parseFloat(parts[2]);
  const raSeconds = parseFloat(parts[3]);
  const decDegrees = parseFloat(parts[4]);
  const decMinutes = parseFloat(parts[5]);
  const decSeconds = parseFloat(parts[6]);

  if (
    isNaN(raHours) || isNaN(raMinutes) || isNaN(raSeconds) ||
    isNaN(decDegrees) || isNaN(decMinutes) || isNaN(decSeconds)
  ) {
    throw new Error("Failed to parse RA or DEC components.");
  }

  const ra = (raHours + raMinutes / 60 + raSeconds / 3600) * 15;
  const dec = decDegrees < 0
    ? -(Math.abs(decDegrees) + decMinutes / 60 + decSeconds / 3600)
    : decDegrees + decMinutes / 60 + decSeconds / 3600;

  const tropicalLongitude = equatorialToEcliptic(ra, dec);

  // Extract target body name from header (if available).
  const targetMatch = rawText.match(/Target body name:\s+([A-Za-z]+)/);
  const planetName = targetMatch ? targetMatch[1] : 'Unknown';

  // We set the Constellation field to 'Unknown' here.
  const planet: PlanetData = {
    name: planetName,
    RA: ra,
    DEC: dec,
    LON: tropicalLongitude,
    LAT: 0,
    Constellation: 'Unknown',
  };

  return { jd, planets: [planet] };
}


export function extractJDFromHorizonsData(rawText: string): number {
  // Define the markers that delimit the ephemeris data
  const startMarker = '$$SOE';
  const endMarker = '$$EOE';

  // Find the start and end positions of the data block
  const startIndex = rawText.indexOf(startMarker);
  const endIndex = rawText.indexOf(endMarker);

  // Check if the markers exist in the text
  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Ephemeris markers not found in NASA data");
  }

  // Extract the block between the markers and trim whitespace
  const block = rawText.substring(startIndex + startMarker.length, endIndex).trim();

  // Split into lines, remove empty lines
  const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Ensure there’s at least one data line
  if (lines.length === 0) {
    throw new Error("No data lines found in ephemeris block");
  }

  // Take the first line and split it by whitespace
  const firstLine = lines[0];
  const parts = firstLine.split(/\s+/);

  // Ensure there’s at least one part (the JD)
  if (parts.length < 1) {
    throw new Error("Insufficient data in ephemeris line");
  }

  // Parse the JD as a float
  const jd = parseFloat(parts[0]);

  // Validate the parsed JD
  if (isNaN(jd)) {
    throw new Error("Failed to parse Julian Day from data");
  }

  return jd;
}

// Helper: Convert a Date (UTC) to Julian Day using the Fliegel–Van Flandern algorithm
export function dateToJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // JS months are 0-indexed
  const day = date.getUTCDate();
  const A = Math.floor((14 - month) / 12);
  const Y = year + 4800 - A;
  const M = month + 12 * A - 3;
  const JDN = day + Math.floor((153 * M + 2) / 5) + 365 * Y +
    Math.floor(Y / 4) - Math.floor(Y / 100) + Math.floor(Y / 400) - 32045;
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  const fraction = (hour - 12) / 24 + minute / 1440 + second / 86400;
  return JDN + fraction;
}

// Calculate the mean ascending node (Rahu) using the common approximation,
// then subtract 30° to adjust the computed value.
export function calculateMeanLunarNode(birthTime: Date): number {
  const JD = dateToJulianDay(birthTime);
  let node = 125.04452 - 0.05295377 * (JD - 2451545.0);
  // Subtract 30° as a correction so that Rahu falls in Capricorn and Ketu in Cancer.
  node = node - 24;
  // Normalize to 0-360 degrees.
  node = ((node % 360) + 360) % 360;
  return node;
}

// Update calculateVedicChart to handle string input
export function calculateVedicChart(birthTime: Date, raw: string | HorizonsData): VedicPlanet[] {
  let jd: number;
  let planetData: PlanetData[];
  
  if (typeof raw === 'string') {
    const horizonsData = processRawHorizonsData(raw);
    jd = horizonsData.jd;
    planetData = horizonsData.planets;
  } else {
    // If raw is already HorizonsData, use its jd and planets.
    jd = raw.jd;
    planetData = raw.planets;
  }
  
  // Calculate dynamic Lahiri ayanamsa from the extracted JD.
  const ayanamsa = calculateLahiriAyanamsaFromJD(jd);
  
  const planets: VedicPlanet[] = planetData.map(planet => {
    const siderealLon = (planet.LON - ayanamsa + 360) % 360;
    return {
      name: planet.name,
      RA: planet.RA,
      DEC: planet.DEC,
      tropicalLongitude: planet.LON,
      siderealLongitude: siderealLon,
      zodiac: getZodiacSign(siderealLon),
      nakshatra: getNakshatra(siderealLon),
      pada: getPada(siderealLon),
      constellation: planet.Constellation,
    };
  });
  
  // Calculate Rahu and Ketu based on the Moon’s sidereal longitude.
  const moon = planets.find(p => p.name.toLowerCase() === 'moon');
  if (moon) {
    const meanNode = calculateMeanLunarNode(birthTime);
    const rahuLongitude = meanNode;
    const ketuLongitude = (meanNode + 180) % 360;
    
    const rahu: VedicPlanet = {
      name: 'Rahu',
      RA: 0,
      DEC: 0,
      tropicalLongitude: 0,
      siderealLongitude: rahuLongitude,
      zodiac: getZodiacSign(rahuLongitude),
      nakshatra: getNakshatra(rahuLongitude),
      pada: getPada(rahuLongitude),
      constellation: 'Node',
    };
    
    const ketu: VedicPlanet = {
      name: 'Ketu',
      RA: 0,
      DEC: 0,
      tropicalLongitude: 0,
      siderealLongitude: ketuLongitude,
      zodiac: getZodiacSign(ketuLongitude),
      nakshatra: getNakshatra(ketuLongitude),
      pada: getPada(ketuLongitude),
      constellation: 'Node',
    };
    
    planets.push(rahu, ketu);
  }
  
  return planets;
}