import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BookmarksList from '@/app/components/BookmarksList'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch initial data server-side
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-orange-50/50 via-white to-rose-50/50">
      {/* Header */}
      <header className="w-full sticky                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  top-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-stone-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-rose-400 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all duration-300 group-hover:scale-105">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-stone-900 via-stone-700 to-stone-900 bg-clip-text text-transparent">
                Smart Bookmarks
              </span>
              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Your Digital Library</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group/profile cursor-default">
              {user.user_metadata?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-9 h-9 rounded-full border-2 border-orange-100 shadow-sm"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-sm font-bold text-white uppercase shadow-md">
                  {user.email?.[0]}
                </div>
              )}
              <div className="flex flex-col hidden sm:flex">
                <span className="text-sm font-semibold text-stone-800 leading-none group-hover/profile:text-orange-600 transition-colors">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse"></div>
                  <span className="text-[10px] text-emerald-600 font-semibold leading-none uppercase tracking-wide">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <form action="/auth/logout" method="post">
              <button className="p-2.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 group relative border border-transparent hover:border-rose-200" title="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 mt-12 mb-8">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-orange-200/30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-rose-200/30 rounded-full blur-3xl"></div>
          
          <div className="relative text-center space-y-4 py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 shadow-sm mb-2">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
              <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                {bookmarks?.length || 0} Saved Link{bookmarks?.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-stone-900 via-stone-700 to-stone-900 bg-clip-text text-transparent">
                Your Collection
              </span>
            </h1>
            
            <p className="text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed">
              Organize, manage, and access all your favorite links in one beautiful place. 
              <span className="text-orange-600 font-medium"> Never lose a bookmark again.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <BookmarksList initialBookmarks={bookmarks ?? []} userId={user.id} />
      </div>
    </main>
  )
}