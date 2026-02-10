// ============================================
// BHARAT MITHRA - Services Data Configuration
// ============================================
// This file contains all service categories and their sub-services
// Add/remove/modify services here - the UI will automatically update

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea' | 'file' | 'date' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // for select/radio
}

export interface ServiceItem {
  id: string;
  name: string;
  nameHindi?: string;
  description?: string;
  icon: string; // emoji or icon identifier
  color: string; // gradient color for the card
  isActive: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  isOnline?: boolean; // online/offline badge
  fee?: number;
  commission?: number;
  formFields?: FormField[];
}

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  nameHindi?: string;
  description: string;
  icon: string; // emoji for sidebar & header
  color: string; // primary color for the category
  gradient: string; // CSS gradient for category header
  isActive: boolean;
  sortOrder: number;
  services: ServiceItem[];
  requiresActivation?: boolean; // if true, shows activation modal
  activationFee?: number; // activation price
  activationFeatures?: string[]; // features list for activation
}

// Common form field sets
const commonCustomerFields: FormField[] = [
  { name: 'customerName', label: 'Customer Name', type: 'text', placeholder: 'Enter full name', required: true },
  { name: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: 'Enter 10-digit mobile', required: true },
  { name: 'email', label: 'Email (Optional)', type: 'email', placeholder: 'Enter email address' },
];

const aadhaarField: FormField = { name: 'aadhaarNo', label: 'Aadhaar Number', type: 'text', placeholder: 'Enter 12-digit Aadhaar', required: true };
const panField: FormField = { name: 'panNo', label: 'PAN Number', type: 'text', placeholder: 'Enter PAN (e.g. ABCDE1234F)', required: true };
const addressFields: FormField[] = [
  { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Enter full address', required: true },
  { name: 'state', label: 'State', type: 'text', placeholder: 'Enter state', required: true },
  { name: 'pincode', label: 'Pincode', type: 'text', placeholder: 'Enter 6-digit pincode', required: true },
];
const documentUpload: FormField = { name: 'document', label: 'Upload Document', type: 'file', required: true };
const photoUpload: FormField = { name: 'photo', label: 'Upload Photo', type: 'file', required: true };
const remarksField: FormField = { name: 'remarks', label: 'Remarks', type: 'textarea', placeholder: 'Any additional notes...' };

const servicesData: ServiceCategory[] = [
  {
    id: 'gov-schemes',
    slug: 'government-schemes',
    name: 'Government Schemes',
    nameHindi: 'सरकारी योजनाएं',
    description: 'Access various central and state government welfare schemes',
    icon: '🏛️',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    isActive: true,
    sortOrder: 1,
    services: [
      { id: 'gs-1', name: 'PM Kisan Samman Nidhi', icon: '🌾', color: '#16a34a', isActive: true, isPopular: true, fee: 0, commission: 15,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'bankAccount', label: 'Bank Account No.', type: 'text', placeholder: 'Enter bank account number', required: true }, { name: 'ifsc', label: 'IFSC Code', type: 'text', placeholder: 'Enter IFSC', required: true }, { name: 'landArea', label: 'Land Area (Acres)', type: 'number', placeholder: 'Enter land area' }, documentUpload, remarksField] },
      { id: 'gs-2', name: 'PM Awas Yojana', icon: '🏠', color: '#2563eb', isActive: true, isPopular: true, fee: 0, commission: 20,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'familyIncome', label: 'Annual Family Income', type: 'number', placeholder: 'Enter annual income', required: true }, { name: 'category', label: 'Category', type: 'select', options: ['General', 'OBC', 'SC', 'ST', 'EWS'], required: true }, ...addressFields, documentUpload, remarksField] },
      { id: 'gs-3', name: 'Ayushman Bharat (PM-JAY)', icon: '🏥', color: '#dc2626', isActive: true, isPopular: true, fee: 0, commission: 25,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'rationCardNo', label: 'Ration Card No.', type: 'text', placeholder: 'Enter ration card number' }, { name: 'familyMembers', label: 'No. of Family Members', type: 'number', placeholder: 'Enter count', required: true }, documentUpload, remarksField] },
      { id: 'gs-4', name: 'PM Ujjwala Yojana', icon: '🔥', color: '#ea580c', isActive: true, fee: 0, commission: 10,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'bplCardNo', label: 'BPL Card No.', type: 'text', placeholder: 'Enter BPL card number', required: true }, documentUpload, remarksField] },
      { id: 'gs-5', name: 'Sukanya Samriddhi Yojana', icon: '👧', color: '#db2777', isActive: true, fee: 0, commission: 15,
        formFields: [...commonCustomerFields, { name: 'girlName', label: 'Girl Child Name', type: 'text', placeholder: 'Enter girl child name', required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, aadhaarField, documentUpload, remarksField] },
      { id: 'gs-6', name: 'PM Mudra Yojana', icon: '💰', color: '#7c3aed', isActive: true, fee: 0, commission: 20,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'loanType', label: 'Loan Type', type: 'select', options: ['Shishu (up to ₹50K)', 'Kishor (₹50K-5L)', 'Tarun (₹5L-10L)'], required: true }, { name: 'businessType', label: 'Business Type', type: 'text', placeholder: 'Describe your business', required: true }, documentUpload, remarksField] },
      { id: 'gs-7', name: 'PM Fasal Bima Yojana', icon: '🌱', color: '#059669', isActive: true, fee: 0, commission: 12,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'cropType', label: 'Crop Type', type: 'text', placeholder: 'Enter crop name', required: true }, { name: 'landArea', label: 'Land Area (Hectares)', type: 'number', placeholder: 'Enter land area', required: true }, { name: 'season', label: 'Season', type: 'select', options: ['Kharif', 'Rabi', 'Zaid'], required: true }, documentUpload, remarksField] },
      { id: 'gs-8', name: 'Atal Pension Yojana', icon: '👴', color: '#0891b2', isActive: true, fee: 0, commission: 18,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'pensionAmount', label: 'Pension Amount', type: 'select', options: ['₹1,000/month', '₹2,000/month', '₹3,000/month', '₹4,000/month', '₹5,000/month'], required: true }, { name: 'bankAccount', label: 'Bank Account No.', type: 'text', placeholder: 'Enter bank account', required: true }, remarksField] },
      { id: 'gs-9', name: 'National Pension System', icon: '📋', color: '#4f46e5', isActive: true, fee: 50, commission: 25,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'occupation', label: 'Occupation', type: 'text', placeholder: 'Enter occupation', required: true }, documentUpload, photoUpload, remarksField] },
      { id: 'gs-10', name: 'PM Jan Dhan Yojana', icon: '🏦', color: '#0d9488', isActive: true, fee: 0, commission: 10,
        formFields: [...commonCustomerFields, aadhaarField, ...addressFields, documentUpload, photoUpload, remarksField] },
      { id: 'gs-11', name: 'Scholarship Schemes', icon: '🎓', color: '#7c3aed', isActive: true, isNew: true, fee: 0, commission: 15,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'institution', label: 'Institution Name', type: 'text', placeholder: 'Enter school/college name', required: true }, { name: 'course', label: 'Course/Class', type: 'text', placeholder: 'Enter course name', required: true }, { name: 'category', label: 'Category', type: 'select', options: ['General', 'OBC', 'SC', 'ST', 'Minority'], required: true }, documentUpload, remarksField] },
      { id: 'gs-12', name: 'Ration Card Services', icon: '🍚', color: '#b45309', isActive: true, fee: 30, commission: 20,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'serviceType', label: 'Service Type', type: 'select', options: ['New Ration Card', 'Addition of Member', 'Deletion of Member', 'Correction', 'Duplicate'], required: true }, { name: 'familyMembers', label: 'No. of Family Members', type: 'number', placeholder: 'Enter count', required: true }, ...addressFields, documentUpload, remarksField] },
    ]
  },
  {
    id: 'print-services',
    slug: 'print-services',
    name: 'Print Services',
    nameHindi: 'प्रिंट सेवाएं',
    description: 'Certificate printing, document printing and related services',
    icon: '🖨️',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    isActive: true,
    sortOrder: 2,
    services: [
      { id: 'ps-1', name: 'Income Certificate', icon: '📄', color: '#2563eb', isActive: true, isPopular: true, fee: 25, commission: 10,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'annualIncome', label: 'Annual Income (₹)', type: 'number', placeholder: 'Enter annual income', required: true }, { name: 'purpose', label: 'Purpose', type: 'text', placeholder: 'Purpose of certificate', required: true }, documentUpload, remarksField] },
      { id: 'ps-2', name: 'Caste Certificate', icon: '📜', color: '#7c3aed', isActive: true, isPopular: true, fee: 25, commission: 10,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'caste', label: 'Caste', type: 'text', placeholder: 'Enter caste', required: true }, { name: 'category', label: 'Category', type: 'select', options: ['SC', 'ST', 'OBC', 'General'], required: true }, documentUpload, remarksField] },
      { id: 'ps-3', name: 'Domicile Certificate', icon: '🏠', color: '#059669', isActive: true, fee: 25, commission: 10,
        formFields: [...commonCustomerFields, aadhaarField, ...addressFields, { name: 'residingSince', label: 'Residing Since (Year)', type: 'number', placeholder: 'e.g. 2010', required: true }, documentUpload, remarksField] },
      { id: 'ps-4', name: 'Birth Certificate', icon: '👶', color: '#db2777', isActive: true, isPopular: true, fee: 20, commission: 8,
        formFields: [...commonCustomerFields, { name: 'childName', label: 'Child Name', type: 'text', placeholder: 'Enter child name', required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', placeholder: 'Enter hospital/place', required: true }, { name: 'fatherName', label: 'Father Name', type: 'text', placeholder: 'Enter father name', required: true }, { name: 'motherName', label: 'Mother Name', type: 'text', placeholder: 'Enter mother name', required: true }, documentUpload, remarksField] },
      { id: 'ps-5', name: 'Death Certificate', icon: '📋', color: '#64748b', isActive: true, fee: 20, commission: 8,
        formFields: [...commonCustomerFields, { name: 'deceasedName', label: 'Deceased Name', type: 'text', placeholder: 'Enter deceased name', required: true }, { name: 'dateOfDeath', label: 'Date of Death', type: 'date', required: true }, { name: 'placeOfDeath', label: 'Place of Death', type: 'text', placeholder: 'Enter place', required: true }, documentUpload, remarksField] },
      { id: 'ps-6', name: 'Marriage Certificate', icon: '💍', color: '#e11d48', isActive: true, fee: 30, commission: 12,
        formFields: [...commonCustomerFields, { name: 'groomName', label: 'Groom Name', type: 'text', required: true }, { name: 'brideName', label: 'Bride Name', type: 'text', required: true }, { name: 'marriageDate', label: 'Marriage Date', type: 'date', required: true }, { name: 'marriagePlace', label: 'Marriage Place', type: 'text', required: true }, documentUpload, remarksField] },
      { id: 'ps-7', name: 'Character Certificate', icon: '✅', color: '#16a34a', isActive: true, fee: 25, commission: 10,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'purpose', label: 'Purpose', type: 'text', placeholder: 'Purpose of certificate', required: true }, documentUpload, remarksField] },
      { id: 'ps-8', name: 'EWS Certificate', icon: '📑', color: '#0891b2', isActive: true, fee: 25, commission: 10,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'annualIncome', label: 'Annual Income (₹)', type: 'number', required: true }, ...addressFields, documentUpload, remarksField] },
      { id: 'ps-9', name: 'Land Record Print', icon: '🗺️', color: '#b45309', isActive: true, fee: 30, commission: 15,
        formFields: [...commonCustomerFields, { name: 'surveyNo', label: 'Survey/Khasra No.', type: 'text', placeholder: 'Enter survey number', required: true }, { name: 'village', label: 'Village', type: 'text', required: true }, { name: 'taluk', label: 'Taluk/Tehsil', type: 'text', required: true }, remarksField] },
      { id: 'ps-10', name: 'Affidavit Print', icon: '⚖️', color: '#4f46e5', isActive: true, fee: 50, commission: 20,
        formFields: [...commonCustomerFields, { name: 'affidavitType', label: 'Affidavit Type', type: 'select', options: ['Name Change', 'Address Proof', 'Date of Birth', 'Gap Certificate', 'General Purpose', 'Other'], required: true }, { name: 'details', label: 'Affidavit Details', type: 'textarea', placeholder: 'Describe the affidavit content', required: true }, documentUpload, remarksField] },
    ]
  },
  {
    id: 'pvc-delivery',
    slug: 'pvc-delivery',
    name: 'PVC Delivery',
    nameHindi: 'पीवीसी डिलीवरी',
    description: 'PVC card printing and courier delivery to doorstep',
    icon: '💳',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    isActive: true,
    sortOrder: 3,
    services: [
      { id: 'pvd-1', name: 'Aadhaar PVC Card', icon: '🪪', color: '#ea580c', isActive: true, isPopular: true, fee: 50, commission: 15,
        formFields: [...commonCustomerFields, aadhaarField, ...addressFields, photoUpload, remarksField] },
      { id: 'pvd-2', name: 'PAN PVC Card', icon: '💳', color: '#2563eb', isActive: true, isPopular: true, fee: 60, commission: 20,
        formFields: [...commonCustomerFields, panField, ...addressFields, photoUpload, remarksField] },
      { id: 'pvd-3', name: 'Voter ID PVC', icon: '🗳️', color: '#7c3aed', isActive: true, fee: 50, commission: 15,
        formFields: [...commonCustomerFields, { name: 'voterIdNo', label: 'Voter ID No.', type: 'text', placeholder: 'Enter EPIC number', required: true }, ...addressFields, photoUpload, remarksField] },
      { id: 'pvd-4', name: 'Driving License PVC', icon: '🚗', color: '#16a34a', isActive: true, fee: 75, commission: 25,
        formFields: [...commonCustomerFields, { name: 'dlNo', label: 'DL Number', type: 'text', placeholder: 'Enter driving license number', required: true }, ...addressFields, photoUpload, remarksField] },
      { id: 'pvd-5', name: 'RC PVC Card', icon: '🏍️', color: '#0d9488', isActive: true, fee: 60, commission: 20,
        formFields: [...commonCustomerFields, { name: 'rcNo', label: 'RC Number', type: 'text', placeholder: 'Enter vehicle RC number', required: true }, ...addressFields, documentUpload, remarksField] },
      { id: 'pvd-6', name: 'Student ID PVC', icon: '🎓', color: '#db2777', isActive: true, isNew: true, fee: 40, commission: 12,
        formFields: [...commonCustomerFields, { name: 'studentName', label: 'Student Name', type: 'text', required: true }, { name: 'institution', label: 'Institution Name', type: 'text', required: true }, { name: 'rollNo', label: 'Roll Number', type: 'text', required: true }, photoUpload, remarksField] },
    ]
  },
  {
    id: 'pvc-maker',
    slug: 'pvc-maker',
    name: 'PVC Maker',
    nameHindi: 'पीवीसी मेकर',
    description: 'PDF to Smart Cards - Convert any government PDF to PVC card',
    icon: '🎨',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    isActive: true,
    sortOrder: 4,
    services: [
      { id: 'pvm-1', name: 'UPI Smart Card', icon: '📱', color: '#7c3aed', isActive: true, fee: 9, commission: 3,
        formFields: [...commonCustomerFields, { name: 'upiId', label: 'UPI ID', type: 'text', placeholder: 'Enter UPI ID', required: true }, photoUpload, remarksField] },
      { id: 'pvm-2', name: 'AADHAAR (New & Old)', icon: '🪪', color: '#ea580c', isActive: true, isPopular: true, fee: 6, commission: 2,
        formFields: [...commonCustomerFields, aadhaarField, documentUpload, remarksField] },
      { id: 'pvm-3', name: 'Voter New', icon: '🗳️', color: '#2563eb', isActive: true, fee: 6, commission: 2,
        formFields: [...commonCustomerFields, { name: 'voterIdNo', label: 'Voter ID No.', type: 'text', required: true }, documentUpload, remarksField] },
      { id: 'pvm-4', name: 'Voter Old', icon: '🗳️', color: '#059669', isActive: true, fee: 6, commission: 2,
        formFields: [...commonCustomerFields, { name: 'voterIdNo', label: 'Voter ID No.', type: 'text', required: true }, documentUpload, remarksField] },
      { id: 'pvm-5', name: 'Health Card (ABHA)', icon: '🏥', color: '#dc2626', isActive: true, fee: 6, commission: 2,
        formFields: [...commonCustomerFields, { name: 'abhaId', label: 'ABHA ID', type: 'text', placeholder: 'Enter ABHA number', required: true }, documentUpload, remarksField] },
      { id: 'pvm-6', name: 'Pancard (Inc. Tax)', icon: '📋', color: '#b45309', isActive: true, fee: 6, commission: 2,
        formFields: [...commonCustomerFields, panField, documentUpload, remarksField] },
      { id: 'pvm-7', name: 'Pancard (NSDL)', icon: '💳', color: '#f59e0b', isActive: true, fee: 6, commission: 2,
        formFields: [...commonCustomerFields, panField, documentUpload, remarksField] },
      { id: 'pvm-8', name: 'Pancard (UTIITSL)', icon: '📊', color: '#4f46e5', isActive: true, fee: 6, commission: 2,
        formFields: [...commonCustomerFields, panField, documentUpload, remarksField] },
      { id: 'pvm-9', name: 'Driving License PVC', icon: '🚗', color: '#16a34a', isActive: true, isNew: true, fee: 9, commission: 3,
        formFields: [...commonCustomerFields, { name: 'dlNo', label: 'DL Number', type: 'text', required: true }, documentUpload, remarksField] },
      { id: 'pvm-10', name: 'RC Card PVC', icon: '🏍️', color: '#0d9488', isActive: true, fee: 9, commission: 3,
        formFields: [...commonCustomerFields, { name: 'rcNo', label: 'RC Number', type: 'text', required: true }, documentUpload, remarksField] },
    ]
  },
  {
    id: 'pan-services',
    slug: 'pan-services',
    name: 'PAN Services',
    nameHindi: 'पैन सेवाएं',
    description: 'PAN card application, correction, and related services',
    icon: '🆔',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    isActive: true,
    sortOrder: 5,
    services: [
      { id: 'pan-1', name: 'Instant NEW PAN', icon: '⚡', color: '#f59e0b', isActive: true, isPopular: true, isOnline: true, fee: 110, commission: 30,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'fatherName', label: 'Father Name', type: 'text', required: true }, ...addressFields, photoUpload, { name: 'signature', label: 'Upload Signature', type: 'file', required: true }, remarksField] },
      { id: 'pan-2', name: 'NSDL PAN Services', icon: '💳', color: '#f59e0b', isActive: true, isPopular: true, fee: 110, commission: 30,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'applicationType', label: 'Application Type', type: 'select', options: ['New PAN', 'Correction', 'Reprint'], required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'fatherName', label: 'Father Name', type: 'text', required: true }, ...addressFields, photoUpload, documentUpload, remarksField] },
      { id: 'pan-3', name: 'Missing/Lost PAN', icon: '🔍', color: '#8b5cf6', isActive: true, fee: 50, commission: 15,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'fatherName', label: 'Father Name', type: 'text', required: true }, documentUpload, remarksField] },
      { id: 'pan-4', name: 'Missing/Lost PAN (Mobl. No. to PAN)', icon: '📱', color: '#0891b2', isActive: true, fee: 50, commission: 15,
        formFields: [{ name: 'mobileNo', label: 'Mobile Number', type: 'tel', placeholder: 'Enter mobile linked to PAN', required: true }, ...commonCustomerFields, remarksField] },
      { id: 'pan-5', name: 'Digital Signature (DSC)', icon: '🔏', color: '#6366f1', isActive: true, fee: 500, commission: 100,
        formFields: [...commonCustomerFields, panField, aadhaarField, { name: 'dscType', label: 'DSC Type', type: 'select', options: ['Class 2 (Sign)', 'Class 2 (Encrypt)', 'Class 3 (Sign)', 'Class 3 (Sign + Encrypt)'], required: true }, { name: 'validity', label: 'Validity', type: 'select', options: ['1 Year', '2 Years', '3 Years'], required: true }, documentUpload, photoUpload, remarksField] },
      { id: 'pan-6', name: 'PF & Bank Details (Mobl. to Bank)', icon: '🏦', color: '#059669', isActive: true, fee: 30, commission: 10,
        formFields: [{ name: 'mobileNo', label: 'Mobile Number', type: 'tel', placeholder: 'Enter mobile number', required: true }, ...commonCustomerFields, remarksField] },
      { id: 'pan-7', name: 'MSME Registration', icon: '🏭', color: '#b45309', isActive: true, fee: 200, commission: 50,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'businessName', label: 'Business Name', type: 'text', required: true }, { name: 'businessType', label: 'Business Type', type: 'select', options: ['Manufacturing', 'Service', 'Trading'], required: true }, { name: 'investmentAmount', label: 'Investment Amount (₹)', type: 'number', required: true }, ...addressFields, documentUpload, remarksField] },
      { id: 'pan-8', name: 'PAN-Aadhaar Link', icon: '🔗', color: '#ea580c', isActive: true, isPopular: true, fee: 50, commission: 15,
        formFields: [...commonCustomerFields, panField, aadhaarField, remarksField] },
    ]
  },
  {
    id: 'payment-services',
    slug: 'payment-services',
    name: 'Payment Services',
    nameHindi: 'भुगतान सेवाएं',
    description: 'AePS, money transfer, bill payments and financial services',
    icon: '💸',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    isActive: true,
    sortOrder: 6,
    services: [
      { id: 'pay-1', name: 'AePS', icon: '🏧', color: '#2563eb', isActive: true, isPopular: true, fee: 0, commission: 3,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'Enter bank name', required: true }, { name: 'transactionType', label: 'Transaction Type', type: 'select', options: ['Cash Withdrawal', 'Balance Enquiry', 'Mini Statement', 'Cash Deposit'], required: true }, { name: 'amount', label: 'Amount (₹)', type: 'number', placeholder: 'Enter amount' }, remarksField] },
      { id: 'pay-2', name: 'Money Transfer @ 1 Rs.', icon: '💸', color: '#059669', isActive: true, isPopular: true, fee: 1, commission: 5,
        formFields: [...commonCustomerFields, { name: 'beneficiaryName', label: 'Beneficiary Name', type: 'text', required: true }, { name: 'beneficiaryAccount', label: 'Account Number', type: 'text', required: true }, { name: 'ifsc', label: 'IFSC Code', type: 'text', required: true }, { name: 'amount', label: 'Amount (₹)', type: 'number', placeholder: 'Enter amount', required: true }, { name: 'transferMode', label: 'Transfer Mode', type: 'select', options: ['IMPS', 'NEFT'], required: true }, remarksField] },
      { id: 'pay-3', name: 'Aadhaar Pay', icon: '📱', color: '#ea580c', isActive: true, fee: 0, commission: 2,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'amount', label: 'Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'pay-4', name: 'UPI Collection', icon: '📲', color: '#7c3aed', isActive: true, isNew: true, fee: 0, commission: 1,
        formFields: [...commonCustomerFields, { name: 'upiId', label: 'UPI ID', type: 'text', required: true }, { name: 'amount', label: 'Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'pay-5', name: 'Mini Statement', icon: '📄', color: '#0891b2', isActive: true, fee: 0, commission: 2,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'bankName', label: 'Bank Name', type: 'text', required: true }, remarksField] },
      { id: 'pay-6', name: 'Cash Deposit', icon: '💵', color: '#16a34a', isActive: true, fee: 10, commission: 5,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'bankName', label: 'Bank Name', type: 'text', required: true }, { name: 'amount', label: 'Amount (₹)', type: 'number', required: true }, remarksField] },
    ]
  },
  {
    id: 'msme-services',
    slug: 'msme-services',
    name: 'MSME Services',
    nameHindi: 'एमएसएमई सेवाएं',
    description: 'Apply & Download - MSME/Udyam Registration Services',
    icon: '🏭',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    isActive: true,
    sortOrder: 7,
    services: [
      { id: 'msme-1', name: 'MSME New Registration', icon: '📋', color: '#2563eb', isActive: true, isPopular: true, fee: 200, commission: 50,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'businessName', label: 'Business Name', type: 'text', required: true }, { name: 'businessType', label: 'Business Type', type: 'select', options: ['Manufacturing', 'Service', 'Trading'], required: true }, { name: 'nic2Code', label: 'NIC 2-Digit Code', type: 'text', placeholder: 'Enter NIC code' }, { name: 'investmentAmount', label: 'Investment Amount (₹)', type: 'number', required: true }, ...addressFields, documentUpload, remarksField] },
      { id: 'msme-2', name: 'Search MSME by Mobile No.', icon: '📱', color: '#059669', isActive: true, isNew: true, fee: 30, commission: 10,
        formFields: [{ name: 'mobileNo', label: 'Mobile Number', type: 'tel', placeholder: 'Enter registered mobile no.', required: true }, ...commonCustomerFields, remarksField] },
      { id: 'msme-3', name: 'Search/Dwnld by PAN No.', icon: '🔍', color: '#8b5cf6', isActive: true, isNew: true, fee: 30, commission: 10,
        formFields: [panField, ...commonCustomerFields, remarksField] },
      { id: 'msme-4', name: 'Direct Download No OTP', icon: '📥', color: '#0891b2', isActive: true, isNew: true, fee: 20, commission: 8,
        formFields: [{ name: 'udyamNo', label: 'Udyam Registration No.', type: 'text', placeholder: 'Enter Udyam number', required: true }, ...commonCustomerFields, remarksField] },
      { id: 'msme-5', name: 'GST Registration', icon: '📊', color: '#ea580c', isActive: true, isPopular: true, fee: 500, commission: 100,
        formFields: [...commonCustomerFields, panField, aadhaarField, { name: 'businessName', label: 'Business/Trade Name', type: 'text', required: true }, { name: 'businessType', label: 'Business Type', type: 'select', options: ['Proprietorship', 'Partnership', 'LLP', 'Pvt Ltd', 'Public Ltd'], required: true }, { name: 'turnover', label: 'Annual Turnover (₹)', type: 'number', required: true }, ...addressFields, documentUpload, remarksField] },
      { id: 'msme-6', name: 'Trade License', icon: '🏪', color: '#0d9488', isActive: true, fee: 300, commission: 75,
        formFields: [...commonCustomerFields, { name: 'shopName', label: 'Shop/Business Name', type: 'text', required: true }, { name: 'businessNature', label: 'Nature of Business', type: 'text', required: true }, ...addressFields, documentUpload, remarksField] },
      { id: 'msme-7', name: 'FSSAI Registration', icon: '🍽️', color: '#dc2626', isActive: true, fee: 500, commission: 100,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'businessName', label: 'Food Business Name', type: 'text', required: true }, { name: 'fssaiType', label: 'License Type', type: 'select', options: ['Basic Registration', 'State License', 'Central License'], required: true }, ...addressFields, documentUpload, remarksField] },
    ]
  },
  {
    id: 'savings-account',
    slug: 'open-savings-account',
    name: 'Open Savings A/C',
    nameHindi: 'बचत खाता खोलें',
    description: 'Open savings accounts with various banks',
    icon: '🏦',
    color: '#0d9488',
    gradient: 'linear-gradient(135deg, #0d9488, #0f766e)',
    isActive: true,
    sortOrder: 8,
    services: [
      { id: 'sav-1', name: 'SBI Savings Account', icon: '🏦', color: '#1d4ed8', isActive: true, isPopular: true, fee: 0, commission: 50,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'nomineeName', label: 'Nominee Name', type: 'text', required: true }, ...addressFields, photoUpload, { name: 'signature', label: 'Upload Signature', type: 'file', required: true }, remarksField] },
      { id: 'sav-2', name: 'BOB Savings Account', icon: '🏦', color: '#ea580c', isActive: true, fee: 0, commission: 50,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, ...addressFields, photoUpload, remarksField] },
      { id: 'sav-3', name: 'PNB Savings Account', icon: '🏦', color: '#7c3aed', isActive: true, fee: 0, commission: 50,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, ...addressFields, photoUpload, remarksField] },
      { id: 'sav-4', name: 'Kotak Savings Account', icon: '🏦', color: '#dc2626', isActive: true, fee: 0, commission: 75,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, ...addressFields, photoUpload, remarksField] },
      { id: 'sav-5', name: 'HDFC Savings Account', icon: '🏦', color: '#0891b2', isActive: true, fee: 0, commission: 75,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, ...addressFields, photoUpload, remarksField] },
      { id: 'sav-6', name: 'ICICI Savings Account', icon: '🏦', color: '#059669', isActive: true, fee: 0, commission: 75,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, ...addressFields, photoUpload, remarksField] },
      { id: 'sav-7', name: 'Fino Payments Bank', icon: '🏦', color: '#f59e0b', isActive: true, isNew: true, fee: 0, commission: 40,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, ...addressFields, photoUpload, remarksField] },
      { id: 'sav-8', name: 'Airtel Payments Bank', icon: '🏦', color: '#dc2626', isActive: true, fee: 0, commission: 40,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, ...addressFields, photoUpload, remarksField] },
    ]
  },
  {
    id: 'bbps',
    slug: 'bbps',
    name: 'BBPS',
    nameHindi: 'बीबीपीएस',
    description: 'Payment Services - Bharat Bill Payment System',
    icon: '⚡',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    isActive: true,
    sortOrder: 9,
    services: [
      { id: 'bbps-1', name: 'Electricity', icon: '💡', color: '#f59e0b', isActive: true, isPopular: true, fee: 0, commission: 5,
        formFields: [...commonCustomerFields, { name: 'provider', label: 'Electricity Provider', type: 'text', placeholder: 'e.g. BESCOM, TANGEDCO', required: true }, { name: 'consumerNo', label: 'Consumer Number', type: 'text', required: true }, { name: 'amount', label: 'Bill Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-2', name: 'Water', icon: '💧', color: '#0ea5e9', isActive: true, fee: 0, commission: 3,
        formFields: [...commonCustomerFields, { name: 'provider', label: 'Water Board', type: 'text', required: true }, { name: 'consumerNo', label: 'Consumer Number', type: 'text', required: true }, { name: 'amount', label: 'Bill Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-3', name: 'Mobile Postpaid', icon: '📱', color: '#7c3aed', isActive: true, isPopular: true, fee: 0, commission: 2,
        formFields: [{ name: 'mobileNo', label: 'Mobile Number', type: 'tel', required: true }, { name: 'operator', label: 'Operator', type: 'select', options: ['Jio', 'Airtel', 'Vi (Vodafone Idea)', 'BSNL'], required: true }, { name: 'amount', label: 'Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-4', name: 'Landline', icon: '📞', color: '#64748b', isActive: true, fee: 0, commission: 3,
        formFields: [...commonCustomerFields, { name: 'provider', label: 'Service Provider', type: 'text', placeholder: 'e.g. BSNL, Airtel', required: true }, { name: 'phoneNo', label: 'Landline Number', type: 'text', required: true }, { name: 'amount', label: 'Bill Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-5', name: 'Cable TV', icon: '📺', color: '#ea580c', isActive: true, fee: 0, commission: 3,
        formFields: [...commonCustomerFields, { name: 'operator', label: 'Cable Operator', type: 'text', required: true }, { name: 'subscriberId', label: 'Subscriber ID', type: 'text', required: true }, { name: 'amount', label: 'Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-6', name: 'Broadband', icon: '🌐', color: '#059669', isActive: true, fee: 0, commission: 3,
        formFields: [...commonCustomerFields, { name: 'provider', label: 'ISP Provider', type: 'text', required: true }, { name: 'accountNo', label: 'Account Number', type: 'text', required: true }, { name: 'amount', label: 'Bill Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-7', name: 'Piped Gas', icon: '🔥', color: '#f97316', isActive: true, fee: 0, commission: 3,
        formFields: [...commonCustomerFields, { name: 'provider', label: 'Gas Provider', type: 'text', placeholder: 'e.g. Mahanagar Gas, IGL', required: true }, { name: 'consumerNo', label: 'Consumer/BP Number', type: 'text', required: true }, { name: 'amount', label: 'Bill Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-8', name: 'Education Fees', icon: '🎓', color: '#f59e0b', isActive: true, fee: 0, commission: 5,
        formFields: [...commonCustomerFields, { name: 'institution', label: 'Institution Name', type: 'text', required: true }, { name: 'studentName', label: 'Student Name', type: 'text', required: true }, { name: 'rollNo', label: 'Roll/Enrollment No.', type: 'text', required: true }, { name: 'amount', label: 'Fee Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-9', name: 'FASTag', icon: '🏷️', color: '#16a34a', isActive: true, isNew: true, fee: 0, commission: 2,
        formFields: [...commonCustomerFields, { name: 'vehicleNo', label: 'Vehicle Number', type: 'text', required: true }, { name: 'fastagProvider', label: 'Fastag Provider', type: 'text', required: true }, { name: 'amount', label: 'Recharge Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-10', name: 'Insurance', icon: '🛡️', color: '#0d9488', isActive: true, fee: 0, commission: 5,
        formFields: [...commonCustomerFields, { name: 'insurer', label: 'Insurance Company', type: 'text', required: true }, { name: 'policyNo', label: 'Policy Number', type: 'text', required: true }, { name: 'amount', label: 'Premium Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-11', name: 'Loan EMI', icon: '💳', color: '#b45309', isActive: true, fee: 0, commission: 5,
        formFields: [...commonCustomerFields, { name: 'lender', label: 'Lender/Bank', type: 'text', required: true }, { name: 'loanAccountNo', label: 'Loan Account Number', type: 'text', required: true }, { name: 'amount', label: 'EMI Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-12', name: 'Credit Card', icon: '💳', color: '#7c3aed', isActive: true, fee: 0, commission: 3,
        formFields: [...commonCustomerFields, { name: 'bankName', label: 'Bank Name', type: 'text', required: true }, { name: 'cardNo', label: 'Last 4 Digits of Card', type: 'text', placeholder: 'Enter last 4 digits', required: true }, { name: 'amount', label: 'Payment Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-13', name: 'Gas Cylinder', icon: '🔴', color: '#dc2626', isActive: true, fee: 0, commission: 3,
        formFields: [...commonCustomerFields, { name: 'provider', label: 'Gas Agency', type: 'select', options: ['HP Gas', 'Bharat Gas', 'Indane Gas'], required: true }, { name: 'consumerNo', label: 'Consumer Number', type: 'text', required: true }, { name: 'amount', label: 'Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-14', name: 'Municipal Taxes', icon: '🏛️', color: '#64748b', isActive: true, fee: 0, commission: 3,
        formFields: [...commonCustomerFields, { name: 'municipality', label: 'Municipality/Corporation', type: 'text', required: true }, { name: 'propertyId', label: 'Property ID/Tax No.', type: 'text', required: true }, { name: 'amount', label: 'Tax Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-15', name: 'Subscription', icon: '📲', color: '#2563eb', isActive: true, fee: 0, commission: 2,
        formFields: [...commonCustomerFields, { name: 'platform', label: 'Platform', type: 'text', placeholder: 'e.g. Netflix, Hotstar', required: true }, { name: 'subscriberId', label: 'Subscriber/Account ID', type: 'text', required: true }, { name: 'amount', label: 'Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-16', name: 'Housing Society', icon: '🏢', color: '#4f46e5', isActive: true, fee: 0, commission: 3,
        formFields: [...commonCustomerFields, { name: 'societyName', label: 'Society Name', type: 'text', required: true }, { name: 'flatNo', label: 'Flat/Unit No.', type: 'text', required: true }, { name: 'amount', label: 'Maintenance Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-17', name: 'Hospital & Pathology', icon: '🏥', color: '#059669', isActive: true, fee: 0, commission: 5,
        formFields: [...commonCustomerFields, { name: 'hospitalName', label: 'Hospital/Lab Name', type: 'text', required: true }, { name: 'patientId', label: 'Patient ID/Bill No.', type: 'text', required: true }, { name: 'amount', label: 'Amount (₹)', type: 'number', required: true }, remarksField] },
      { id: 'bbps-18', name: 'Recurring Deposit', icon: '🏦', color: '#0891b2', isActive: true, fee: 0, commission: 3,
        formFields: [...commonCustomerFields, { name: 'bankName', label: 'Bank Name', type: 'text', required: true }, { name: 'rdAccountNo', label: 'RD Account Number', type: 'text', required: true }, { name: 'amount', label: 'Installment Amount (₹)', type: 'number', required: true }, remarksField] },
    ]
  },
  {
    id: 'e-governance',
    slug: 'e-governance',
    name: 'E-Governance',
    nameHindi: 'ई-गवर्नेंस',
    description: '1,000+ State & Central Govt. Services - Activation ₹249/-',
    icon: '🖥️',
    color: '#2563eb',
    gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    isActive: true,
    sortOrder: 10,
    requiresActivation: true,
    activationFee: 249,
    activationFeatures: [
      'Free updates of all New Govt. Services!!',
      '1,000+ Central & State Govt. Services',
      'New Services will be updated Everyday!',
      'Search option for quick search',
      'All Important Govt. Services At One Place!',
    ],
    services: [
      { id: 'egov-1', name: 'Aadhaar Update/Correction', icon: '🪪', color: '#ea580c', isActive: true, isPopular: true, fee: 50, commission: 15,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'updateType', label: 'Update Type', type: 'select', options: ['Name', 'Address', 'Date of Birth', 'Gender', 'Mobile Number', 'Email', 'Photo'], required: true }, documentUpload, remarksField] },
      { id: 'egov-2', name: 'Voter ID (New/Correction)', icon: '🗳️', color: '#7c3aed', isActive: true, fee: 50, commission: 15,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'applicationType', label: 'Application Type', type: 'select', options: ['New Voter ID', 'Correction', 'Transfer', 'Duplicate'], required: true }, { name: 'constituency', label: 'Constituency', type: 'text', required: true }, ...addressFields, photoUpload, documentUpload, remarksField] },
      { id: 'egov-3', name: 'Passport Application', icon: '📕', color: '#1d4ed8', isActive: true, fee: 100, commission: 30,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'passportType', label: 'Passport Type', type: 'select', options: ['Fresh', 'Re-issue', 'Tatkal'], required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, ...addressFields, photoUpload, documentUpload, remarksField] },
      { id: 'egov-4', name: 'Driving License', icon: '🚗', color: '#16a34a', isActive: true, fee: 80, commission: 25,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'applicationType', label: 'Type', type: 'select', options: ['Learner License', 'Permanent License', 'Renewal', 'Duplicate', 'International Permit'], required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, ...addressFields, photoUpload, documentUpload, remarksField] },
      { id: 'egov-5', name: 'Vehicle Registration', icon: '🏍️', color: '#0891b2', isActive: true, fee: 100, commission: 30,
        formFields: [...commonCustomerFields, { name: 'vehicleType', label: 'Vehicle Type', type: 'select', options: ['Two Wheeler', 'Four Wheeler', 'Commercial'], required: true }, { name: 'chassisNo', label: 'Chassis Number', type: 'text', required: true }, { name: 'engineNo', label: 'Engine Number', type: 'text', required: true }, ...addressFields, documentUpload, remarksField] },
      { id: 'egov-6', name: 'RTI Application', icon: '📝', color: '#059669', isActive: true, fee: 30, commission: 10,
        formFields: [...commonCustomerFields, { name: 'department', label: 'Department/Ministry', type: 'text', required: true }, { name: 'subject', label: 'Subject', type: 'text', required: true }, { name: 'details', label: 'Information Required', type: 'textarea', required: true }, ...addressFields, remarksField] },
      { id: 'egov-7', name: 'E-District Services', icon: '🏛️', color: '#4f46e5', isActive: true, fee: 25, commission: 10,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'serviceType', label: 'Service', type: 'select', options: ['Income Certificate', 'Caste Certificate', 'Domicile', 'Character Certificate', 'OBC Certificate', 'SC/ST Certificate'], required: true }, documentUpload, remarksField] },
      { id: 'egov-8', name: 'Land Records', icon: '🗺️', color: '#b45309', isActive: true, fee: 30, commission: 12,
        formFields: [...commonCustomerFields, { name: 'surveyNo', label: 'Survey/Khasra No.', type: 'text', required: true }, { name: 'village', label: 'Village', type: 'text', required: true }, { name: 'district', label: 'District', type: 'text', required: true }, remarksField] },
      { id: 'egov-9', name: 'Court Fee Stamp', icon: '⚖️', color: '#dc2626', isActive: true, isNew: true, fee: 20, commission: 8,
        formFields: [...commonCustomerFields, { name: 'stampValue', label: 'Stamp Value (₹)', type: 'number', required: true }, { name: 'purpose', label: 'Purpose', type: 'text', required: true }, remarksField] },
    ]
  },
  {
    id: 'govt-job-alerts',
    slug: 'govt-job-alerts',
    name: 'Govt Job Alerts',
    nameHindi: 'सरकारी नौकरी अलर्ट',
    description: 'Government job notifications, exam forms and admit cards',
    icon: '📢',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    isActive: true,
    sortOrder: 11,
    services: [
      { id: 'job-1', name: 'SSC Exam Forms', icon: '📝', color: '#2563eb', isActive: true, isPopular: true, fee: 50, commission: 20,
        formFields: [...commonCustomerFields, { name: 'examName', label: 'Exam Name', type: 'text', required: true }, { name: 'qualification', label: 'Qualification', type: 'select', options: ['10th Pass', '12th Pass', 'Graduate', 'Post Graduate'], required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'category', label: 'Category', type: 'select', options: ['General', 'OBC', 'SC', 'ST', 'EWS'], required: true }, photoUpload, documentUpload, remarksField] },
      { id: 'job-2', name: 'Railway Exam Forms', icon: '🚂', color: '#dc2626', isActive: true, isPopular: true, fee: 50, commission: 20,
        formFields: [...commonCustomerFields, { name: 'examName', label: 'Exam Name', type: 'text', required: true }, { name: 'qualification', label: 'Qualification', type: 'select', options: ['10th Pass', '12th Pass', 'Graduate', 'ITI', 'Diploma'], required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, photoUpload, documentUpload, remarksField] },
      { id: 'job-3', name: 'Bank Exam Forms', icon: '🏦', color: '#059669', isActive: true, fee: 50, commission: 20,
        formFields: [...commonCustomerFields, { name: 'examName', label: 'Exam Name (IBPS/SBI)', type: 'text', required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, photoUpload, documentUpload, remarksField] },
      { id: 'job-4', name: 'UPSC Forms', icon: '📋', color: '#7c3aed', isActive: true, fee: 50, commission: 20,
        formFields: [...commonCustomerFields, { name: 'examName', label: 'UPSC Exam Name', type: 'text', required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'qualification', label: 'Qualification', type: 'text', required: true }, photoUpload, documentUpload, remarksField] },
      { id: 'job-5', name: 'State PSC Forms', icon: '📄', color: '#ea580c', isActive: true, fee: 50, commission: 20,
        formFields: [...commonCustomerFields, { name: 'stateName', label: 'State', type: 'text', required: true }, { name: 'examName', label: 'Exam Name', type: 'text', required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, photoUpload, documentUpload, remarksField] },
      { id: 'job-6', name: 'Admit Card Download', icon: '🎫', color: '#0891b2', isActive: true, fee: 20, commission: 8,
        formFields: [...commonCustomerFields, { name: 'registrationNo', label: 'Registration Number', type: 'text', required: true }, { name: 'examName', label: 'Exam Name', type: 'text', required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, remarksField] },
      { id: 'job-7', name: 'Result Check', icon: '📊', color: '#16a34a', isActive: true, fee: 10, commission: 5,
        formFields: [...commonCustomerFields, { name: 'registrationNo', label: 'Registration/Roll Number', type: 'text', required: true }, { name: 'examName', label: 'Exam Name', type: 'text', required: true }, remarksField] },
      { id: 'job-8', name: 'Answer Key Download', icon: '📥', color: '#f59e0b', isActive: true, fee: 10, commission: 5,
        formFields: [...commonCustomerFields, { name: 'examName', label: 'Exam Name', type: 'text', required: true }, remarksField] },
      { id: 'job-9', name: 'Army/Navy/Air Force', icon: '🎖️', color: '#4f46e5', isActive: true, isNew: true, fee: 50, commission: 20,
        formFields: [...commonCustomerFields, { name: 'branch', label: 'Branch', type: 'select', options: ['Indian Army', 'Indian Navy', 'Indian Air Force'], required: true }, { name: 'post', label: 'Post Applied', type: 'text', required: true }, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, photoUpload, documentUpload, remarksField] },
    ]
  },
  {
    id: 'insurance',
    slug: 'insurance',
    name: 'Insurance Services',
    nameHindi: 'बीमा सेवाएं',
    description: 'Life, health, vehicle and other insurance services',
    icon: '🛡️',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    isActive: true,
    sortOrder: 12,
    services: [
      { id: 'ins-1', name: 'Life Insurance', icon: '❤️', color: '#dc2626', isActive: true, isPopular: true, fee: 0, commission: 200,
        formFields: [...commonCustomerFields, aadhaarField, panField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'sumAssured', label: 'Sum Assured (₹)', type: 'number', required: true }, { name: 'nomineeName', label: 'Nominee Name', type: 'text', required: true }, ...addressFields, documentUpload, remarksField] },
      { id: 'ins-2', name: 'Health Insurance', icon: '🏥', color: '#059669', isActive: true, isPopular: true, fee: 0, commission: 150,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'dob', label: 'Date of Birth', type: 'date', required: true }, { name: 'coverAmount', label: 'Cover Amount (₹)', type: 'number', required: true }, { name: 'familyMembers', label: 'Family Members Count', type: 'number', required: true }, documentUpload, remarksField] },
      { id: 'ins-3', name: 'Vehicle Insurance', icon: '🚗', color: '#2563eb', isActive: true, fee: 0, commission: 100,
        formFields: [...commonCustomerFields, { name: 'vehicleNo', label: 'Vehicle Number', type: 'text', required: true }, { name: 'vehicleType', label: 'Vehicle Type', type: 'select', options: ['Two Wheeler', 'Four Wheeler', 'Commercial'], required: true }, { name: 'policyType', label: 'Policy Type', type: 'select', options: ['Third Party', 'Comprehensive', 'Own Damage'], required: true }, documentUpload, remarksField] },
      { id: 'ins-4', name: 'Crop Insurance', icon: '🌾', color: '#16a34a', isActive: true, fee: 0, commission: 80,
        formFields: [...commonCustomerFields, aadhaarField, { name: 'cropType', label: 'Crop Type', type: 'text', required: true }, { name: 'landArea', label: 'Land Area (Hectares)', type: 'number', required: true }, { name: 'season', label: 'Season', type: 'select', options: ['Kharif', 'Rabi'], required: true }, documentUpload, remarksField] },
      { id: 'ins-5', name: 'Travel Insurance', icon: '✈️', color: '#7c3aed', isActive: true, fee: 0, commission: 75,
        formFields: [...commonCustomerFields, { name: 'destination', label: 'Destination', type: 'text', required: true }, { name: 'travelDates', label: 'Travel Start Date', type: 'date', required: true }, { name: 'duration', label: 'Duration (Days)', type: 'number', required: true }, documentUpload, remarksField] },
      { id: 'ins-6', name: 'Home Insurance', icon: '🏠', color: '#ea580c', isActive: true, isNew: true, fee: 0, commission: 100,
        formFields: [...commonCustomerFields, ...addressFields, { name: 'propertyValue', label: 'Property Value (₹)', type: 'number', required: true }, { name: 'coverType', label: 'Cover Type', type: 'select', options: ['Structure Only', 'Structure + Contents', 'Contents Only'], required: true }, documentUpload, remarksField] },
    ]
  },
  {
    id: 'travel',
    slug: 'travel-booking',
    name: 'Travel & Booking',
    nameHindi: 'यात्रा और बुकिंग',
    description: 'Train, bus, flight tickets and hotel booking services',
    icon: '✈️',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    isActive: true,
    sortOrder: 13,
    services: [
      { id: 'trv-1', name: 'Train Ticket (IRCTC)', icon: '🚂', color: '#dc2626', isActive: true, isPopular: true, fee: 20, commission: 10,
        formFields: [...commonCustomerFields, { name: 'fromStation', label: 'From Station', type: 'text', required: true }, { name: 'toStation', label: 'To Station', type: 'text', required: true }, { name: 'travelDate', label: 'Travel Date', type: 'date', required: true }, { name: 'classType', label: 'Class', type: 'select', options: ['Sleeper', '3AC', '2AC', '1AC', 'General', 'CC'], required: true }, { name: 'passengers', label: 'No. of Passengers', type: 'number', required: true }, remarksField] },
      { id: 'trv-2', name: 'Bus Ticket Booking', icon: '🚌', color: '#059669', isActive: true, fee: 15, commission: 8,
        formFields: [...commonCustomerFields, { name: 'fromCity', label: 'From City', type: 'text', required: true }, { name: 'toCity', label: 'To City', type: 'text', required: true }, { name: 'travelDate', label: 'Travel Date', type: 'date', required: true }, { name: 'passengers', label: 'No. of Passengers', type: 'number', required: true }, remarksField] },
      { id: 'trv-3', name: 'Flight Booking', icon: '✈️', color: '#2563eb', isActive: true, fee: 50, commission: 25,
        formFields: [...commonCustomerFields, { name: 'fromCity', label: 'From City', type: 'text', required: true }, { name: 'toCity', label: 'To City', type: 'text', required: true }, { name: 'travelDate', label: 'Travel Date', type: 'date', required: true }, { name: 'tripType', label: 'Trip Type', type: 'select', options: ['One Way', 'Round Trip'], required: true }, { name: 'passengers', label: 'No. of Passengers', type: 'number', required: true }, remarksField] },
      { id: 'trv-4', name: 'Hotel Booking', icon: '🏨', color: '#7c3aed', isActive: true, fee: 0, commission: 30,
        formFields: [...commonCustomerFields, { name: 'city', label: 'City', type: 'text', required: true }, { name: 'checkinDate', label: 'Check-in Date', type: 'date', required: true }, { name: 'checkoutDate', label: 'Check-out Date', type: 'date', required: true }, { name: 'rooms', label: 'No. of Rooms', type: 'number', required: true }, { name: 'guests', label: 'No. of Guests', type: 'number', required: true }, remarksField] },
      { id: 'trv-5', name: 'Cab Booking', icon: '🚕', color: '#f59e0b', isActive: true, isNew: true, fee: 0, commission: 10,
        formFields: [...commonCustomerFields, { name: 'pickupLocation', label: 'Pickup Location', type: 'text', required: true }, { name: 'dropLocation', label: 'Drop Location', type: 'text', required: true }, { name: 'travelDate', label: 'Travel Date', type: 'date', required: true }, { name: 'cabType', label: 'Cab Type', type: 'select', options: ['Sedan', 'SUV', 'Hatchback', 'Tempo Traveller'], required: true }, remarksField] },
    ]
  },
];

export default servicesData;

// Helper function to get a category by slug
export const getCategoryBySlug = (slug: string): ServiceCategory | undefined => {
  return servicesData.find(cat => cat.slug === slug);
};

// Helper function to get all active categories
export const getActiveCategories = (): ServiceCategory[] => {
  return servicesData.filter(cat => cat.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
};

// Helper to get total services count
export const getTotalServicesCount = (): number => {
  return servicesData.reduce((sum, cat) => sum + cat.services.length, 0);
};

// Helper to get active services count
export const getActiveServicesCount = (): number => {
  return servicesData.reduce((sum, cat) => sum + cat.services.filter(s => s.isActive).length, 0);
};

// Helper to get new services across all categories
export const getNewServices = (): { service: ServiceItem; categoryName: string }[] => {
  const newServices: { service: ServiceItem; categoryName: string }[] = [];
  servicesData.forEach(cat => {
    cat.services.forEach(s => {
      if (s.isNew) {
        newServices.push({ service: s, categoryName: cat.name });
      }
    });
  });
  return newServices;
};

// Helper to get popular services across all categories
export const getPopularServices = (): { service: ServiceItem; categoryName: string }[] => {
  const popular: { service: ServiceItem; categoryName: string }[] = [];
  servicesData.forEach(cat => {
    cat.services.forEach(s => {
      if (s.isPopular) {
        popular.push({ service: s, categoryName: cat.name });
      }
    });
  });
  return popular;
};
