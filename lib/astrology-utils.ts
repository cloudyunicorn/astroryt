// Constants for Vedic calculations
const LAHIRI_EPOCH = 285.0 // Base year for Lahiri ayanamsa (285 AD)
const PRECESSION_RATE = 50.27 // Arcseconds per year

// Convert NASA Horizons data to Julian Date
export function toJulian(date: Date): number {
    return date.getTime() / 86400000 + 2440587.5;
}

// Calculate Lahiri ayanamsa (approximation)
export function calculateAyanamsa(jd: number): number {
    const centuries = (jd - 2451545.0) / 36525;
    return 23.85 + centuries * (50.27 / 3600); // Degrees
}

// Convert tropical to sidereal longitude
export function toSidereal(tropical: number, ayanamsa: number): number {
    return (tropical - ayanamsa + 360) % 360;
}

// Calculate nakshatra and pada
export function getNakshatra(sidereal: number) {
    const NAKSHATRA_LENGTH = 13.3333; // 13°20'
    const index = Math.floor(sidereal / NAKSHATRA_LENGTH);
    const pada = Math.floor((sidereal % NAKSHATRA_LENGTH) / 3.3333) + 1;
    return { index, pada };
}

// Zodiac sign calculation
export function getZodiacSign(longitude: number) {
    const SIGNS = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return SIGNS[Math.floor(longitude / 30)];
}

// House calculation (simplified Placidus)
export function calculateHouses(jd: number, lat: number, lon: number) {
    // Complex calculation - simplified for demonstration
    return Array.from({ length: 12 }, (_, i) => (i * 30 + 15) % 360);
}