import { getZodiacSign } from "@/lib/astrology-utils";

export function ZodiacWheel({ houses }: { houses: number[] }) {
    return (
        <div className="relative w-64 h-64 mx-auto">
            {Array.from({ length: 12 }).map((_, i) => (
                <div 
                    key={i}
                    className="absolute w-full h-full border-2 border-primary/20 rounded-full"
                    style={{
                        transform: `rotate(${i * 30}deg)`,
                        clipPath: 'inset(0 50% 0 0)'
                    }}
                >
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 text-xs">
                        {getZodiacSign(i * 30)}
                    </div>
                </div>
            ))}
            {houses.map((cusp, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-8 bg-primary origin-bottom"
                    style={{
                        transform: `rotate(${cusp}deg) translateY(-16px)`
                    }}
                />
            ))}
        </div>
    );
}