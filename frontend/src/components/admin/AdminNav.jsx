import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminNav = ({ tabs, activeTab, onTabChange, unreadCount, handleLogout, screenWidth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isXS = screenWidth < 480;
  const isSM = screenWidth < 768;
  const isMD = screenWidth < 992;
  const showTextInTab = screenWidth >= 640;

  // Close menu when tab changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  // Responsive tab rendering
  const renderTab = (tab) => {
    const isActive = activeTab === tab.id;
    const hasNotification = (tab.id === 'notifications' || tab.id === 'appointments') && unreadCount > 0;

    return (
      <motion.button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: showTextInTab ? '12px 18px' : '12px 8px',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          fontSize: showTextInTab ? '14px' : '12px',
          fontWeight: isActive ? '700' : '500',
          color: isActive ? '#1a0f08' : '#6c757d',
          background: isActive
            ? 'linear-gradient(135deg, rgba(184,134,11,0.15), rgba(212,165,116,0.1))'
            : 'transparent',
          transition: 'all 0.3s ease',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: showTextInTab ? '8px' : '2px',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: '16px' }}>{tab.icon}</span>
        {showTextInTab && <span>{tab.label}</span>}
        {hasNotification && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: '#dc3545',
              borderRadius: '50%',
            }}
          />
        )}
      </motion.button>
    );
  };

  // Desktop layout: horizontal tabs
  if (!isMD) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 0',
          borderBottom: '1px solid rgba(184,134,11,0.1)',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '8px',
            flex: '1',
          }}
        >
          {tabs.map(renderTab)}
        </div>
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            background: 'rgba(220, 53, 69, 0.08)',
            color: '#dc3545',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}
        >
          🚪 Déconnexion
        </motion.button>
      </div>
    );
  }

  // Mobile layout: hamburger menu
  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '16px 0',
          borderBottom: '1px solid rgba(184,134,11,0.1)',
        }}
      >
        <h1 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Dashboard</h1>
        <motion.button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '1px solid rgba(184,134,11,0.15)',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ☰
        </motion.button>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: mobileMenuOpen ? '16px 0' : '0',
        }}
      >
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeTab === tab.id ? '700' : '500',
              color: activeTab === tab.id ? '#1a0f08' : '#6c757d',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, rgba(184,134,11,0.15), rgba(212,165,116,0.1))'
                : 'rgba(184,134,11,0.05)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: '18px' }}>{tab.icon}</span>
            <span style={{ textAlign: 'center' }}>{tab.label}</span>
            {(tab.id === 'notifications' || tab.id === 'appointments') && unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '18px',
                  height: '18px',
                  background: '#dc3545',
                  borderRadius: '50%',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                }}
              >
                {unreadCount}
              </span>
            )}
          </motion.button>
        ))}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            background: 'rgba(220, 53, 69, 0.08)',
            color: '#dc3545',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            gridColumn: '1 / -1',
          }}
        >
          <span style={{ fontSize: '18px' }}>🚪</span>
          <span>Déconnexion</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default AdminNav;
