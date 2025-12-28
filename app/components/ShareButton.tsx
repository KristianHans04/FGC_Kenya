'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Share2, X } from 'lucide-react'

/**
 * ShareButton component for social media sharing
 * Opens a modal with sharing options for various platforms
 * 
 * @param {string} title - Content title to share
 * @param {string} text - Content description to share
 * @returns {JSX.Element} The share button component
 */
export default function ShareButton({ title, text }: { title: string; text: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const shareMessage = `I really think you should read this: ${title}`
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  const shareLinks = [
    {
      name: 'LinkedIn',
      icon: '/images/SVG/linkedin.svg',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      color: 'hover:bg-[#0077B5]/10'
    },
    {
      name: 'X (Twitter)',
      icon: '/images/SVG/x-twitter.svg',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(currentUrl)}`,
      color: 'hover:bg-black/10 dark:hover:bg-white/10'
    },
    {
      name: 'WhatsApp',
      icon: '/images/SVG/whatsapp.svg',
      url: `https://wa.me/?text=${encodeURIComponent(shareMessage + ' ' + currentUrl)}`,
      color: 'hover:bg-[#25D366]/10'
    },
    {
      name: 'Instagram',
      icon: '/images/SVG/instagram.svg',
      info: 'Instagram stories - copy link to share',
      copyLink: true,
      color: 'hover:bg-[#E4405F]/10'
    },
    {
      name: 'Substack',
      icon: '/images/SVG/substack.svg',
      url: `https://substack.com/inbox?utm_source=share&text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(currentUrl)}`,
      color: 'hover:bg-[#FF6719]/10'
    }
  ]

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl)
        alert('Link copied! You can now share it on Instagram or anywhere else.')
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = currentUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand('copy')
          alert('Link copied! You can now share it on Instagram or anywhere else.')
        } catch (err) {
          console.error('Failed to copy:', err)
          alert('Could not copy link. Please copy manually: ' + currentUrl)
        }
        document.body.removeChild(textArea)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Could not copy link. Please copy manually: ' + currentUrl)
    }
  }

  const handleShare = (link: typeof shareLinks[0]) => {
    if (link.copyLink) {
      handleCopyLink()
    } else if (link.url) {
      window.open(link.url, '_blank', 'width=600,height=600')
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-primary/20 hover:text-primary rounded-lg transition-all duration-200 cursor-pointer"
        aria-label="Share this story"
      >
        <Share2 className="h-4 w-4" />
        <span className="text-sm font-medium">Share</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share Menu - Mobile Responsive */}
          <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 bottom-4 md:bottom-auto md:top-full mt-0 md:mt-2 w-auto md:w-72 max-w-sm bg-background border border-border rounded-lg shadow-2xl z-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Share this story</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded cursor-pointer"
                aria-label="Close share menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {shareLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleShare(link)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer ${link.color}`}
                  title={link.info}
                >
                  <div className="w-6 h-6 flex-shrink-0 relative">
                    <Image
                      src={link.icon}
                      alt={`${link.name} icon`}
                      width={24}
                      height={24}
                      className={`object-contain ${link.name === 'X (Twitter)' ? 'dark:invert' : ''}`}
                    />
                  </div>
                  <div className="flex-grow text-left">
                    <div className="text-sm font-medium">{link.name}</div>
                    {link.info && (
                      <div className="text-xs text-muted-foreground">{link.info}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <button
                onClick={handleCopyLink}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-2 hover:bg-muted rounded cursor-pointer"
              >
                Copy Link
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
