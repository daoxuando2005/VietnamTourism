import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { favoriteService } from '@/services'
import { ROUTES } from '@/routes/paths'

interface FavoriteButtonProps {
  destinationId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FavoriteButton({ destinationId, className = '', size = 'md' }: FavoriteButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(Boolean(user))

  useEffect(() => {
    if (!user) return

    let active = true

    const checkFavorite = async () => {
      setLoading(true)
      try {
        const val = await favoriteService.isFavorite(user.id, destinationId)
        if (active) {
          setIsFav(val)
        }
      } catch (err) {
        console.error('Error checking favorite state:', err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    checkFavorite()

    return () => {
      active = false
    }
  }, [user, destinationId])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      // Redirect to login page preserving location state
      navigate(ROUTES.login, { state: { from: location } })
      return
    }

    // Optimistic Update
    const originalState = isFav
    setIsFav(!originalState)

    try {
      if (originalState) {
        await favoriteService.removeFavorite(user.id, destinationId)
      } else {
        await favoriteService.addFavorite(user.id, destinationId)
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      // Revert state on error
      setIsFav(originalState)
    }
  }

  if (loading) {
    return (
      <div
        className={[
          'animate-pulse rounded-full bg-gray-200',
          size === 'lg' ? 'h-10 w-10' : 'h-8 w-8',
          className,
        ].join(' ')}
      />
    )
  }

  const iconSize = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
  const buttonSize = size === 'lg' ? 'p-2.5' : 'p-1.5'

  return (
    <button
      onClick={handleToggle}
      className={[
        'rounded-full bg-white/90 backdrop-blur-sm border border-gray-100 hover:scale-105 shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-teal-500',
        isFav ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500',
        buttonSize,
        className,
      ].join(' ')}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={[iconSize, isFav ? 'fill-current' : ''].join(' ')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  )
}
export default FavoriteButton
