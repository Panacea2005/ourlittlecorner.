import { NextRequest, NextResponse } from 'next/server'

async function getToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID || ''
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || ''
  const body = new URLSearchParams()
  body.append('grant_type', 'client_credentials')
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to get token')
  return res.json()
}

// Love song playlists and search terms for variety
const loveSongQueries = [
  'love song',
  'romantic ballad',
  'classic love song',
  'acoustic love',
  'indie love song',
  'pop love song',
  'R&B love song',
  'country love song',
  'jazz love song',
  'folk love song'
]

export async function GET(req: NextRequest) {
  try {
    const { access_token } = await getToken()
    
    // Use date to get consistent daily results
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const queryIndex = dayOfYear % loveSongQueries.length
    const query = loveSongQueries[queryIndex]
    
    // Search for love songs
    const api = `https://api.spotify.com/v1/search?type=track&limit=50&q=${encodeURIComponent(query)}`
    const res = await fetch(api, { 
      headers: { Authorization: `Bearer ${access_token}` }, 
      cache: 'no-store' 
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json({ error: 'Search failed', detail: errorText }, { status: 500 })
    }
    
    const data = await res.json()
    const tracks = data?.tracks?.items || []
    
    if (tracks.length === 0) {
      return NextResponse.json({ error: 'No tracks found' }, { status: 404 })
    }
    
    // Use day of year to select a consistent track for the day
    const selectedTrack = tracks[dayOfYear % tracks.length]
    
    const song = {
      id: selectedTrack.id,
      name: selectedTrack.name,
      artists: selectedTrack.artists?.map((a: any) => a.name)?.join(', '),
      preview_url: selectedTrack.preview_url,
      external_url: selectedTrack.external_urls?.spotify,
      image: selectedTrack.album?.images?.[1]?.url || selectedTrack.album?.images?.[0]?.url || '',
      album_name: selectedTrack.album?.name,
      duration_ms: selectedTrack.duration_ms,
      popularity: selectedTrack.popularity,
      date: today.toISOString().split('T')[0] // YYYY-MM-DD format
    }
    
    return NextResponse.json({ song })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 })
  }
}
