import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineFolder,
  HiOutlinePhotograph
} from 'react-icons/hi';
import servicesApi from '../../../services/api/services.api';
import type { ServiceCategory } from '../../../types/api.types';
import { PageHeader } from '../../../components/common/PageHeader';
import './CategoryList.scss';

const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await servicesApi.getAllCategories(true);
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setCategories([]);
        if (response.message) {
          setError(response.message);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
      setError('Unable to connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (category: ServiceCategory) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    setDeleteLoading(category.id);
    setError(null);

    try {
      const response = await servicesApi.deleteCategory(category.id);
      if (response.success) {
        setCategories(prev => prev.filter(c => c.id !== category.id));
      } else {
        setError(response.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError('Failed to delete category. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.name_hindi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Separate parent categories and subcategories
  const parentCategories = filteredCategories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => filteredCategories.filter(c => c.parent_id === parentId);

  return (
    <div className="bm-categories">
      <PageHeader
        icon={<HiOutlineFolder />}
        title="Categories"
        description="Manage service categories"
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
              onClick={() => navigate('/services/categories/new')}
            >
              <HiOutlinePlus />
              <span>Add Category</span>
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
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bm-search-input"
            />
          </div>
          <div className="bm-category-count">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </div>
        </div>

        {loading ? (
          <div className="bm-loading-state">
            <div className="bm-loading-spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : parentCategories.length > 0 ? (
          <div className="bm-categories-list">
            {parentCategories.map((category) => {
              const subcategories = getSubcategories(category.id);
              return (
                <div key={category.id} className="bm-category-item">
                  <div className="bm-category-row">
                    <div className="bm-category-icon">
                      {category.icon_url ? (
                        <img src={category.icon_url} alt={category.name} />
                      ) : (
                        <HiOutlinePhotograph />
                      )}
                    </div>
                    <div className="bm-category-info">
                      <div className="bm-category-name">
                        {category.name}
                        {category.name_hindi && (
                          <span className="bm-category-hindi">{category.name_hindi}</span>
                        )}
                      </div>
                      {category.description && (
                        <p className="bm-category-desc">{category.description}</p>
                      )}
                      <div className="bm-category-meta">
                        <span className="bm-category-slug">{category.slug}</span>
                        <span className={`bm-status ${category.is_active ? 'bm-status-active' : 'bm-status-inactive'}`}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="bm-category-order">Order: {category.sort_order}</span>
                      </div>
                    </div>
                    <div className="bm-category-actions">
                      <button
                        className="bm-btn bm-btn-ghost"
                        onClick={() => navigate(`/services/categories/${category.id}/edit`)}
                      >
                        <HiOutlinePencil />
                        <span>Edit</span>
                      </button>
                      <button
                        className="bm-btn bm-btn-ghost bm-btn-danger"
                        onClick={() => handleDelete(category)}
                        disabled={deleteLoading === category.id}
                      >
                        <HiOutlineTrash />
                        <span>{deleteLoading === category.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                  {subcategories.length > 0 && (
                    <div className="bm-subcategories">
                      {subcategories.map((sub) => (
                        <div key={sub.id} className="bm-subcategory-row">
                          <div className="bm-category-icon bm-subcategory-icon">
                            {sub.icon_url ? (
                              <img src={sub.icon_url} alt={sub.name} />
                            ) : (
                              <HiOutlinePhotograph />
                            )}
                          </div>
                          <div className="bm-category-info">
                            <div className="bm-category-name">
                              {sub.name}
                              {sub.name_hindi && (
                                <span className="bm-category-hindi">{sub.name_hindi}</span>
                              )}
                            </div>
                            <div className="bm-category-meta">
                              <span className="bm-category-slug">{sub.slug}</span>
                              <span className={`bm-status ${sub.is_active ? 'bm-status-active' : 'bm-status-inactive'}`}>
                                {sub.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="bm-category-actions">
                            <button
                              className="bm-btn bm-btn-ghost"
                              onClick={() => navigate(`/services/categories/${sub.id}/edit`)}
                            >
                              <HiOutlinePencil />
                            </button>
                            <button
                              className="bm-btn bm-btn-ghost bm-btn-danger"
                              onClick={() => handleDelete(sub)}
                              disabled={deleteLoading === sub.id}
                            >
                              <HiOutlineTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bm-empty-state">
            <div className="bm-empty-icon">
              <HiOutlineFolder />
            </div>
            <h3>No categories found</h3>
            <p>
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first category'}
            </p>
            {!searchQuery && (
              <button
                className="bm-btn bm-btn-primary"
                onClick={() => navigate('/services/categories/new')}
              >
                <HiOutlinePlus />
                <span>Create Category</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
