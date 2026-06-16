import apiClient from './apiClient'

export const reviewService = {
  uploadReviewMedia: async (file: File): Promise<{ url: string; type: 'image' | 'video' }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<{ url: string; type: 'image' | 'video' }>('/uploads/review-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
