import React from 'react';
import { pageMeta } from '../pageMeta';

function PageHeader({ activePage }) {
  const meta = pageMeta[activePage];
  if (!meta) return null;
  return (
    <header className="ds-page-header">
      <h1 className="ds-page__title">{meta.title}</h1>
      <p className="ds-page__subtitle">{meta.subtitle}</p>
    </header>
  );
}

export default PageHeader;
