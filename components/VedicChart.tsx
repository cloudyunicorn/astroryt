import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

const NAKSHATRA_NAMES = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
];

export function VedicChart({ data }: { data: any }) {
  return (
    <Table>
      <TableBody>
        {data.planets.map((planet: any) => (
          <TableRow key={planet.name}>
            <TableCell className="font-medium capitalize">
              {planet.name}
            </TableCell>
            <TableCell>
              {planet.zodiac}
              <span className="text-muted-foreground ml-2">
                ({planet.sidereal.toFixed(2)}°)
              </span>
            </TableCell>
            <TableCell>
              {NAKSHATRA_NAMES[planet.nakshatra]}
              <span className="text-muted-foreground ml-2">
                Pada {planet.pada}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
