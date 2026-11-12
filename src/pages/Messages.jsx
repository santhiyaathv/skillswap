
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Sparkles, Send, ArrowLeft, MessageCircle, RefreshCw
} from 'lucide-react'

export default function Messages() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [requests, setRequests] = useState([])
  const [skills, setSkills] = useState([])
  const [profiles, setProfiles] = useState({})
  const [selected, setSelected] = useState('')
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function initialize() {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        navigate('/login')
        return
      }

      setUser(data.user)

      const [requestResult, skillResult] = await Promise.all([
        supabase.from('swap_requests')
          .select('*')
          .eq('status', 'accepted')
          .order('created_at', { ascending: false }),

        supabase.from('skills').select('*')
      ])

      if (requestResult.error) setError(requestResult.error.message)
      if (skillResult.error) setError(skillResult.error.message)

      const accepted = (requestResult.data || []).filter(request =>
        request.requester_id === data.user.id ||
        request.receiver_id === data.user.id
      )

      setRequests(accepted)
      setSkills(skillResult.data || [])

      const partnerIds = [...new Set(
        accepted.map(request =>
          request.requester_id === data.user.id
            ? request.receiver_id
            : request.requester_id
        )
      )]

      if (partnerIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', partnerIds)

        if (profileError) {
          setError(profileError.message)
        } else {
          const profileMap = {}

          ;(profileData || []).forEach(profile => {
            profileMap[profile.id] = profile.full_name
          })

          setProfiles(profileMap)
        }
      }

      if (accepted.length > 0) {
        setSelected(accepted[0].id)
      }

      setLoading(false)
    }

    initialize()
  }, [navigate])

  const loadMessages = useCallback(async (requestId) => {
    if (!requestId || !user) return

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
      return
    }

    const currentMessages = data || []

    const unreadIds = currentMessages
      .filter(message =>
        message.sender_id !== user.id && !message.read_at
      )
      .map(message => message.id)

    if (unreadIds.length > 0) {
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds)

      if (updateError) {
        setError(updateError.message)
      } else {
        unreadIds.forEach(id => {
          const message = currentMessages.find(item => item.id === id)
          if (message) message.read_at = new Date().toISOString()
        })
      }
    }

    setMessages(currentMessages)
  }, [user])

  useEffect(() => {
    if (!selected || !user) return

    loadMessages(selected)

    const channel = supabase
      .channel(`messages-${selected}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `request_id=eq.${selected}`
        },
        () => loadMessages(selected)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selected, user, loadMessages])

  async function sendMessage(e) {
    e.preventDefault()

    if (!content.trim() || !selected || !user || sending) return

    setSending(true)
    setError('')

    const { error } = await supabase.from('messages').insert({
      request_id: selected,
      sender_id: user.id,
      content: content.trim()
    })

    if (error) {
      setError(error.message)
    } else {
      setContent('')
      await loadMessages(selected)
    }

    setSending(false)
  }

  function skillName(id) {
    return skills.find(skill => skill.id === id)?.name || 'Skill'
  }

  function partnerName(request) {
    if (!user) return 'SkillSwap member'

    const partnerId = request.requester_id === user.id
      ? request.receiver_id
      : request.requester_id

    return profiles[partnerId] || 'SkillSwap member'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9ff]">
        Loading messages...
      </div>
    )
  }

  const activeRequest = requests.find(item => item.id === selected)

  return (
    <div className="min-h-screen bg-[#faf9ff]">
      <header className="bg-white border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <span className="bg-violet-600 text-white p-2 rounded-xl">
              <Sparkles size={21} />
            </span>
            <span className="text-2xl font-bold text-violet-950">
              SkillSwap
            </span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-violet-700 font-semibold"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Messages
        </h1>

        <p className="text-gray-500 mt-2 mb-7">
          Communicate with your accepted skill exchange partners.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-5">
            {error}
          </div>
        )}

        <div className="bg-white border border-violet-100 rounded-2xl overflow-hidden grid md:grid-cols-[300px_1fr] min-h-[550px]">
          <aside className="border-r border-violet-100 p-4">
            <h2 className="font-bold mb-4">Conversations</h2>

            {requests.map(request => (
              <button
                key={request.id}
                onClick={() => setSelected(request.id)}
                className={`w-full text-left p-4 rounded-xl mb-2 ${
                  selected === request.id
                    ? 'bg-violet-100 text-violet-900'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle size={19} />
                  <span className="font-semibold">
                    {partnerName(request)}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {skillName(request.offered_skill_id)} ↔ {skillName(request.requested_skill_id)}
                </p>
              </button>
            ))}

            {requests.length === 0 && (
              <p className="text-sm text-gray-500">
                No accepted skill exchanges yet. Accept a swap request to start messaging.
              </p>
            )}
          </aside>

          <section className="flex flex-col min-w-0">
            {activeRequest ? (
              <>
                <div className="border-b border-violet-100 p-5 flex justify-between items-center">
                  <div>
                    <h2 className="font-bold">
                      {partnerName(activeRequest)}
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                      {skillName(activeRequest.offered_skill_id)} ↔ {skillName(activeRequest.requested_skill_id)}
                    </p>
                  </div>

                  <button
                    onClick={() => loadMessages(selected)}
                    className="text-violet-600 p-2"
                    title="Refresh messages"
                  >
                    <RefreshCw size={19} />
                  </button>
                </div>

                <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[420px]">
                  {messages.map(message => {
                    const mine = message.sender_id === user.id

                    return (
                      <div
                        key={message.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          mine
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="break-words">{message.content}</p>

                          <p className={`text-[10px] mt-2 ${
                            mine ? 'text-violet-200' : 'text-gray-400'
                          }`}>
                            {new Date(message.created_at).toLocaleString()}
                          </p>

                          {mine && message.read_at && (
                            <p className="text-[10px] text-violet-200 mt-1">
                              Read
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 py-20">
                      <MessageCircle size={35} className="mx-auto mb-3" />
                      Start your conversation!
                    </div>
                  )}
                </div>

                <form
                  onSubmit={sendMessage}
                  className="border-t border-violet-100 p-4 flex gap-3"
                >
                  <input
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 min-w-0 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-400"
                  />

                  <button
                    type="submit"
                    disabled={sending || !content.trim()}
                    className="bg-violet-600 text-white px-5 rounded-xl disabled:opacity-50"
                  >
                    <Send size={19} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <MessageCircle size={45} className="mb-4" />
                <p>Select an accepted exchange to start messaging.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
