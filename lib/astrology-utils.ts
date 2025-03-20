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

function calculateLahiriAyanamsa(tropicalLon: number): number {
    // Simplified ayanamsa calculation (for precise results consider polynomial equations)
    return 23.85 + (tropicalLon / 360) * 50.27 / 3600;
}

// function getZodiacSign(longitude: number): string {
//     return ZODIAC[Math.floor(longitude / 30)];
// }

function getNakshatra(longitude: number): string {
    return NAKSHATRAS[Math.floor(longitude / 13.3333)];
}

function getPada(longitude: number): number {
    return Math.floor((longitude % 13.3333) / 3.3333) + 1;
}

export function parseEphemerisData(text: string) {
  const startMarker = '$$SOE';
  const endMarker = '$$EOE';
  const startIndex = text.indexOf(startMarker);
  const endIndex = text.indexOf(endMarker);
  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Ephemeris markers not found.");
  }
  const block = text.substring(startIndex + startMarker.length, endIndex).trim();
  const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) {
    throw new Error("No ephemeris data found.");
  }
  // Use the first data line.
  const dataLine = lines[0];
  const parts = dataLine.split(/\s+/);
  if (parts.length < 7) {
    throw new Error("Insufficient data in ephemeris line.");
  }
  // parts[2] = RA hours, parts[3] = RA minutes, parts[4] = RA seconds,
  // parts[5] = DEC degrees, parts[6] = DEC minutes, parts[7] = DEC seconds.
  const raHours = parseFloat(parts[1]);
  const raMinutes = parseFloat(parts[2]);
  const raSeconds = parseFloat(parts[3]);
  const decDegrees = parseFloat(parts[3]);
  const decMinutes = parseFloat(parts[5]);
  const decSeconds = parseFloat(parts[6]);
  
  const ra = (raHours + raMinutes / 60 + raSeconds / 3600) * 15;
  const dec = (Math.abs(decDegrees) + decMinutes / 60 + decSeconds / 3600) * (parts[5].startsWith('-') ? -1 : 1);
  return { ra, dec };
}

/**
 * Converts equatorial coordinates (RA, DEC) to tropical ecliptic longitude.
 * @param ra - Right Ascension in decimal degrees.
 * @param dec - Declination in decimal degrees.
 * @param epsilon - Obliquity of the ecliptic in degrees (default is 23.44°).
 * @returns Tropical ecliptic longitude in degrees.
 */

export function equatorialToEcliptic(ra: number, dec: number, epsilon = 23.44): number {
  const raRad = ra * Math.PI / 180;
  const decRad = dec * Math.PI / 180;
  const epsilonRad = epsilon * Math.PI / 180;

  const sinEpsilon = Math.sin(epsilonRad);
  const cosEpsilon = Math.cos(epsilonRad);

  const y = Math.sin(raRad) * cosEpsilon + Math.tan(decRad) * sinEpsilon;
  const x = Math.cos(raRad);
  const lambda = Math.atan2(y, x);

  // Convert to degrees and normalize
  let lambdaDeg = lambda * 180 / Math.PI;
  if (lambdaDeg < 0) lambdaDeg += 360;
  
  return lambdaDeg;
}

/**
 * Converts tropical ecliptic longitude to sidereal by subtracting the ayanamsa.
 * @param tropical - Tropical longitude in degrees.
 * @param ayanamsa - Ayanamsa in degrees (default 24.0 for Lahiri).
 * @returns Sidereal longitude in degrees.
 */

export function tropicalToSidereal(tropical: number, ayanamsa = 24.0): number {
  let sidereal = tropical - ayanamsa;
  if (sidereal < 0) sidereal += 360;
  return sidereal;
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
 * Given raw Horizons output text, parse the data and return the calculated
 * astrological parameters.
 * @param rawText - The plain-text output from the Horizons API.
 * @returns An object containing tropicalLongitude, siderealLongitude, zodiacSign, and the parsed RA/DEC.
 */
export function calculatePlanetaryPosition(rawText: string) {
  // Parse RA and DEC from the raw text.
  const { ra, dec } = parseEphemerisData(rawText);
  // Convert to tropical ecliptic longitude.
  const tropicalLongitude = equatorialToEcliptic(ra, dec);
  // Convert tropical to sidereal (adjust ayanamsa as needed).
  const siderealLongitude = tropicalToSidereal(tropicalLongitude, 24.0);
  // Determine zodiac sign.
  const zodiacSign = getZodiacSign(siderealLongitude);

  return {
    ra,
    dec,
    tropicalLongitude,
    siderealLongitude,
    zodiacSign,
  };
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

/**
 * Calculates the Moon's Nakshatra based on its sidereal longitude.
 * @param moonSiderealLongitude - The Moon's sidereal ecliptic longitude in degrees.
 * @returns The Nakshatra name.
 */
export function calculateMoonNakshatra(moonSiderealLongitude: number): string {
  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha",
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", 
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", 
    "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", 
    "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", 
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];
  const segment = 360 / 27; // ~13.3333° per nakshatra.
  const index = Math.floor(moonSiderealLongitude / segment) % 27;
  return nakshatras[index];
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


export function processRawHorizonsData(rawText: string): PlanetData[] {
  const planets: PlanetData[] = [];
  
  // Split the raw text into blocks using a separator line (adjust the regex as needed).
  // Here we assume that the ephemeris block is delimited by $$SOE and $$EOE.
  const startMarker = '$$SOE';
  const endMarker = '$$EOE';
  const startIndex = rawText.indexOf(startMarker);
  const endIndex = rawText.indexOf(endMarker);
  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Ephemeris markers not found in NASA data");
  }
  
  // Get the block of lines between $$SOE and $$EOE
  const dataBlock = rawText
    .slice(startIndex + startMarker.length, endIndex)
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Extract target body name from header (e.g. "Target body name: Sun")
  const targetMatch = rawText.match(/Target body name:\s+([A-Za-z]+)/);
  const planetName = targetMatch ? targetMatch[1] : 'Unknown';

  // If there are multiple lines, take only the first one.
  if (dataBlock.length > 0) {
    const firstLine = dataBlock[0];
    // Remove markers and extra characters
    const cleanLine = firstLine.replace('*m', '').replace('*', '').trim();
    const parts = cleanLine.split(/\s+/);
    // Expect at least 7 parts: JD, RAh, RAm, RAs, DECd, DECm, DECs.
    if (parts.length < 8) {
      throw new Error("Insufficient data in ephemeris line.");
    }
    try {
      // Note: Adjust the indices if needed. Here we assume:
      // parts[1] = RA hours, parts[2] = RA minutes, parts[3] = RA seconds,
      // parts[4] = DEC degrees, parts[5] = DEC minutes, parts[6] = DEC seconds.
      const raHours = parseFloat(parts[2]);
      const raMinutes = parseFloat(parts[3]);
      const raSeconds = parseFloat(parts[4]);
      const decDegrees = parseFloat(parts[5]);
      const decMinutes = parseFloat(parts[6]);
      const decSeconds = parseFloat(parts[7]);
      
      // Convert RA (hours to degrees) 
      const ra = (raHours + raMinutes / 60 + raSeconds / 3600) * 15;
      
      // Calculate DEC (taking into account sign)
      const dec = decDegrees < 0
        ? -(Math.abs(decDegrees) + decMinutes / 60 + decSeconds / 3600)
        : decDegrees + decMinutes / 60 + decSeconds / 3600;
      
      // Calculate tropical longitude using your equatorialToEcliptic function.
      const tropicalLongitude = equatorialToEcliptic(ra, dec);
      
      planets.push({
        name: planetName,
        RA: ra,
        DEC: dec,
        LON: tropicalLongitude,
        LAT: 0, // Set default; you can update if needed.
        Constellation: getConstellationFromCoords(ra, dec) // See note below.
      });
    } catch (error) {
      console.error("Error parsing data line:", error);
    }
  }
  
  return planets;
}

interface ConstellationBoundary {
  name: string;
  raMin: number;  // in degrees
  raMax: number;  // in degrees
  decMin: number; // in degrees
  decMax: number; // in degrees
}

// Approximate boundaries for the 12 zodiac constellations.
// These boundaries are only approximate and should be refined if needed.
const zodiacBoundaries: ConstellationBoundary[] = [
  { name: 'Aries',       raMin: 0,    raMax: 30,   decMin: 10, decMax: 30 },
  { name: 'Taurus',      raMin: 30,   raMax: 60,   decMin: 0,  decMax: 30 },
  { name: 'Gemini',      raMin: 60,   raMax: 90,   decMin: 0,  decMax: 30 },
  { name: 'Cancer',      raMin: 90,   raMax: 120,  decMin: 0,  decMax: 30 },
  { name: 'Leo',         raMin: 120,  raMax: 150,  decMin: 0,  decMax: 30 },
  { name: 'Virgo',       raMin: 150,  raMax: 180,  decMin: -10, decMax: 20 },
  { name: 'Libra',       raMin: 180,  raMax: 210,  decMin: -20, decMax: 10 },
  { name: 'Scorpio',     raMin: 210,  raMax: 240,  decMin: -30, decMax: 0 },
  { name: 'Sagittarius', raMin: 240,  raMax: 270,  decMin: -40, decMax: -10 },
  { name: 'Capricorn',   raMin: 270,  raMax: 300,  decMin: -50, decMax: -20 },
  { name: 'Aquarius',    raMin: 300,  raMax: 330,  decMin: -30, decMax: 0 },
  { name: 'Pisces',      raMin: 330,  raMax: 360,  decMin: 0,  decMax: 20 },
];

/**
 * Given RA and Dec (in degrees), returns the constellation name.
 * This implementation uses simplified boundaries for the zodiac constellations.
 * For a full implementation covering all 88 constellations, you would need a dataset
 * of detailed polygon boundaries and a point-in-polygon algorithm.
 */
export function getConstellationFromCoords(ra: number, dec: number): string {
  // Normalize RA to 0-360 degrees.
  const normalizedRA = ((ra % 360) + 360) % 360;
  
  for (const boundary of zodiacBoundaries) {
    if (
      normalizedRA >= boundary.raMin &&
      normalizedRA < boundary.raMax &&
      dec >= boundary.decMin &&
      dec <= boundary.decMax
    ) {
      return boundary.name;
    }
  }
  
  return 'Unknown';
}

// Helper: Convert a Date (UTC) to Julian Day using the Fliegel–Van Flandern algorithm
export function dateToJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600;

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12*a - 3;

  const jd = day + Math.floor((153*m + 2)/5) + 
    365*y + Math.floor(y/4) - 
    Math.floor(y/100) + Math.floor(y/400) - 
    32045 + (hour - 12)/24;

  // Add fraction of day
  return jd;
}

// Calculate the mean ascending node (Rahu) using the common approximation,
// then subtract 30° to adjust the computed value.
export function calculateMeanLunarNode(birthTime: Date): number {
  const JD = dateToJulianDay(birthTime);
  const T = (JD - 2451545.0) / 36525;
  
  // Improved polynomial approximation
  let node = 125.04452 
    - 1934.136261 * T 
    + 0.0020708 * T*T 
    + T*T*T / 450000;
    node = node - 24;
  // Normalize to 0-360
  node = ((node % 360) + 360) % 360;
  return node;
}

// Update calculateVedicChart to handle string input
export function calculateVedicChart(birthTime: Date, raw: string | PlanetData[]): VedicPlanet[] {
  let planetData: PlanetData[];
  if (typeof raw === 'string') {
    planetData = processRawHorizonsData(raw);
  } else {
    planetData = raw;
  }
  const planets: VedicPlanet[] = planetData.map(planet => {
    const ayanamsa = calculateLahiriAyanamsa(planet.LON);
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

  // Calculate Rahu and Ketu based on Moon's sidereal longitude.
  const moon = planets.find(p => p.name.toLowerCase() === 'moon');
  if (moon) {
const meanNode = calculateMeanLunarNode(birthTime);

// By convention in Vedic astrology, Rahu (the ascending node) is given by the mean node,
// and Ketu (the descending node) is exactly opposite (i.e. mean node + 180° modulo 360).
const rahuLongitude = meanNode;
const ketuLongitude = (meanNode + 180) % 360;

const rahu: VedicPlanet = {
  name: 'Rahu',
  RA: 0,       // Not directly available
  DEC: 0,      // Not directly available
  tropicalLongitude: 0, // Not defined in this approximation
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