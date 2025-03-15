import logo from '@/assets/image/uic_logo.svg';
import { apiBaseUrl, siteName } from '@/assets/js/config.js';
import BreadcrumbGroup from '@/common/BreadcrumbGroup';
import MenuList from '@/common/MenuList';
import MixinMenuHeader from '@/common/MixinMenuHeader';
import {
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout as Container, Dropdown, Space, message } from 'antd';
import cls from 'classnames';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styles from './index.less';
const { Header } = Container;

const NavBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sideBarCollapsed, theme, menuMode } = useSelector(state => state.SettingModel);

  const onLogout = ({ key }) => {
    if (key === 'logout') {
      fetch(`${apiBaseUrl}/user/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
      })
        .then(res => res.json())
        .then(response => {
          if (response.success) {
            message.success(response.message);
            window.localStorage.removeItem('userToken');
            window.localStorage.removeItem('user');
            navigate('/login');
          } else {
            // message.error(response.message);
            window.localStorage.removeItem('userToken');
            window.localStorage.removeItem('user');
            navigate('/login');
          }
        });
    }
  };

  const setDefaultEntrypoint = defaultEntrypoint => {
    fetch(
      `${apiBaseUrl}/user/${
        localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : 'Null'
      }/default-entrypoint`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify({
          default_entrypoint: defaultEntrypoint,
        }),
      }
    )
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          // message.success('Default entrypoint set to Chat.');
          localStorage.setItem('user', JSON.stringify({ ...user, default_entrypoint: 'chat' }));
        } else {
          handleTokenError(response.code);
        }
      })
      .catch(() => {
        // message.error('An error occurred while setting default entrypoint.');
      });
  };

  const items = [
    {
      key: 'chat',
      label: (
        <Space>
          <RobotOutlined />
          ChatUIC
        </Space>
      ),
      onClick: () => {
        setDefaultEntrypoint('chat');
        navigate('/chat');
      },
    },
    {
      key: 'logout',
      label: (
        <Space>
          <LogoutOutlined />
          Logout
        </Space>
      ),
      onClick: onLogout,
    },
  ];

  return (
    <Header
      className={cls(styles.navBar, {
        [styles[theme]]: menuMode !== 'inline',
      })}
    >
      <div className={styles.navHeader}>
        {menuMode !== 'inline' ? (
          <div className={styles.left}>
            <Link to="/">
              <div className={styles.logo}>
                <img src={logo} alt="logo" />
                <span
                  className={cls({
                    [styles[theme]]: menuMode !== 'inline',
                  })}
                >
                  {siteName}
                </span>
              </div>
            </Link>
            <div className={styles.menu}>
              {menuMode === 'horizontal' ? <MenuList /> : <MixinMenuHeader />}
            </div>
          </div>
        ) : (
          <div className={styles.inlineLeft}>
            {React.createElement(sideBarCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => dispatch({ type: 'setSideBarCollapsed' }),
            })}
            <BreadcrumbGroup />
          </div>
        )}
        <div
          className={cls(styles.right, {
            [styles[theme]]: menuMode !== 'inline',
            [styles.light]: menuMode === 'inline',
          })}
        >
          <Dropdown menu={{ items }}>
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
              <Space>
                <UserOutlined />
                {localStorage.getItem('user')
                  ? JSON.parse(localStorage.getItem('user')).username
                  : 'Null'}
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </div>
      </div>
    </Header>
  );
};

export default NavBar;
