// app/api/horizon/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

// GET: Retrieve the stored birth chart data for the given userId.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Fetch the stored BirthChart record
    const chart = await prisma.birthChart.findUnique({
      where: { userId },
      select: {
        planetaryData: true,
        updatedAt: true,
        // Optionally, you could also select other fields if needed
      },
    });

    if (!chart) {
      return NextResponse.json({ error: 'No chart found' }, { status: 404 });
    }

    return NextResponse.json(chart);
  } catch (error) {
    console.error('Error in GET /api/horizon:', error);
    return NextResponse.json(
      { error: 'Server error retrieving chart' },
      { status: 500 }
    );
  }
}

// POST: Calculate the chart using the stored birth data and update the record.
export async function POST(request: Request) {
  try {
    // Parse the incoming request body; we expect at least a userId.
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId in request body' },
        { status: 400 }
      );
    }

    // Fetch the user's birth data from the BirthChart record
    const birthChart = await prisma.birthChart.findUnique({
      where: { userId },
      select: { birthDate: true, birthTime: true, lat: true, lon: true },
    });

    if (!birthChart) {
      return NextResponse.json(
        { error: 'No birth data available' },
        { status: 404 }
      );
    }

    // Combine the birthDate and birthTime into one ISO string.
    const datePart = birthChart.birthDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const timePart = birthChart.birthTime
      .toISOString()
      .split('T')[1]
      .split('.')[0]; // HH:MM:SS
    const dateTime = `${datePart}T${timePart}`;

    birthChart.birthTime.setMinutes(birthChart.birthTime.getMinutes() + 1);
    const newTimePart = birthChart.birthTime
      .toISOString()
      .split('T')[1]
      .split('.')[0]; // HH:MM:SS format with 1 minute added
    const stopTime = `${datePart}T${newTimePart}`;
    console.log(dateTime, stopTime);

    // Build the Horizons API URL.
    // For example, using COMMAND '10' for the Sun.
    const horizonsUrl = `https://ssd.jpl.nasa.gov/api/horizons.api?format=json
  &COMMAND=10
  &OBJ_DATA=YES
  &MAKE_EPHEM=YES
  &EPHEM_TYPE=OBSERVER
  &CENTER=coord
  &START_TIME='${encodeURIComponent(dateTime)}'
  &STOP_TIME='${encodeURIComponent(stopTime)}'
  &STEP_SIZE='1%20m'
  &QUANTITIES='1,9'
  &SITE_COORD='${encodeURIComponent(`1,${birthChart.lon},${birthChart.lat},0`)}'
  &CAL_FORMAT=JD
  &CSV_FORMAT=NO`;

    console.log('Horizons URL:', horizonsUrl);

    // Call the Horizons API
    const response = await fetch(horizonsUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Calculation failed: Horizons API error' },
        { status: 500 }
      );
    }
    const data = await response.json();

    // Update the rawNasaData
    await prisma.birthChart.update({
      where: { userId },
      data: { rawHorizonsData: data || null },
    });

    return NextResponse.json({
      message: 'Nasa data calculated successfully',
      data: data,
    });
  } catch (error) {
    console.error('Error in POST /api/horizon:', error);
    return NextResponse.json(
      { error: 'Calculation failed due to server error' },
      { status: 500 }
    );
  }
}
