import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChristmasPage } from './pages/Christmas';
import { NewYearPage } from './pages/NewYear';
import { CNYPage } from './pages/ChineseNewYear';
import { Navigation } from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="relative w-screen h-screen bg-[#020403] overflow-hidden">
        <Navigation />
        <Routes>
          <Route path="/" element={<ChristmasPage />} />
          <Route path="/new-year" element={<NewYearPage />} />
          <Route path="/cny" element={<CNYPage />} />
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
