import { useApi } from '@/lib/api'
import type { PartyOnboardingRequest, PartyOnboardingResponse } from '../types'

export function useOnboardingApi() {
  const { post } = useApi()

  return {
    // Complete the party onboarding process
    onboardParty: async (data: PartyOnboardingRequest): Promise<PartyOnboardingResponse> => {
      const response = await post('/users/onboard/party', {
        partyType: data.partyType,
        taxId: data.taxId.trim(),
        taxIdType: data.taxIdType,
        name: data.name.trim(),
        regimen: data.regimen,
        companyId: data.companyId
      })
      return response.data
    }
  }
}
