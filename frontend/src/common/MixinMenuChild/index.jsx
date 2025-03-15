import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; //React Router v6, useNavigate
import { insideRoutes } from '@/router';
import { useMenu } from '@/hooks';

const MixinMenuChild = () => {
  const { theme, menuMode, mixinMenuActivePath } = useSelector(state => state.SettingModel);
  const navigate = useNavigate(); // Hook for navigation
  const selectedKeys = useMenu();
  const [openKeys, setOpenKeys] = useState(useMenu());
  const [childMenuList, setChildMenuList] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    setChildMenuList(
      insideRoutes[insideRoutes.findIndex(item => item.path === mixinMenuActivePath)]?.items || []
    );
  }, [mixinMenuActivePath]);

  useEffect(() => {
    dispatch({ type: 'setSideBarHidden', data: !childMenuList.length });
  }, [childMenuList, dispatch]);

  const getChildMenuItems = (routes, parentPath) => {
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
            children: getChildMenuItems(route.items, key + '/'),
          };
        }
      });
  };

  const menuItems = getChildMenuItems(childMenuList, '/' + mixinMenuActivePath + '/');

  return (
    <Menu
      theme={theme}
      mode="inline"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={keys => setOpenKeys(keys)}
      items={menuItems}
    />
  );
};

export default MixinMenuChild;
