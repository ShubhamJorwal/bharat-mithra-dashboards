import {
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineClipboardCheck,
  HiOutlineCurrencyRupee,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineDotsHorizontal,
  HiOutlineChevronRight
} from 'react-icons/hi';

const Dashboard = () => {
  const stats = [
    {
      icon: HiOutlineDocumentText,
      label: 'Total Applications',
      value: '12,845',
      trend: '+12.5%',
      trendType: 'up' as const,
      iconColor: 'primary' as const,
    },
    {
      icon: HiOutlineUsers,
      label: 'Active Users',
      value: '8,523',
      trend: '+8.2%',
      trendType: 'up' as const,
      iconColor: 'success' as const,
    },
    {
      icon: HiOutlineClipboardCheck,
      label: 'Completed Services',
      value: '6,234',
      trend: '-2.4%',
      trendType: 'down' as const,
      iconColor: 'warning' as const,
    },
    {
      icon: HiOutlineCurrencyRupee,
      label: 'Revenue',
      value: '₹45.2L',
      trend: '+18.7%',
      trendType: 'up' as const,
      iconColor: 'danger' as const,
    },
  ];

  const recentApplications = [
    { id: 'APP001', service: 'Passport Renewal', user: 'Rajesh Kumar', status: 'Pending', date: '2024-01-15' },
    { id: 'APP002', service: 'PAN Card', user: 'Priya Sharma', status: 'Approved', date: '2024-01-15' },
    { id: 'APP003', service: 'Driving License', user: 'Amit Singh', status: 'In Review', date: '2024-01-14' },
    { id: 'APP004', service: 'Aadhaar Update', user: 'Sunita Devi', status: 'Completed', date: '2024-01-14' },
    { id: 'APP005', service: 'Voter ID', user: 'Vikram Patel', status: 'Pending', date: '2024-01-13' },
  ];

  const popularServices = [
    { name: 'Passport Services', count: 2340, growth: '+15%' },
    { name: 'PAN Card', count: 1856, growth: '+12%' },
    { name: 'Aadhaar Services', count: 1654, growth: '+8%' },
    { name: 'Driving License', count: 1234, growth: '+5%' },
    { name: 'Birth Certificate', count: 987, growth: '+3%' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'In Review':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <span className="current">Dashboard</span>
        </div>
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening with your services today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon ${stat.iconColor}`}>
                <stat.icon />
              </div>
              <div className={`stat-trend ${stat.trendType}`}>
                {stat.trendType === 'up' ? <HiOutlineArrowUp /> : <HiOutlineArrowDown />}
                {stat.trend}
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid-2">
        {/* Recent Applications */}
        <div className="content-card">
          <div className="card-header">
            <h3>Recent Applications</h3>
            <div className="card-actions">
              <button className="btn-icon">
                <HiOutlineDotsHorizontal />
              </button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service</th>
                  <th>User</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app.id}>
                    <td className="text-primary">{app.id}</td>
                    <td>{app.service}</td>
                    <td>{app.user}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-footer">
            <button className="btn-link">
              View all applications <HiOutlineChevronRight />
            </button>
          </div>
        </div>

        {/* Popular Services */}
        <div className="content-card">
          <div className="card-header">
            <h3>Popular Services</h3>
            <div className="card-actions">
              <button className="btn-icon">
                <HiOutlineDotsHorizontal />
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="services-list">
              {popularServices.map((service, index) => (
                <div key={index} className="service-item">
                  <div className="service-rank">{index + 1}</div>
                  <div className="service-info">
                    <span className="service-name">{service.name}</span>
                    <span className="service-count">{service.count} applications</span>
                  </div>
                  <div className="service-growth text-success">{service.growth}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <button className="btn-link">
              View all services <HiOutlineChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
