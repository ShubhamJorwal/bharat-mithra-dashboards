import './TestPlan.scss';

const TestPlan = () => {
  return (
    <div className="tp-container">
      <div className="tp-header">
        <h1 className="tp-title">Bharat Mithra — Complete Service Platform Blueprint</h1>
        <p className="tp-subtitle">Deep Research + Database Schema + API Architecture + Dynamic Fields System</p>
        <div className="tp-meta">
          <span className="tp-badge tp-badge--research">Research from 10+ platforms</span>
          <span className="tp-badge tp-badge--api">50+ API Endpoints</span>
          <span className="tp-badge tp-badge--db">25+ Database Tables</span>
          <span className="tp-badge tp-badge--services">800+ Services Mapped</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1: RESEARCH SUMMARY */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="tp-section">
        <h2 className="tp-section-title">1. Research Summary — Reference Platforms</h2>

        <div className="tp-card">
          <h3>1.1 Karnataka One (karnatakaone.gov.in)</h3>
          <p>100+ services across 14 departments. Key categories:</p>
          <ul>
            <li><strong>Aadhaar/UIDAI</strong> — enrollment, updates, eAadhaar print, biometric update</li>
            <li><strong>Transport/RTO</strong> — learning license, driving license, RC extract, KSRTC/BMTC bus pass, RedBus</li>
            <li><strong>Municipal</strong> — property tax, khata certificate, UGD tax, building plan approval, advertisement tax</li>
            <li><strong>Revenue</strong> — NadaKacheri (land records), RTC, encumbrance certificates</li>
            <li><strong>Police</strong> — document attestation, traffic fines, police verification, arms license</li>
            <li><strong>Utilities</strong> — electricity (BESCOM/HESCOM/GESCOM/CESC/MESCOM), water (BWSSB), gas, BSNL/telecom</li>
            <li><strong>E-Stamping</strong> — stamp paper generation</li>
            <li><strong>Food & Civil Supplies</strong> — ration card print/apply/amend</li>
            <li><strong>Seva Sindhu</strong> — state citizen services portal integration</li>
          </ul>
        </div>

        <div className="tp-card">
          <h3>1.2 CSC - Common Service Centres (cscspv.in / csc.gov.in)</h3>
          <p>36+ core service categories. India's largest service delivery network:</p>
          <ul>
            <li><strong>G2C Services</strong> — Passport, PAN card, FASTag, Swachh Bharat, PM Awas Yojana, FSSAI, e-District, Election</li>
            <li><strong>Banking</strong> — AEPS, Aadhaar Pay, Jan Dhan accounts, deposits, mini ATM, money transfer</li>
            <li><strong>Insurance</strong> — Life, health, vehicle, crop (PM Fasal Bima), personal accident</li>
            <li><strong>Health</strong> — Tele-health, Jan Aushadhi, diagnostic kits, Ayurveda, super specialty consultation</li>
            <li><strong>Education</strong> — NDLM-DISHA, Tally courses, English courses, GST course, NIELIT, cyber gram</li>
            <li><strong>Agriculture</strong> — machine store, online marketplace, farmer registration</li>
            <li><strong>Travel</strong> — Train (IRCTC), bus, flight, hotel, darshan booking</li>
            <li><strong>Utility Payments</strong> — electricity, telephone, water, DTH, mobile recharge</li>
          </ul>
        </div>

        <div className="tp-card">
          <h3>1.3 BharatOne / Digital Seva Kendra Platforms</h3>
          <p>Private service aggregators with affiliate/commission models:</p>
          <ul>
            <li><strong>Banking Services</strong> — AEPS, cash deposit, money transfer, CSP kiosk, mini ATM, loan apply, credit card</li>
            <li><strong>Bill Payments (BBPS)</strong> — prepaid/DTH recharge, LIC, gas, electricity, water, FASTag</li>
            <li><strong>Government</strong> — Aadhaar enrollment/update, PAN (UTI/NSDL), passport, DL, voter ID, e-Shram, labour card</li>
            <li><strong>Registration & Tax</strong> — GST registration/return, TDS return, income tax return, TAN, company registration, MSME Udyam</li>
            <li><strong>Travel</strong> — IRCTC trains, bus, flights</li>
            <li><strong>Insurance</strong> — bike, car, commercial vehicle, health, travel, life</li>
            <li><strong>Affiliate Commission</strong> — per-transaction commission, retailer network, tiered earnings</li>
          </ul>
        </div>

        <div className="tp-card">
          <h3>1.4 MeeSeva / eMitra / eDistrict</h3>
          <p>State-level citizen portals (300+ services each):</p>
          <ul>
            <li><strong>Certificates</strong> — birth, death, caste (SC/ST/OBC), income, domicile, marriage, nationality</li>
            <li><strong>Land & Property</strong> — RTC, encumbrance, khata, mutation, land conversion</li>
            <li><strong>Social Welfare</strong> — old age pension, widow pension, disability certificate, scholarship</li>
            <li><strong>License & Permits</strong> — trade license, food license, building permit, shop establishment</li>
            <li><strong>Education</strong> — RTE admission, exam fee payment, scholarship, university results</li>
          </ul>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2: MASTER SERVICE CATEGORIES */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="tp-section">
        <h2 className="tp-section-title">2. Master Service Categories for Bharat Mithra</h2>
        <p className="tp-note">Consolidated from all reference platforms. These are the category_type values.</p>

        <div className="tp-grid">
          <div className="tp-card tp-card--cat">
            <div className="tp-cat-header tp-cat--govt">GOVERNMENT SERVICES</div>
            <ol>
              <li><strong>Identity & Documents</strong> — Aadhaar, PAN, Voter ID, Passport, Driving License</li>
              <li><strong>Certificates</strong> — Birth, Death, Caste, Income, Domicile, Marriage, Nationality, Character, Solvency</li>
              <li><strong>Land & Revenue</strong> — RTC, Encumbrance, Khata, Mutation, Land Conversion, Property Registration</li>
              <li><strong>Social Welfare & Schemes</strong> — PM Awas, PM Kisan, Atal Pension, Jan Dhan, Ayushman Bharat, e-Shram, Labour Card, Ration Card, Widow/Old Age Pension</li>
              <li><strong>Transport & RTO</strong> — Learning License, Driving License, RC, Vehicle Tax, Transfer of Ownership, Fancy Number, Fitness Certificate</li>
              <li><strong>Municipal & Civic</strong> — Property Tax, Water Connection, Trade License, Building Permit, Khata Transfer, Birth/Death Registration</li>
              <li><strong>Police & Legal</strong> — FIR, Police Verification, Passport Verification, Arms License, e-Court, RTI</li>
              <li><strong>Agriculture</strong> — Soil Health Card, Crop Insurance, PM Kisan, Farmer Registration, Seed Subsidy</li>
              <li><strong>Education & Scholarship</strong> — RTE, Scholarship (SC/ST/Minority/Merit), Exam Fees, University Registration</li>
              <li><strong>Food & Civil Supplies</strong> — Ration Card Apply/Amend/Print, BPL/APL Card</li>
              <li><strong>E-Stamping & Registration</strong> — Stamp Paper, Document Registration, Rental Agreement</li>
            </ol>
          </div>

          <div className="tp-card tp-card--cat">
            <div className="tp-cat-header tp-cat--private">PRIVATE / B2C SERVICES</div>
            <ol>
              <li><strong>Banking & Finance</strong> — AEPS, Aadhaar Pay, Money Transfer (DMT), Mini ATM, Cash Deposit, Account Opening, Loan Apply, Credit Card</li>
              <li><strong>Insurance</strong> — Life, Health, Vehicle (2W/4W/Commercial), Travel, Crop, Personal Accident, Home</li>
              <li><strong>Bill Payments (BBPS)</strong> — Electricity, Water, Gas, Broadband, Postpaid Mobile, DTH, LIC Premium, Loan EMI, FASTag</li>
              <li><strong>Recharge</strong> — Prepaid Mobile, DTH, Data Card, FASTag</li>
              <li><strong>Travel & Booking</strong> — Train (IRCTC), Bus, Flight, Hotel, Cab, Darshan/Temple Booking</li>
              <li><strong>E-Commerce</strong> — Product Sales (LED Bulbs, Electronics), Medicine Delivery</li>
              <li><strong>Health & Telemedicine</strong> — Tele-consultation, Lab Tests (Thyrocare), Ayurveda, Specialist Consult, Health Card</li>
              <li><strong>Digital Signature & Security</strong> — DSC (Digital Signature Certificate), e-Sign</li>
            </ol>
          </div>

          <div className="tp-card tp-card--cat">
            <div className="tp-cat-header tp-cat--it">IT & BUSINESS SERVICES</div>
            <ol>
              <li><strong>Tax & Compliance</strong> — GST Registration/Return/Correction, Income Tax Return, TDS Return, TAN Registration</li>
              <li><strong>Business Registration</strong> — MSME Udyam, Company Registration (Pvt Ltd/OPC/LLP), Partnership Deed, Trade License, FSSAI License</li>
              <li><strong>Trademark & IP</strong> — Trademark Registration, Copyright, Patent Filing</li>
              <li><strong>Website & Digital</strong> — Website Development, Mobile App Development, SEO, Digital Marketing, Social Media Management</li>
              <li><strong>Accounting & Bookkeeping</strong> — Tally Setup, GST Bookkeeping, Payroll, Audit Assistance</li>
              <li><strong>Legal Services</strong> — Legal Consultation, Agreement Drafting, Will Preparation, Affidavit</li>
              <li><strong>BIS & Quality</strong> — BIS Registration, ISO Certification, Quality Compliance</li>
            </ol>
          </div>

          <div className="tp-card tp-card--cat">
            <div className="tp-cat-header tp-cat--affiliate">AFFILIATE SERVICES</div>
            <ol>
              <li><strong>Commission-based Retail</strong> — Every service earns operator a commission</li>
              <li><strong>Retailer Network</strong> — Onboard sub-retailers, earn on their transactions</li>
              <li><strong>White-Label Services</strong> — Use Bharat Mithra API to offer services under own brand</li>
              <li><strong>Tiered Commission</strong> — Volume-based commission slabs (higher volume = higher %)</li>
            </ol>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3: DATABASE SCHEMA — EXISTING TABLES (already in genome) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="tp-section">
        <h2 className="tp-section-title">3. Database Schema — Existing Tables (Already in Genome Backend)</h2>
        <p className="tp-note">These tables already exist and are well-designed. We'll BUILD ON TOP of them.</p>

        <div className="tp-card tp-card--schema">
          <h3>3.1 Existing Tables We Keep As-Is</h3>
          <div className="tp-table-wrapper">
            <table className="tp-table">
              <thead>
                <tr>
                  <th>Table</th>
                  <th>Purpose</th>
                  <th>Key Columns</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>service_categories</code></td>
                  <td>Parent/child category tree</td>
                  <td>id, name, slug, parent_id, category_type (government/private/hybrid), department, ministry, color_code, priority_score, is_featured, service_count</td>
                </tr>
                <tr>
                  <td><code>services</code></td>
                  <td>Master service record</td>
                  <td>id, category_id, name, slug, service_type, service_mode, service_level, service_fee, platform_fee, form_fields (JSON), extra_fields (JSONB), required_documents[], available_states[], eligibility_criteria, processing_time, 50+ more columns</td>
                </tr>
                <tr>
                  <td><code>service_forms</code></td>
                  <td>Dynamic form schemas (versioned)</td>
                  <td>id, service_id, version, form_schema (JSONB), is_active</td>
                </tr>
                <tr>
                  <td><code>service_pricing</code></td>
                  <td>Location-specific pricing</td>
                  <td>id, service_id, state_code, district_code, service_fee, platform_fee, government_fee, convenience_fee, gst_percentage, express_available</td>
                </tr>
                <tr>
                  <td><code>service_documents</code></td>
                  <td>Required document definitions</td>
                  <td>id, service_id, document_name, document_type, is_mandatory, accepted_formats[], max_size_mb, state_specific</td>
                </tr>
                <tr>
                  <td><code>service_workflow</code></td>
                  <td>Processing pipeline steps</td>
                  <td>id, service_id, step_number, step_name, step_type (manual/automatic/verification/approval/payment), assigned_role, sla_hours</td>
                </tr>
                <tr>
                  <td><code>service_faqs</code></td>
                  <td>FAQ per service</td>
                  <td>id, service_id, question, answer (bilingual)</td>
                </tr>
                <tr>
                  <td><code>service_eligibility</code></td>
                  <td>Eligibility rule engine</td>
                  <td>id, service_id, rule_type (age/income/gender/caste/state), rule_operator, rule_value, error_message</td>
                </tr>
                <tr>
                  <td><code>service_status_mapping</code></td>
                  <td>Custom status per service</td>
                  <td>id, service_id, status_code, status_name, status_color, is_final, is_success</td>
                </tr>
                <tr>
                  <td><code>service_office_locations</code></td>
                  <td>Physical office directory</td>
                  <td>id, service_id, state_code, district_code, office_name, address, lat/lng, phone, working_hours</td>
                </tr>
                <tr>
                  <td><code>service_contact_persons</code></td>
                  <td>Contact directory</td>
                  <td>id, service_id, state_code, name, designation, phone, email, availability_hours</td>
                </tr>
                <tr>
                  <td><code>service_checklist</code></td>
                  <td>Pre-application checklist</td>
                  <td>id, service_id, item_text, is_mandatory</td>
                </tr>
                <tr>
                  <td><code>service_state_availability</code></td>
                  <td>State-wise availability</td>
                  <td>id, service_id, state_code, is_available, local_service_name, state_portal_url</td>
                </tr>
                <tr>
                  <td><code>service_caseworker_info</code></td>
                  <td>Step-by-step guidance for operators</td>
                  <td>id, service_id, state_code, portal details, offline office info, step-by-step process, form submission, document verification, payment info, tracking, tips</td>
                </tr>
                <tr>
                  <td><code>applications</code></td>
                  <td>Application submissions</td>
                  <td>id, user_id, service_id, agent_id, application_number, status, form_data (JSON), all applicant details, fees, payment, workflow tracking, 100+ columns</td>
                </tr>
                <tr>
                  <td><code>application_documents</code></td>
                  <td>Uploaded files per application</td>
                  <td>id, application_id, document_type, file_url, verification_status, ocr_data</td>
                </tr>
                <tr>
                  <td><code>application_status_history</code></td>
                  <td>Audit trail</td>
                  <td>id, application_id, from_status, to_status, remarks, changed_by</td>
                </tr>
                <tr>
                  <td><code>application_payment</code></td>
                  <td>Payment transactions</td>
                  <td>id, application_id, amount, payment_method, transaction_id, status</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 4: NEW TABLES TO ADD */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="tp-section">
        <h2 className="tp-section-title">4. New Database Tables to Add</h2>
        <p className="tp-note">These are NEW tables needed to support the full service ecosystem.</p>

        {/* 4.1 — service_field_templates */}
        <div className="tp-card tp-card--schema">
          <h3>4.1 <code>service_field_templates</code> — Reusable Dynamic Field Templates</h3>
          <p>Problem: Different services need different form fields (Aadhaar needs biometric, PAN needs photo+signature, certificates need applicant details, insurance needs nominee info). Instead of duplicating, create reusable field templates.</p>
          <div className="tp-code-block">
            <pre>{`CREATE TABLE service_field_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name   VARCHAR(100) NOT NULL UNIQUE,
    template_slug   VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT,
    category        VARCHAR(50) NOT NULL,
    -- category: 'personal', 'address', 'identity', 'banking', 'education',
    --           'employment', 'property', 'vehicle', 'nominee', 'business'
    field_schema    JSONB NOT NULL,
    -- Same structure as service_forms.form_schema.fields[]
    -- Example: [
    --   { "id": "father_name", "name": "father_name", "label": "Father's Name",
    --     "label_hindi": "पिता का नाम", "type": "text", "required": true,
    --     "validation": { "min_length": 2, "max_length": 100, "pattern": "^[a-zA-Z\\s]+$" } },
    --   { "id": "mother_name", "name": "mother_name", ... }
    -- ]
    is_system       BOOLEAN DEFAULT false,  -- system templates can't be deleted
    usage_count     INT DEFAULT 0,          -- how many services use this
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Example Templates:
-- 'personal_basic'     → name, father/mother name, DOB, gender, religion, caste
-- 'address_full'       → line1, line2, city, district, state, pincode, landmark
-- 'identity_docs'      → aadhaar_number, pan_number, voter_id
-- 'banking_details'    → account_holder, account_number, ifsc, bank_name, branch
-- 'nominee_info'       → nominee_name, relation, DOB, share_percentage
-- 'vehicle_info'       → registration_number, chassis, engine, make, model, year
-- 'business_info'      → business_name, type, GSTIN, address, PAN
-- 'education_info'     → qualification, university, year, marks/grade
-- 'employment_info'    → employer, designation, salary, experience_years
-- 'property_info'      → property_type, survey_number, extent, location`}</pre>
          </div>
        </div>

        {/* 4.2 — service_form_template_mapping */}
        <div className="tp-card tp-card--schema">
          <h3>4.2 <code>service_form_template_mapping</code> — Link Services to Field Templates</h3>
          <p>Maps which templates a service uses, with optional field overrides.</p>
          <div className="tp-code-block">
            <pre>{`CREATE TABLE service_form_template_mapping (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id      UUID NOT NULL REFERENCES services(id),
    template_id     UUID NOT NULL REFERENCES service_field_templates(id),
    section_title   VARCHAR(200),           -- override section name
    section_order   INT DEFAULT 0,          -- ordering in the form
    field_overrides JSONB,                  -- override specific field properties
    -- Example: { "father_name": { "required": false }, "dob": { "label": "Date of Birth of Applicant" } }
    excluded_fields TEXT[],                 -- fields from template to skip
    -- Example: ['religion', 'caste'] for a service that doesn't need them
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(service_id, template_id)
);`}</pre>
          </div>
        </div>

        {/* 4.3 — commission_slabs */}
        <div className="tp-card tp-card--schema">
          <h3>4.3 <code>commission_slabs</code> — Affiliate Commission Structure</h3>
          <div className="tp-code-block">
            <pre>{`CREATE TABLE commission_slabs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    slab_type           VARCHAR(20) NOT NULL,
    -- 'flat' | 'percentage' | 'tiered'
    service_id          UUID REFERENCES services(id),         -- NULL = applies to all
    category_id         UUID REFERENCES service_categories(id), -- NULL = applies to all
    -- Commission values (used for flat/percentage types)
    commission_amount   DECIMAL(10,2) DEFAULT 0,    -- flat amount in ₹
    commission_percent  DECIMAL(5,2) DEFAULT 0,     -- percentage of service_fee
    max_commission      DECIMAL(10,2),              -- cap for percentage type
    min_commission      DECIMAL(10,2),              -- floor for percentage type
    -- Tiered slabs (used when slab_type = 'tiered')
    tiers               JSONB,
    -- Example: [
    --   { "min_txn": 0,   "max_txn": 100,  "commission": 15.00, "type": "flat" },
    --   { "min_txn": 101, "max_txn": 500,  "commission": 20.00, "type": "flat" },
    --   { "min_txn": 501, "max_txn": null,  "commission": 2.5,   "type": "percent" }
    -- ]
    -- Applicability
    agent_type          VARCHAR(20),  -- 'retailer' | 'distributor' | 'super_distributor' | NULL (all)
    state_code          CHAR(2),      -- NULL = all states
    valid_from          DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_to            DATE,
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
          </div>
        </div>

        {/* 4.4 — commission_transactions */}
        <div className="tp-card tp-card--schema">
          <h3>4.4 <code>commission_transactions</code> — Commission Earnings Ledger</h3>
          <div className="tp-code-block">
            <pre>{`CREATE TABLE commission_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id      UUID NOT NULL REFERENCES applications(id),
    agent_id            UUID NOT NULL REFERENCES users(id),
    service_id          UUID NOT NULL REFERENCES services(id),
    slab_id             UUID REFERENCES commission_slabs(id),
    -- Amount details
    transaction_amount  DECIMAL(10,2) NOT NULL,  -- the service fee paid by user
    commission_amount   DECIMAL(10,2) NOT NULL,  -- earned commission
    tds_amount          DECIMAL(10,2) DEFAULT 0, -- TDS deducted
    net_amount          DECIMAL(10,2) NOT NULL,  -- commission - TDS
    -- Status
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- 'pending' | 'approved' | 'paid' | 'rejected' | 'reversed'
    paid_at             TIMESTAMPTZ,
    payment_reference   VARCHAR(100),
    -- Hierarchy commission (if agent was referred by distributor)
    parent_agent_id     UUID REFERENCES users(id),
    parent_commission   DECIMAL(10,2) DEFAULT 0,
    -- Meta
    remarks             TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
          </div>
        </div>

        {/* 4.5 — service_providers */}
        <div className="tp-card tp-card--schema">
          <h3>4.5 <code>service_providers</code> — External API Providers</h3>
          <p>For services fulfilled via external APIs (AEPS, money transfer, recharge, bill pay, insurance, etc.)</p>
          <div className="tp-code-block">
            <pre>{`CREATE TABLE service_providers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(100) NOT NULL UNIQUE,
    provider_type       VARCHAR(50) NOT NULL,
    -- 'payment_gateway' | 'banking_api' | 'insurance_api' | 'utility_api' |
    -- 'travel_api' | 'identity_api' | 'government_portal' | 'recharge_api'
    api_base_url        VARCHAR(500),
    api_version         VARCHAR(20),
    auth_type           VARCHAR(30),  -- 'api_key' | 'oauth2' | 'jwt' | 'basic' | 'hmac'
    credentials         JSONB,        -- encrypted: { "api_key": "...", "secret": "...", "merchant_id": "..." }
    -- Operational
    is_sandbox          BOOLEAN DEFAULT true,
    sandbox_url         VARCHAR(500),
    production_url      VARCHAR(500),
    webhook_url         VARCHAR(500),
    callback_url        VARCHAR(500),
    -- Status & Config
    health_check_url    VARCHAR(500),
    last_health_check   TIMESTAMPTZ,
    is_active           BOOLEAN DEFAULT true,
    priority            INT DEFAULT 0,  -- for failover: higher = try first
    config              JSONB,          -- provider-specific settings
    supported_services  UUID[],         -- array of service_ids
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
          </div>
        </div>

        {/* 4.6 — service_provider_transactions */}
        <div className="tp-card tp-card--schema">
          <h3>4.6 <code>service_provider_transactions</code> — External API Call Logs</h3>
          <div className="tp-code-block">
            <pre>{`CREATE TABLE service_provider_transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id      UUID REFERENCES applications(id),
    provider_id         UUID NOT NULL REFERENCES service_providers(id),
    service_id          UUID NOT NULL REFERENCES services(id),
    -- Request/Response
    request_payload     JSONB,
    response_payload    JSONB,
    http_status         INT,
    -- Transaction details
    provider_txn_id     VARCHAR(200),
    provider_ref_id     VARCHAR(200),
    amount              DECIMAL(10,2),
    status              VARCHAR(30) NOT NULL DEFAULT 'initiated',
    -- 'initiated' | 'processing' | 'success' | 'failed' | 'timeout' | 'refunded'
    error_code          VARCHAR(50),
    error_message       TEXT,
    -- Timing
    initiated_at        TIMESTAMPTZ DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,
    response_time_ms    INT,
    -- Retry
    retry_count         INT DEFAULT 0,
    parent_txn_id       UUID REFERENCES service_provider_transactions(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
          </div>
        </div>

        {/* 4.7 — service_bundles */}
        <div className="tp-card tp-card--schema">
          <h3>4.7 <code>service_bundles</code> — Service Packages / Combos</h3>
          <p>E.g., "New Business Starter Pack" = GST + MSME + PAN + Bank Account Opening</p>
          <div className="tp-code-block">
            <pre>{`CREATE TABLE service_bundles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    name_hindi          VARCHAR(200),
    slug                VARCHAR(100) NOT NULL UNIQUE,
    description         TEXT,
    description_hindi   TEXT,
    icon_url            VARCHAR(500),
    banner_url          VARCHAR(500),
    -- Pricing
    original_price      DECIMAL(10,2) NOT NULL,  -- sum of individual prices
    bundle_price        DECIMAL(10,2) NOT NULL,  -- discounted price
    discount_percent    DECIMAL(5,2),
    -- Services included
    service_ids         UUID[] NOT NULL,
    -- Display
    is_featured         BOOLEAN DEFAULT false,
    is_active           BOOLEAN DEFAULT true,
    valid_from          DATE,
    valid_to            DATE,
    sort_order          INT DEFAULT 0,
    target_audience     VARCHAR(50),  -- 'individual' | 'business' | 'farmer' | 'student' | 'all'
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
          </div>
        </div>

        {/* 4.8 — service_reviews */}
        <div className="tp-card tp-card--schema">
          <h3>4.8 <code>service_reviews</code> — User Reviews & Ratings</h3>
          <div className="tp-code-block">
            <pre>{`CREATE TABLE service_reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id          UUID NOT NULL REFERENCES services(id),
    user_id             UUID NOT NULL REFERENCES users(id),
    application_id      UUID REFERENCES applications(id),
    rating              INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text         TEXT,
    -- Moderation
    is_approved         BOOLEAN DEFAULT false,
    is_flagged          BOOLEAN DEFAULT false,
    approved_by         UUID REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    -- Meta
    helpful_count       INT DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, application_id)
);`}</pre>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 5: DYNAMIC FORM FIELDS — THE DIFFERENT FIELDS CONCEPT */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="tp-section">
        <h2 className="tp-section-title">5. Dynamic Form Fields — "Different Different Fields" Concept</h2>
        <p className="tp-note">This is the core architecture that allows EVERY service to have its OWN unique set of form fields while keeping the system unified.</p>

        <div className="tp-card">
          <h3>5.1 How It Works — 3-Layer System</h3>
          <div className="tp-code-block">
            <pre>{`┌───────────────────────────────────────────────────────────────────┐
│                    LAYER 1: FIELD TEMPLATES                       │
│    Reusable building blocks (personal_info, address, identity)    │
│    Stored in: service_field_templates.field_schema (JSONB)        │
├───────────────────────────────────────────────────────────────────┤
│                    LAYER 2: SERVICE FORM                          │
│    Combines templates + custom fields for each service            │
│    Stored in: service_forms.form_schema (JSONB)                   │
│    Versioned — can update form without breaking old applications  │
├───────────────────────────────────────────────────────────────────┤
│                    LAYER 3: APPLICATION DATA                      │
│    User-submitted values stored as JSON                           │
│    Stored in: applications.form_data (JSON)                       │
│    Validated against the form_schema version at submission time   │
└───────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </div>

        <div className="tp-card">
          <h3>5.2 Form Schema Structure (JSONB in service_forms)</h3>
          <div className="tp-code-block">
            <pre>{`{
  "title": "Income Certificate Application",
  "description": "Apply for income certificate from revenue department",
  "sections": [
    {
      "id": "sec_personal",
      "title": "Personal Information",
      "title_hindi": "व्यक्तिगत जानकारी",
      "description": "Applicant's basic details",
      "sort_order": 1,
      "template_id": "uuid-of-personal-basic-template",  // ← uses template
      "fields": [
        // Auto-populated from template, plus custom overrides:
        {
          "id": "annual_income",
          "name": "annual_income",
          "label": "Annual Income (₹)",
          "label_hindi": "वार्षिक आय (₹)",
          "type": "number",
          "placeholder": "Enter annual income",
          "required": true,
          "sort_order": 10,
          "validation": {
            "min": 0,
            "max": 100000000,
            "pattern": "^[0-9]+$",
            "pattern_msg": "Only numbers allowed"
          }
        },
        {
          "id": "income_source",
          "name": "income_source",
          "label": "Source of Income",
          "label_hindi": "आय का स्रोत",
          "type": "select",
          "required": true,
          "sort_order": 11,
          "options": [
            { "value": "salary", "label": "Salary", "label_hindi": "वेतन" },
            { "value": "business", "label": "Business", "label_hindi": "व्यापार" },
            { "value": "agriculture", "label": "Agriculture", "label_hindi": "कृषि" },
            { "value": "pension", "label": "Pension", "label_hindi": "पेंशन" },
            { "value": "other", "label": "Other", "label_hindi": "अन्य" }
          ]
        }
      ]
    },
    {
      "id": "sec_address",
      "title": "Residential Address",
      "title_hindi": "आवासीय पता",
      "sort_order": 2,
      "template_id": "uuid-of-address-full-template",   // ← uses template
      "fields": []  // all fields from template, no overrides
    },
    {
      "id": "sec_documents",
      "title": "Supporting Documents",
      "title_hindi": "सहायक दस्तावेज",
      "sort_order": 3,
      "fields": [
        {
          "id": "salary_slip",
          "name": "salary_slip",
          "label": "Latest Salary Slip / Income Proof",
          "label_hindi": "नवीनतम वेतन पर्ची",
          "type": "file",
          "required": true,
          "sort_order": 1,
          "validation": {
            "file_types": ["pdf", "jpg", "jpeg", "png"],
            "max_file_size": 5242880
          }
        }
      ]
    }
  ]
}`}</pre>
          </div>
        </div>

        <div className="tp-card">
          <h3>5.3 Real-World Service Examples — Different Fields for Different Services</h3>
          <div className="tp-table-wrapper">
            <table className="tp-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Templates Used</th>
                  <th>Custom Fields</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Aadhaar Enrollment</strong></td>
                  <td>personal_basic, address_full</td>
                  <td>biometric_consent, photo (file), iris_scan, fingerprint, POI document type, POA document type</td>
                </tr>
                <tr>
                  <td><strong>PAN Card</strong></td>
                  <td>personal_basic, identity_docs</td>
                  <td>pan_type (individual/company), photo (file), signature (file), AO code, income_source</td>
                </tr>
                <tr>
                  <td><strong>Income Certificate</strong></td>
                  <td>personal_basic, address_full</td>
                  <td>annual_income, income_source, employer_name, salary_slip (file), ration_card_number</td>
                </tr>
                <tr>
                  <td><strong>Caste Certificate</strong></td>
                  <td>personal_basic, address_full</td>
                  <td>caste, sub_caste, father_caste_cert (file), community_headman_cert (file)</td>
                </tr>
                <tr>
                  <td><strong>Driving License</strong></td>
                  <td>personal_basic, address_full, identity_docs</td>
                  <td>vehicle_class[], blood_group, existing_ll_number, medical_cert (file), photo (file)</td>
                </tr>
                <tr>
                  <td><strong>Property Tax Payment</strong></td>
                  <td>property_info</td>
                  <td>property_id (SAS/PID), owner_name, ward_number, zone, tax_year, amount_due</td>
                </tr>
                <tr>
                  <td><strong>GST Registration</strong></td>
                  <td>personal_basic, business_info, address_full, banking_details</td>
                  <td>business_type (proprietor/partnership/pvt_ltd), constitution, trade_name, HSN codes[], turnover</td>
                </tr>
                <tr>
                  <td><strong>Vehicle Insurance</strong></td>
                  <td>personal_basic, vehicle_info, nominee_info</td>
                  <td>insurance_type (comprehensive/third_party), previous_policy, NCB_percent, IDV_amount, add_ons[]</td>
                </tr>
                <tr>
                  <td><strong>Money Transfer (DMT)</strong></td>
                  <td>identity_docs, banking_details</td>
                  <td>sender_mobile, beneficiary_name, beneficiary_account, beneficiary_ifsc, transfer_amount, transfer_mode (IMPS/NEFT)</td>
                </tr>
                <tr>
                  <td><strong>Electricity Bill</strong></td>
                  <td>—</td>
                  <td>consumer_number, service_provider (BESCOM/HESCOM/etc.), billing_unit, amount (auto-fetched)</td>
                </tr>
                <tr>
                  <td><strong>IRCTC Booking</strong></td>
                  <td>personal_basic</td>
                  <td>from_station, to_station, journey_date, train_number, class, quota, passengers[] (name, age, gender, berth_pref)</td>
                </tr>
                <tr>
                  <td><strong>Company Registration</strong></td>
                  <td>business_info, address_full</td>
                  <td>company_type, proposed_names[], directors[] (name, DIN, shareholding), authorized_capital, paid_up_capital, MOA (file), AOA (file)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="tp-card">
          <h3>5.4 Supported Field Types</h3>
          <div className="tp-grid tp-grid--3col">
            <div>
              <h4>Basic Inputs</h4>
              <ul>
                <li><code>text</code> — single-line text</li>
                <li><code>textarea</code> — multi-line text</li>
                <li><code>number</code> — numeric input</li>
                <li><code>email</code> — email with validation</li>
                <li><code>tel</code> — phone number</li>
                <li><code>password</code> — masked input</li>
                <li><code>url</code> — URL input</li>
              </ul>
            </div>
            <div>
              <h4>Selection</h4>
              <ul>
                <li><code>select</code> — dropdown single</li>
                <li><code>combobox</code> — searchable dropdown</li>
                <li><code>radio</code> — radio buttons</li>
                <li><code>checkbox</code> — checkboxes</li>
                <li><code>toggle</code> — boolean switch</li>
                <li><code>multi_select</code> — multiple select</li>
              </ul>
            </div>
            <div>
              <h4>Date/Time & File</h4>
              <ul>
                <li><code>date</code> — date picker</li>
                <li><code>datetime</code> — date + time</li>
                <li><code>time</code> — time only</li>
                <li><code>file</code> — file upload</li>
                <li><code>image</code> — image with preview</li>
                <li><code>signature</code> — signature pad</li>
              </ul>
            </div>
            <div>
              <h4>Composite</h4>
              <ul>
                <li><code>address</code> — full address block</li>
                <li><code>name</code> — first/middle/last</li>
                <li><code>repeater</code> — dynamic array (e.g., passengers[])</li>
                <li><code>group</code> — field group container</li>
                <li><code>dependent</code> — shows based on another field's value</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 6: API ENDPOINTS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="tp-section">
        <h2 className="tp-section-title">6. API Endpoints — Complete Architecture</h2>
        <p className="tp-note">Base URL: <code>https://dn0o2uwx5481n.cloudfront.net/api/v1</code></p>

        <div className="tp-card">
          <h3>6.1 Existing Endpoints (Already Built)</h3>
          <div className="tp-table-wrapper">
            <table className="tp-table tp-table--compact">
              <thead>
                <tr><th>Method</th><th>Endpoint</th><th>Purpose</th></tr>
              </thead>
              <tbody>
                <tr><td className="tp-method tp-method--get">GET</td><td>/categories</td><td>List categories (with filters, pagination)</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/categories/:id</td><td>Get category by ID</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/categories/slug/:slug</td><td>Get category by slug</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/categories/:id/subcategories</td><td>Get subcategories</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/categories/:id/services</td><td>Get services in category</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/categories</td><td>Create category</td></tr>
                <tr><td className="tp-method tp-method--put">PUT</td><td>/categories/:id</td><td>Update category</td></tr>
                <tr><td className="tp-method tp-method--del">DEL</td><td>/categories/:id</td><td>Delete category</td></tr>
                <tr><td colSpan={3} className="tp-divider-row">— Services —</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services</td><td>List services (paginated, filtered)</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/grouped</td><td>Services grouped by category</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/popular</td><td>Popular services</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/featured</td><td>Featured services</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/search</td><td>Full-text search</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/:id/complete</td><td>Full service details + form + FAQs + pricing + docs + workflow</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/:id/form</td><td>Active form schema</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/:id/pricing</td><td>Location-specific pricing</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/:id/documents</td><td>Required documents</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/:id/workflow</td><td>Workflow steps</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/:id/eligibility</td><td>Eligibility rules</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/services</td><td>Create service</td></tr>
                <tr><td className="tp-method tp-method--put">PUT</td><td>/services/:id</td><td>Update service</td></tr>
                <tr><td colSpan={3} className="tp-divider-row">— Applications —</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/applications</td><td>Submit application</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/applications</td><td>List applications</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/applications/:id</td><td>Application details</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="tp-card">
          <h3>6.2 New Endpoints to Add</h3>
          <div className="tp-table-wrapper">
            <table className="tp-table tp-table--compact">
              <thead>
                <tr><th>Method</th><th>Endpoint</th><th>Purpose</th></tr>
              </thead>
              <tbody>
                <tr><td colSpan={3} className="tp-divider-row">— Field Templates —</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/field-templates</td><td>List all field templates</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/field-templates/:id</td><td>Get template by ID</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/field-templates</td><td>Create new template</td></tr>
                <tr><td className="tp-method tp-method--put">PUT</td><td>/field-templates/:id</td><td>Update template</td></tr>
                <tr><td className="tp-method tp-method--del">DEL</td><td>/field-templates/:id</td><td>Delete (non-system only)</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/field-templates/category/:category</td><td>Templates by category (personal, address, etc.)</td></tr>

                <tr><td colSpan={3} className="tp-divider-row">— Template Mapping —</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/:id/field-templates</td><td>Get templates mapped to a service</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/services/:id/field-templates</td><td>Map template to service</td></tr>
                <tr><td className="tp-method tp-method--put">PUT</td><td>/services/:id/field-templates/:templateId</td><td>Update mapping (overrides)</td></tr>
                <tr><td className="tp-method tp-method--del">DEL</td><td>/services/:id/field-templates/:templateId</td><td>Remove template from service</td></tr>

                <tr><td colSpan={3} className="tp-divider-row">— Commission —</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/commissions/slabs</td><td>List all commission slabs</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/commissions/slabs/:id</td><td>Get slab details</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/commissions/slabs</td><td>Create commission slab</td></tr>
                <tr><td className="tp-method tp-method--put">PUT</td><td>/commissions/slabs/:id</td><td>Update slab</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/commissions/transactions</td><td>List commission transactions</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/commissions/summary</td><td>Agent commission summary (total earned, pending, paid)</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/commissions/payout</td><td>Process commission payout batch</td></tr>

                <tr><td colSpan={3} className="tp-divider-row">— Service Providers —</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/providers</td><td>List all service providers</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/providers/:id</td><td>Get provider details</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/providers</td><td>Register new provider</td></tr>
                <tr><td className="tp-method tp-method--put">PUT</td><td>/providers/:id</td><td>Update provider config</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/providers/:id/health</td><td>Check provider API health</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/providers/:id/transactions</td><td>Transaction logs for provider</td></tr>

                <tr><td colSpan={3} className="tp-divider-row">— Service Bundles —</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/bundles</td><td>List bundles</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/bundles/:id</td><td>Get bundle details</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/bundles</td><td>Create bundle</td></tr>
                <tr><td className="tp-method tp-method--put">PUT</td><td>/bundles/:id</td><td>Update bundle</td></tr>

                <tr><td colSpan={3} className="tp-divider-row">— Reviews —</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/services/:id/reviews</td><td>Get reviews for service</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/services/:id/reviews</td><td>Submit review</td></tr>
                <tr><td className="tp-method tp-method--put">PUT</td><td>/reviews/:id/approve</td><td>Approve review (admin)</td></tr>

                <tr><td colSpan={3} className="tp-divider-row">— Utility Endpoints —</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/utility/bill-fetch</td><td>Fetch bill for consumer number (BBPS)</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/utility/bill-pay</td><td>Pay utility bill</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/utility/recharge</td><td>Process recharge (mobile/DTH/FASTag)</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/banking/aeps</td><td>AEPS transaction (withdraw/balance/mini-stmt)</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/banking/dmt</td><td>Domestic money transfer</td></tr>
                <tr><td className="tp-method tp-method--post">POST</td><td>/banking/dmt/beneficiary</td><td>Add DMT beneficiary</td></tr>
                <tr><td className="tp-method tp-method--get">GET</td><td>/banking/dmt/beneficiaries</td><td>List beneficiaries</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 7: API REQUEST/RESPONSE EXAMPLES */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="tp-section">
        <h2 className="tp-section-title">7. API Request/Response Payloads</h2>

        <div className="tp-card">
          <h3>7.1 Create Service (with dynamic form)</h3>
          <div className="tp-code-block">
            <h4>POST /api/v1/services</h4>
            <pre>{`// REQUEST PAYLOAD
{
  "name": "Income Certificate",
  "name_hindi": "आय प्रमाण पत्र",
  "slug": "income-certificate",
  "category_id": "uuid-of-certificates-category",
  "description": "Apply for income certificate from revenue department",
  "service_type": "government",
  "service_mode": "both",
  "service_level": "district",
  "department": "Revenue Department",
  "issuing_authority": "Tahsildar",
  "processing_time": "7-15 days",
  "validity_period": "6 months",
  "service_fee": 0,
  "platform_fee": 50.00,
  "is_free_service": false,
  "is_aadhaar_required": true,
  "application_mode": "online",
  "payment_modes": ["upi", "debit_card", "net_banking", "wallet"],
  "available_states": ["KA", "TN", "AP", "MH"],
  "required_documents": ["Aadhaar Card", "Ration Card", "Salary Slip/Income Proof"],
  "eligibility_criteria": "Any resident of the state can apply",
  "icon_url": "/icons/income-certificate.svg"
}

// RESPONSE (201 Created)
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Income Certificate",
    "slug": "income-certificate",
    "category_id": "uuid-of-certificates-category",
    "service_type": "government",
    "service_fee": 0,
    "platform_fee": 50.00,
    "total_fee": 50.00,
    "is_active": true,
    "created_at": "2026-02-24T10:00:00Z"
  },
  "message": "Service created successfully"
}`}</pre>
          </div>
        </div>

        <div className="tp-card">
          <h3>7.2 Create/Update Form Schema for a Service</h3>
          <div className="tp-code-block">
            <h4>POST /api/v1/forms</h4>
            <pre>{`// REQUEST PAYLOAD
{
  "service_id": "550e8400-e29b-41d4-a716-446655440000",
  "form_schema": {
    "title": "Income Certificate Application Form",
    "description": "Fill in all details to apply for income certificate",
    "sections": [
      {
        "id": "personal",
        "title": "Applicant Details",
        "title_hindi": "आवेदक विवरण",
        "sort_order": 1,
        "fields": [
          {
            "id": "full_name", "name": "full_name",
            "label": "Full Name (as per Aadhaar)", "label_hindi": "पूरा नाम",
            "type": "text", "required": true, "sort_order": 1,
            "validation": { "min_length": 3, "max_length": 100 }
          },
          {
            "id": "father_name", "name": "father_name",
            "label": "Father's Name", "label_hindi": "पिता का नाम",
            "type": "text", "required": true, "sort_order": 2
          },
          {
            "id": "dob", "name": "dob",
            "label": "Date of Birth", "label_hindi": "जन्म तिथि",
            "type": "date", "required": true, "sort_order": 3
          },
          {
            "id": "gender", "name": "gender",
            "label": "Gender", "label_hindi": "लिंग",
            "type": "radio", "required": true, "sort_order": 4,
            "options": [
              { "value": "male", "label": "Male", "label_hindi": "पुरुष" },
              { "value": "female", "label": "Female", "label_hindi": "महिला" },
              { "value": "other", "label": "Other", "label_hindi": "अन्य" }
            ]
          },
          {
            "id": "aadhaar_number", "name": "aadhaar_number",
            "label": "Aadhaar Number", "label_hindi": "आधार संख्या",
            "type": "text", "required": true, "sort_order": 5,
            "validation": { "pattern": "^[0-9]{12}$", "pattern_msg": "Enter valid 12-digit Aadhaar" }
          },
          {
            "id": "mobile", "name": "mobile",
            "label": "Mobile Number", "label_hindi": "मोबाइल नंबर",
            "type": "tel", "required": true, "sort_order": 6,
            "validation": { "pattern": "^[6-9][0-9]{9}$", "pattern_msg": "Enter valid 10-digit mobile" }
          }
        ]
      },
      {
        "id": "income",
        "title": "Income Details",
        "title_hindi": "आय विवरण",
        "sort_order": 2,
        "fields": [
          {
            "id": "annual_income", "name": "annual_income",
            "label": "Annual Income (₹)", "type": "number",
            "required": true, "sort_order": 1,
            "validation": { "min": 0, "max": 100000000 }
          },
          {
            "id": "income_source", "name": "income_source",
            "label": "Source of Income", "type": "select",
            "required": true, "sort_order": 2,
            "options": [
              { "value": "salary", "label": "Salary" },
              { "value": "business", "label": "Business" },
              { "value": "agriculture", "label": "Agriculture" },
              { "value": "pension", "label": "Pension" },
              { "value": "rental", "label": "Rental Income" },
              { "value": "other", "label": "Other" }
            ]
          },
          {
            "id": "employer_name", "name": "employer_name",
            "label": "Employer/Business Name", "type": "text",
            "required": false, "sort_order": 3,
            "help_text": "Required if income source is Salary or Business"
          }
        ]
      },
      {
        "id": "address",
        "title": "Address",
        "title_hindi": "पता",
        "sort_order": 3,
        "fields": [
          { "id": "address_line1", "name": "address_line1", "label": "Address Line 1", "type": "text", "required": true, "sort_order": 1 },
          { "id": "address_line2", "name": "address_line2", "label": "Address Line 2", "type": "text", "required": false, "sort_order": 2 },
          { "id": "city", "name": "city", "label": "City/Village", "type": "text", "required": true, "sort_order": 3 },
          { "id": "district", "name": "district", "label": "District", "type": "select", "required": true, "sort_order": 4, "options": [] },
          { "id": "state", "name": "state", "label": "State", "type": "select", "required": true, "sort_order": 5, "options": [] },
          { "id": "pincode", "name": "pincode", "label": "Pincode", "type": "text", "required": true, "sort_order": 6, "validation": { "pattern": "^[0-9]{6}$" } }
        ]
      },
      {
        "id": "documents",
        "title": "Upload Documents",
        "title_hindi": "दस्तावेज अपलोड करें",
        "sort_order": 4,
        "fields": [
          {
            "id": "aadhaar_copy", "name": "aadhaar_copy",
            "label": "Aadhaar Card Copy", "type": "file",
            "required": true, "sort_order": 1,
            "validation": { "file_types": ["pdf","jpg","jpeg","png"], "max_file_size": 5242880 }
          },
          {
            "id": "income_proof", "name": "income_proof",
            "label": "Income Proof (Salary Slip/ITR/Form 16)", "type": "file",
            "required": true, "sort_order": 2,
            "validation": { "file_types": ["pdf","jpg","jpeg","png"], "max_file_size": 5242880 }
          }
        ]
      }
    ]
  }
}

// RESPONSE (201 Created)
{
  "success": true,
  "data": {
    "id": "form-uuid",
    "service_id": "550e8400-e29b-41d4-a716-446655440000",
    "version": 1,
    "is_active": true,
    "created_at": "2026-02-24T10:00:00Z"
  }
}`}</pre>
          </div>
        </div>

        <div className="tp-card">
          <h3>7.3 Submit Application (User filling the dynamic form)</h3>
          <div className="tp-code-block">
            <h4>POST /api/v1/applications</h4>
            <pre>{`// REQUEST PAYLOAD
{
  "service_id": "550e8400-e29b-41d4-a716-446655440000",
  "form_version": 1,
  "applicant_type": "self",
  "form_data": {
    "full_name": "Rajesh Kumar",
    "father_name": "Suresh Kumar",
    "dob": "1990-05-15",
    "gender": "male",
    "aadhaar_number": "123456789012",
    "mobile": "9876543210",
    "annual_income": 450000,
    "income_source": "salary",
    "employer_name": "TCS Limited",
    "address_line1": "123, MG Road",
    "address_line2": "Near Bus Stand",
    "city": "Bengaluru",
    "district": "Bengaluru Urban",
    "state": "KA",
    "pincode": "560001"
  },
  "documents": [
    { "document_type": "aadhaar_copy", "file_url": "uploads/aadhaar_rajesh.pdf" },
    { "document_type": "income_proof", "file_url": "uploads/salary_slip_rajesh.pdf" }
  ],
  "payment": {
    "method": "upi",
    "amount": 50.00
  }
}

// RESPONSE (201 Created)
{
  "success": true,
  "data": {
    "id": "app-uuid",
    "application_number": "BM-IC-2026-000001",
    "service_name": "Income Certificate",
    "status": "submitted",
    "total_fee": 50.00,
    "payment_status": "pending",
    "estimated_completion": "2026-03-10",
    "workflow": {
      "total_steps": 4,
      "current_step": 1,
      "steps": [
        { "step_number": 1, "name": "Application Received", "status": "completed" },
        { "step_number": 2, "name": "Document Verification", "status": "pending" },
        { "step_number": 3, "name": "Officer Approval", "status": "pending" },
        { "step_number": 4, "name": "Certificate Issue", "status": "pending" }
      ]
    },
    "created_at": "2026-02-24T10:05:00Z"
  },
  "message": "Application submitted successfully"
}`}</pre>
          </div>
        </div>

        <div className="tp-card">
          <h3>7.4 Commission Slab Creation</h3>
          <div className="tp-code-block">
            <h4>POST /api/v1/commissions/slabs</h4>
            <pre>{`// REQUEST
{
  "name": "Income Certificate - Retailer Commission",
  "slab_type": "flat",
  "service_id": "550e8400-e29b-41d4-a716-446655440000",
  "commission_amount": 15.00,
  "agent_type": "retailer",
  "valid_from": "2026-01-01"
}

// RESPONSE
{
  "success": true,
  "data": {
    "id": "slab-uuid",
    "name": "Income Certificate - Retailer Commission",
    "slab_type": "flat",
    "commission_amount": 15.00,
    "agent_type": "retailer",
    "is_active": true
  }
}

// ── Tiered Example (for Money Transfer) ──
{
  "name": "DMT Commission - Tiered",
  "slab_type": "tiered",
  "service_id": "uuid-of-dmt-service",
  "tiers": [
    { "min_txn": 0,    "max_txn": 5000,  "commission": 10.00, "type": "flat" },
    { "min_txn": 5001, "max_txn": 25000, "commission": 0.50,  "type": "percent" },
    { "min_txn": 25001,"max_txn": null,  "commission": 1.00,  "type": "percent", "max_cap": 250 }
  ],
  "agent_type": null,
  "valid_from": "2026-01-01"
}`}</pre>
          </div>
        </div>

        <div className="tp-card">
          <h3>7.5 Bill Fetch & Pay (BBPS)</h3>
          <div className="tp-code-block">
            <h4>POST /api/v1/utility/bill-fetch</h4>
            <pre>{`// REQUEST
{
  "service_id": "uuid-of-electricity-bill-service",
  "provider_slug": "bescom",
  "consumer_number": "1234567890",
  "billing_unit": "KA-BLR"
}

// RESPONSE
{
  "success": true,
  "data": {
    "consumer_name": "Rajesh Kumar",
    "consumer_number": "1234567890",
    "bill_amount": 2450.00,
    "bill_date": "2026-02-01",
    "due_date": "2026-02-28",
    "bill_period": "Jan 2026",
    "provider_ref": "BESCOM-REF-123456",
    "partial_pay_allowed": true,
    "min_amount": 500.00
  }
}

// ── Bill Payment ──
// POST /api/v1/utility/bill-pay
{
  "bill_fetch_ref": "BESCOM-REF-123456",
  "consumer_number": "1234567890",
  "amount": 2450.00,
  "payment_method": "upi"
}

// RESPONSE
{
  "success": true,
  "data": {
    "transaction_id": "BM-TXN-2026-000456",
    "provider_txn_id": "BBPS-789012",
    "amount": 2450.00,
    "convenience_fee": 10.00,
    "total_charged": 2460.00,
    "status": "success",
    "receipt_url": "/receipts/BM-TXN-2026-000456.pdf"
  }
}`}</pre>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 8: IMPLEMENTATION PHASES */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="tp-section">
        <h2 className="tp-section-title">8. Implementation Phases</h2>

        <div className="tp-card tp-card--phase">
          <div className="tp-phase-header tp-phase--1">PHASE 1 — Foundation (Backend)</div>
          <ol>
            <li>Create migration for new tables: <code>service_field_templates</code>, <code>service_form_template_mapping</code>, <code>commission_slabs</code>, <code>commission_transactions</code>, <code>service_providers</code>, <code>service_provider_transactions</code>, <code>service_bundles</code>, <code>service_reviews</code></li>
            <li>Create Go models for all new tables</li>
            <li>Create Go handlers/routes for field templates CRUD</li>
            <li>Create Go handlers/routes for commission CRUD + calculation</li>
            <li>Create Go handlers/routes for service providers CRUD</li>
            <li>Seed 10+ field templates (personal, address, identity, banking, etc.)</li>
            <li>Seed master service categories (all 4 types: government, private, IT, affiliate)</li>
          </ol>
        </div>

        <div className="tp-card tp-card--phase">
          <div className="tp-phase-header tp-phase--2">PHASE 2 — Service Data Seeding</div>
          <ol>
            <li>Seed 50+ government services with forms (certificates, identity, transport, municipal)</li>
            <li>Seed 30+ private/B2C services (banking, insurance, bill pay, recharge, travel)</li>
            <li>Seed 20+ IT/business services (GST, company reg, trademark, website dev)</li>
            <li>Set up pricing per state for key services</li>
            <li>Set up commission slabs per service/category</li>
            <li>Set up workflow steps for each service type</li>
          </ol>
        </div>

        <div className="tp-card tp-card--phase">
          <div className="tp-phase-header tp-phase--3">PHASE 3 — Dashboard Frontend</div>
          <ol>
            <li>Enhanced Service Portal — browsable by category with filters</li>
            <li>Dynamic Form Renderer — reads form_schema and renders correct fields</li>
            <li>Application Wizard — multi-step form with section navigation</li>
            <li>Commission Dashboard — agent's earnings, transactions, payout history</li>
            <li>Admin: Service Manager — create/edit services with drag-drop form builder</li>
            <li>Admin: Commission Manager — configure slabs and process payouts</li>
            <li>Admin: Provider Manager — configure external API providers</li>
          </ol>
        </div>

        <div className="tp-card tp-card--phase">
          <div className="tp-phase-header tp-phase--4">PHASE 4 — External Integrations</div>
          <ol>
            <li>BBPS integration (bill fetch + pay)</li>
            <li>AEPS/DMT banking integration</li>
            <li>Recharge APIs (mobile, DTH, FASTag)</li>
            <li>Insurance aggregator API</li>
            <li>IRCTC/travel booking API</li>
            <li>Payment gateway (Razorpay/Cashfree/PhonePe)</li>
          </ol>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 9: COMPLETE SERVICE MASTER LIST */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="tp-section">
        <h2 className="tp-section-title">9. Complete Service Master List (800+ Services)</h2>
        <p className="tp-note">Consolidated from Karnataka One, CSC, MeeSeva, eMitra, Digital Seva Kendra, BharatOne. This is what Bharat Mithra will offer.</p>

        <div className="tp-card">
          <h3>Government Services (by Department)</h3>
          <div className="tp-table-wrapper">
            <table className="tp-table">
              <thead><tr><th>Department</th><th>Services</th></tr></thead>
              <tbody>
                <tr><td><strong>UIDAI (Aadhaar)</strong></td><td>New Enrollment, Demographic Update, Biometric Update, Mobile Update, Email Update, eAadhaar Download (Color/BW), Address Validation Letter, PVC Card Print, eKYC</td></tr>
                <tr><td><strong>Income Tax</strong></td><td>PAN Card New (UTI/NSDL), PAN Correction, PAN Reprint, Duplicate PAN, Link Aadhaar-PAN, TAN Registration, Income Tax Return (ITR-1 to ITR-7), Form 26AS View, TDS Certificate</td></tr>
                <tr><td><strong>Revenue</strong></td><td>Income Certificate, Caste Certificate (SC/ST/OBC), Domicile Certificate, RTC (Record of Rights), Encumbrance Certificate, Khata Certificate, Khata Transfer, Mutation, Land Conversion, Possession Certificate, No Objection Certificate, Solvency Certificate</td></tr>
                <tr><td><strong>Transport (RTO)</strong></td><td>Learning License (New/Renewal), Driving License (New/Renewal/International), RC Extract, Duplicate RC, Transfer of Ownership, Hypothecation, Fancy Number Allotment, Fitness Certificate, Permit (Goods/Passenger), Vehicle Tax Payment, NOC, Address Change in RC/DL</td></tr>
                <tr><td><strong>Municipal/Civic</strong></td><td>Birth Certificate (Apply/Correction/Duplicate), Death Certificate, Marriage Registration, Property Tax Payment, Trade License, Building Plan Approval, Water Connection (New/Disconnect), Khata Endorsement, UGD Tax, Advertisement Tax, Shop & Establishment License</td></tr>
                <tr><td><strong>Police</strong></td><td>FIR Copy, Police Verification Certificate, Passport Verification, Document Attestation, Arms License, Traffic Fine Payment, Character Certificate, Tenant Verification</td></tr>
                <tr><td><strong>Passport</strong></td><td>Fresh Passport, Renewal, Tatkal, Police Clearance Certificate, Passport Status Check</td></tr>
                <tr><td><strong>Election</strong></td><td>Voter ID New, Voter ID Correction, EPIC Reprint, Form 6/6A/7/8, Electoral Roll Search, Overseas Voter Registration</td></tr>
                <tr><td><strong>Social Welfare</strong></td><td>Old Age Pension, Widow Pension, Disability Pension, Disability Certificate (UDID), Senior Citizen Card, BPL Certificate, SC/ST Scholarship, Minority Scholarship, Merit Scholarship, Abhaya Hastham</td></tr>
                <tr><td><strong>Food & Civil Supplies</strong></td><td>Ration Card (New/Amendment/Correction/Surrender/Duplicate), BPL/APL Status, Food Security Card, Fair Price Shop Locator</td></tr>
                <tr><td><strong>Labour</strong></td><td>Labour Card (New/Renewal), e-Shram Card, EPF Registration, ESI Registration, Building Worker Registration, Unorganized Worker Registration, Inter-State Migrant Worker Card</td></tr>
                <tr><td><strong>Agriculture</strong></td><td>Farmer Registration, PM Kisan Samman Nidhi, PM Fasal Bima Yojana, Soil Health Card, KCC (Kisan Credit Card), Subsidy Applications (Seeds/Fertilizers/Equipment), Market Price Info, Land Pooling Certificate</td></tr>
                <tr><td><strong>Education</strong></td><td>RTE Admission, School/College TC, Migration Certificate, Scholarship Applications, Exam Fee Payment, University Registration, Degree Certificate, Bonafide Certificate, Gap Certificate</td></tr>
                <tr><td><strong>Health</strong></td><td>Ayushman Bharat Card, State Health Insurance Card, Birth/Death Registration (Hospital), Disability Certificate, Medical Fitness Certificate, COVID Vaccination Certificate</td></tr>
                <tr><td><strong>Housing</strong></td><td>PM Awas Yojana (Urban/Rural), State Housing Scheme, Basava Vasathi, RGRHCL Registration</td></tr>
                <tr><td><strong>Legal</strong></td><td>RTI Application, e-Court Case Status, Legal Aid Application, Tele-Law Consultation, Succession Certificate, Legal Heir Certificate</td></tr>
                <tr><td><strong>E-Stamping</strong></td><td>E-Stamp Paper Purchase, Franking, Rental Agreement, Sale Deed Registration</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="tp-card">
          <h3>Private / B2C Services</h3>
          <div className="tp-table-wrapper">
            <table className="tp-table">
              <thead><tr><th>Category</th><th>Services</th></tr></thead>
              <tbody>
                <tr><td><strong>Banking (AEPS/DMT)</strong></td><td>Aadhaar Cash Withdrawal, Aadhaar Balance Enquiry, Aadhaar Mini Statement, Aadhaar Pay, Domestic Money Transfer (IMPS/NEFT), Beneficiary Management, Cash Deposit, Account Opening (Jan Dhan/Savings/Current), Mini ATM</td></tr>
                <tr><td><strong>Insurance</strong></td><td>Two-Wheeler Insurance, Four-Wheeler Insurance, Commercial Vehicle Insurance, Health Insurance, Life Insurance (Term/Endowment/ULIP), Personal Accident Insurance, Travel Insurance, Home Insurance, Crop Insurance (PMFBY), Fire Insurance</td></tr>
                <tr><td><strong>Bill Payments (BBPS)</strong></td><td>Electricity Bill (50+ providers), Water Bill, Gas Bill (Piped/LPG), Broadband Bill, Postpaid Mobile, Landline Bill, DTH Bill, LIC Premium, Insurance Premium, Loan EMI, Credit Card Bill, Municipal Tax, Housing Society Maintenance</td></tr>
                <tr><td><strong>Recharge</strong></td><td>Prepaid Mobile (Jio/Airtel/Vi/BSNL), DTH (Tata Play/Dish TV/Airtel/Sun/d2h), Data Card, FASTag Recharge</td></tr>
                <tr><td><strong>Travel</strong></td><td>Train Booking (IRCTC), Bus Booking (KSRTC/RedBus/Private), Flight Booking, Hotel Booking, Cab Booking, Darshan/Temple Booking, Tourist Package, Cruise Booking</td></tr>
                <tr><td><strong>E-Commerce</strong></td><td>LED Bulb/Tube/Fan (EESL), Electronics, Mobile Phones (Refurbished), Jan Aushadhi Medicines, Grocery, Agricultural Products</td></tr>
                <tr><td><strong>Health</strong></td><td>Tele-Consultation (General/Specialist), Lab Tests (Thyrocare/SRL), Ayurveda Consultation, Homeopathy, Medicine Delivery, Health Checkup Packages, Dental, Eye Check</td></tr>
                <tr><td><strong>Digital Signature</strong></td><td>Class 2 DSC (New/Renewal), Class 3 DSC (New/Renewal), DGFT DSC, e-Sign (Aadhaar-based)</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="tp-card">
          <h3>IT & Business Services</h3>
          <div className="tp-table-wrapper">
            <table className="tp-table">
              <thead><tr><th>Category</th><th>Services</th></tr></thead>
              <tbody>
                <tr><td><strong>Tax & Compliance</strong></td><td>GST Registration, GST Return (GSTR-1/3B/9/9C), GST Correction/Amendment, GST Cancellation, GST LUT Filing, Income Tax Return Filing, TDS Return (24Q/26Q/27Q), TAN Registration/Correction, Professional Tax Registration</td></tr>
                <tr><td><strong>Business Registration</strong></td><td>MSME/Udyam Registration, Private Limited Company, One Person Company, LLP Registration, Partnership Deed, Sole Proprietorship, Section 8 Company, Producer Company, Nidhi Company, Add/Remove Director/Partner, Change Registered Office, Change Business Name, Annual Compliance Filing, ROC Filing</td></tr>
                <tr><td><strong>License & Permits</strong></td><td>FSSAI Registration/License (Basic/State/Central), Trade License, Shop & Establishment, Import Export Code (IEC), Drug License, Liquor License, BIS Registration, ISO Certification, MSME Certification</td></tr>
                <tr><td><strong>Trademark & IP</strong></td><td>Trademark Registration, Trademark Objection Reply, Trademark Renewal, Copyright Registration, Patent Filing, Design Registration</td></tr>
                <tr><td><strong>Website & Digital</strong></td><td>Website Development (Basic/Business/eCommerce), Mobile App Development, SEO Service, Digital Marketing (Social/PPC/Content), Logo Design, Graphic Design, Domain & Hosting, SSL Certificate, Email Setup</td></tr>
                <tr><td><strong>Accounting</strong></td><td>Tally Setup & Training, GST Bookkeeping, Payroll Processing, Audit Assistance, Financial Statement Preparation, Budgeting & Forecasting</td></tr>
                <tr><td><strong>Legal</strong></td><td>Legal Consultation (30 min/1 hr), Agreement Drafting (Rent/Sale/Service/NDA), Will Preparation, Power of Attorney, Affidavit Drafting, Notary Services, Arbitration, Mediation</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="tp-section tp-section--footer">
        <div className="tp-card">
          <h3>Summary</h3>
          <ul>
            <li><strong>Existing Backend:</strong> 18 tables already built (services, forms, pricing, workflow, applications, etc.) — we build ON TOP</li>
            <li><strong>New Tables:</strong> 8 new tables (field_templates, commission_slabs, commission_transactions, service_providers, provider_transactions, bundles, reviews, template_mapping)</li>
            <li><strong>New API Endpoints:</strong> 30+ new endpoints for templates, commissions, providers, bundles, reviews, utility payments, banking</li>
            <li><strong>Dynamic Fields:</strong> 3-layer system (Templates → Form Schema → Application Data) — allows every service to have unique fields</li>
            <li><strong>Service Categories:</strong> 4 types — Government, Private/B2C, IT/Business, Affiliate</li>
            <li><strong>Total Services:</strong> 800+ services mapped across all categories</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default TestPlan;
