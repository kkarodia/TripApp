import { Loader } from '@googlemaps/js-api-loader'

declare global {
  interface Window {
    __googleMapsLoader?: Loader
  }
}

export function getMapsLoader(apiKey: string): Loader {
  if (typeof window === 'undefined') throw new Error('Maps loader is client-only')
  if (!window.__googleMapsLoader) {
    window.__googleMapsLoader = new Loader({ apiKey, version: 'weekly' })
  }
  return window.__googleMapsLoader
}
