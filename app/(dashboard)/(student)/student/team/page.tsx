'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { 
  Users,
  User,
  Star,
  Mail,
  Phone,
  School,
  Award,
  MessageSquare,
  Calendar,
  Target,
  Zap,
  Shield
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  phone: string
  school: string
  avatar?: string
  skills: string[]
  joinedAt: string
  contributions: number
  isLeader: boolean
  isOnline: boolean
}

interface TeamStats {
  totalMembers: number
  completedTasks: number
  pendingTasks: number
  teamScore: number
  ranking: number
  achievements: number
}

export default function StudentTeamPage() {
  
  useEffect(() => {
    document.title = 'My Team | FIRST Global Team Kenya'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Collaborate with your FIRST Global team')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Collaborate with your FIRST Global team'
      document.head.appendChild(meta)
    }
  }, [])


  const [team, setTeam] = useState<{
    id: string
    name: string
    motto: string
    members: TeamMember[]
    stats: TeamStats
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    try {
      const response = await fetch('/api/student/team')
      if (response.ok) {
        const data = await response.json()
        setTeam(data.data || null)
      }
    } catch (error) {
      console.error('Failed to fetch team:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data
  const mockTeam = {
    id: 'team1',
    name: 'Tech Innovators',
    motto: 'Innovation through collaboration',
    members: [
      {
        id: '1',
        name: 'Sarah Johnson',
        role: 'Team Captain',
        email: 'sarah.j@school.edu',
        phone: '+254 700 123456',
        school: 'Nairobi Academy',
        skills: ['Programming', 'Leadership', 'Design'],
        joinedAt: '2024-01-15',
        contributions: 45,
        isLeader: true,
        isOnline: true
      },
      {
        id: '2',
        name: 'James Mwangi',
        role: 'Lead Programmer',
        email: 'james.m@school.edu',
        phone: '+254 722 654321',
        school: 'Nairobi Academy',
        skills: ['Python', 'C++', 'Arduino'],
        joinedAt: '2024-01-15',
        contributions: 38,
        isLeader: false,
        isOnline: true
      },
      {
        id: '3',
        name: 'Mary Wanjiru',
        role: 'Mechanical Designer',
        email: 'mary.w@school.edu',
        phone: '+254 733 789012',
        school: 'Nairobi Academy',
        skills: ['CAD', 'Mechanics', '3D Printing'],
        joinedAt: '2024-01-20',
        contributions: 32,
        isLeader: false,
        isOnline: false
      },
      {
        id: '4',
        name: 'David Ochieng',
        role: 'Strategy & Documentation',
        email: 'david.o@school.edu',
        phone: '+254 744 456789',
        school: 'Nairobi Academy',
        skills: ['Research', 'Documentation', 'Presentation'],
        joinedAt: '2024-01-22',
        contributions: 28,
        isLeader: false,
        isOnline: false
      }
    ],
    stats: {
      totalMembers: 4,
      completedTasks: 23,
      pendingTasks: 7,
      teamScore: 850,
      ranking: 3,
      achievements: 12
    }
  }

  const displayTeam = team || mockTeam

  const getRoleIcon = (role: string) => {
    if (role.includes('Captain')) return <Shield className="h-4 w-4 text-yellow-600" />
    if (role.includes('Programmer')) return <Zap className="h-4 w-4 text-blue-600" />
    if (role.includes('Designer')) return <Target className="h-4 w-4 text-green-600" />
    return <Users className="h-4 w-4 text-gray-600" />
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Team Header */}
      <div className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">{displayTeam.name}</h1>
        <p className="text-muted-foreground italic">"{displayTeam.motto}"</p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4 text-center">
          <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <div className="text-2xl font-bold">{displayTeam?.stats?.totalMembers || 0}</div>
          <div className="text-xs text-muted-foreground">Members</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">#{displayTeam?.stats?.ranking || 0}</div>
          <div className="text-xs text-muted-foreground">Ranking</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{displayTeam?.stats?.teamScore || 0}</div>
          <div className="text-xs text-muted-foreground">Points</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{displayTeam?.stats?.achievements || 0}</div>
          <div className="text-xs text-muted-foreground">Achievements</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <Zap className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{displayTeam?.stats?.completedTasks || 0}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold">{displayTeam?.stats?.pendingTasks || 0}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
      </div>

      {/* Team Members */}
      <h2 className="text-xl font-semibold mb-4">Team Members</h2>
      
      {displayTeam.members && displayTeam.members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayTeam.members.map((member) => (
            <div 
              key={member.id} 
              className={`bg-card rounded-lg border p-6 hover:shadow-md transition-shadow ${
                member.isLeader ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {member.name}
                      {member.isLeader && <Shield className="h-4 w-4 text-yellow-600" />}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      {member.role}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/student/team/${member.id}`}
                  className="p-2 hover:bg-muted rounded-lg"
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <School className="h-4 w-4" />
                  <span>{member.school}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <p className="text-xs font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {member.skills && member.skills.length > 0 ? (
                    member.skills.map(skill => (
                      <span 
                        key={skill} 
                        className="px-2 py-1 bg-muted rounded-md text-xs"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No skills listed</span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="pt-4 border-t flex items-center justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Contributions: </span>
                  <span className="font-medium">{member.contributions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Joined: </span>
                  <span className="font-medium">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
        ))}
      </div>
      ) : (
        <div className="bg-card rounded-lg border p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">No team members yet</h3>
          <p className="text-sm text-muted-foreground">Team members will appear here once they join.</p>
        </div>
      )}

      {/* Team Actions */}
      <div className="mt-8 p-6 bg-card rounded-lg border">
        <h3 className="font-semibold mb-4">Team Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border rounded-lg hover:bg-muted text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <span className="text-sm">Schedule Meeting</span>
          </button>
          <button className="p-4 border rounded-lg hover:bg-muted text-center">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <span className="text-sm">Team Chat</span>
          </button>
          <button className="p-4 border rounded-lg hover:bg-muted text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <span className="text-sm">View Tasks</span>
          </button>
          <button className="p-4 border rounded-lg hover:bg-muted text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
            <span className="text-sm">Achievements</span>
          </button>
        </div>
      </div>
    </div>
  )
}
