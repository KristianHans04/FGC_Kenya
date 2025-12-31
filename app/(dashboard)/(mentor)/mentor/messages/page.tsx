'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare,
  Send,
  Search,
  User,
  Users,
  Clock,
  Star,
  Archive,
  Trash2,
  Paperclip,
  Filter,
  ChevronRight
} from 'lucide-react'

interface Message {
  id: string
  subject: string
  body: string
  senderId: string
  senderName: string
  senderRole: string
  recipientId: string
  recipientName: string
  sentAt: string
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  threadId?: string
  attachments?: Array<{
    name: string
    url: string
  }>
}

interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantRole: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
}

export default function MentorMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'starred' | 'archived'>('all')
  const [newMessage, setNewMessage] = useState('')
  const [showCompose, setShowCompose] = useState(false)

  useEffect(() => {
    fetchMessages()
    fetchConversations()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/mentor/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data.data?.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/mentor/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data.data?.conversations || [])
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  }

  // Mock data
  const mockConversations: Conversation[] = [
    {
      id: '1',
      participantId: 'student1',
      participantName: 'Sarah Johnson',
      participantRole: 'Student',
      lastMessage: 'Thank you for the feedback on my project!',
      lastMessageTime: '10:30 AM',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      participantId: 'student2',
      participantName: 'James Mwangi',
      participantRole: 'Student',
      lastMessage: 'Can we schedule a one-on-one session?',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '3',
      participantId: 'admin1',
      participantName: 'Admin Team',
      participantRole: 'Admin',
      lastMessage: 'Updated training materials are available',
      lastMessageTime: '3 days ago',
      unreadCount: 0,
      isOnline: true
    }
  ]

  const mockMessages: Message[] = [
    {
      id: '1',
      subject: 'Project Feedback',
      body: 'Hi, thank you for the detailed feedback on my robotics project. I have implemented the changes you suggested.',
      senderId: 'student1',
      senderName: 'Sarah Johnson',
      senderRole: 'Student',
      recipientId: 'mentor1',
      recipientName: 'You',
      sentAt: '2024-03-15T10:30:00',
      isRead: false,
      isStarred: false,
      isArchived: false
    },
    {
      id: '2',
      subject: 'Re: Programming Question',
      body: 'I understand the concept now. The example code you shared was very helpful.',
      senderId: 'student1',
      senderName: 'Sarah Johnson',
      senderRole: 'Student',
      recipientId: 'mentor1',
      recipientName: 'You',
      sentAt: '2024-03-15T09:15:00',
      isRead: false,
      isStarred: true,
      isArchived: false
    }
  ]

  const displayConversations = conversations.length > 0 ? conversations : mockConversations
  const displayMessages = messages.length > 0 ? messages : mockMessages

  const filteredConversations = displayConversations.filter(conv => {
    const matchesSearch = searchTerm === '' ||
      conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      await fetch('/api/mentor/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedConversation.participantId,
          subject: 'Direct Message',
          body: newMessage
        })
      })
      setNewMessage('')
      fetchMessages()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations List */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold mb-4">Messages</h1>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex gap-2 text-sm">
            {(['all', 'unread', 'starred'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg capitalize ${
                  filterType === type 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No conversations</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 hover:bg-muted/50 border-b text-left transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      {conv.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{conv.participantName}</div>
                      <div className="text-xs text-muted-foreground">{conv.participantRole}</div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{conv.lastMessageTime}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate mb-1">
                  {conv.lastMessage}
                </p>
                {conv.unreadCount > 0 && (
                  <span className="inline-block px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={() => setShowCompose(true)}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            New Message
          </button>
        </div>
      </div>

      {/* Message Thread */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">{selectedConversation.participantName}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.participantRole} • 
                  {selectedConversation.isOnline ? ' Online' : ' Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded">
                <Star className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-muted rounded">
                <Archive className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-muted rounded text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {displayMessages
              .filter(msg => 
                msg.senderId === selectedConversation.participantId ||
                msg.recipientId === selectedConversation.participantId
              )
              .map(message => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === 'mentor1' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div className={`max-w-[70%] p-3 rounded-lg ${
                    message.senderId === 'mentor1'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.body}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === 'mentor1'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}>
                      {new Date(message.sentAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <button className="p-2 hover:bg-muted rounded">
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage()
                }}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4" />
            <p>Select a conversation to view messages</p>
          </div>
        </div>
      )}
    </div>
  )
}