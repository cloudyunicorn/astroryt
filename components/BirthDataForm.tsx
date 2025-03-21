'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { saveUserBirthData } from "@/lib/actions/user.action";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface BirthDataFormProps {
  userId: string;
}

export default function BirthDataForm({ userId }: BirthDataFormProps) {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<LocationSuggestion | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch location suggestions from Nominatim (OpenStreetMap)
  useEffect(() => {
    if (location.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    // Debounce input for 500ms before fetching suggestions
    const handler = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
        .then((res) => res.json())
        .then((data: LocationSuggestion[]) => {
          setSuggestions(data);
        })
        .catch((err) => {
          console.error('Error fetching location suggestions:', err);
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [location]);

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setSelectedSuggestion(suggestion);
    setLocation(suggestion.display_name);
    setSuggestions([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedSuggestion) {
        setError('Please select a location from the suggestions.');
        setLoading(false);
        return;
      }
      // Call the server action to save birth data.
      // You can pass the location name along with lat & lon.
      await saveUserBirthData(
        userId,
        birthDate,
        birthTime,
        parseFloat(selectedSuggestion.lat),
        parseFloat(selectedSuggestion.lon),
        location // Optionally, update the user schema with this location name.
      );
      // Redirect to the dashboard after saving.
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Enter Your Birth Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="birthDate">Birth Date</Label>
            <Input
              type="date"
              id="birthDate"
              name="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="birthTime">Birth Time</Label>
            <Input
              type="time"
              id="birthTime"
              name="birthTime"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="location">Birth Location</Label>
            <Input
              type="text"
              id="location"
              name="location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setSelectedSuggestion(null);
              }}
              placeholder="Enter city or location"
              required
            />
            {suggestions.length > 0 && (
              <ul className="border border-gray-300 mt-1 rounded bg-white max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {error && <p className="text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
