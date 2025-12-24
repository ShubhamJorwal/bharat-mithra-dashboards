import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineCollection,
  HiOutlineStar,
  HiOutlineCube,
  HiOutlineRefresh,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { Service, ServiceCategory } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './ServiceList.scss';

const ServiceList = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        servicesApi.getServices({ per_page: 100 }),
        servicesApi.getCategories()
      ]);

      if (servicesRes.success && servicesRes.data) {
        setServices(servicesRes.data);
      } else {
        setServices([]);
        if (servicesRes.message) {
          setError(servicesRes.message);
        }
      }

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setServices([]);
      setCategories([]);
      setError('Unable to connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (service: Service) => {
    if (!window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return;
    }

    setDeleteLoading(service.id);
    setError(null);

    try {
      const response = await servicesApi.deleteService(service.id);
      if (response.success) {
        setServices(prev => prev.filter(s => s.id !== service.id));
      } else {
        setError(response.message || 'Failed to delete service');
      }
    } catch (err) {
      console.error('Failed to delete service:', err);
      setError('Failed to delete service. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bm-services">
      <PageHeader
        icon={<HiOutlineCube />}
        title="Services"
        description="Manage government services for citizens"
        actions={
          <>
            <button
              className="bm-btn bm-btn-secondary"
              onClick={fetchData}
              disabled={loading}
            >
              <HiOutlineRefresh className={loading ? 'bm-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              className="bm-btn bm-btn-primary"
              onClick={() => navigate('/services/new')}
            >
              <HiOutlinePlus />
              <span>Add Service</span>
            </button>
          </>
        }
      />

      {error && (
        <div className="bm-alert bm-alert-error">
          <HiOutlineExclamationCircle />
          <span>{error}</span>
          <button className="bm-alert-close" onClick={() => setError(null)}>&times;</button>
        </div>
      )}

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
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bm-loading-state">
            <div className="bm-loading-spinner"></div>
            <p>Loading services...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="bm-services-grid">
            {filteredServices.map((service) => (
              <div key={service.id} className="bm-service-card">
                <div className="bm-service-header">
                  <div className="bm-service-icon">
                    <HiOutlineCollection />
                  </div>
                  <div className="bm-service-badges">
                    {service.is_popular && (
                      <span className="bm-badge bm-badge-popular">
                        <HiOutlineStar /> Popular
                      </span>
                    )}
                    {service.is_featured && (
                      <span className="bm-badge bm-badge-featured">Featured</span>
                    )}
                  </div>
                </div>
                <div className="bm-service-body">
                  <h3 className="bm-service-name">{service.name}</h3>
                  <p className="bm-service-desc">{service.description}</p>
                  <div className="bm-service-meta">
                    <span className="bm-service-category">{getCategoryName(service.category_id)}</span>
                    <span className="bm-service-fee">
                      {service.is_free_service ? 'Free' : `₹${service.total_fee}`}
                    </span>
                  </div>
                  {service.department && (
                    <div className="bm-service-dept">{service.department}</div>
                  )}
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
                  <button
                    className="bm-btn bm-btn-ghost bm-btn-danger"
                    onClick={() => handleDelete(service)}
                    disabled={deleteLoading === service.id}
                  >
                    <HiOutlineTrash />
                    <span>{deleteLoading === service.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bm-empty-state">
            <div className="bm-empty-icon">
              <HiOutlineCube />
            </div>
            <h3>No services found</h3>
            <p>
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first service'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                className="bm-btn bm-btn-primary"
                onClick={() => navigate('/services/new')}
              >
                <HiOutlinePlus />
                <span>Create Service</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceList;
