import { siteName } from '@/assets/js/config.js';
import { insideRoutes } from '@/router';
import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const BreadcrumbGroup = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  // Modify pathSnippets to treat view/:id as a single element
  const modifiedPathSnippets = [];
  for (let i = 0; i < pathSnippets.length; i++) {
    if (pathSnippets[i] === 'view' && i < pathSnippets.length - 1) {
      modifiedPathSnippets.push(`view/${pathSnippets[i + 1]}`);
      i++; // Skip the next element since it has been combined with 'view'
    } else {
      modifiedPathSnippets.push(pathSnippets[i]);
    }
  }

  // Find the route by path segment
  const findRouteByPath = (routes, pathSegment) => {
    return routes.find(route => route.path.replace(/^:|\//g, '') === pathSegment);
  };

  // Get breadcrumb routes
  const getBreadcrumbRoutes = (routes, pathSegments) => {
    let currentRoutes = routes;
    let breadcrumbRoutes = [];

    for (const segment of pathSegments) {
      const route = findRouteByPath(currentRoutes, segment);
      if (route) {
        if (
          breadcrumbRoutes.length === 0 ||
          breadcrumbRoutes[breadcrumbRoutes.length - 1] !== route
        ) {
          breadcrumbRoutes.push(route);
        }
        currentRoutes = route.items || [];
      } else {
        break;
      }
    }

    return breadcrumbRoutes;
  };

  const breadcrumbItems = modifiedPathSnippets
    .map((_, index) => {
      const pathSegments = modifiedPathSnippets.slice(0, index + 1);
      const breadcrumbRoutes = getBreadcrumbRoutes(insideRoutes, pathSegments);
      return breadcrumbRoutes
        .map((route, idx) => {
          if (idx === breadcrumbRoutes.length - 1) {
            const url = `/${modifiedPathSnippets.slice(0, idx + 1).join('/')}`;
            return {
              key: url,
              title: <Link to={url}>{route.title}</Link>,
            };
          }
          return null;
        })
        .filter(Boolean);
    })
    .flat();

  const items = [
    {
      key: 'home',
      title: <Link to="/">{siteName}</Link>,
    },
    ...breadcrumbItems,
  ];

  return <Breadcrumb items={items} />;
};

export default BreadcrumbGroup;
