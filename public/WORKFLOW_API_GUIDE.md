# Application Workflow Management API Guide

## Overview

This guide explains how to manage application workflows from the dashboard. Each application can have a workflow with multiple steps that need to be completed in order.

## Base URL
```
https://dn0o2uwx5481n.cloudfront.net/api/v1
```

---

## Workflow Endpoints

### 1. Start Workflow
Initializes the workflow for an application (sets first step to "in_progress").

```
POST /applications/:id/workflow/start
```

**Request Body:** None required

**Response:**
```json
{
  "success": true,
  "message": "Workflow started successfully"
}
```

---

### 2. Get Workflow Progress
Returns all workflow steps with their current status.

```
GET /applications/:id/workflow
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow progress retrieved",
  "data": {
    "summary": {
      "total_steps": 4,
      "completed_steps": 1,
      "current_step": {
        "step_number": 2,
        "step_name": "Document Verification",
        "step_status": "in_progress"
      },
      "next_step": {
        "step_number": 3,
        "step_name": "Processing",
        "step_status": "pending"
      },
      "percent_complete": 25
    },
    "steps": [
      {
        "id": "uuid",
        "step_number": 1,
        "step_name": "Document Collection",
        "step_status": "completed",
        "started_at": "2025-12-28T10:00:00Z",
        "completed_at": "2025-12-28T11:00:00Z",
        "completed_by": "uuid",
        "completed_by_name": "Officer Name"
      },
      {
        "id": "uuid",
        "step_number": 2,
        "step_name": "Document Verification",
        "step_status": "in_progress",
        "started_at": "2025-12-28T11:00:00Z"
      },
      {
        "id": "uuid",
        "step_number": 3,
        "step_name": "Processing",
        "step_status": "pending"
      },
      {
        "id": "uuid",
        "step_number": 4,
        "step_name": "Certificate Issuance",
        "step_status": "pending"
      }
    ]
  }
}
```

---

### 3. Get Current Workflow Step
Returns only the currently active step.

```
GET /applications/:id/workflow/current
```

**Response:**
```json
{
  "success": true,
  "message": "Current workflow step retrieved",
  "data": {
    "id": "uuid",
    "step_number": 2,
    "step_name": "Document Verification",
    "step_status": "in_progress",
    "started_at": "2025-12-28T11:00:00Z"
  }
}
```

---

### 4. Advance Workflow Step (Complete Current & Start Next)
Marks the current step as completed and starts the next step.

```
POST /applications/:id/workflow/advance
```

**Request Body:**
```json
{
  "remarks": "Documents verified successfully",
  "user_id": "uuid-of-officer",        // Optional if using auth
  "user_name": "Officer Name"          // Optional if using auth
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workflow advanced successfully"
}
```

---

## Notes Endpoints

### 5. Add Note to Application
Adds a note/comment to an application.

```
POST /applications/:id/notes
```

**Request Body:**
```json
{
  "note": "Customer called to check status",
  "note_type": "internal",    // internal, public, action_required
  "is_private": false,
  "user_id": "uuid-of-user",  // Optional if using auth
  "user_name": "Officer Name" // Optional if using auth
}
```

**Note Types:**
- `internal` - For internal team notes
- `public` - Visible to applicant
- `action_required` - Needs attention

**Response:**
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "id": "uuid",
    "application_id": "uuid",
    "note": "Customer called to check status",
    "note_type": "internal",
    "is_private": false,
    "created_by": "uuid",
    "created_by_name": "Officer Name",
    "created_at": "2025-12-29T10:00:00Z"
  }
}
```

---

### 6. Get Notes for Application
Returns all notes for an application.

```
GET /applications/:id/notes
GET /applications/:id/notes?include_private=true
```

**Response:**
```json
{
  "success": true,
  "message": "Notes retrieved",
  "data": [
    {
      "id": "uuid",
      "note": "Customer called to check status",
      "note_type": "internal",
      "is_private": false,
      "created_by_name": "Officer Name",
      "created_at": "2025-12-29T10:00:00Z"
    }
  ]
}
```

---

## Verification Endpoint

### 7. Verify Application
Mark application as verified or request more documents.

```
POST /applications/:id/verify
```

**Request Body:**
```json
{
  "verified": true,
  "remarks": "All documents verified",
  "user_id": "uuid-of-verifier",  // Optional if using auth
  "user_name": "Verifier Name"     // Optional if using auth
}
```

**To request more documents:**
```json
{
  "verified": false,
  "remarks": "Need clearer copy of Aadhaar card"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application verification updated"
}
```

---

## Workflow Step Statuses

| Status | Description |
|--------|-------------|
| `pending` | Step not yet started |
| `in_progress` | Step currently being worked on |
| `completed` | Step finished successfully |
| `skipped` | Step was skipped |

---

## Application Model - Workflow Fields

When you fetch an application, these workflow-related fields are included:

```json
{
  "id": "uuid",
  "application_number": "APP-2025-xxxxx",
  "status": "under_review",

  // Workflow fields
  "workflow_status": "in_progress",    // not_started, in_progress, completed
  "current_workflow_step": 2,          // Current step number (0 = not started)
  "workflow_data": { ... },            // Full workflow state as JSON
  "workflow_started_at": "2025-12-28T10:00:00Z",
  "workflow_completed_at": null,
  "last_workflow_update": "2025-12-28T11:00:00Z"
}
```

---

## Example: Complete Workflow Flow

### Step 1: Start the workflow
```javascript
// When application is submitted and payment received
await fetch(`/api/v1/applications/${appId}/workflow/start`, {
  method: 'POST'
});
```

### Step 2: Get current status
```javascript
const response = await fetch(`/api/v1/applications/${appId}/workflow`);
const { data } = await response.json();
console.log(`Step ${data.summary.current_step.step_number}: ${data.summary.current_step.step_name}`);
```

### Step 3: Complete step and move to next
```javascript
await fetch(`/api/v1/applications/${appId}/workflow/advance`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    remarks: "Documents verified successfully",
    user_name: "Officer Kumar"
  })
});
```

### Step 4: Add a note
```javascript
await fetch(`/api/v1/applications/${appId}/notes`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    note: "Called customer for clarification",
    note_type: "internal",
    user_name: "Officer Kumar"
  })
});
```

---

## Dashboard UI Suggestions

1. **Progress Bar**: Show `percent_complete` from workflow summary
2. **Step Timeline**: Display all steps with their status icons
3. **Current Step Highlight**: Highlight the `in_progress` step
4. **Action Button**: Show "Complete Step" button for the current step
5. **Notes Section**: Collapsible notes list with "Add Note" button
6. **History Tab**: Show status history from `/applications/:id/history`
