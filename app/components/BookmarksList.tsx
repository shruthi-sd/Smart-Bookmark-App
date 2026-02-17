'use client'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
}

export default function BookmarksList({ initialBookmarks, userId }: { initialBookmarks: any[], userId: string }) {
  const [supabase] = useState(() => createClient())
  // Ensure we sort by created_at correctly even if realtime brings new stuff
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime_bookmarks')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookmarks',
          filter: `user_id=eq.${userId}` 
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Check if it already exists to avoid duplicates from optimistic update or race conditions
            const newBookmark = payload.new as Bookmark
            setBookmarks((prev) => {
              if (prev.some((b) => b.id === newBookmark.id)) return prev
              return [newBookmark, ...prev]
            })
          }
          if (payload.eventType === 'DELETE') {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !url || loading) return

    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in to add bookmarks')

      // Optimistic update using a temporary ID? 
      // Actually, standard Supabase pattern: insert -> let Realtime update logic handle it OR handle return data.
      // We will handle return data to be faster than realtime.
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({ 
          title, 
          url,
          user_id: user.id 
        })
        .select()
        .single()
      
      if (error) throw error

      if (data) {
        setBookmarks((prev) => {
          // If realtime arrived first, don't duplicate
          if (prev.some(b => b.id === data.id)) return prev
          return [data as Bookmark, ...prev]
        })
      }
      
      // Clear inputs
      setTitle('')
      setUrl('')
    } catch (error: any) {
      console.error('Error adding bookmark:', error)
      alert(`Failed to add bookmark: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    // Optimistic Delete
    const previousBookmarks = [...bookmarks]
    setBookmarks((prev) => prev.filter((b) => b.id !== id))

    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id)
      if (error) throw error
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      alert("Failed to delete bookmark")
      // Rollback
      setBookmarks(previousBookmarks)
    }
  }

  return (
    <div className="space-y-8 w-full mx-auto">
      {/* Add Form */}
      <div className="bg-gradient-to-br from-white to-orange-50/30 backdrop-blur-md border border-stone-200 rounded-2xl shadow-xl shadow-stone-900/5 p-8 transition-all hover:shadow-2xl hover:shadow-orange-500/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg shadow-orange-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">Add New Bookmark</h2>
            <p className="text-xs text-stone-400 mt-0.5">Save your favorite web pages instantly</p>
          </div>
        </div>
        
        <form onSubmit={handleAdd} className="flex gap-4 flex-col sm:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full"
              required
            />
          </div>
          <div className="flex-[2]">
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="glass-input w-full font-mono text-sm"
              required
            />
          </div>
          <button 
            type="submit" 
            className={`btn-primary h-[46px] flex items-center justify-center gap-2 min-w-[110px] font-semibold ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={!title || !url || loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Add</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {bookmarks.length === 0 ? (
          <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-stone-200">
            <div className="bg-gradient-to-br from-orange-100 to-rose-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-orange-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-700 mb-2">No bookmarks yet</h3>
            <p className="text-stone-400 text-sm max-w-md mx-auto">Start building your collection by adding your first bookmark above</p>
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <div 
              key={bookmark.id} 
              className="group relative bg-white border border-stone-200 rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-200 hover:-translate-y-0.5"
            >
              {/* Gradient accent on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50/0 via-orange-50/50 to-rose-50/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
              
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 shadow-lg shadow-orange-500/40"></div>
                    <a 
                      href={bookmark.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-bold text-lg text-stone-900 hover:text-orange-600 transition-colors truncate block group-hover:underline underline-offset-2"
                    >
                      {bookmark.title}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 ml-5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-stone-400 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    <p className="text-sm text-stone-400 font-mono truncate group-hover:text-stone-500 transition-colors">
                      {bookmark.url}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <a 
                    href={bookmark.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2.5 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all hover:scale-110 border border-transparent hover:border-orange-200"
                    title="Open Link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                  <button 
                    onClick={() => handleDelete(bookmark.id)}
                    className="p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all hover:scale-110 border border-transparent hover:border-rose-200"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}