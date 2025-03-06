'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { saveUserBirthData } from "@/lib/actions/user.action"

// Import the server action from our actions file.
// (Next.js will handle this correctly if you're using server actions.)

interface BirthDataFormProps {
  userId: string
}

export default function BirthDataForm({ userId }: BirthDataFormProps) {
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Directly call the server action to save birth data.
      // This function will run on the server.
      await saveUserBirthData(
        userId,
        birthDate,
        birthTime,
        parseFloat(lat),
        parseFloat(lon)
      )
      // Redirect to the dashboard after saving.
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to save birth data')
    } finally {
      setLoading(false)
    }
  }

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
            <Label htmlFor="lat">Latitude</Label>
            <Input
              type="number"
              step="any"
              id="lat"
              name="lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lon">Longitude</Label>
            <Input
              type="number"
              step="any"
              id="lon"
              name="lon"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              required
            />
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
  )
}
