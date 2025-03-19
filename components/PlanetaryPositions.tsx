import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PlanetaryPositionsProps {
  planetaryData: {
    name: string;
    zodiac: string;
    nakshatra: number;
    pada: number;
  }[];
}

export default function PlanetaryPositions({ planetaryData }: PlanetaryPositionsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Show Planetary Positions</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Planetary Positions</DialogTitle>
        <DialogDescription>Detailed planetary data based on your birth details.</DialogDescription>
        <ul className="space-y-2 mt-3">
          {planetaryData.map((planet) => (
            <li key={planet.name} className="flex items-center justify-between p-2 bg-secondary/10 rounded">
              <span className="capitalize font-medium text-sm">{planet.name}</span>
              <span className="text-sm text-foreground/80">
                {planet.zodiac} <span className="text-xs text-foreground/60">(Nakshatra {planet.nakshatra}, Pada {planet.pada})</span>
              </span>
            </li>
          ))}
        </ul>
        <DialogClose asChild>
          <Button variant="ghost" className="mt-2 w-full">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
