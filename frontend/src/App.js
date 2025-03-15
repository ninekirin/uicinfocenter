import Layout from '@/common/Layout';
import RouteLoading from '@/common/RouteLoading';
import getRoutes from '@/common/RouteMap';
import { outsideRoutes } from '@/router';
import { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

const App = () => {
  const dispatch = useDispatch();

  const handleResize = () => {
    const isCollapsed = window.innerWidth < 768;
    dispatch({ type: 'setSideBarCollapsed', data: isCollapsed });
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(document.body);

    // Initial check
    handleResize();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/*" element={<Layout />} />
        {getRoutes(outsideRoutes)}
      </Routes>
    </Suspense>
  );
};

export default App;
