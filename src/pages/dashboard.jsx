
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, LogOut, User, BookOpen, Users, Plus,
  Search, GraduationCap, Trash2, Send, Check,
  X, RefreshCw, LayoutDashboard, Target, Star
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import Reviews from '../components/Reviews'

const categories = [
  'Programming', 'Design', 'Photography', 'Music',
  'Business', 'Languages', 'Writing', 'Other'
]

export default function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [goals, setGoals] = useState([])
  const [requests, setRequests] = useState([])
  const [tab, setTab] = useState('overview')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const [skillName, setSkillName] = useState('')
  const [skillCategory, setSkillCategory] = useState('Programming')
  const [skillLevel, setSkillLevel] = useState('Beginner')
  const [skillDescription, setSkillDescription] = useState('')

  const [goalName, setGoalName] = useState('')
  const [goalCategory, setGoalCategory] = useState('Programming')
  const [goalDescription, setGoalDescription] = useState('')

  const [offeredSkills, setOfferedSkills] = useState({})
  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')

  async function loadData() {
    setError('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      navigate('/login')
      return
    }

    const currentUser = authData.user
    setUser(currentUser)

    const [
      profileResult,
      skillsResult,
      goalsResult,
      requestsResult
    ] = await Promise.all([
      supabase.from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle(),

      supabase.from('skills')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase.from('learning_goals')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false }),

      supabase.from('swap_requests')
        .select('*')
        .order('created_at', { ascending: false })
    ])

    if (profileResult.error) setError(profileResult.error.message)
    if (skillsResult.error) setError(skillsResult.error.message)
    if (goalsResult.error) setError(goalsResult.error.message)
    if (requestsResult.error) setError(requestsResult.error.message)

    setProfile(profileResult.data)
    setProfileName(profileResult.data?.full_name || '')
    setProfileBio(profileResult.data?.bio || '')
    setSkills(skillsResult.data || [])
    setGoals(goalsResult.data || [])
    setRequests(requestsResult.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function showNotice(message) {
    setNotice(message)
    setTimeout(() => setNotice(''), 3500)
  }

  async function saveProfile(e) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setNotice('')

    const updates = {
      full_name: profileName.trim(),
      bio: profileBio.trim()
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (error) {
      setError(error.message)
    } else if (!data) {
      setError('Your profile record was not found. Please contact support.')
    } else {
      setProfile(data)
      setProfileName(data.full_name || '')
      setProfileBio(data.bio || '')
      showNotice('Profile updated successfully!')
    }

    setSaving(false)
  }

  async function addSkill(e) {
    e.preventDefault()
    if (!skillName.trim()) return

    setSaving(true)
    setError('')

    const { error } = await supabase.from('skills').insert({
      user_id: user.id,
      name: skillName.trim(),
      category: skillCategory,
      level: skillLevel,
      description: skillDescription.trim()
    })

    if (error) {
      setError(error.message)
    } else {
      setSkillName('')
      setSkillDescription('')
      showNotice('Your skill was added successfully!')
      await loadData()
    }

    setSaving(false)
  }

  async function deleteSkill(id) {
    if (!window.confirm('Delete this skill?')) return

    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) setError(error.message)
    else {
      showNotice('Skill deleted.')
      await loadData()
    }
  }

  async function addGoal(e) {
    e.preventDefault()
    if (!goalName.trim()) return

    setSaving(true)
    setError('')

    const { error } = await supabase.from('learning_goals').insert({
      user_id: user.id,
      skill_name: goalName.trim(),
      category: goalCategory,
      description: goalDescription.trim()
    })

    if (error) {
      setError(error.message)
    } else {
      setGoalName('')
      setGoalDescription('')
      showNotice('Learning goal added!')
      await loadData()
    }

    setSaving(false)
  }

  async function deleteGoal(id) {
    if (!window.confirm('Delete this learning goal?')) return

    const { error } = await supabase
      .from('learning_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) setError(error.message)
    else {
      showNotice('Learning goal deleted.')
      await loadData()
    }
  }

  async function sendRequest(skill) {
    const offeredId = offeredSkills[skill.id]

    if (!offeredId) {
      setError('Please select one of your skills to offer first.')
      return
    }

    const offered = skills.find(item => item.id === offeredId)

    if (!offered) {
      setError('The selected skill is unavailable.')
      return
    }

    if (skill.user_id === user.id) {
      setError('You cannot request your own skill.')
      return
    }

    const alreadyRequested = requests.some(request =>
      request.requester_id === user.id &&
      request.receiver_id === skill.user_id &&
      request.requested_skill_id === skill.id &&
      ['pending', 'accepted'].includes(request.status)
    )

    if (alreadyRequested) {
      setError('You already have an active request for this skill.')
      return
    }

    setError('')

    const { error } = await supabase.from('swap_requests').insert({
      requester_id: user.id,
      receiver_id: skill.user_id,
      offered_skill_id: offered.id,
      requested_skill_id: skill.id,
      message: `I would like to exchange ${offered.name} for ${skill.name}.`,
      status: 'pending'
    })

    if (error) {
      setError(error.message)
    } else {
      showNotice('Skill swap request sent!')
      await loadData()
    }
  }

  async function updateRequest(id, status) {
    setError('')

    const { error } = await supabase
      .from('swap_requests')
      .update({ status })
      .eq('id', id)
      .eq('receiver_id', user.id)
      .eq('status', 'pending')

    if (error) {
      setError(error.message)
    } else {
      showNotice(`Request ${status}.`)
      await loadData()
    }
  }

  async function completeSwap(id) {
    const confirmed = window.confirm(
      'Are you sure this skill exchange has been completed?'
    )

    if (!confirmed) return

    setError('')
    setNotice('')

    const { data, error } = await supabase
      .from('swap_requests')
      .update({ status: 'completed' })
      .eq('id', id)
      .eq('status', 'accepted')
      .select()

    if (error) {
      setError(error.message)
    } else if (!data || data.length === 0) {
      setError(
        'Could not complete this swap. Please check your Supabase update permissions.'
      )
    } else {
      showNotice('Skill exchange completed! You can now leave a review.')
      await loadData()
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const mySkills = skills.filter(skill => skill.user_id === user?.id)
  const otherSkills = skills.filter(skill => skill.user_id !== user?.id)

  const filteredSkills = otherSkills.filter(skill =>
    `${skill.name} ${skill.category} ${skill.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const incoming = requests.filter(item => item.receiver_id === user?.id)
  const outgoing = requests.filter(item => item.requester_id === user?.id)

  function getSkillName(id) {
    return skills.find(skill => skill.id === id)?.name || 'Skill'
  }

  function getUserName(id) {
    return id === user?.id
      ? 'You'
      : `Member ${String(id || '').slice(0, 6)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9ff]">
        <div className="text-center">
          <Sparkles className="mx-auto text-violet-600 animate-pulse" size={36} />
          <p className="mt-3 text-violet-700 font-semibold">
            Loading SkillSwap...
          </p>
        </div>
      </div>
    )
  }

  const displayName =
    profile?.full_name ||
    user?.email?.split('@')[0] ||
    'Learner'

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'skills', label: 'My Skills', icon: BookOpen },
    { id: 'goals', label: 'Learning Goals', icon: Target },
    { id: 'discover', label: 'Discover Skills', icon: Search },
    { id: 'requests', label: 'Swap Requests', icon: Users },
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star }
  ]

  return (
    <div className="min-h-screen bg-[#faf9ff]">
      <header className="sticky top-0 z-20 bg-white border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => setTab('overview')}
            className="flex items-center gap-2"
          >
            <span className="bg-violet-600 text-white p-2 rounded-xl">
              <Sparkles size={21} />
            </span>
            <span className="text-2xl font-extrabold text-violet-950">
              SkillSwap
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-sm">{displayName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 text-violet-700 hover:bg-violet-50"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-8 grid lg:grid-cols-[230px_1fr] gap-7">
        <aside>
          <div className="bg-white rounded-2xl border border-violet-100 p-4 lg:sticky lg:top-24">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-3">
              Workspace
            </p>

            <nav className="flex lg:flex-col gap-2 overflow-x-auto">
              {navItems.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab(item.id)
                      setError('')
                    }}
                    className={`flex shrink-0 items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-left ${
                      tab === item.id
                        ? 'bg-violet-600 text-white'
                        : 'text-gray-600 hover:bg-violet-50'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                    {item.id === 'requests' && incoming.filter(r => r.status === 'pending').length > 0 && (
                      <span className="ml-auto rounded-full bg-pink-500 text-white px-2 py-0.5 text-xs">
                        {incoming.filter(r => r.status === 'pending').length}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0">
          {notice && (
            <div className="mb-5 rounded-xl bg-green-50 border border-green-200 p-4 text-green-800">
              {notice}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              {error}
              <button onClick={() => setError('')} className="float-right font-bold">
                ×
              </button>
            </div>
          )}

          {tab === 'overview' && (
            <div className="space-y-7">
              <section>
                <p className="text-violet-600 font-bold text-sm mb-2">
                  YOUR LEARNING SPACE
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-gray-500 mt-2">
                  Share your knowledge. Discover something new. Grow together.
                </p>
              </section>

              <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: 'Skills Offered', value: mySkills.length, icon: BookOpen },
                  { label: 'Learning Goals', value: goals.length, icon: GraduationCap },
                  { label: 'Incoming Requests', value: incoming.length, icon: Users },
                  { label: 'Outgoing Requests', value: outgoing.length, icon: Send }
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="bg-white border border-violet-100 rounded-2xl p-5">
                      <div className="bg-violet-100 text-violet-700 rounded-xl w-11 h-11 flex items-center justify-center">
                        <Icon size={22} />
                      </div>
                      <p className="text-3xl font-extrabold mt-4">{item.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                    </div>
                  )
                })}
              </section>

              <section className="bg-gradient-to-r from-violet-700 to-indigo-600 text-white rounded-3xl p-7 md:p-10">
                <h2 className="text-2xl md:text-3xl font-bold">
                  Your skills have value.
                </h2>
                <p className="text-violet-100 mt-3 max-w-xl">
                  Add a skill you can teach, find someone who can teach you,
                  and start exchanging knowledge.
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={() => setTab('skills')}
                    className="bg-white text-violet-700 px-5 py-3 rounded-xl font-bold"
                  >
                    <Plus className="inline mr-2" size={18} />
                    Add a skill
                  </button>
                  <button
                    onClick={() => setTab('discover')}
                    className="border border-white/50 px-5 py-3 rounded-xl font-bold"
                  >
                    Explore skills
                  </button>
                </div>
              </section>

              <section className="bg-white border border-violet-100 rounded-2xl p-6">
                <h2 className="font-bold text-xl mb-4">Your profile</h2>
                <div className="flex items-center gap-4">
                  <div className="bg-violet-100 text-violet-700 p-4 rounded-full">
                    <User size={26} />
                  </div>
                  <div>
                    <p className="font-bold">{displayName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {profile?.bio || 'Add your profile details to introduce yourself.'}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {tab === 'skills' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold">My Skills</h1>
                <p className="text-gray-500 mt-2">
                  Add the skills you are ready to teach others.
                </p>
              </div>

              <form onSubmit={addSkill} className="bg-white border border-violet-100 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg">Add a new skill</h2>

                <input
                  required
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  placeholder="Skill name (e.g. Python)"
                  className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-violet-400"
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <select
                    value={skillCategory}
                    onChange={e => setSkillCategory(e.target.value)}
                    className="border rounded-xl p-3 bg-white"
                  >
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>

                  <select
                    value={skillLevel}
                    onChange={e => setSkillLevel(e.target.value)}
                    className="border rounded-xl p-3 bg-white"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                <textarea
                  value={skillDescription}
                  onChange={e => setSkillDescription(e.target.value)}
                  placeholder="Describe what you can teach..."
                  rows={3}
                  className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-violet-400"
                />

                <button disabled={saving} className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold">
                  <Plus className="inline mr-2" size={18} />
                  {saving ? 'Saving...' : 'Add Skill'}
                </button>
              </form>

              <div className="grid sm:grid-cols-2 gap-4">
                {mySkills.map(skill => (
                  <div key={skill.id} className="bg-white border border-violet-100 rounded-2xl p-5">
                    <div className="flex justify-between gap-3">
                      <div>
                        <span className="text-xs text-violet-600 font-bold">{skill.category}</span>
                        <h3 className="font-bold text-lg mt-1">{skill.name}</h3>
                      </div>
                      <button onClick={() => deleteSkill(skill.id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">{skill.description || 'No description added.'}</p>
                    <span className="inline-block mt-4 text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                      {skill.level}
                    </span>
                  </div>
                ))}
              </div>

              {mySkills.length === 0 && (
                <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-violet-100">
                  You haven't added any skills yet. Add your first skill above!
                </div>
              )}
            </div>
          )}

          {tab === 'goals' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold">Learning Goals</h1>
                <p className="text-gray-500 mt-2">What would you like to learn?</p>
              </div>

              <form onSubmit={addGoal} className="bg-white border border-violet-100 rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg">Add a learning goal</h2>
                <input
                  required
                  value={goalName}
                  onChange={e => setGoalName(e.target.value)}
                  placeholder="What do you want to learn?"
                  className="w-full border rounded-xl p-3"
                />
                <select
                  value={goalCategory}
                  onChange={e => setGoalCategory(e.target.value)}
                  className="w-full border rounded-xl p-3 bg-white"
                >
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
                <textarea
                  value={goalDescription}
                  onChange={e => setGoalDescription(e.target.value)}
                  placeholder="Add a short description..."
                  rows={3}
                  className="w-full border rounded-xl p-3"
                />
                <button disabled={saving} className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50">
                  <Plus className="inline mr-2" size={18} />
                  {saving ? 'Saving...' : 'Add Learning Goal'}
                </button>
              </form>

              <div className="grid sm:grid-cols-2 gap-4">
                {goals.map(goal => (
                  <div key={goal.id} className="bg-white border border-violet-100 rounded-2xl p-5">
                    <div className="flex justify-between">
                      <div>
                        <span className="text-xs font-bold text-pink-600">{goal.category}</span>
                        <h3 className="font-bold text-lg mt-1">{goal.skill_name}</h3>
                      </div>
                      <button onClick={() => deleteGoal(goal.id)} className="text-red-500 p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">{goal.description || 'Ready to start learning!'}</p>
                  </div>
                ))}
              </div>

              {goals.length === 0 && (
                <p className="text-center text-gray-500 bg-white rounded-2xl p-8 border border-violet-100">
                  Add your first learning goal!
                </p>
              )}
            </div>
          )}

          {tab === 'discover' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold">Discover Skills</h1>
                <p className="text-gray-500 mt-2">
                  Find skills shared by other SkillSwap members.
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search skills or categories..."
                  className="w-full bg-white border border-violet-100 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {filteredSkills.map(skill => (
                  <div key={skill.id} className="bg-white border border-violet-100 rounded-2xl p-5">
                    <span className="text-xs font-bold text-violet-600">{skill.category}</span>
                    <h3 className="text-xl font-bold mt-2">{skill.name}</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {skill.description || 'This member is ready to share their knowledge.'}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                        {skill.level}
                      </span>
                      <span className="text-xs text-gray-400">
                        {getUserName(skill.user_id)}
                      </span>
                    </div>

                    <select
                      value={offeredSkills[skill.id] || ''}
                      onChange={e => setOfferedSkills({
                        ...offeredSkills,
                        [skill.id]: e.target.value
                      })}
                      className="w-full border rounded-xl p-3 mt-4 bg-white text-sm"
                    >
                      <option value="">Choose a skill to offer</option>
                      {mySkills.map(ownSkill => (
                        <option key={ownSkill.id} value={ownSkill.id}>
                          Offer: {ownSkill.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => sendRequest(skill)}
                      disabled={mySkills.length === 0}
                      className="w-full mt-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white rounded-xl py-3 font-bold"
                    >
                      <Send className="inline mr-2" size={17} />
                      Send Swap Request
                    </button>
                  </div>
                ))}
              </div>

              {filteredSkills.length === 0 && (
                <div className="bg-white border border-violet-100 rounded-2xl p-8 text-center text-gray-500">
                  No matching skills found. Try another search or check back later.
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold">Edit Profile</h1>
                <p className="text-gray-500 mt-2">
                  Update the information other SkillSwap members see about you.
                </p>
              </div>

              <form
                onSubmit={saveProfile}
                className="bg-white border border-violet-100 rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-violet-100 text-violet-700 p-4 rounded-full">
                    <User size={28} />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{displayName}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="profile-name">
                    Full name
                  </label>
                  <input
                    id="profile-name"
                    required
                    maxLength={80}
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" htmlFor="profile-bio">
                    About me
                  </label>
                  <textarea
                    id="profile-bio"
                    maxLength={500}
                    rows={4}
                    value={profileBio}
                    onChange={e => setProfileBio(e.target.value)}
                    placeholder="Introduce yourself, your interests, and what you would like to learn..."
                    className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-violet-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Maximum 500 characters.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email address
                  </label>
                  <input
                    value={user?.email || ''}
                    readOnly
                    className="w-full border rounded-xl p-3 bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Your email address is managed by your login account.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving || !profileName.trim()}
                  className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>
          )}

          {tab === 'reviews' && (
            <Reviews
              user={user}
              requests={requests}
            />
          )}

          {tab === 'requests' && (
            <div className="space-y-7">
              <div>
                <h1 className="text-3xl font-extrabold">Swap Requests</h1>
                <p className="text-gray-500 mt-2">
                  Manage your incoming and outgoing skill exchanges.
                </p>
              </div>

              <section>
                <h2 className="font-bold text-xl mb-4">Incoming requests</h2>
                <div className="space-y-3">
                  {incoming.map(request => (
                    <div key={request.id} className="bg-white border border-violet-100 rounded-2xl p-5">
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <p className="text-sm text-gray-500">From {getUserName(request.requester_id)}</p>
                          <h3 className="font-bold mt-1">
                            {getSkillName(request.offered_skill_id)} for {getSkillName(request.requested_skill_id)}
                          </h3>
                          <p className="text-sm text-gray-500 mt-2">{request.message}</p>
                        </div>
                        <span className="text-sm font-semibold capitalize">{request.status}</span>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => updateRequest(request.id, 'accepted')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
                          >
                            <Check className="inline mr-1" size={16} />
                            Accept
                          </button>
                          <button
                            onClick={() => updateRequest(request.id, 'rejected')}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold"
                          >
                            <X className="inline mr-1" size={16} />
                            Reject
                          </button>
                        </div>
                      )}

                      {request.status === 'accepted' && (
                        <button
                          onClick={() => completeSwap(request.id)}
                          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          <Check className="inline mr-2" size={16} />
                          Mark as Completed
                        </button>
                      )}

                      {request.status === 'completed' && (
                        <p className="mt-4 text-sm font-semibold text-green-700">
                          <Check className="inline mr-1" size={16} />
                          Swap completed — reviews are now available.
                        </p>
                      )}
                    </div>
                  ))}

                  {incoming.length === 0 && (
                    <p className="bg-white p-6 rounded-xl text-gray-500 border border-violet-100">
                      No incoming requests yet.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h2 className="font-bold text-xl mb-4">Outgoing requests</h2>
                <div className="space-y-3">
                  {outgoing.map(request => (
                    <div key={request.id} className="bg-white border border-violet-100 rounded-2xl p-5">
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <p className="text-sm text-gray-500">To {getUserName(request.receiver_id)}</p>
                          <h3 className="font-bold mt-1">
                            {getSkillName(request.offered_skill_id)} for {getSkillName(request.requested_skill_id)}
                          </h3>
                          <p className="text-sm text-gray-500 mt-2">{request.message}</p>
                        </div>
                        <span className="text-sm font-semibold capitalize">{request.status}</span>
                      </div>

                      {request.status === 'accepted' && (
                        <button
                          onClick={() => completeSwap(request.id)}
                          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          <Check className="inline mr-2" size={16} />
                          Mark as Completed
                        </button>
                      )}

                      {request.status === 'completed' && (
                        <p className="mt-4 text-sm font-semibold text-green-700">
                          <Check className="inline mr-1" size={16} />
                          Swap completed — reviews are now available.
                        </p>
                      )}
                    </div>
                  ))}

                  {outgoing.length === 0 && (
                    <p className="bg-white p-6 rounded-xl text-gray-500 border border-violet-100">
                      You haven't sent any requests yet.
                    </p>
                  )}
                </div>
              </section>

              <button onClick={loadData} className="text-violet-700 font-semibold">
                <RefreshCw className="inline mr-2" size={17} />
                Refresh requests
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
