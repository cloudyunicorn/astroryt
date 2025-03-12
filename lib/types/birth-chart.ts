export interface PlanetaryData {
  name: string;
  zodiac: string;
  nakshatra: number;
  pada: number;
}

export interface IBirthChart {
  planetaryData: PlanetaryData[];
  ascendant?: number;
  updatedAt: string;
}

export interface VedicPlanet {
  name: string;
  RA: number;
  DEC: number;
  tropicalLongitude: number;
  siderealLongitude: number;
  zodiac: string;
  nakshatra: string;
  pada: number;
  constellation: string;
}

export interface VedicChart {
  planets: VedicPlanet[];
  lagna: string;
  sunZodiac: string;
  moonNakshatra: string;
}
