import SettingMenu from '@/common/SettingMenu';
import { insideRoutes } from '@/router';
import { Layout as Container } from 'antd';
import cls from 'classnames';
import { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Routes, useNavigate } from 'react-router-dom';
import BreadcrumbGroup from '../BreadcrumbGroup';
import RouteLoading from '../RouteLoading';
import getRoutes from '../RouteMap';
import NavBar from './NavBar';
import SideBar from './SideBar';
import styles from './index.less';
// import EmbededAnythingLLM from '../EmbededAnythingLLM';
const { Content, Footer } = Container;

const Layout = () => {
  const navigate = useNavigate();
  const { menuMode, menuEnable } = useSelector(state => state.SettingModel); // Destructure menuMode, menuEnable from state.SettingModel
  return (
    <Container>
      {menuMode === 'inline' ? menuEnable ? <SideBar /> : '' : <NavBar />}
      <Container className={cls({ [styles.inline]: menuMode === 'inline' })}>
        {menuMode === 'inline' ? <NavBar /> : menuEnable ? <SideBar /> : ''}
        <Content
          className={cls({ [styles.mixin]: menuEnable && menuMode === 'mixin' })}
          style={{ padding: '12px 12px 12px 12px' }} // Remove padding-bottom: 16px 16px 0px 16px
        >
          {menuEnable && menuMode !== 'inline' && (
            <div style={{ marginBottom: '12px' }}>
              <BreadcrumbGroup />
            </div>
          )}
          <div
            style={{
              position: 'relative',
              height: '100%',
              minHeight: 'calc(100vh - 64px)',
              minHeight: 'calc(100dvh - 64px)',
              backgroundColor: '#fff',
              borderRadius: '8px',
            }}
          >
            <Suspense fallback={<RouteLoading />}>
              <Routes>{getRoutes(insideRoutes)}</Routes>
            </Suspense>
            <Outlet />
          </div>
          <SettingMenu />
          {/* <FloatButton
            icon={<CommentOutlined />}
            type="primary"
            tooltip={<div>Ask ChatUIC</div>}
            style={{
              marginRight: '20px',
            }}
            onClick={() => {
              navigate('/chat');
            }}
          /> */}
          {/* <EmbededAnythingLLM /> */}
          {/* <Footer
            style={{
              textAlign: 'center',
            }}
          >
            UIC Information Center &copy; {new Date().getFullYear()} Team UIC
          </Footer> */}
        </Content>
      </Container>
    </Container>
  );
};

export default Layout;
