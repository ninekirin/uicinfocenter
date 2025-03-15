import logo from '@/assets/image/uic_logo.svg';
import { siteName } from '@/assets/js/config.js';
import MenuList from '@/common/MenuList';
import MixinMenuChild from '@/common/MixinMenuChild';
import { Layout as Container } from 'antd';
import cls from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from './index.less';

const { Sider } = Container;
const SideBar = () => {
  const dispatch = useDispatch();
  const { sideBarCollapsed, theme, menuMode, sideBarHidden } = useSelector(
    state => state.SettingModel
  );
  return (
    <>
      {menuMode !== 'horizontal' && (
        <Sider
          collapsible
          collapsed={sideBarCollapsed}
          onCollapse={() => dispatch({ type: 'setSideBarCollapsed' })}
          theme={theme}
          className={cls(styles[menuMode], styles[theme], {
            [styles.sideBar]: !sideBarCollapsed,
            [styles.sideBarCollapsed]: sideBarCollapsed,
            [styles.light]: menuMode === 'mixin',
            [styles.sideBarHidden]: sideBarHidden && menuMode === 'mixin',
          })}
        >
          {menuMode === 'inline' && (
            <Link to="/">
              <div
                className={cls(styles.logo, {
                  [styles.logoCollapsed]: sideBarCollapsed,
                })}
              >
                <img src={logo} alt="logo" />
                {!sideBarCollapsed && <span className={styles[theme]}>{siteName}</span>}
              </div>
            </Link>
          )}
          {menuMode === 'inline' ? <MenuList /> : <MixinMenuChild />}
        </Sider>
      )}
    </>
  );
};
export default SideBar;
