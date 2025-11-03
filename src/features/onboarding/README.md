# Party Onboarding Feature

This feature handles the onboarding flow for supplier parties in the FinPilot application.

## Overview

The onboarding flow collects required party information and submits it to the backend API to create a new party record and update Auth0 metadata.

## Components

### Pages
- `OnboardingView.vue` - Main onboarding form page

### Composables
- `usePartyOnboarding.ts` - Form state management and business logic
- `useOnboardingApi.ts` - API integration for party onboarding

### Types
- `types.ts` - TypeScript interfaces and enums for party onboarding

## Features

- **Form Validation**: Validates required fields and tax ID format
- **Auth0 Integration**: Checks `app_metadata.onboarded` flag
- **Token Refresh**: Automatically refreshes Auth0 tokens after successful onboarding
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Environment Variables

Required environment variables:
- `VITE_COMPANY_ID` - Company ID for party association
- `VITE_AUTH0_AUDIENCE` - Auth0 audience for metadata access
- `VITE_API_BASE_URL` - Backend API base URL

## API Endpoint

The feature calls the `/users/onboard/party` endpoint with the following payload:

```typescript
{
  partyType: 'SUPPLIER',
  taxId: string,
  taxIdType: 'CUIT' | 'CUIL' | 'DNI',
  name: string,
  regimen: 'MONOTRIBUTO' | 'RESPONSABLE_INSCRIPTO' | 'EXENTO' | 'CONSUMIDOR_FINAL',
  companyId: string
}
```

## Router Guards

- `onboardingGuard` - Redirects to onboarding if user is not onboarded
- `preventIfOnboarded` - Prevents access to onboarding if user is already onboarded
