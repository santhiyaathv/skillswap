
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Users,
  Sparkles,
  Code,
  Palette,
  Camera,
  Music,
  CheckCircle
} from 'lucide-react'

const categories = [
  { name: 'Programming', icon: Code, count: '120+ skills' },
  { name: 'Design', icon: Palette, count: '85+ skills' },
  { name: 'Photography', icon: Camera, count: '45+ skills' },
  { name: 'Music', icon: Music, count: '60+ skills' },
]

const benefits = [
  'Learn without expensive courses',
  'Teach skills you already know',
  'Meet people with similar interests',
  'Grow your skills together'
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf9ff]">

      {/* NAVIGATION */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-6 bg-white border-b border-purple-100">
        <Link to="/" className="text-2xl font-black text-violet-700">
          SkillSwap<span className="text-orange-400">.</span>
        </Link>

        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
          <a href="#how">How it works</a>
          <a href="#categories">Explore skills</a>
          <a href="#benefits">Why SkillSwap</a>
        </div>

        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold">
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-full bg-violet-700 px-5 py-2.5 text-sm text-white font-semibold hover:bg-violet-800"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main>

        {/* HERO SECTION */}
        <section className="px-6 md:px-16 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-violet-700 text-sm font-semibold mb-7">
              <Sparkles size={16} />
              A new way to learn together
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              Your skills are
              <span className="text-violet-700"> worth sharing.</span>
            </h1>

            <p className="mt-6 text-gray-600 text-lg leading-8 max-w-lg">
              Teach what you know. Learn what you love.
              Connect with people and exchange skills
              without boundaries.
            </p>

            <div className="flex flex-wrap gap-4 mt-9">
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-full bg-violet-700 text-white px-7 py-4 font-semibold hover:bg-violet-800"
              >
                Start swapping <ArrowRight size={18} />
              </Link>

              <a
                href="#categories"
                className="rounded-full border border-purple-200 px-7 py-4 font-semibold text-violet-800 hover:bg-purple-50"
              >
                Explore skills
              </a>
            </div>

            <div className="flex gap-8 mt-12">
              <div>
                <h3 className="text-2xl font-bold">Learn</h3>
                <p className="text-sm text-gray-500">Something new</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold">Teach</h3>
                <p className="text-sm text-gray-500">What you know</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold">Connect</h3>
                <p className="text-sm text-gray-500">With others</p>
              </div>
            </div>
          </div>

          {/* HERO CARD */}
          <div className="relative">
            <div className="absolute inset-0 bg-purple-200 blur-3xl opacity-40 rounded-full" />

            <div className="relative rounded-3xl bg-gradient-to-br from-violet-700 to-indigo-500 p-8 md:p-12 text-white shadow-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-purple-200 text-sm">Your next opportunity</p>
                  <h2 className="text-3xl font-bold mt-2">
                    Find your skill partner.
                  </h2>
                </div>

                <Users size={40} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12">
                {categories.map((category) => {
                  const Icon = category.icon

                  return (
                    <div
                      key={category.name}
                      className="rounded-2xl bg-white/15 border border-white/20 p-5 backdrop-blur"
                    >
                      <Icon size={28} />
                      <h3 className="font-bold mt-5">{category.name}</h3>
                      <p className="text-sm text-purple-200 mt-1">
                        {category.count}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 rounded-2xl bg-white p-5 text-gray-800 flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-3 text-green-700">
                  <BookOpen size={24} />
                </div>

                <div>
                  <h3 className="font-bold">Learn something new today</h3>
                  <p className="text-sm text-gray-500">
                    Your journey starts here.
                  </p>
                </div>

                <ArrowRight className="ml-auto text-violet-700" />
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section id="categories" className="px-6 md:px-16 py-20 bg-white">
          <div className="text-center">
            <p className="text-violet-700 font-semibold">DISCOVER</p>
            <h2 className="text-4xl font-black mt-3">
              Explore what you can learn
            </h2>
            <p className="text-gray-500 mt-4">
              Find a skill that excites you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
            {categories.map((category) => {
              const Icon = category.icon

              return (
                <div
                  key={category.name}
                  className="border border-purple-100 rounded-2xl p-7 hover:shadow-xl hover:-translate-y-1 transition"
                >
                  <div className="bg-purple-100 text-violet-700 w-14 h-14 rounded-xl flex items-center justify-center">
                    <Icon size={27} />
                  </div>

                  <h3 className="text-xl font-bold mt-6">{category.name}</h3>
                  <p className="text-gray-500 mt-2">{category.count}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="px-6 md:px-16 py-20">
          <div className="text-center">
            <p className="text-violet-700 font-semibold">SIMPLE PROCESS</p>
            <h2 className="text-4xl font-black mt-3">
              How SkillSwap works
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              ['01', 'Create your profile', 'Tell the community what you can teach and what you want to learn.'],
              ['02', 'Find your match', 'Discover people whose skills complement your learning goals.'],
              ['03', 'Start exchanging', 'Connect, teach, learn and grow together.']
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="bg-white rounded-2xl p-8 border border-purple-100"
              >
                <p className="text-4xl font-black text-violet-300">{number}</p>
                <h3 className="text-xl font-bold mt-5">{title}</h3>
                <p className="text-gray-500 mt-3 leading-7">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BENEFITS */}
        <section id="benefits" className="bg-violet-950 text-white px-6 md:px-16 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-violet-300 font-semibold">WHY SKILLSWAP?</p>
              <h2 className="text-4xl md:text-5xl font-black mt-4">
                Knowledge grows when you share it.
              </h2>
            </div>

            <div className="space-y-5">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex gap-3 items-center">
                  <CheckCircle className="text-green-400 shrink-0" />
                  <p className="text-lg">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 py-20 text-center">
          <h2 className="text-4xl font-black">
            Ready to exchange your skills?
          </h2>
          <p className="text-gray-500 mt-4">
            Your next learning partner is waiting.
          </p>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 mt-8 rounded-full bg-violet-700 text-white px-8 py-4 font-semibold"
          >
            Join SkillSwap <ArrowRight size={18} />
          </Link>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-purple-100 px-6 md:px-16 py-8 text-center text-gray-500 text-sm">
        © 2026 SkillSwap. Learn. Teach. Connect.
      </footer>
    </div>
  )
}
