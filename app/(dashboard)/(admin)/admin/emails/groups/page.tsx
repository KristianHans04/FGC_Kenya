'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  UserPlus,
  X,
  Check,
  ChevronRight,
  Mail,
  Calendar,
  MapPin,
  GraduationCap,
  Shield
} from 'lucide-react'

interface EmailGroup {
  id: string
  name: string
  description: string
  filters: {
    roles?: string[]
    cohorts?: string[]
    schools?: string[]
    years?: string[]
    gender?: string
    travelHistory?: boolean
    isActive?: boolean
  }
  memberCount: number
  createdAt: string
  updatedAt: string
}

interface GroupMember {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  school?: string
  year?: string
}

export default function EmailGroups() {
  const [groups, setGroups] = useState<EmailGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<EmailGroup | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingGroup, setEditingGroup] = useState<EmailGroup | null>(null)

  // Form state
  const [formData, setFormData] = useState<{
    name: string
    description: string
    filters: Partial<EmailGroup['filters']>
  }>({
    name: '',
    description: '',
    filters: {
      roles: [],
      cohorts: [],
      schools: [],
      years: [],
      gender: '',
      travelHistory: undefined,
      isActive: true
    }
  })

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup.id)
    }
  }, [selectedGroup])

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/emails/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.data?.groups || [])
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroupMembers = async (groupId: string) => {
    try {
      const response = await fetch(`/api/admin/emails/groups/${groupId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.data?.members || [])
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  const handleCreateGroup = async () => {
    try {
      const response = await fetch('/api/admin/emails/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        fetchGroups()
        setShowCreateModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }

  const handleUpdateGroup = async () => {
    if (!editingGroup) return

    try {
      const response = await fetch(`/api/admin/emails/groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        fetchGroups()
        setEditingGroup(null)
        resetForm()
      }
    } catch (error) {
      console.error('Failed to update group:', error)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      const response = await fetch(`/api/admin/emails/groups/${groupId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchGroups()
        if (selectedGroup?.id === groupId) {
          setSelectedGroup(null)
          setMembers([])
        }
      }
    } catch (error) {
      console.error('Failed to delete group:', error)
    }
  }

  const handleSendEmailToGroup = (group: EmailGroup) => {
    // Navigate to compose with group pre-selected
    window.location.href = `/admin/emails/compose?group=${group.id}`
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      filters: {
        roles: [],
        cohorts: [],
        schools: [],
        years: [],
        gender: '',
        travelHistory: undefined,
        isActive: true
      }
    })
  }

  const startEdit = (group: EmailGroup) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description,
      filters: group.filters
    })
  }

  // Available options for filters
  const availableRoles = ['USER', 'STUDENT', 'MENTOR', 'ALUMNI', 'ADMIN', 'SUPER_ADMIN']
  const availableCohorts = ['FGC2023', 'FGC2024', 'FGC2025', 'FGC2026']
  const availableYears = ['2023', '2024', '2025', '2026']
  const availableSchools = [
    'Nairobi School',
    'Alliance High School',
    'Kenya High School',
    'Starehe Boys Centre',
    'Precious Blood Riruta'
  ]

  const FilterTag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
      {label}
      <button onClick={onRemove} className="hover:text-destructive">
        <X className="h-3 w-3" />
      </button>
    </span>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Groups</h1>
          <p className="text-muted-foreground">Create fine-grained email groups for targeted communication</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Groups</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                </div>
              ) : groups.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>No groups created yet</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedGroup?.id === group.id ? 'bg-muted/50' : ''
                    }`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {group.memberCount} members
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(group.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Group Details */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-semibold text-lg">{selectedGroup.name}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendEmailToGroup(selectedGroup)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm flex items-center gap-2"
                  >
                    <Mail className="h-3 w-3" />
                    Send Email
                  </button>
                  <button
                    onClick={() => startEdit(selectedGroup)}
                    className="p-1.5 hover:bg-muted rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(selectedGroup.id)}
                    className="p-1.5 hover:bg-muted rounded text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 border-b">
                <p className="text-sm text-muted-foreground mb-3">{selectedGroup.description}</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Active Filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGroup.filters.roles?.map(role => (
                      <FilterTag key={role} label={`Role: ${role}`} onRemove={() => {}} />
                    ))}
                    {selectedGroup.filters.cohorts?.map(cohort => (
                      <FilterTag key={cohort} label={`Cohort: ${cohort}`} onRemove={() => {}} />
                    ))}
                    {selectedGroup.filters.schools?.map(school => (
                      <FilterTag key={school} label={`School: ${school}`} onRemove={() => {}} />
                    ))}
                    {selectedGroup.filters.years?.map(year => (
                      <FilterTag key={year} label={`Year: ${year}`} onRemove={() => {}} />
                    ))}
                    {selectedGroup.filters.gender && (
                      <FilterTag label={`Gender: ${selectedGroup.filters.gender}`} onRemove={() => {}} />
                    )}
                    {selectedGroup.filters.travelHistory !== undefined && (
                      <FilterTag 
                        label={`Travel History: ${selectedGroup.filters.travelHistory ? 'Yes' : 'No'}`} 
                        onRemove={() => {}} 
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Members ({members.length})</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      className="pl-9 pr-3 py-1.5 border rounded text-sm"
                    />
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="text-sm text-muted-foreground border-b">
                      <tr>
                        <th className="text-left pb-2">Name</th>
                        <th className="text-left pb-2">Email</th>
                        <th className="text-left pb-2">Role</th>
                        <th className="text-left pb-2">School</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {members.map((member) => (
                        <tr key={member.id} className="border-b">
                          <td className="py-2">
                            {member.firstName || member.lastName
                              ? `${member.firstName || ''} ${member.lastName || ''}`.trim()
                              : 'N/A'}
                          </td>
                          <td className="py-2">{member.email}</td>
                          <td className="py-2">
                            <span className="px-2 py-0.5 bg-muted rounded text-xs">
                              {member.role}
                            </span>
                          </td>
                          <td className="py-2">{member.school || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg border p-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3" />
              <p>Select a group to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Group Modal */}
      {(showCreateModal || editingGroup) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-card rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingGroup ? 'Edit Group' : 'Create Email Group'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Female Students FGC2023 Travelers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Describe the purpose of this group..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        const roles = formData.filters.roles || []
                        if (roles.includes(role)) {
                          setFormData({
                            ...formData,
                            filters: {
                              ...formData.filters,
                              roles: roles.filter(r => r !== role)
                            }
                          })
                        } else {
                          setFormData({
                            ...formData,
                            filters: {
                              ...formData.filters,
                              roles: [...roles, role]
                            }
                          })
                        }
                      }}
                      className={`px-3 py-1 rounded border ${
                        formData.filters.roles?.includes(role)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cohorts</label>
                <div className="flex flex-wrap gap-2">
                  {availableCohorts.map(cohort => (
                    <button
                      key={cohort}
                      onClick={() => {
                        const cohorts = formData.filters.cohorts || []
                        if (cohorts.includes(cohort)) {
                          setFormData({
                            ...formData,
                            filters: {
                              ...formData.filters,
                              cohorts: cohorts.filter(c => c !== cohort)
                            }
                          })
                        } else {
                          setFormData({
                            ...formData,
                            filters: {
                              ...formData.filters,
                              cohorts: [...cohorts, cohort]
                            }
                          })
                        }
                      }}
                      className={`px-3 py-1 rounded border ${
                        formData.filters.cohorts?.includes(cohort)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {cohort}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      filters: { ...formData.filters, gender: 'male' }
                    })}
                    className={`px-3 py-1 rounded border ${
                      formData.filters.gender === 'male'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      filters: { ...formData.filters, gender: 'female' }
                    })}
                    className={`px-3 py-1 rounded border ${
                      formData.filters.gender === 'female'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    Female
                  </button>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      filters: { ...formData.filters, gender: '' }
                    })}
                    className={`px-3 py-1 rounded border ${
                      !formData.filters.gender
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    Any
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Travel History</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      filters: { ...formData.filters, travelHistory: true }
                    })}
                    className={`px-3 py-1 rounded border ${
                      formData.filters.travelHistory === true
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    Has Traveled
                  </button>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      filters: { ...formData.filters, travelHistory: false }
                    })}
                    className={`px-3 py-1 rounded border ${
                      formData.filters.travelHistory === false
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    Never Traveled
                  </button>
                  <button
                    onClick={() => setFormData({
                      ...formData,
                      filters: { ...formData.filters, travelHistory: undefined }
                    })}
                    className={`px-3 py-1 rounded border ${
                      formData.filters.travelHistory === undefined
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    Any
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingGroup(null)
                  resetForm()
                }}
                className="px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
              >
                {editingGroup ? 'Update Group' : 'Create Group'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
