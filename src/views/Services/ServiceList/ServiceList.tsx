import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineCollection,
  HiOutlineStar,
  HiOutlineCube,
  HiOutlineSparkles
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { Service, ServiceCategory } from '../../../types/api.types';
import './ServiceList.scss';

// Mock data for development/demo when API is not available
const mockCategories: ServiceCategory[] = [
  { id: 'cat-1', name: 'Identity Documents', name_hindi: 'पहचान दस्तावेज़', slug: 'identity-documents', sort_order: 1, is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'cat-2', name: 'Property & Land', name_hindi: 'संपत्ति और भूमि', slug: 'property-land', sort_order: 2, is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'cat-3', name: 'Education', name_hindi: 'शिक्षा', slug: 'education', sort_order: 3, is_active: true, created_at: '2025-01-01T00:00:00Z' },
  { id: 'cat-4', name: 'Health & Welfare', name_hindi: 'स्वास्थ्य और कल्याण', slug: 'health-welfare', sort_order: 4, is_active: true, created_at: '2025-01-01T00:00:00Z' },
];

const mockServices: Service[] = [
  {
    id: 'srv-1', category_id: 'cat-1', name: 'Aadhaar Card', name_hindi: 'आधार कार्ड', slug: 'aadhaar-card',
    description: 'Apply for new Aadhaar card or update existing details', department: 'UIDAI',
    service_fee: 0, platform_fee: 50, total_fee: 50, is_free_service: false, is_popular: true, is_featured: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'srv-2', category_id: 'cat-1', name: 'PAN Card', name_hindi: 'पैन कार्ड', slug: 'pan-card',
    description: 'Apply for new PAN card or corrections in existing PAN', department: 'Income Tax Department',
    service_fee: 107, platform_fee: 50, total_fee: 157, is_free_service: false, is_popular: true, is_featured: false,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'srv-3', category_id: 'cat-1', name: 'Voter ID Card', name_hindi: 'मतदाता पहचान पत्र', slug: 'voter-id',
    description: 'Apply for new Voter ID or update existing voter card', department: 'Election Commission',
    service_fee: 0, platform_fee: 30, total_fee: 30, is_free_service: false, is_popular: false, is_featured: false,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'srv-4', category_id: 'cat-2', name: 'Property Registration', name_hindi: 'संपत्ति पंजीकरण', slug: 'property-registration',
    description: 'Register your property with government authorities', department: 'Revenue Department',
    service_fee: 500, platform_fee: 100, total_fee: 600, is_free_service: false, is_popular: false, is_featured: true,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'srv-5', category_id: 'cat-3', name: 'Income Certificate', name_hindi: 'आय प्रमाण पत्र', slug: 'income-certificate',
    description: 'Apply for income certificate for various purposes', department: 'Revenue Department',
    service_fee: 0, platform_fee: 25, total_fee: 25, is_free_service: false, is_popular: true, is_featured: false,
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'srv-6', category_id: 'cat-4', name: 'Ayushman Bharat Card', name_hindi: 'आयुष्मान भारत कार्ड', slug: 'ayushman-bharat',
    description: 'Apply for Ayushman Bharat health insurance card', department: 'Ministry of Health',
    service_fee: 0, platform_fee: 0, total_fee: 0, is_free_service: true, is_popular: true, is_featured: true,
    created_at: '2025-01-01T00:00:00Z'
  },
];

const ServiceList = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch both services and categories
        const [servicesRes, categoriesRes] = await Promise.all([
          servicesApi.getServices({ per_page: 100 }),
          servicesApi.getCategories()
        ]);

        if (servicesRes.success && servicesRes.data) {
          setServices(servicesRes.data);
        } else {
          setServices(mockServices);
        }
        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        } else {
          setCategories(mockCategories);
        }
      } catch (error) {
        console.error('Failed to fetch services, using mock data:', error);
        setServices(mockServices);
        setCategories(mockCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get category name by ID (with null safety)
  const getCategoryName = (categoryId: string) => {
    const category = (categories || []).find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  // Safe filter with null check
  const filteredServices = (services || []).filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="bm-services">
        <div className="bm-loading">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="bm-services">
      <header className="bm-page-header">
        <div className="bm-page-header-left">
          <div className="bm-page-icon">
            <HiOutlineCube />
          </div>
          <div className="bm-page-header-content">
            <div className="bm-page-title-row">
              <h1 className="bm-page-title">Services</h1>
              <div className="bm-page-tags">
                <span className="bm-tag bm-tag-primary">
                  <HiOutlineSparkles /> Active
                </span>
                <span className="bm-tag bm-tag-info">{(services || []).length} Total</span>
              </div>
            </div>
            <p className="bm-page-desc">Manage and configure government services for citizens</p>
          </div>
        </div>
        <div className="bm-page-header-right">
          <button className="bm-btn bm-btn-primary" onClick={() => navigate('/services/new')}>
            <HiOutlinePlus />
            <span>Add Service</span>
          </button>
        </div>
      </header>

      <div className="bm-card">
        <div className="bm-table-toolbar">
          <div className="bm-search-box">
            <HiOutlineSearch className="bm-search-icon" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bm-search-input"
            />
          </div>
          <div className="bm-toolbar-actions">
            <div className="bm-filter-group">
              <HiOutlineFilter className="bm-filter-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bm-select"
              >
                <option value="all">All Categories</option>
                {(categories || []).map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bm-services-grid">
          {filteredServices.map((service) => (
            <div key={service.id} className="bm-service-card">
              <div className="bm-service-header">
                <div className="bm-service-icon">
                  <HiOutlineCollection />
                </div>
                <div className="bm-service-badges">
                  {service.is_popular && (
                    <span className="bm-popular-badge">
                      <HiOutlineStar /> Popular
                    </span>
                  )}
                  {service.is_featured && (
                    <span className="bm-featured-badge">Featured</span>
                  )}
                </div>
              </div>
              <div className="bm-service-body">
                <h3 className="bm-service-name">{service.name}</h3>
                <p className="bm-service-desc">{service.description}</p>
                <div className="bm-service-meta">
                  <span className="bm-service-category">{getCategoryName(service.category_id)}</span>
                  <span className="bm-service-fee">₹{service.total_fee}</span>
                </div>
                <div className="bm-service-dept">{service.department}</div>
              </div>
              <div className="bm-service-actions">
                <button
                  className="bm-btn bm-btn-ghost"
                  onClick={() => navigate(`/services/${service.slug}`)}
                >
                  <HiOutlineEye />
                  <span>View</span>
                </button>
                <button
                  className="bm-btn bm-btn-ghost"
                  onClick={() => navigate(`/services/${service.slug}/edit`)}
                >
                  <HiOutlinePencil />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="bm-empty-state">
            <p>No services found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;
