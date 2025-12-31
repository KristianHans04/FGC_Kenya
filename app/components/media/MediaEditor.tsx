/**
 * @file components/media/MediaEditor.tsx
 * @description Media editor component for creating and editing articles
 * @author Team Kenya Dev
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { X, Save } from 'lucide-react'

interface MediaEditorProps {
  article?: any
  onClose: () => void
  onSave: (data: any) => void
}

export default function MediaEditor({ article, onClose, onSave }: MediaEditorProps) {
  const [title, setTitle] = useState(article?.title || '')
  const [content, setContent] = useState(article?.content || '')

  const handleSave = () => {
    onSave({ title, content })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{article ? 'Edit Article' : 'New Article'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                className="w-full min-h-[300px] p-3 border rounded-md"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}