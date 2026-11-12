
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

function MessagesShortcut() {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    let channel

    async function loadUnread() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .neq('sender_id', user.id)
        .is('read_at', null)

      if (!error) setUnread(count || 0)
    }

    loadUnread()

    channel = supabase
      .channel('dashboard-message-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        loadUnread
      )
      .subscribe()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  return (
    <Link
      to="/messages"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-violet-600 px-5 py-4 text-white shadow-xl hover:bg-violet-700"
    >
      <MessageCircle size={22} />
      <span className="font-semibold">Messages</span>

      {unread > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold">
          {unread}
        </span>
      )}
    </Link>
  )
}

export default MessagesShortcut
