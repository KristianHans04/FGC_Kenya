/**
 * Alumni Dashboard - Network and Mentorship
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Briefcase,
  Award,
  Calendar,
  MessageSquare,
  MapPin,
  Building,
  GraduationCap,
  Linkedin,
  Twitter,
  Globe,
  Mail,
  Phone,
  Star,
  TrendingUp,
  UserPlus,
  Heart,
  Share2
} from 'lucide-react'
import { useAuth } from '@/app/lib/contexts/AuthContext'
import Link from 'next/link'

interface AlumniMember {
  id: string
  email: string
  firstName?: string
  lastName?: string
  cohort: string
  currentRole?: string
  company?: string
  location?: string
  bio?: string
  expertise: string[]
  social: {
    linkedin?: string
    twitter?: string
    website?: string
  }
  availableForMentorship: boolean
  profilePicture?: string
}

interface SuccessStory {
  id: string
  title: string
  excerpt: string
  author: {
    name: string
    cohort: string
    profilePicture?: string
  }
  publishedAt: string
  likes: number
  shares: number
}

interface MentorshipRequest {
  id: string
  student: {
    name: string
    email: string
    cohort: string
  }
  topic: string
  message: string
  status: 'pending' | 'accepted' | 'declined'
  requestedAt: string
}

interface AlumniEvent {
  id: string
  title: string
  description: string
  date: string
  location: string
  type: 'networking' | 'workshop' | 'reunion' | 'webinar'
  attendees: number
  isRegistered: boolean
}

export default function AlumniDashboard() {
  const { user } = useAuth()
  const [alumniNetwork, setAlumniNetwork] = useState<AlumniMember[]>([])
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([])
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([])
  const [events, setEvents] = useState<AlumniEvent[]>([])
  const [stats, setStats] = useState({
    networkSize: 0,
    activeMentors: 0,
    successStories: 0,
    upcomingEvents: 0,
    mentorshipSessions: 0,
    connectionsThisMonth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlumniData()
  }, [])

  const fetchAlumniData = async () => {
    setLoading(true)
    try {
      // Fetch alumni network
      const networkResponse = await fetch('/api/alumni/network')
      if (networkResponse.ok) {
        const networkData = await networkResponse.json()
        setAlumniNetwork(networkData.data?.alumni || [])
      }

      // Fetch success stories
      const storiesResponse = await fetch('/api/alumni/stories')
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json()
        setSuccessStories(storiesData.data?.stories || [])
      }

      // Fetch mentorship requests
      const mentorshipResponse = await fetch('/api/alumni/mentorship/requests')
      if (mentorshipResponse.ok) {
        const mentorshipData = await mentorshipResponse.json()
        setMentorshipRequests(mentorshipData.data?.requests || [])
      }

      // Fetch alumni events
      const eventsResponse = await fetch('/api/alumni/events')
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData.data?.events || [])
      }

      // Calculate stats
      setStats({
        networkSize: alumniNetwork.length,
        activeMentors: alumniNetwork.filter(a => a.availableForMentorship).length,
        successStories: successStories.length,
        upcomingEvents: events.filter(e => new Date(e.date) > new Date()).length,
        mentorshipSessions: mentorshipRequests.filter(r => r.status === 'accepted').length,
        connectionsThisMonth: Math.floor(Math.random() * 10) + 5 // Mock data
      })
    } catch (error) {
      console.error('Failed to fetch alumni data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptMentorship = async (requestId: string) => {
    try {
      await fetch(`/api/alumni/mentorship/requests/${requestId}/accept`, {
        method: 'PUT'
      })
      fetchAlumniData()
    } catch (error) {
      console.error('Failed to accept mentorship:', error)
    }
  }

  const handleDeclineMentorship = async (requestId: string) => {
    try {
      await fetch(`/api/alumni/mentorship/requests/${requestId}/decline`, {
        method: 'PUT'
      })
      fetchAlumniData()
    } catch (error) {
      console.error('Failed to decline mentorship:', error)
    }
  }

  const handleRegisterEvent = async (eventId: string) => {
    try {
      await fetch(`/api/alumni/events/${eventId}/register`, {
        method: 'POST'
      })
      fetchAlumniData()
    } catch (error) {
      console.error('Failed to register for event:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alumni Network</h1>
          <p className="text-muted-foreground">
            Welcome back to the FGC Kenya family
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/alumni/profile/edit"
            className="px-4 py-2 border rounded-lg hover:bg-muted"
          >
            Update Profile
          </Link>
          <Link
            href="/alumni/stories/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Share Your Story
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alumni Network */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Alumni Directory</h2>
              <Link
                href="/alumni/network"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {alumniNetwork.slice(0, 5).map((member) => (
                <div key={member.id} className="p-4 hover:bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">
                        {member.firstName?.[0] || member.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {member.currentRole} {member.company && `at ${member.company}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.cohort} • {member.location}
                          </p>
                        </div>
                        {member.availableForMentorship && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            Available for Mentorship
                          </span>
                        )}
                      </div>
                      
                      {member.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.expertise.slice(0, 3).map((skill) => (
                            <span key={skill} className="px-2 py-0.5 bg-muted rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mt-2">
                        {member.social.linkedin && (
                          <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                        {member.social.twitter && (
                          <a href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                        <Link
                          href={`/alumni/network/${member.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Success Stories</h2>
              <Link
                href="/alumni/stories"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {successStories.slice(0, 4).map((story) => (
                <div key={story.id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">{story.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {story.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span>{story.author.name}</span>
                    <span>•</span>
                    <span>{story.author.cohort}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 text-sm">
                      <button className="flex items-center gap-1 hover:text-primary">
                        <Heart className="h-3 w-3" />
                        {story.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary">
                        <Share2 className="h-3 w-3" />
                        {story.shares}
                      </button>
                    </div>
                    <Link
                      href={`/alumni/stories/${story.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Mentorship Requests */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Mentorship Requests</h2>
            </div>
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {mentorshipRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No pending requests</p>
                </div>
              ) : (
                mentorshipRequests
                  .filter(r => r.status === 'pending')
                  .map((request) => (
                    <div key={request.id} className="p-4">
                      <div className="mb-2">
                        <p className="font-medium text-sm">{request.student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.student.cohort} • {request.topic}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {request.message}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptMentorship(request.id)}
                          className="flex-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineMentorship(request.id)}
                          className="flex-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Alumni Events</h2>
              <Link
                href="/alumni/events"
                className="text-sm text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {events
                .filter(e => new Date(e.date) > new Date())
                .slice(0, 3)
                .map((event) => (
                  <div key={event.id} className="border rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        event.type === 'networking' ? 'bg-blue-100 text-blue-800' :
                        event.type === 'workshop' ? 'bg-green-100 text-green-800' :
                        event.type === 'reunion' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.attendees} attending
                      </div>
                    </div>
                    {event.isRegistered ? (
                      <button className="w-full px-3 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Registered
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegisterEvent(event.id)}
                        className="w-full px-3 py-1 bg-primary text-primary-foreground rounded text-xs"
                      >
                        Register
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-lg border p-4">
            <h2 className="font-semibold mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/alumni/mentorship/offer"
                className="flex items-center gap-2 p-2 rounded hover:bg-muted"
              >
                <Briefcase className="h-4 w-4" />
                <span className="text-sm">Offer Mentorship</span>
              </Link>
              <Link
                href="/alumni/jobs/post"
                className="flex items-center gap-2 p-2 rounded hover:bg-muted"
              >
                <Building className="h-4 w-4" />
                <span className="text-sm">Post Job Opportunity</span>
              </Link>
              <Link
                href="/alumni/donate"
                className="flex items-center gap-2 p-2 rounded hover:bg-muted"
              >
                <Heart className="h-4 w-4" />
                <span className="text-sm">Support Program</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}