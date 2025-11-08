import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Tag } from 'lucide-react'
import { getAllStories, getStoryByIdentifier, getSimilarStories, formatDate, formatRelativeDate, ContentBlock } from '@/app/lib/media'
import ShareButton from '@/app/components/ShareButton'

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const stories = getAllStories()
  return stories.map(story => ({
    slug: story.slug,
  }))
}

/**
 * Render individual content blocks with appropriate styling
 */
function renderContentBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={index} className="text-lg leading-relaxed mb-6 text-foreground">
          {block.text}
        </p>
      )
    
    case 'heading':
      return (
        <h2 key={index} className="text-2xl md:text-3xl font-bold font-heading mt-8 mb-4 text-foreground">
          {block.text}
        </h2>
      )
    
    case 'image':
      return (
        <figure key={index} className="my-8">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            <span className="text-muted-foreground">Story Image</span>
          </div>
          {block.caption && (
            <figcaption className="text-sm text-muted-foreground text-center mt-2 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )
    
    case 'blockquote':
      return (
        <blockquote key={index} className="border-l-4 border-primary pl-6 py-4 my-6 bg-muted/30 rounded-r-lg">
          <p className="text-lg italic text-foreground mb-2">
            "{block.text}"
          </p>
          {block.author && (
            <cite className="text-sm text-muted-foreground not-italic">
              — {block.author}
            </cite>
          )}
        </blockquote>
      )
    
    default:
      return null
  }
}

/**
 * Story detail page displaying full content with reading time and similar stories
 */
export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const story = getStoryByIdentifier(resolvedParams.slug)

  if (!story) {
    notFound()
  }

  const similarStories = getSimilarStories(story, 3)

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 african-pattern opacity-5"></div>
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <div className="mb-6">
              <Link
                href="/media"
                className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Media
              </Link>
            </div>

            {/* Category and metadata */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {story.category}
              </span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={story.publishedDate}>
                  {formatDate(story.publishedDate)}
                </time>
                <span className="mx-2">•</span>
                <span>{formatRelativeDate(story.publishedDate)}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{story.readTimeMinutes} min read</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-foreground">
              {story.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {story.excerpt}
            </p>

            {/* Author info */}
            <div className="flex items-start gap-4 p-6 bg-muted/30 rounded-lg mb-8">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground mb-1">{story.author}</div>
                <div className="text-sm text-muted-foreground">{story.authorBio}</div>
              </div>
            </div>

            {/* Tags */}
            {story.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {story.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-3 py-1 bg-background border border-border text-sm rounded-full"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container px-4 sm:px-6 lg:px-8">
          <article className="max-w-4xl mx-auto">
            {story.content.map((block, index) => renderContentBlock(block, index))}
          </article>

          {/* Share section */}
          <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Last updated: {formatDate(story.updatedDate)}
              </div>
              <ShareButton title={story.title} text={story.excerpt} />
            </div>
          </div>
        </div>
      </section>

      {/* Similar Stories Section */}
      {similarStories.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold font-heading mb-8">
                Related <span className="text-primary">Stories</span>
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarStories.map((relatedStory) => (
                  <article
                    key={relatedStory.id}
                    className="card hover:shadow-xl transition-shadow group"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Story Image</span>
                    </div>

                    {/* Category */}
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md mb-3">
                      {relatedStory.category}
                    </span>

                    {/* Title */}
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/media/${relatedStory.slug}`}>
                        {relatedStory.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {relatedStory.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{relatedStory.readTimeMinutes} min</span>
                      </div>
                      <Link
                        href={`/media/${relatedStory.slug}`}
                        className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Read
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center card bg-gradient-to-br from-primary/10 to-secondary/10">
            <h2 className="text-2xl font-bold mb-4">
              Want to Learn More About Team Kenya?
            </h2>
            <p className="text-muted-foreground mb-6">
              Explore our journey, meet our team, and discover how you can be part of Kenya's STEM revolution
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/about" className="btn-primary">
                About Us
              </Link>
              <Link href="/media" className="btn-secondary">
                More Stories
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
