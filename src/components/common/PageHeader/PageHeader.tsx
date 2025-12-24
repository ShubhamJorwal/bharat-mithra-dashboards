import React from 'react';
import './PageHeader.scss';

interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'minimal';
}

const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  description,
  actions,
  variant = 'gradient'
}) => {
  return (
    <header className={`bm-page-header bm-page-header--${variant}`}>
      {/* Animated Background Objects */}
      {variant === 'gradient' && (
        <div className="bm-header-bg">
          <div className="bm-bg-object bm-bg-object--1"></div>
          <div className="bm-bg-object bm-bg-object--2"></div>
          <div className="bm-bg-object bm-bg-object--3"></div>
          <div className="bm-bg-object bm-bg-object--4"></div>
          <div className="bm-bg-object bm-bg-object--5"></div>
          <div className="bm-bg-grid"></div>
        </div>
      )}

      <div className="bm-page-header-content">
        <div className="bm-page-header-left">
          {icon && <div className="bm-page-icon">{icon}</div>}
          <div className="bm-page-header-text">
            <h1 className="bm-page-title">{title}</h1>
            {description && <p className="bm-page-desc">{description}</p>}
          </div>
        </div>

        {actions && (
          <div className="bm-page-header-right">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
