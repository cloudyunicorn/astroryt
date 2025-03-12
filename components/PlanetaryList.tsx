import { PlanetaryData } from "@/lib/types/birth-chart"

interface PlanetaryListProps {
  data: PlanetaryData[]
}

export default function PlanetaryList({ data }: PlanetaryListProps) {
  return (
    <ul className="space-y-2">
      {data.map((planet) => (
        <PlanetaryListItem key={planet.name} planet={planet} />
      ))}
    </ul>
  )
}

function PlanetaryListItem({ planet }: { planet: PlanetaryData }) {
  return (
    <li className="flex items-center justify-between p-2 bg-secondary/10 rounded">
      <span className="capitalize font-medium text-sm">
        {planet.name}
      </span>
      <span className="text-sm text-foreground/80">
        {planet.zodiac}{' '}
        <span className="text-xs text-foreground/60">
          (Nakshatra {planet.nakshatra}, Pada {planet.pada})
        </span>
      </span>
    </li>
  )
}
