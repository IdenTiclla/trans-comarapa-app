# Lesson 006: Do not use hardcoded routes in modal onClose

**Date:** 2026-04-25
**Context:** Secretary Dashboard → click "New Package" → close the modal → redirects to `/packages` instead of returning to the dashboard

## Error

```tsx
// WRONG — always redirects to /packages regardless of where the user came from
onClose={() => navigate('/packages')}
```

**Result:** When closing the modal from the secretary dashboard, the user is sent to `/packages` instead of staying on the dashboard.

## Root Cause

The modal's `onClose` was hardcoded to a specific route (`/packages`) without considering that the modal can be accessed from different pages (dashboard, package list, etc.).

## Solution

```tsx
// GOOD — goes back to the previous page
onClose={() => navigate(-1)}
```

## Rule

Always use `navigate(-1)` in modal/overlay page close callbacks, unless there is a justified fixed destination.
