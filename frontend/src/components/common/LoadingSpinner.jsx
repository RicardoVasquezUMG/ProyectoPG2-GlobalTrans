import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
      <ProgressSpinner />
    </div>
  );
}
