import React from 'react';
import { Routes, Route } from 'react-router-dom';
import pluginId from '../../pluginId';
import HomePage from '../HomePage';
import { Page } from "@strapi/strapi/admin";

const App = () => {
  return (
    <Routes>
      <Route path={`/plugins/${pluginId}`} element={<HomePage />} />
      <Route path="*" element={<Page.Error />} />
    </Routes>
  );
};

export default App;
