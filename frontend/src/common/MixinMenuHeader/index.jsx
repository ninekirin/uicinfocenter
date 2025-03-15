import React from 'react';
import { Menu } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { insideRoutes } from '@/router';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '@/hooks';

const MixinMenuHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedKeys = useMenu();
  const { theme } = useSelector(state => state.SettingModel);

  const getHeaderMenuItems = (routes, parentPath) => {
    return routes
      .filter(item => !item.hidden)
      .map(route => {
        const key =
          parentPath +
          (route.path.match(/(\S*)\/\*/) ? route.path.match(/(\S*)\/\*/)[1] : route.path);
        return {
          key: key,
          icon: route.icon || null,
          label: route.title,
          onClick: () => {
            if (!route.items?.length) {
              navigate(key);
            }
            dispatch({ type: 'setMixinMenuActivePath', data: route.path });
          },
        };
      });
  };

  const menuItems = getHeaderMenuItems(insideRoutes, '/');

  return <Menu theme={theme} mode="horizontal" selectedKeys={selectedKeys} items={menuItems} />;
};

export default MixinMenuHeader;
