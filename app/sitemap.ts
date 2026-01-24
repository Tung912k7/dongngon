import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const domain = 'https://dongngon.com'

  // Fetch all public works
  const { data: works } = await supabase
    .from('works')
    .select('id, created_at')
    .eq('license', 'public')

  const workEntries: MetadataRoute.Sitemap = (works || []).map((work) => ({
    url: `${domain}/work/${work.id}`,
    lastModified: new Date(work.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: domain,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${domain}/dong-ngon`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  return [...staticEntries, ...workEntries]
}
