import { useEffect } from 'react'
import { AppRoutes } from '@/routes'
import apiClient from '@/services/apiClient'

function App() {
  useEffect(() => {
    // Session-based traffic channel tracking
    if (!sessionStorage.getItem('visited_tracked')) {
      sessionStorage.setItem('visited_tracked', 'true')
      
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref') || params.get('utm_source')
      
      let channel = 'direct'
      
      if (ref) {
        const refLower = ref.toLowerCase()
        if (refLower === 'facebook' || refLower === 'fb' || refLower === 'fbclid') {
          channel = 'facebook'
        } else if (refLower === 'tiktok') {
          channel = 'tiktok'
        } else if (refLower === 'zalo') {
          channel = 'zalo'
        } else if (refLower === 'google') {
          channel = 'google'
        }
      } else if (window.location.search.includes('fbclid')) {
        channel = 'facebook'
      } else if (document.referrer && document.referrer.includes('google.com')) {
        channel = 'google'
      }
      
      apiClient.post(`/analytics/track-visit?channel=${channel}`)
        .catch(err => console.error('Failed to track traffic channel visit:', err))
    }
  }, [])

  return <AppRoutes />
}

export default App

