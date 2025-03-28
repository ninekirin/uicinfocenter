import React from 'react';
import { Route, Navigate } from 'react-router-dom';
const getRoutes = routes => {
  return routes.map(route => {
    const Component = route.component;
    
    return !route.items?.length ? (
      route.redirect ? (
        <Route path={route.path} key={route.path} element={<Navigate to={route.redirect} />} />
      ) : route.index ? (
        <Route index key={route.path || route.redirect} element={Component ? <Component /> : null} />
      ) : (
        <Route key={route.path} path={route.path} element={Component ? <Component /> : null} />
      )
    ) : (
      <Route key={route.path} path={route.path} element={Component ? <Component /> : null}>
        {getRoutes(route.items)}
      </Route>
    );
  });
};
export default getRoutes;
