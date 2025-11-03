import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'

// Auth guard that handles Auth0 loading state and authentication
export const authGuard = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0()

  // If Auth0 is still loading, wait for it to finish
  if (isLoading.value) {
    const checkAuthentication = setInterval(() => {
      if (!isLoading.value) {
        clearInterval(checkAuthentication)
        if (isAuthenticated.value) {
          next()
        } else {
          loginWithRedirect({ appState: { targetUrl: to.fullPath } })
        }
      }
    }, 50)
    return
  }

  if (isAuthenticated.value) {
    return next()
  } else {
    // Redirect to Auth0 login with return URL
    loginWithRedirect({ appState: { targetUrl: to.fullPath } })
  }
}
