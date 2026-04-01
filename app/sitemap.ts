import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'
import { HELP_CENTER_SECTIONS } from '@/data/helpCenter'

export const revalidate = 3600 // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dongngon.vercel.app'
  const supabase = await createClient()

  // --- Static pages ---
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/kho-tang`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hdsd`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dang-nhap`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/dang-ky`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/quen-mat-khau`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.1,
    },
  ]

  // --- HDSD sections (from static data) ---
  const hdsdSectionPages: MetadataRoute.Sitemap = HELP_CENTER_SECTIONS.map(
    (section) => ({
      url: `${baseUrl}/hdsd/${section.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })
  )

  // --- HDSD articles (from database) ---
  let hdsdArticlePages: MetadataRoute.Sitemap = []
  try {
    const { data: articles } = await supabase
      .from('hdsd_articles')
      .select('slug, section_id, updated_at')
      .eq('status', 'published')

    if (articles) {
      hdsdArticlePages = articles.map((article) => ({
        url: `${baseUrl}/hdsd/${article.section_id}/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }))
    }
  } catch {
    // Silently skip if hdsd_articles table doesn't exist yet
  }

  // --- Public works (from database) ---
  let workPages: MetadataRoute.Sitemap = []
  try {
    const { data: works } = await supabase
      .from('works')
      .select('id, updated_at')
      .eq('privacy', 'Public')
      .eq('is_test', false)
      .order('updated_at', { ascending: false })
      .limit(50000)

    if (works) {
      workPages = works.map((work) => ({
        url: `${baseUrl}/work/${work.id}`,
        lastModified: new Date(work.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch {
    // Silently skip if works table is unavailable
  }

  return [...staticPages, ...hdsdSectionPages, ...hdsdArticlePages, ...workPages]
}
