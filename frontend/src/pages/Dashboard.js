import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const cards = [
    { icon: '🌱', title: 'Farmer', desc: 'Upload herb batch details', path: '/farmer' },
    { icon: '⚙️', title: 'Processing Unit', desc: 'Update processing status', path: '/processing' },
    { icon: '🔬', title: 'Laboratory', desc: 'Upload quality certificates', path: '/lab' },
    { icon: '🏭', title: 'Manufacturer', desc: 'Confirm receipt & production', path: '/manufacturer' },
    { icon: '📦', title: 'Track Batch', desc: 'Scan QR or enter batch ID', path: '/track' },
    { icon: '⚡', title: 'Admin Panel', desc: 'Manage users & companies', path: '/admin' },
  ];

  const stats = [
    { label: 'Batches Tracked', value: '1,284' },
    { label: 'Farmers Onboarded', value: '342' },
    { label: 'Companies Using ERVAS', value: '28' },
    { label: 'Blockchain Records', value: '9,741' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <span className="header-logo">🌿</span>
          <h1>ERVAS</h1>
        </div>
        <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
      </div>

      <div className="dashboard-body">
        <h2>Welcome to ERVAS Dashboard</h2>
        <p>Select your module to continue</p>

        {/* Stats Bar */}
        <div className="stats-bar">
          {stats.map((stat, i) => (
            <div className="stat-item" key={i}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="cards-grid">
          {cards.map((card, index) => (
            <div className="card" key={index} onClick={() => navigate(card.path)}>
              <span className="card-icon">{card.icon}</span>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;