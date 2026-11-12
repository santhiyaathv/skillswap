
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function Auth() {
  const navigate = useNavigate()

  const [isSignup, setIsSignup] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        })

        if (error) throw error

        if (data.session) {
          navigate('/dashboard')
        } else {
          setMessage('Account created! Please check your email to verify your account.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9ff] flex items-center justify-center p-5">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden">

        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-900 text-white">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Sparkles size={26} />
            SkillSwap
          </Link>

          <div>
            <p className="text-purple-200 font-medium mb-4">
              LEARN. SHARE. GROW.
            </p>
            <h1 className="text-5xl font-bold leading-tight">
              Your skills are valuable. Share them.
            </h1>
            <p className="mt-6 text-purple-100 leading-7">
              Connect with people, exchange knowledge and discover
              something new through SkillSwap.
            </p>
          </div>

          <p className="text-sm text-purple-200">
            A community where everyone has something to teach.
          </p>
        </div>

        <div className="p-8 sm:p-12">
          <Link to="/" className="text-violet-700 font-bold text-lg md:hidden">
            ✦ SkillSwap
          </Link>

          <div className="mt-8 md:mt-0">
            <p className="text-sm font-semibold text-violet-600">
              {isSignup ? 'GET STARTED' : 'WELCOME BACK'}
            </p>

            <h2 className="text-3xl font-bold mt-2 text-gray-900">
              {isSignup ? 'Create your account' : 'Welcome back!'}
            </h2>

            <p className="text-gray-500 mt-2">
              {isSignup
                ? 'Join the community and start exchanging skills.'
                : 'Sign in to continue your learning journey.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            {isSignup && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-violet-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </p>
            )}

            {message && (
              <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-700 hover:bg-violet-800 disabled:opacity-60 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition"
            >
              {loading
                ? 'Please wait...'
                : isSignup ? 'Create account' : 'Sign in'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-7">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
                setMessage('')
              }}
              className="text-violet-700 font-semibold ml-2"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
