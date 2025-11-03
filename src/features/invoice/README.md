# Invoice Feature

This feature provides invoice management functionality for the front-sanos application.

## Structure

```
src/features/invoice/
├── components/
│   └── InvoiceList.vue          # Main invoice list component
├── composables/
│   ├── useInvoiceApi.ts         # API integration for invoices
│   └── useInvoices.ts           # State management for invoice operations
├── pages/
│   └── HomeView.vue             # Home page with invoice list
├── routes.ts                    # Invoice routes configuration
├── types.ts                     # TypeScript type definitions
└── README.md                    # This file
```

## Components

### InvoiceList.vue
- Displays a paginated list of invoices
- Includes search and filtering capabilities
- Shows invoice status and state with color-coded badges
- Provides action buttons for each invoice

### HomeView.vue
- Main page layout for invoice management
- Includes header with actions (refresh, export, new invoice)
- Embeds the InvoiceList component

## Composables

### useInvoiceApi.ts
- Handles API communication with the backend
- Provides `listInvoices()` and `getInvoice()` methods
- Manages query parameter construction

### useInvoices.ts
- Manages invoice state (loading, error, data)
- Provides search and filtering functionality
- Handles pagination
- Includes reactive state for UI updates

## Types

### Invoice
Main invoice interface with all invoice properties including:
- Basic info (id, number, type, dates)
- Financial data (subtotal, tax, total)
- Status and state tracking
- Related entities (party, organization, files)

### InvoiceStatus & InvoiceState
Enums for invoice processing status and business state

### InvoiceListParams
Interface for filtering and pagination parameters

## Routes

- `/invoices` - Main invoice list page (protected route)

## Features

- **Search**: Filter invoices by number or party name
- **Status Filtering**: Filter by invoice processing status
- **State Filtering**: Filter by business state
- **Pagination**: Navigate through large invoice lists
- **Real-time Updates**: Refresh functionality
- **Responsive Design**: Works on mobile and desktop

## API Integration

The feature integrates with the backend API endpoints:
- `GET /invoices` - List invoices with filtering and pagination
- `GET /invoices/:id` - Get specific invoice details

All API calls include proper authentication headers and error handling.
