interface PlanetData {
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
  if (parts.length < 8) {
    throw new Error("Insufficient data in ephemeris line.");
  }
  // parts[2] = RA hours, parts[3] = RA minutes, parts[4] = RA seconds,
  // parts[5] = DEC degrees, parts[6] = DEC minutes, parts[7] = DEC seconds.
  const raHours = parseFloat(parts[2]);
  const raMinutes = parseFloat(parts[3]);
  const raSeconds = parseFloat(parts[4]);
  const decDegrees = parseFloat(parts[5]);
  const decMinutes = parseFloat(parts[6]);
  const decSeconds = parseFloat(parts[7]);
  
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
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  const epsilonRad = (epsilon * Math.PI) / 180;
  // Calculate the ecliptic longitude (lambda)
  const lambda = Math.atan2(
    Math.sin(raRad) * Math.cos(epsilonRad) + Math.tan(decRad) * Math.sin(epsilonRad),
    Math.cos(raRad)
  );
  let lambdaDeg = (lambda * 180) / Math.PI;
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
  
  // Split the raw text into planetary data blocks
  const planetaryBlocks = rawText.split(/\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*\\*/);
  
  planetaryBlocks.forEach(block => {
    if(block.includes('$$SOE')) {
      try {
        const position = parseEphemerisData(block);
        const eclipticLon = equatorialToEcliptic(position.ra, position.dec);
        
        planets.push({
          name: extractPlanetName(block),
          RA: position.ra,
          DEC: position.dec,
          LON: eclipticLon,
          LAT: 0, // Latitude calculation would need additional logic
          Constellation: extractConstellation(block)
        });
      } catch (error) {
        console.error('Error processing planetary block:', error);
      }
    }
  });
  
  return planets;
}

function extractPlanetName(block: string): string {
  const match = block.match(/Revised:.*\n.*\n.*\n.*\n\s+(.*?)\s+/);
  return match ? match[1] : 'Unknown';
}

function extractConstellation(block: string): string {
  const match = block.match(/Constellation\s*:\s*(.+)/);
  return match ? match[1].trim() : 'Unknown';
}

// Update calculateVedicChart to handle string input
export function calculateVedicChart(rawText: string): VedicPlanet[] {
  const planetData = processRawHorizonsData(rawText);
  return planetData.map(planet => {
    // Original calculation logic
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
}