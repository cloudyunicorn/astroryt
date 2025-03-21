interface BirthDataDisplayProps {
  vedicZodiacSign: string;
  westernZodiac: string
  birthDate?: string | null;
  birthTime?: string | null;
  birthLocation?: string | null | undefined;
}

export default function BirthDataDisplay({ vedicZodiacSign, birthTime, birthDate, birthLocation, westernZodiac }: BirthDataDisplayProps) {
  console.log(birthTime)
  return (
    <div className="p-3 bg-muted/10 rounded-md">
      <h3 className="text-md font-medium text-muted-foreground mb-2">Birth Details</h3>
      <div className="flex items-center justify-between px-2 py-1 bg-secondary/10 rounded">
        <span className="text-sm text-foreground/70">Zodiac Sign (Western):</span>
        <span className="text-sm font-semibold">{westernZodiac}</span>
      </div>
      <div className="flex items-center justify-between px-2 py-1 bg-secondary/10 rounded mt-2">
        <span className="text-sm text-foreground/70">Zodiac Sign (Vedic):</span>
        <span className="text-sm font-semibold">{vedicZodiacSign}</span>
      </div>
      <div className="flex items-center justify-between px-2 py-1 bg-secondary/10 rounded mt-2">
        <span className="text-sm text-foreground/70">Birth Date:</span>
        <span className="text-sm font-semibold">{birthDate}</span>
      </div>
      <div className="flex items-center justify-between px-2 py-1 bg-secondary/10 rounded mt-2">
        <span className="text-sm text-foreground/70">Birth Time:</span>
        <span className="text-sm font-semibold">{birthTime}</span>
      </div>
      <div className="flex items-center justify-between px-2 py-1 bg-secondary/10 rounded mt-2">
        <span className="text-sm text-foreground/70">Birth Location:</span>
        <span className="text-sm font-semibold">{birthLocation}</span>
      </div>
    </div>
  );
}
