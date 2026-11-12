import { useEffect, useState } from 'react'
import { Star, Send, MessageSquare, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Reviews({ user, requests }) {
  const [myReviews, setMyReviews] = useState([])
  const [receivedReviews, setReceivedReviews] = useState([])
  const [profiles, setProfiles] = useState({})
  const [ratings, setRatings] = useState({})
  const [comments, setComments] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const completedRequests = requests.filter(
    request =>
      request.status === 'completed' &&
      (request.requester_id === user.id ||
        request.receiver_id === user.id)
  )

  async function loadReviews() {
    setLoading(true)
    setError('')

    const [myResult, receivedResult] = await Promise.all([
      supabase
        .from('reviews')
        .select('*')
        .eq('reviewer_id', user.id),

      supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', user.id)
        .order('created_at', { ascending: false })
    ])

    if (myResult.error) {
      setError(myResult.error.message)
    } else {
      setMyReviews(myResult.data || [])
    }

    if (receivedResult.error) {
      setError(receivedResult.error.message)
    } else {
      setReceivedReviews(receivedResult.data || [])
    }

    const memberIds = [
      ...new Set([
        ...completedRequests.map(request =>
          request.requester_id === user.id
            ? request.receiver_id
            : request.requester_id
        ),
        ...(receivedResult.data || []).map(review => review.reviewer_id)
      ])
    ]

    if (memberIds.length > 0) {
      const { data: memberProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', memberIds)

      const profileMap = {}

      ;(memberProfiles || []).forEach(profile => {
        profileMap[profile.id] = profile.full_name
      })

      setProfiles(profileMap)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadReviews()
  }, [user.id, requests.length])

  function getPartnerId(request) {
    return request.requester_id === user.id
      ? request.receiver_id
      : request.requester_id
  }

  function getPartnerName(id) {
    return profiles[id] || `Member ${String(id).slice(0, 6)}`
  }

  function getExistingReview(requestId) {
    return myReviews.find(review => review.request_id === requestId)
  }

  async function submitReview(request) {
    const rating = ratings[request.id] || 0
    const comment = comments[request.id] || ''

    if (rating < 1 || rating > 5) {
      setError('Please select a rating from 1 to 5 stars.')
      return
    }

    setSavingId(request.id)
    setError('')
    setNotice('')

    const { error: insertError } = await supabase
      .from('reviews')
      .insert({
        request_id: request.id,
        reviewer_id: user.id,
        reviewee_id: getPartnerId(request),
        rating,
        comment: comment.trim()
      })

    if (insertError) {
      setError(insertError.message)
    } else {
      setNotice('Your review was submitted successfully!')
      setRatings(previous => ({
        ...previous,
        [request.id]: 0
      }))
      setComments(previous => ({
        ...previous,
        [request.id]: ''
      }))
      await loadReviews()
    }

    setSavingId(null)
  }

  const averageRating = receivedReviews.length
    ? (
        receivedReviews.reduce(
          (total, review) => total + Number(review.rating),
          0
        ) / receivedReviews.length
      ).toFixed(1)
    : '0.0'

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-violet-100 p-8 text-center">
        <RefreshCw className="animate-spin mx-auto text-violet-600" />
        <p className="text-gray-500 mt-3">Loading reviews...</p>
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <section>
        <h1 className="text-3xl font-extrabold">Reviews & Ratings</h1>
        <p className="text-gray-500 mt-2">
          Share feedback after completing a skill exchange.
        </p>
      </section>

      {notice && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4">
          {notice}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-violet-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-amber-500">
            <Star size={23} fill="currentColor" />
            <span className="text-3xl font-extrabold text-gray-900">
              {averageRating}
            </span>
            <span className="text-gray-400 text-sm">/ 5</span>
          </div>
          <p className="text-gray-500 mt-2">Your average rating</p>
        </div>

        <div className="bg-white border border-violet-100 rounded-2xl p-6">
          <p className="text-3xl font-extrabold">
            {receivedReviews.length}
          </p>
          <p className="text-gray-500 mt-2">Reviews received</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Completed swaps</h2>

        <div className="space-y-4">
          {completedRequests.map(request => {
            const partnerId = getPartnerId(request)
            const existingReview = getExistingReview(request.id)
            const selectedRating = ratings[request.id] || 0

            return (
              <div
                key={request.id}
                className="bg-white border border-violet-100 rounded-2xl p-6"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Skill exchange with
                    </p>
                    <h3 className="font-bold text-lg mt-1">
                      {getPartnerName(partnerId)}
                    </h3>
                  </div>

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold h-fit">
                    Completed
                  </span>
                </div>

                {existingReview ? (
                  <div className="mt-5 bg-violet-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-violet-800">
                      You have reviewed this member.
                    </p>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map(number => (
                        <Star
                          key={number}
                          size={20}
                          className={
                            number <= existingReview.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    {existingReview.comment && (
                      <p className="text-sm text-gray-600 mt-3">
                        {existingReview.comment}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    <p className="font-semibold text-sm">
                      Rate your experience
                    </p>

                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(number => (
                        <button
                          type="button"
                          key={number}
                          onClick={() =>
                            setRatings(previous => ({
                              ...previous,
                              [request.id]: number
                            }))
                          }
                          className="p-1"
                          aria-label={`Rate ${number} stars`}
                        >
                          <Star
                            size={29}
                            className={
                              number <= selectedRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300'
                            }
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={comments[request.id] || ''}
                      onChange={e =>
                        setComments(previous => ({
                          ...previous,
                          [request.id]: e.target.value
                        }))
                      }
                      placeholder="Write about your experience (optional)..."
                      rows={3}
                      maxLength={500}
                      className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-violet-400"
                    />

                    <button
                      type="button"
                      onClick={() => submitReview(request)}
                      disabled={savingId === request.id}
                      className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold"
                    >
                      <Send className="inline mr-2" size={17} />
                      {savingId === request.id
                        ? 'Submitting...'
                        : 'Submit Review'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {completedRequests.length === 0 && (
            <div className="bg-white border border-violet-100 rounded-2xl p-8 text-center">
              <MessageSquare className="mx-auto text-violet-400" size={32} />
              <h3 className="font-bold mt-3">No completed swaps yet</h3>
              <p className="text-gray-500 text-sm mt-2">
                Once a skill exchange is completed, you can rate the other member here.
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Reviews you've received</h2>

        <div className="space-y-3">
          {receivedReviews.map(review => (
            <div
              key={review.id}
              className="bg-white border border-violet-100 rounded-2xl p-5"
            >
              <p className="font-bold">
                {getPartnerName(review.reviewer_id)}
              </p>

              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(number => (
                  <Star
                    key={number}
                    size={18}
                    className={
                      number <= review.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>

              <p className="text-gray-600 text-sm mt-3">
                {review.comment || 'No written feedback.'}
              </p>

              <p className="text-xs text-gray-400 mt-3">
                {review.created_at
                  ? new Date(review.created_at).toLocaleDateString()
                  : ''}
              </p>
            </div>
          ))}

          {receivedReviews.length === 0 && (
            <div className="bg-white border border-violet-100 rounded-2xl p-6 text-center text-gray-500">
              You haven't received any reviews yet.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}