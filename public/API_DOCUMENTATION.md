# Genome API Documentation

**Base URL:** `https://dn0o2uwx5481n.cloudfront.net/api/v1`
**Alternative:** `http://genome-alb-1599622395.ap-south-1.elb.amazonaws.com/api/v1`

**Authentication:** Bearer Token (JWT) in Authorization header
**Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Services & Categories](#3-services--categories)
4. [Applications](#4-applications)
5. [Geography](#5-geography)
6. [Common Response Format](#6-common-response-format)

---

## 1. Authentication

### 1.1 Send OTP
```
POST /auth/otp/send
```

**Request:**
```json
{
  "mobile": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "otp_id": "uuid",
    "expires_in": 300
  }
}
```

### 1.2 Verify OTP
```
POST /auth/otp/verify
```

**Request:**
```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 86400,
    "user": {
      "id": "uuid",
      "mobile": "9876543210",
      "full_name": "John Doe",
      "status": "active"
    }
  }
}
```

### 1.3 Refresh Token
```
POST /auth/refresh
```

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 1.4 Get Current User (Requires Auth)
```
GET /auth/me
Authorization: Bearer <access_token>
```

### 1.5 Logout (Requires Auth)
```
POST /auth/logout
Authorization: Bearer <access_token>
```

---

## 2. Users

### 2.1 Create User
```
POST /users/create
```

**Request:**
```json
{
  "mobile": "9876543210",
  "full_name": "John Doe",
  "email": "john@example.com",
  "state_code": "KA"
}
```

### 2.2 Get User by ID
```
GET /users/:id
```

### 2.3 Get User by Mobile
```
GET /users/mobile/:mobile
```

### 2.4 List Users
```
GET /users/list?page=1&per_page=20&search=john&state_code=KA
```

### 2.5 Update User
```
PUT /users/:id
```

**Request:**
```json
{
  "full_name": "John Updated",
  "email": "john.updated@example.com"
}
```

### 2.6 Delete User
```
DELETE /users/:id
```

### 2.7 Get User Profile (Requires Auth)
```
GET /users/profile
Authorization: Bearer <access_token>
```

### 2.8 Update Profile (Requires Auth)
```
PUT /users/profile
Authorization: Bearer <access_token>
```

---

## 3. Services & Categories

### 3.1 Categories

#### Get All Categories
```
GET /categories
GET /categories/all
```

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved",
  "data": [
    {
      "id": "uuid",
      "name": "Land Records",
      "name_hindi": "भूमि रिकॉर्ड",
      "slug": "land-records",
      "description": "Land related services",
      "icon_url": "https://...",
      "parent_id": null,
      "sort_order": 1,
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Category
```
POST /categories
```

**Request:**
```json
{
  "name": "Land Records",
  "name_hindi": "भूमि रिकॉर्ड",
  "slug": "land-records",
  "description": "Land related services",
  "icon_url": "https://...",
  "parent_id": null,
  "sort_order": 1
}
```

#### Get Category by ID
```
GET /categories/:id
```

#### Get Category by Slug
```
GET /categories/slug/:slug
```

#### Get Subcategories
```
GET /categories/:id/subcategories
```

#### Get Services by Category
```
GET /categories/:id/services
```

#### Update Category
```
PUT /categories/:id
```

#### Delete Category
```
DELETE /categories/:id
```

### 3.2 Services

#### Get All Services
```
GET /services?page=1&per_page=20&category_id=uuid&search=certificate
GET /services/all
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20, max: 100)
- `category_id` - Filter by category
- `search` - Search in name/description
- `is_active` - Filter by active status
- `is_popular` - Filter popular services
- `is_featured` - Filter featured services

**Response:**
```json
{
  "success": true,
  "message": "Services retrieved",
  "data": [
    {
      "id": "uuid",
      "category_id": "uuid",
      "name": "Birth Certificate",
      "name_hindi": "जन्म प्रमाण पत्र",
      "slug": "birth-certificate",
      "description": "Apply for birth certificate",
      "description_hindi": "जन्म प्रमाण पत्र के लिए आवेदन करें",
      "department": "Revenue Department",
      "department_hindi": "राजस्व विभाग",
      "ministry": "Ministry of Home Affairs",
      "eligibility_criteria": "Must be a resident",
      "required_documents": ["Aadhaar Card", "Hospital Record"],
      "processing_time": "7-15 days",
      "service_fee": 50.00,
      "platform_fee": 10.00,
      "total_fee": 60.00,
      "is_free_service": false,
      "icon_url": "https://...",
      "banner_url": "https://...",
      "official_url": "https://...",
      "is_active": true,
      "is_popular": true,
      "is_featured": false,
      "total_applications": 1500,
      "average_rating": 4.5,
      "available_states": ["KA", "MH", "TN"],
      "available_locations": "all",
      "form_fields": "{...}",
      "sort_order": 1,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z",
      "category": {
        "id": "uuid",
        "name": "Certificates"
      }
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

#### Get Popular Services
```
GET /services/popular
```

#### Get Featured Services
```
GET /services/featured
```

#### Search Services
```
GET /services/search?q=birth+certificate
```

#### Create Service
```
POST /services
```

**Request:**
```json
{
  "category_id": "uuid",
  "name": "Birth Certificate",
  "name_hindi": "जन्म प्रमाण पत्र",
  "slug": "birth-certificate",
  "description": "Apply for birth certificate",
  "description_hindi": "जन्म प्रमाण पत्र के लिए आवेदन करें",
  "department": "Revenue Department",
  "department_hindi": "राजस्व विभाग",
  "ministry": "Ministry of Home Affairs",
  "eligibility_criteria": "Must be a resident",
  "required_documents": ["Aadhaar Card", "Hospital Record"],
  "processing_time": "7-15 days",
  "service_fee": 50.00,
  "platform_fee": 10.00,
  "is_free_service": false,
  "icon_url": "https://...",
  "banner_url": "https://...",
  "official_url": "https://...",
  "is_popular": true,
  "is_featured": false,
  "available_states": ["KA", "MH", "TN"],
  "available_locations": "all",
  "form_fields": "{\"sections\":[...]}",
  "sort_order": 1
}
```

#### Get Service by ID
```
GET /services/:id
```

#### Get Service by Slug
```
GET /services/slug/:slug
```

#### Update Service
```
PUT /services/:id
```

#### Delete Service
```
DELETE /services/:id
```

#### Get Service Form
```
GET /services/:id/form
```

**Response:**
```json
{
  "success": true,
  "message": "Form retrieved",
  "data": {
    "id": "uuid",
    "service_id": "uuid",
    "version": 1,
    "form_schema": {
      "title": "Birth Certificate Application",
      "description": "Fill the form to apply",
      "sections": [
        {
          "id": "personal_info",
          "title": "Personal Information",
          "title_hindi": "व्यक्तिगत जानकारी",
          "sort_order": 1,
          "fields": [
            {
              "id": "full_name",
              "name": "full_name",
              "label": "Full Name",
              "label_hindi": "पूरा नाम",
              "type": "text",
              "placeholder": "Enter your full name",
              "required": true,
              "sort_order": 1,
              "validation": {
                "min_length": 2,
                "max_length": 100
              }
            },
            {
              "id": "gender",
              "name": "gender",
              "label": "Gender",
              "label_hindi": "लिंग",
              "type": "select",
              "required": true,
              "sort_order": 2,
              "options": [
                {"value": "male", "label": "Male", "label_hindi": "पुरुष"},
                {"value": "female", "label": "Female", "label_hindi": "महिला"},
                {"value": "other", "label": "Other", "label_hindi": "अन्य"}
              ]
            }
          ]
        }
      ]
    },
    "is_active": true
  }
}
```

#### Get Service FAQs
```
GET /services/:id/faqs
GET /services/slug/:slug/faqs
```

---

## 4. Applications

**All application endpoints require authentication**

### 4.1 Create Application
```
POST /applications
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "service_id": "uuid",
  "form_data": {
    "full_name": "John Doe",
    "date_of_birth": "1990-01-15",
    "gender": "male",
    "father_name": "Robert Doe",
    "mother_name": "Jane Doe"
  },

  "applicant_name": "John Doe",
  "applicant_mobile": "9876543210",
  "applicant_email": "john@example.com",
  "applicant_father_name": "Robert Doe",
  "applicant_mother_name": "Jane Doe",
  "applicant_spouse_name": null,
  "applicant_dob": "1990-01-15",
  "applicant_gender": "male",
  "applicant_religion": "Hindu",
  "applicant_caste": "General",
  "applicant_caste_category": "General",
  "applicant_nationality": "Indian",
  "applicant_marital_status": "single",
  "applicant_occupation": "Software Engineer",
  "applicant_qualification": "B.Tech",
  "applicant_annual_income": 800000,
  "applicant_aadhaar_last4": "1234",
  "applicant_pan_number": "ABCDE1234F",
  "applicant_voter_id": "ABC1234567",
  "applicant_passport_number": null,
  "applicant_driving_license": "KA0120190001234",
  "applicant_photo_url": "https://storage.example.com/photo.jpg",
  "applicant_signature_url": "https://storage.example.com/sign.jpg",

  "doc_address_line1": "123, Main Street",
  "doc_address_line2": "Near Bus Stand",
  "doc_address_landmark": "Opposite Temple",
  "doc_address_village": "Koramangala",
  "doc_address_block": "South Block",
  "doc_address_taluk": "Bangalore South",
  "doc_address_district": "Bangalore Urban",
  "doc_address_state_code": "KA",
  "doc_address_state_name": "Karnataka",
  "doc_address_pincode": "560034",
  "doc_address_country": "India",
  "doc_address_type": "aadhaar",

  "curr_address_line1": "456, Park Avenue",
  "curr_address_line2": "Floor 2",
  "curr_address_landmark": "Near Mall",
  "curr_address_village": "Indiranagar",
  "curr_address_block": "East Block",
  "curr_address_taluk": "Bangalore East",
  "curr_address_district": "Bangalore Urban",
  "curr_address_state_code": "KA",
  "curr_address_state_name": "Karnataka",
  "curr_address_pincode": "560038",
  "curr_address_country": "India",
  "curr_address_duration_years": 3,
  "is_address_same_as_document": false,

  "alt_contact_name": "Jane Doe",
  "alt_contact_mobile": "9876543211",
  "alt_contact_relation": "Mother",
  "alt_contact_email": "jane@example.com",

  "bank_account_name": "John Doe",
  "bank_ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "bank_branch": "Koramangala Branch",

  "service_extra_fields": {
    "hospital_name": "City Hospital",
    "birth_place": "Bangalore"
  },

  "source": "web",
  "device_type": "desktop",
  "app_version": "1.0.0",
  "is_urgent": false,
  "urgency_reason": null,
  "extra_data": {},
  "remarks": "First time application"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "id": "uuid",
    "application_number": "APP-2025-000001",
    "user_id": "uuid",
    "service_id": "uuid",
    "status": "draft",
    "payment_status": "pending",
    "total_fee": 60.00,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### 4.2 Get My Applications
```
GET /applications/my?page=1&per_page=20
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Applications retrieved",
  "data": [
    {
      "id": "uuid",
      "application_number": "APP-2025-000001",
      "service_name": "Birth Certificate",
      "service_name_hindi": "जन्म प्रमाण पत्र",
      "applicant_name": "John Doe",
      "applicant_mobile": "9876543210",
      "status": "submitted",
      "payment_status": "completed",
      "total_fee": 60.00,
      "amount_paid": 60.00,
      "is_agent_assisted": false,
      "agent_name": null,
      "submitted_at": "2025-01-01T10:00:00Z",
      "created_at": "2025-01-01T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

### 4.3 Get All Applications (Admin)
```
GET /applications?page=1&per_page=20&status=submitted&payment_status=completed&service_id=uuid&state_code=KA&district=Bangalore&search=john&is_urgent=true&is_flagged=false
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` - Page number
- `per_page` - Items per page
- `status` - Filter by status (draft, submitted, under_review, processing, approved, rejected, completed, cancelled)
- `payment_status` - Filter by payment status (pending, completed, failed, refunded)
- `service_id` - Filter by service
- `user_id` - Filter by user
- `agent_id` - Filter by agent
- `state_code` - Filter by state
- `district` - Filter by district
- `date_from` - Filter from date
- `date_to` - Filter to date
- `search` - Search in name, mobile, application number
- `is_urgent` - Filter urgent applications
- `is_flagged` - Filter flagged applications

### 4.4 Get Application by ID
```
GET /applications/:id
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Application retrieved",
  "data": {
    "id": "uuid",
    "application_number": "APP-2025-000001",
    "user_id": "uuid",
    "service_id": "uuid",
    "agent_id": null,
    "applicant_type": "self",
    "is_agent_assisted": false,

    "status": "submitted",
    "sub_status": null,
    "status_remarks": null,
    "last_status_change": "2025-01-01T10:00:00Z",
    "previous_status": "draft",

    "form_data": {
      "full_name": "John Doe",
      "date_of_birth": "1990-01-15"
    },
    "form_version": 1,

    "applicant_name": "John Doe",
    "applicant_name_hindi": null,
    "applicant_mobile": "9876543210",
    "applicant_email": "john@example.com",
    "applicant_father_name": "Robert Doe",
    "applicant_mother_name": "Jane Doe",
    "applicant_spouse_name": null,
    "applicant_dob": "1990-01-15",
    "applicant_gender": "male",
    "applicant_religion": "Hindu",
    "applicant_caste": "General",
    "applicant_caste_category": "General",
    "applicant_nationality": "Indian",
    "applicant_marital_status": "single",
    "applicant_occupation": "Software Engineer",
    "applicant_qualification": "B.Tech",
    "applicant_annual_income": 800000,
    "applicant_aadhaar_last4": "1234",
    "applicant_pan_number": "ABCDE1234F",
    "applicant_voter_id": "ABC1234567",
    "applicant_photo_url": "https://...",
    "applicant_signature_url": "https://...",

    "doc_address_line1": "123, Main Street",
    "doc_address_line2": "Near Bus Stand",
    "doc_address_landmark": "Opposite Temple",
    "doc_address_village": "Koramangala",
    "doc_address_block": "South Block",
    "doc_address_taluk": "Bangalore South",
    "doc_address_district": "Bangalore Urban",
    "doc_address_state_code": "KA",
    "doc_address_state_name": "Karnataka",
    "doc_address_pincode": "560034",
    "doc_address_country": "India",
    "doc_address_type": "aadhaar",

    "curr_address_line1": "456, Park Avenue",
    "curr_address_district": "Bangalore Urban",
    "curr_address_state_code": "KA",
    "curr_address_pincode": "560038",
    "curr_address_duration_years": 3,
    "is_address_same_as_document": false,

    "alt_contact_name": "Jane Doe",
    "alt_contact_mobile": "9876543211",
    "alt_contact_relation": "Mother",

    "bank_account_name": "John Doe",
    "bank_ifsc_code": "SBIN0001234",
    "bank_name": "State Bank of India",
    "bank_branch": "Koramangala Branch",

    "category_id": "uuid",
    "category_name": "Certificates",
    "category_name_hindi": "प्रमाण पत्र",
    "service_name": "Birth Certificate",
    "service_name_hindi": "जन्म प्रमाण पत्र",
    "service_slug": "birth-certificate",
    "service_department": "Revenue Department",
    "service_department_hindi": "राजस्व विभाग",
    "service_ministry": "Ministry of Home Affairs",
    "service_category": "Certificates",
    "service_processing_time": "7-15 days",
    "service_required_documents": ["Aadhaar Card", "Hospital Record"],
    "service_form_fields": {...},
    "service_extra_fields": {
      "hospital_name": "City Hospital",
      "birth_place": "Bangalore"
    },

    "service_fee": 50.00,
    "platform_fee": 10.00,
    "total_fee": 60.00,
    "amount_paid": 60.00,
    "amount_due": 0.00,
    "payment_status": "completed",
    "payment_method": "upi",
    "payment_reference": "TXN123456",
    "payment_gateway": "razorpay",
    "transaction_id": "pay_ABC123",
    "payment_date": "2025-01-01T09:30:00Z",
    "is_free_service": false,
    "fee_waiver_applied": false,

    "assigned_to": null,
    "assigned_at": null,
    "processing_center": null,
    "processing_office": null,
    "processing_remarks": null,

    "verified_by": null,
    "verified_at": null,
    "verification_remarks": null,

    "approved_by": null,
    "approved_at": null,
    "rejected_by": null,
    "rejected_at": null,
    "rejection_reason": null,
    "rejection_code": null,

    "certificate_number": null,
    "certificate_url": null,
    "certificate_issued_at": null,
    "output_data": null,

    "estimated_completion_date": "2025-01-15",
    "actual_completion_date": null,
    "processing_days": null,
    "sla_breached": false,
    "sla_days": 15,

    "priority": "normal",
    "is_urgent": false,
    "urgency_reason": null,

    "rating": null,
    "feedback_text": null,
    "feedback_given_at": null,

    "is_resubmission": false,
    "parent_application_id": null,
    "resubmission_count": 0,
    "is_flagged": false,
    "flag_reason": null,
    "is_deleted": false,

    "extra_data": {},
    "remarks": "First time application",

    "source": "web",
    "device_type": "desktop",
    "app_version": "1.0.0",

    "submitted_at": "2025-01-01T10:00:00Z",
    "created_at": "2025-01-01T09:00:00Z",
    "updated_at": "2025-01-01T10:00:00Z"
  }
}
```

### 4.5 Update Application
```
PUT /applications/:id
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "form_data": {
    "full_name": "John Doe Updated"
  },
  "status": "under_review",
  "sub_status": "pending_verification",
  "status_remarks": "Submitted for review",
  "assigned_to": "officer-uuid",
  "processing_center": "Bangalore Office",
  "processing_office": "District Office",
  "processing_remarks": "Assigned to officer",
  "priority": "high",
  "is_urgent": true,
  "urgency_reason": "Medical emergency",
  "is_flagged": false,
  "flag_reason": null,
  "extra_data": {},
  "remarks": "Updated details"
}
```

### 4.6 Submit Application
```
POST /applications/:id/submit
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": null
}
```

### 4.7 Update Application Status
```
POST /applications/:id/status
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "status": "under_review",
  "remarks": "Moving to review queue"
}
```

**Available Statuses:**
- `draft` - Initial state
- `pending_payment` - Awaiting payment
- `payment_failed` - Payment failed
- `submitted` - Submitted for processing
- `under_review` - Under review
- `document_required` - Additional documents needed
- `processing` - Being processed
- `pending_verification` - Awaiting verification
- `verified` - Documents verified
- `approved` - Application approved
- `rejected` - Application rejected
- `completed` - Certificate/output issued
- `cancelled` - Cancelled by user
- `on_hold` - Put on hold
- `expired` - Application expired

### 4.8 Verify Application
```
POST /applications/:id/verify
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "verified": true,
  "remarks": "All documents verified successfully"
}
```

Or reject:
```json
{
  "verified": false,
  "remarks": "Aadhaar card image is not clear"
}
```

### 4.9 Approve/Reject Application
```
POST /applications/:id/approve
Authorization: Bearer <access_token>
```

**Approve:**
```json
{
  "approved": true,
  "remarks": "Application approved"
}
```

**Reject:**
```json
{
  "approved": false,
  "remarks": "Application rejected due to invalid documents",
  "rejection_reason": "Invalid Aadhaar card",
  "rejection_code": "DOC_INVALID"
}
```

### 4.10 Complete Application
```
POST /applications/:id/complete
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "certificate_number": "CERT-2025-000001",
  "certificate_url": "https://storage.example.com/certificates/cert.pdf"
}
```

### 4.11 Cancel Application
```
POST /applications/:id/cancel
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "reason": "Applied by mistake"
}
```

### 4.12 Delete Application
```
DELETE /applications/:id
Authorization: Bearer <access_token>
```

### 4.13 Get Application Status History
```
GET /applications/:id/history
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Status history retrieved",
  "data": [
    {
      "id": "uuid",
      "application_id": "uuid",
      "from_status": "draft",
      "to_status": "submitted",
      "remarks": "Application submitted",
      "changed_by": "uuid",
      "changed_by_type": "user",
      "changed_by_name": "John Doe",
      "ip_address": "192.168.1.1",
      "created_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

### 4.14 Documents

#### Get Application Documents
```
GET /applications/:id/documents
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Documents retrieved",
  "data": [
    {
      "id": "uuid",
      "application_id": "uuid",
      "document_type": "aadhaar_card",
      "document_name": "Aadhaar Card",
      "document_number": "XXXX-XXXX-1234",
      "file_url": "https://storage.example.com/docs/aadhaar.pdf",
      "file_type": "application/pdf",
      "file_size_bytes": 102400,
      "thumbnail_url": "https://storage.example.com/docs/aadhaar_thumb.jpg",
      "original_filename": "aadhaar.pdf",
      "verification_status": "verified",
      "verified_by": "uuid",
      "verified_at": "2025-01-02T10:00:00Z",
      "rejection_reason": null,
      "ocr_data": null,
      "is_required": true,
      "sort_order": 1,
      "uploaded_by": "self",
      "is_deleted": false,
      "created_at": "2025-01-01T09:15:00Z",
      "updated_at": "2025-01-02T10:00:00Z"
    }
  ]
}
```

#### Upload Document
```
POST /applications/:id/documents
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "document_type": "aadhaar_card",
  "document_name": "Aadhaar Card",
  "document_number": "XXXX-XXXX-1234",
  "is_required": true,
  "sort_order": 1
}
```

#### Verify Document
```
POST /applications/documents/:doc_id/verify
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "verified": true,
  "rejection_reason": null
}
```

#### Delete Document
```
DELETE /applications/documents/:doc_id
Authorization: Bearer <access_token>
```

### 4.15 Notes

#### Get Application Notes
```
GET /applications/:id/notes?include_private=true
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notes retrieved",
  "data": [
    {
      "id": "uuid",
      "application_id": "uuid",
      "note": "Applicant called to check status",
      "note_type": "internal",
      "created_by": "uuid",
      "created_by_name": "Officer Name",
      "is_private": true,
      "created_at": "2025-01-02T14:00:00Z"
    }
  ]
}
```

#### Add Note
```
POST /applications/:id/notes
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "note": "Applicant called to check status",
  "note_type": "internal",
  "is_private": true
}
```

**Note Types:**
- `internal` - Internal notes (visible to officers)
- `public` - Public notes (visible to applicant)
- `action_required` - Action required

### 4.16 Payments

#### Get Application Payments
```
GET /applications/:id/payments
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Payments retrieved",
  "data": [
    {
      "id": "uuid",
      "application_id": "uuid",
      "amount": 60.00,
      "payment_type": "total",
      "payment_method": "upi",
      "payment_gateway": "razorpay",
      "transaction_id": "pay_ABC123",
      "gateway_order_id": "order_ABC123",
      "gateway_payment_id": "pay_ABC123",
      "status": "success",
      "failure_reason": null,
      "refund_id": null,
      "refunded_at": null,
      "refund_reason": null,
      "payment_data": {},
      "paid_at": "2025-01-01T09:30:00Z",
      "created_at": "2025-01-01T09:25:00Z",
      "updated_at": "2025-01-01T09:30:00Z"
    }
  ]
}
```

#### Record Payment
```
POST /applications/:id/payments
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "amount": 60.00,
  "payment_method": "upi",
  "payment_gateway": "razorpay",
  "transaction_id": "pay_ABC123"
}
```

### 4.17 Feedback
```
POST /applications/:id/feedback
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "rating": 5,
  "feedback": "Excellent service! Very fast processing."
}
```

### 4.18 Statistics
```
GET /applications/stats?service_id=uuid&agent_id=uuid&state_code=KA&date_from=2025-01-01&date_to=2025-12-31
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved",
  "data": {
    "total_applications": 1500,
    "draft_count": 50,
    "submitted_count": 200,
    "under_review_count": 100,
    "processing_count": 150,
    "approved_count": 800,
    "rejected_count": 50,
    "completed_count": 750,
    "pending_payment_count": 30,
    "total_revenue": 90000.00,
    "total_pending_revenue": 1800.00,
    "average_processing_days": 5.5,
    "sla_breached_count": 10
  }
}
```

### 4.19 Track Application (Public - No Auth Required)
```
GET /track/:application_number
```

**Response:**
```json
{
  "success": true,
  "message": "Application status retrieved",
  "data": {
    "application_number": "APP-2025-000001",
    "service_name": "Birth Certificate",
    "service_name_hindi": "जन्म प्रमाण पत्र",
    "status": "processing",
    "submitted_at": "2025-01-01T10:00:00Z",
    "created_at": "2025-01-01T09:00:00Z"
  }
}
```

---

## 5. Geography

### 5.1 States

#### Get All States
```
GET /geography/states?page=1&per_page=20&type=state&zone=south&search=karnataka&sort_by=name&sort_order=1
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 20, max: 100)
- `type` - Filter by type: `state` or `union_territory`
- `zone` - Filter by zone: `north`, `south`, `east`, `west`, `central`, `northeast`
- `search` - Search in name
- `sort_by` - Sort field (name, code, population, area_sq_km)
- `sort_order` - 0 = DESC, 1 = ASC

**Response:**
```json
{
  "success": true,
  "message": "States retrieved",
  "data": [
    {
      "id": "uuid",
      "code": "KA",
      "name": "Karnataka",
      "name_hindi": "कर्नाटक",
      "name_local": "ಕರ್ನಾಟಕ",
      "type": "state",
      "zone": "south",
      "capital": "Bengaluru",
      "iso_code": "IN-KA",
      "vehicle_code": "KA",
      "official_language": "Kannada",
      "additional_languages": ["Tulu", "Konkani", "Kodava", "Urdu"],
      "total_districts": 31,
      "total_taluks": 232,
      "total_gram_panchayats": 6551,
      "total_villages": 28194,
      "total_municipalities": 0,
      "population": 61095297,
      "area_sq_km": 191791,
      "density": 318.55,
      "literacy_rate": 75.36,
      "sex_ratio": 973,
      "map_url": null,
      "flag_url": null,
      "is_active": true,
      "sort_order": 11,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 36,
    "total_pages": 2
  }
}
```

#### Get State by ID
```
GET /geography/states/:id
```

#### Get State by Code
```
GET /geography/states/code/:code
```

#### Get State Districts
```
GET /geography/states/:id/districts
```

#### Get State Summary
```
GET /geography/states/:id/summary
```

### 5.2 Districts

#### Get All Districts
```
GET /geography/districts?page=1&per_page=20&state_id=uuid&search=bangalore&sort_by=name&sort_order=1
```

**Response:**
```json
{
  "success": true,
  "message": "Districts retrieved",
  "data": [
    {
      "id": "uuid",
      "state_id": "uuid",
      "code": "KA-BLR",
      "name": "Bangalore Urban",
      "name_hindi": "बेंगलुरु शहरी",
      "name_local": "ಬೆಂಗಳೂರು ನಗರ",
      "headquarters": "Bengaluru",
      "total_taluks": 4,
      "total_gram_panchayats": 0,
      "total_villages": 0,
      "total_municipalities": 1,
      "population": 9621551,
      "area_sq_km": 2190,
      "density": 4393.86,
      "literacy_rate": 88.48,
      "sex_ratio": 916,
      "is_active": true,
      "sort_order": 1,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z",
      "state": {
        "id": "uuid",
        "code": "KA",
        "name": "Karnataka"
      }
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 31,
    "total_pages": 2
  }
}
```

#### Get District by ID
```
GET /geography/districts/:id
```

#### Get District by Code
```
GET /geography/districts/code/:code
```

#### Get District Taluks
```
GET /geography/districts/:id/taluks
```

### 5.3 Taluks

#### Get All Taluks
```
GET /geography/taluks?page=1&per_page=20&state_id=uuid&district_id=uuid&search=anekal
```

#### Get Taluk by ID
```
GET /geography/taluks/:id
```

#### Get Taluk Gram Panchayats
```
GET /geography/taluks/:id/gram-panchayats
```

### 5.4 Gram Panchayats

#### Get All Gram Panchayats
```
GET /geography/gram-panchayats?page=1&per_page=20&state_id=uuid&district_id=uuid&taluk_id=uuid&search=name
```

#### Get Gram Panchayat by ID
```
GET /geography/gram-panchayats/:id
```

#### Get Gram Panchayat Villages
```
GET /geography/gram-panchayats/:id/villages
```

### 5.5 Villages

#### Get All Villages
```
GET /geography/villages?page=1&per_page=20&state_id=uuid&district_id=uuid&taluk_id=uuid&gram_panchayat_id=uuid
```

#### Get Village by ID
```
GET /geography/villages/:id
```

### 5.6 Search Locations
```
GET /geography/search?q=bangalore&type=district
```

### 5.7 National Summary
```
GET /geography/india
```

**Response:**
```json
{
  "success": true,
  "message": "National summary retrieved",
  "data": {
    "total_states": 28,
    "total_union_territories": 8,
    "total_districts": 773,
    "total_taluks": 6000,
    "total_gram_panchayats": 250000,
    "total_villages": 600000,
    "total_population": 1400000000
  }
}
```

---

## 6. Common Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Success with Pagination
```json
{
  "success": true,
  "message": "Items retrieved",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Common HTTP Status Codes
- `200` - OK (Success)
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Common Error Codes
- `INVALID_REQUEST` - Malformed request body
- `MISSING_FIELD` - Required field is missing
- `INVALID_ID` - Invalid UUID format
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Permission denied
- `DUPLICATE` - Resource already exists
- `VALIDATION_ERROR` - Validation failed

---

## Health Check Endpoints

### Health
```
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00Z",
  "version": "1.0.0",
  "services": {
    "postgres": "healthy",
    "redis": "healthy"
  },
  "system": {
    "go_version": "go1.21.13",
    "num_goroutine": 7,
    "uptime": "24h30m15s"
  }
}
```

### Ping
```
GET /ping
```

**Response:**
```json
{
  "message": "pong"
}
```

### Ready
```
GET /ready
```

**Response:**
```json
{
  "ready": true
}
```

---

## Notes for Developers

1. **Authentication**: All `/applications/*` endpoints require Bearer token authentication. Get token via `/auth/otp/verify`.

2. **Pagination**: Default `per_page` is 20, max is 100. Always check `meta.total_pages`.

3. **Date Format**: All dates are in ISO 8601 format (UTC): `2025-01-01T00:00:00Z`

4. **UUID Format**: All IDs are UUID v4 format: `550e8400-e29b-41d4-a716-446655440000`

5. **Nullable Fields**: Fields marked with `omitempty` in responses may be `null` or absent.

6. **File Uploads**: Document upload returns URL; actual file upload should be done to storage service first.

7. **Rate Limiting**: API is rate limited. Check response headers for limits.

8. **CORS**: API allows all origins. For production, configure allowed origins.

---

*Last Updated: December 27, 2025*
*API Version: 1.0.0*
