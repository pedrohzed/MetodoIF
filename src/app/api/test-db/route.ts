import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('campuses_courses')
      .select('*')
      .order('campus_name')
    
    console.log('API Test DB - Data length:', data?.length, 'Error:', error)
    
    if (error) {
      console.error('API Test DB Error:', error)
      return NextResponse.json({ error }, { status: 500 })
    }
    
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error', details: err }, { status: 500 })
  }
}
