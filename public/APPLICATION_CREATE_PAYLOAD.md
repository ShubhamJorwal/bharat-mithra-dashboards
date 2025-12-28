# Application Create V2 - Complete Payload Reference

## POST /api/v1/applications/v2

### Complete Payload with All Fields

```json
{
  // ==================== REQUIRED FIELDS ====================
  "service_id": "uuid-of-service",                    // REQUIRED - The service to apply for

  // ==================== APPLICANT PERSONAL INFO ====================
  "applicant_name": "John Doe",                       // Full name
  "applicant_mobile": "9876543210",                   // 10-digit mobile
  "applicant_email": "john@example.com",              // Email address
  "applicant_father_name": "Richard Doe",             // Father's name
  "applicant_mother_name": "Mary Doe",                // Mother's name
  "applicant_spouse_name": "Jane Doe",                // Spouse name (if married)
  "applicant_dob": "1990-01-15",                      // Date of birth (YYYY-MM-DD)
  "applicant_gender": "Male",                         // Male, Female, Other
  "applicant_religion": "Hindu",                      // Hindu, Muslim, Christian, Sikh, etc.
  "applicant_caste": "Brahmin",                       // Caste name
  "applicant_caste_category": "General",              // General, OBC, SC, ST, EWS
  "applicant_nationality": "Indian",                  // Nationality
  "applicant_marital_status": "Single",               // Single, Married, Divorced, Widowed
  "applicant_occupation": "Software Engineer",        // Occupation
  "applicant_qualification": "B.Tech",                // Educational qualification
  "applicant_annual_income": 500000,                  // Annual income in INR (number)

  // ==================== IDENTITY DOCUMENTS ====================
  "applicant_aadhaar_last4": "1234",                  // Last 4 digits of Aadhaar
  "applicant_pan_number": "ABCDE1234F",               // PAN number
  "applicant_voter_id": "ABC1234567",                 // Voter ID number
  "applicant_passport_number": "J1234567",            // Passport number
  "applicant_driving_license": "KA0120200001234",     // Driving license number
  "applicant_photo_url": "https://s3.../photo.jpg",   // Photo URL
  "applicant_signature_url": "https://s3.../sign.jpg", // Signature URL

  // ==================== LEGACY ADDRESS (Simple) ====================
  "applicant_address": "123 Main Street, Near Temple",
  "applicant_village": "Rajpur",
  "applicant_block": "Central Block",
  "applicant_district": "Jaipur",
  "applicant_state_code": "RJ",                       // 2-letter state code
  "applicant_pincode": "302001",

  // ==================== DOCUMENT ADDRESS (Permanent/Aadhaar) ====================
  "doc_address_line1": "123 Main Street",
  "doc_address_line2": "Near Gandhi Chowk",
  "doc_address_landmark": "Opposite SBI Bank",
  "doc_address_village": "Rajpur",
  "doc_address_block": "Central Block",
  "doc_address_taluk": "Jaipur Taluk",
  "doc_address_district": "Jaipur",
  "doc_address_state_code": "RJ",
  "doc_address_state_name": "Rajasthan",
  "doc_address_pincode": "302001",
  "doc_address_country": "India",
  "doc_address_type": "permanent",                    // permanent, temporary

  // ==================== CURRENT ADDRESS (Present) ====================
  "curr_address_line1": "456 New Colony",
  "curr_address_line2": "Sector 5",
  "curr_address_landmark": "Near Metro Station",
  "curr_address_village": "New Delhi",
  "curr_address_block": "South Block",
  "curr_address_taluk": "New Delhi",
  "curr_address_district": "New Delhi",
  "curr_address_state_code": "DL",
  "curr_address_state_name": "Delhi",
  "curr_address_pincode": "110001",
  "curr_address_country": "India",
  "curr_address_duration_years": 5,                   // How long at current address
  "is_address_same_as_document": false,               // Is current = document address?

  // ==================== ALTERNATE CONTACT ====================
  "alt_contact_name": "Jane Doe",
  "alt_contact_mobile": "9876543211",
  "alt_contact_relation": "Spouse",                   // Father, Mother, Spouse, Sibling, etc.
  "alt_contact_email": "jane@example.com",

  // ==================== BANK DETAILS (for DBT) ====================
  "bank_account_name": "John Doe",
  "bank_account_number": "1234567890123456",
  "bank_ifsc_code": "SBIN0001234",
  "bank_name": "State Bank of India",
  "bank_branch": "Jaipur Main Branch",

  // ==================== AGENT INFO (if agent submitting) ====================
  "agent_id": "uuid-of-agent",
  "agent_name": "Agent Kumar",
  "agent_mobile": "9876543212",
  "agent_center": "CSC Center Jaipur",

  // ==================== SOURCE & DEVICE ====================
  "source": "web",                                    // web, mobile, agent, csc
  "device_type": "desktop",                           // desktop, mobile, tablet
  "app_version": "1.0.0",

  // ==================== PRIORITY ====================
  "is_urgent": true,
  "urgency_reason": "Urgent requirement for passport application",

  // ==================== FORM DATA (Flexible JSON) ====================
  // Put any additional service-specific fields here
  "form_data": {
    "purpose_of_certificate": "Employment",
    "number_of_copies": 2,
    "delivery_preference": "speed_post",
    "custom_field_1": "value1",
    "custom_field_2": "value2"
  },

  // ==================== EXTRA DATA (Any additional JSON) ====================
  "extra_data": {
    "referral_code": "REF123",
    "campaign": "summer_2025"
  },

  // ==================== REMARKS ====================
  "remarks": "Please process urgently",

  // ==================== DOCUMENTS (Multiple Images Supported) ====================
  "documents": [
    // Option 1: Single file per document
    {
      "document_type": "identity",
      "document_name": "PAN Card",
      "file_url": "https://s3.amazonaws.com/bucket/pan.pdf",
      "document_number": "ABCDE1234F",
      "file_type": "application/pdf",
      "file_size_bytes": 524288
    },

    // Option 2: Multiple images for same document (e.g., front & back)
    {
      "document_type": "identity",
      "document_name": "Aadhaar Card",
      "document_number": "1234-5678-9012",
      "files": [
        {
          "file_url": "https://s3.amazonaws.com/bucket/aadhaar_front.jpg",
          "original_filename": "aadhaar_front.jpg",
          "file_type": "image/jpeg",
          "file_size_bytes": 256000,
          "page_number": 1
        },
        {
          "file_url": "https://s3.amazonaws.com/bucket/aadhaar_back.jpg",
          "original_filename": "aadhaar_back.jpg",
          "file_type": "image/jpeg",
          "file_size_bytes": 245000,
          "page_number": 2
        }
      ],
      "issue_date": "2020-01-15",
      "expiry_date": null,
      "issuing_authority": "UIDAI"
    },

    // Address proof with multiple pages
    {
      "document_type": "address",
      "document_name": "Electricity Bill",
      "document_number": "ELEC-12345",
      "files": [
        {
          "file_url": "https://s3.../bill_page1.jpg",
          "page_number": 1
        },
        {
          "file_url": "https://s3.../bill_page2.jpg",
          "page_number": 2
        }
      ]
    },

    // Photo
    {
      "document_type": "photo",
      "document_name": "Passport Photo",
      "file_url": "https://s3.amazonaws.com/bucket/photo.jpg",
      "file_type": "image/jpeg"
    },

    // Signature
    {
      "document_type": "signature",
      "document_name": "Applicant Signature",
      "file_url": "https://s3.amazonaws.com/bucket/signature.png",
      "file_type": "image/png"
    }
  ],

  // ==================== AUTO SUBMIT ====================
  "auto_submit": false                                // Auto-submit if all mandatory docs uploaded
}
```

---

## Field Reference Table

### Required Fields
| Field | Type | Description |
|-------|------|-------------|
| `service_id` | uuid | **REQUIRED** - Service UUID to apply for |

### Applicant Personal Info
| Field | Type | Description |
|-------|------|-------------|
| `applicant_name` | string | Full name of applicant |
| `applicant_mobile` | string | 10-digit mobile number |
| `applicant_email` | string | Email address |
| `applicant_father_name` | string | Father's full name |
| `applicant_mother_name` | string | Mother's full name |
| `applicant_spouse_name` | string | Spouse name (if married) |
| `applicant_dob` | string | Date of birth (YYYY-MM-DD) |
| `applicant_gender` | string | Male, Female, Other |
| `applicant_religion` | string | Hindu, Muslim, Christian, Sikh, Buddhist, Jain, Other |
| `applicant_caste` | string | Caste name |
| `applicant_caste_category` | string | General, OBC, SC, ST, EWS |
| `applicant_nationality` | string | Nationality (default: Indian) |
| `applicant_marital_status` | string | Single, Married, Divorced, Widowed |
| `applicant_occupation` | string | Current occupation |
| `applicant_qualification` | string | Educational qualification |
| `applicant_annual_income` | number | Annual income in INR |

### Identity Documents
| Field | Type | Description |
|-------|------|-------------|
| `applicant_aadhaar_last4` | string | Last 4 digits of Aadhaar |
| `applicant_pan_number` | string | PAN card number |
| `applicant_voter_id` | string | Voter ID number |
| `applicant_passport_number` | string | Passport number |
| `applicant_driving_license` | string | Driving license number |
| `applicant_photo_url` | string | URL to applicant photo |
| `applicant_signature_url` | string | URL to applicant signature |

### Document Address (Permanent/Aadhaar)
| Field | Type | Description |
|-------|------|-------------|
| `doc_address_line1` | string | Address line 1 |
| `doc_address_line2` | string | Address line 2 |
| `doc_address_landmark` | string | Nearby landmark |
| `doc_address_village` | string | Village/City name |
| `doc_address_block` | string | Block/Tehsil |
| `doc_address_taluk` | string | Taluk/Mandal |
| `doc_address_district` | string | District name |
| `doc_address_state_code` | string | 2-letter state code (RJ, MP, UP, etc.) |
| `doc_address_state_name` | string | Full state name |
| `doc_address_pincode` | string | 6-digit PIN code |
| `doc_address_country` | string | Country (default: India) |
| `doc_address_type` | string | permanent, temporary |

### Current Address (Present)
| Field | Type | Description |
|-------|------|-------------|
| `curr_address_line1` | string | Address line 1 |
| `curr_address_line2` | string | Address line 2 |
| `curr_address_landmark` | string | Nearby landmark |
| `curr_address_village` | string | Village/City name |
| `curr_address_block` | string | Block/Tehsil |
| `curr_address_taluk` | string | Taluk/Mandal |
| `curr_address_district` | string | District name |
| `curr_address_state_code` | string | 2-letter state code |
| `curr_address_state_name` | string | Full state name |
| `curr_address_pincode` | string | 6-digit PIN code |
| `curr_address_country` | string | Country |
| `curr_address_duration_years` | number | Years at current address |
| `is_address_same_as_document` | boolean | Current = Document address? |

### Alternate Contact
| Field | Type | Description |
|-------|------|-------------|
| `alt_contact_name` | string | Alternate contact name |
| `alt_contact_mobile` | string | Alternate mobile number |
| `alt_contact_relation` | string | Relation: Father, Mother, Spouse, Sibling, Friend |
| `alt_contact_email` | string | Alternate email |

### Bank Details (for DBT)
| Field | Type | Description |
|-------|------|-------------|
| `bank_account_name` | string | Account holder name |
| `bank_account_number` | string | Bank account number |
| `bank_ifsc_code` | string | IFSC code |
| `bank_name` | string | Bank name |
| `bank_branch` | string | Branch name |

### Document Upload Structure
| Field | Type | Description |
|-------|------|-------------|
| `document_type` | string | Type: identity, address, photo, signature, income, education |
| `document_name` | string | Name: Aadhaar Card, PAN Card, Passport, etc. |
| `file_url` | string | Single file URL (for single-file docs) |
| `files` | array | Multiple files array (for multi-page docs) |
| `files[].file_url` | string | URL of the file |
| `files[].original_filename` | string | Original file name |
| `files[].file_type` | string | MIME type |
| `files[].file_size_bytes` | number | File size in bytes |
| `files[].page_number` | number | Page/image number (1, 2, 3...) |
| `document_number` | string | Document ID number |
| `issue_date` | string | Date issued (YYYY-MM-DD) |
| `expiry_date` | string | Expiry date (YYYY-MM-DD) |
| `issuing_authority` | string | Issuing authority name |

---

## Common Document Types
| Type | Description |
|------|-------------|
| `identity` | Aadhaar, PAN, Passport, Voter ID, Driving License |
| `address` | Electricity Bill, Ration Card, Bank Statement, Rent Agreement |
| `photo` | Passport size photo |
| `signature` | Applicant signature |
| `income` | Salary Slip, ITR, Form 16 |
| `education` | Degree, Marksheet, Certificate |
| `property` | Property documents, Sale deed |
| `financial` | Bank statements, FD receipts |
| `business` | GST certificate, Registration |

---

## Minimal Payload Example

```json
{
  "service_id": "f3b7bbbd-121f-449d-a5da-cc7af66d3f3e",
  "applicant_name": "John Doe",
  "applicant_mobile": "9876543210",
  "applicant_state_code": "RJ",
  "form_data": {}
}
```

---

## With Documents Example (Multiple Images)

```json
{
  "service_id": "f3b7bbbd-121f-449d-a5da-cc7af66d3f3e",
  "applicant_name": "John Doe",
  "applicant_mobile": "9876543210",
  "applicant_father_name": "Richard Doe",
  "applicant_dob": "1990-01-15",
  "applicant_gender": "Male",
  "applicant_state_code": "RJ",
  "doc_address_line1": "123 Main Street",
  "doc_address_district": "Jaipur",
  "doc_address_pincode": "302001",
  "form_data": {
    "purpose": "Employment"
  },
  "documents": [
    {
      "document_type": "identity",
      "document_name": "Aadhaar Card",
      "document_number": "1234-5678-9012",
      "files": [
        {
          "file_url": "https://s3.../aadhaar_front.jpg",
          "page_number": 1
        },
        {
          "file_url": "https://s3.../aadhaar_back.jpg",
          "page_number": 2
        }
      ]
    },
    {
      "document_type": "photo",
      "file_url": "https://s3.../photo.jpg"
    }
  ]
}
```

---

## State Codes Reference

| Code | State/UT |
|------|----------|
| AN | Andaman and Nicobar |
| AP | Andhra Pradesh |
| AR | Arunachal Pradesh |
| AS | Assam |
| BR | Bihar |
| CH | Chandigarh |
| CT | Chhattisgarh |
| DL | Delhi |
| GA | Goa |
| GJ | Gujarat |
| HP | Himachal Pradesh |
| HR | Haryana |
| JH | Jharkhand |
| JK | Jammu and Kashmir |
| KA | Karnataka |
| KL | Kerala |
| LA | Ladakh |
| LD | Lakshadweep |
| MH | Maharashtra |
| ML | Meghalaya |
| MN | Manipur |
| MP | Madhya Pradesh |
| MZ | Mizoram |
| NL | Nagaland |
| OD | Odisha |
| PB | Punjab |
| PY | Puducherry |
| RJ | Rajasthan |
| SK | Sikkim |
| TN | Tamil Nadu |
| TS | Telangana |
| TR | Tripura |
| UK | Uttarakhand |
| UP | Uttar Pradesh |
| WB | West Bengal |
