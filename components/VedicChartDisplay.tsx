// // app/components/VedicChartDisplay.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
// import { Skeleton } from '@/components/ui/skeleton';

// interface VedicPlanet {
//   name: string;
//   RA: number;
//   DEC: number;
//   tropicalLongitude: number;
//   siderealLongitude: number;
//   zodiac: string;
//   nakshatra: string;
//   pada: number;
//   constellation: string;
// }

// interface VedicChart {
//   planets: VedicPlanet[];
//   lagna: string;
//   sunZodiac: string;
//   moonNakshatra: string;
// }

// export default function VedicChartDisplay({ userId }: { userId: string }) {
//   const [chart, setChart] = useState<VedicChart | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     async function fetchChart() {
//       try {
//         const res = await fetch('/api/calculate-chart', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ userId }),
//         });
        
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`);
//         }

//         const { data } = await res.json() as { data: VedicChart };
//         setChart(data);
//       } catch (err: unknown) {
//         if (err instanceof Error) {
//           setError(err.message);
//         } else {
//           setError('An unknown error occurred');
//         }
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchChart();
//   }, [userId]);

//   if (loading) return (
//     <div className="space-y-4">
//       <Skeleton className="h-[125px] w-full rounded-xl" />
//       <Skeleton className="h-[300px] w-full rounded-xl" />
//     </div>
//   );

//   if (error) return (
//     <Card className="bg-destructive/10">
//       <CardContent className="pt-4 text-destructive">
//         Error: {error}
//       </CardContent>
//     </Card>
//   );

//   if (!chart) return (
//     <Card>
//       <CardContent className="pt-4">
//         No Vedic chart available. Please complete your birth information.
//       </CardContent>
//     </Card>
//   );

//   console.log(chart)

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Vedic Birth Chart Analysis</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="grid gap-4 md:grid-cols-2">
//           <div className="space-y-2">
//             <p><strong>Lagna (Ascendant):</strong> {chart.lagna}</p>
//             <p><strong>Sun Zodiac:</strong> {chart.sunZodiac}</p>
//             <p><strong>Moon Nakshatra:</strong> {chart.moonNakshatra}</p>
//           </div>
          
//           <Table>
//             <TableBody>
//               {chart.planets.map((planet) => (
//                 <TableRow key={planet.name}>
//                   <TableCell className="font-medium capitalize">
//                     {planet.name}
//                   </TableCell>
//                   <TableCell>
//                     {planet.zodiac}
//                     <span className="block text-sm text-muted-foreground">
//                       {planet.nakshatra} (Pada {planet.pada})
//                     </span>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }