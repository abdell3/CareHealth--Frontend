import * as React from 'react'
import { X, Plus, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/libs/utils'

interface TagManagerProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  suggestions?: string[]
  maxTags?: number
  className?: string
}

export const TagManager: React.FC<TagManagerProps> = ({
  tags,
  onTagsChange,
  suggestions = [],
  maxTags = 10,
  className,
}) => {
  const [inputValue, setInputValue] = React.useState('')
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  const filteredSuggestions = React.useMemo(() => {
    if (!inputValue) return suggestions.filter((s) => !tags.includes(s))
    return suggestions
      .filter((s) => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s))
      .slice(0, 5)
  }, [inputValue, suggestions, tags])

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag])
      setInputValue('')
      setShowSuggestions(false)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      handleAddTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1])
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700">Tags</label>
      <div className="relative">
        <div className="flex flex-wrap gap-2 rounded-lg border border-input bg-background p-2 min-h-[42px]">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {tags.length < maxTags && (
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setShowSuggestions(true)
              }}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Ajouter un tag..."
              className="h-8 min-w-[120px] flex-1 border-0 p-0 focus-visible:ring-0"
            />
          )}
        </div>

        {/* Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border bg-white shadow-lg">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                onClick={() => handleAddTag(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500">
        {tags.length}/{maxTags} tags • Appuyez sur Entrée pour ajouter
      </p>
    </div>
  )
}

