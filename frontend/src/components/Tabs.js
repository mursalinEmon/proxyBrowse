import React, { useState, useEffect } from 'react';
import './Tabs.css';

const Tabs = ({ children, activeLabel, onTabChange }) => {
  const tabChildren = React.Children.toArray(children);
  const initialLabel = activeLabel || (tabChildren[0] && tabChildren[0].props.label);
  const [activeTab, setActiveTab] = useState(initialLabel);

  useEffect(() => {
    if (activeLabel && activeLabel !== activeTab) {
      setActiveTab(activeLabel);
    }
  }, [activeLabel, activeTab]);

  const handleClick = (e, newActiveTab) => {
    e.preventDefault();
    setActiveTab(newActiveTab);
    onTabChange?.(newActiveTab);
  };

  return (
    <div className="container">
      <ul className="tabs">
        {tabChildren.map(child => (
          <li
            key={child.props.label}
            className={activeTab === child.props.label ? 'active' : ''}
            onClick={e => handleClick(e, child.props.label)}
          >
            {child.props.label}
          </li>
        ))}
      </ul>
      <div className="tab-content">
        {tabChildren.map(child => {
          if (child.props.label === activeTab) {
            return <div key={child.props.label}>{child.props.children}</div>;
          }
          return null;
        })}
      </div>
    </div>
  );
};

const Tab = ({ label, children }) => {
  return (
    <div label={label} className="tab-pane">
      {children}
    </div>
  );
};

export { Tabs, Tab };
