import React from 'react';
import { createRoot } from 'react-dom/client';
import DesignApp from './DesignApp.jsx';
import PageMotion from './components/shared/PageMotion.jsx';
import './motion.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><PageMotion /><DesignApp /></React.StrictMode>);
