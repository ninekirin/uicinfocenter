import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Menu } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // React Router v6, useNavigate
import { insideRoutes } from '@/router';
import { useMenu } from '@/hooks';

const MenuList = React.memo(() => {
  const navigate = useNavigate(); // Hook for navigation
  const { theme, menuMode } = useSelector(state => state.SettingModel);
  const selectedKeys = useMenu(); // This will change based on URL change
  const [openKeys, setOpenKeys] = useState(selectedKeys);

  useEffect(() => {
    setOpenKeys(selectedKeys);
  }, [selectedKeys]);

  const getMenuItems = useCallback(
    (routes, parentPath) => {
      return routes
        .filter(item => !item.hidden)
        .map(route => {
          const key =
            parentPath +
            (route.path.match(/(\S*)\/\*/) ? route.path.match(/(\S*)\/\*/)[1] : route.path);
          if (!route.items?.length) {
            return {
              key: key,
              icon: route.icon || null,
              label: route.title, // Removed Link
              onClick: () => navigate(key), // Added onClick for navigation
            };
          } else {
            return {
              key: key,
              icon: route.icon || null,
              label: route.title,
              children: getMenuItems(route.items, key + '/'),
            };
          }
        });
    },
    [navigate]
  );

  const onOpenChange = useCallback(
    keys => {
      const latestOpenKey = keys.find(key => !openKeys.includes(key));
      if (latestOpenKey) {
        const others = keys.filter(
          key => latestOpenKey.includes(key) || key.includes(latestOpenKey)
        );
        setOpenKeys(others);
      } else {
        setOpenKeys(keys);
      }
    },
    [openKeys]
  );

  const menuItems = useMemo(() => getMenuItems(insideRoutes, '/'), [getMenuItems]);

  return (
    <Menu
      theme={theme}
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={onOpenChange}
      mode={menuMode}
      items={menuItems}
    />
  );
});

export default MenuList;
