import { CheckOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { Drawer, Switch, Tooltip } from 'antd';
import cls from 'classnames';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './index.less';
const SettingMenu = () => {
  const [settingVisible, setSettingVisible] = useState(false);
  const dispatch = useDispatch();
  const { theme, menuMode, menuEnable } = useSelector(state => state.SettingModel);
  useEffect(() => {
    setSettingVisible(false);
  }, []);
  return (
    <>
      <div
        className={cls(styles.setting, { [styles.close]: !settingVisible })}
        onClick={() => setSettingVisible(val => !val)}
      >
        {settingVisible ? <CloseOutlined /> : <SettingOutlined />}
      </div>
      <Drawer
        closable={false}
        open={settingVisible}
        onClose={() => setSettingVisible(false)}
        width={300}
        className={styles.container}
      >
        <div className={cls(styles.item, styles.vertical)}>
          <p className={styles.itemtitle}>Menu</p>
          <Switch
            defaultChecked={menuEnable}
            onChange={v => {
              dispatch({ type: 'setMenuMode', data: 'inline' });
              dispatch({ type: 'setMenuEnable', data: v });
            }}
          />
        </div>
        <div className={cls(styles.item, styles.vertical)}>
          <p className={styles.itemtitle}>Menu Style</p>
          <div style={{ display: 'flex' }}>
            <Tooltip title="Dark">
              <div
                className={styles.dark}
                onClick={() => {
                  dispatch({ type: 'setTheme', data: 'dark' });
                }}
              >
                {theme === 'dark' && <CheckOutlined />}
              </div>
            </Tooltip>
            <Tooltip title="Light">
              <div
                className={styles.light}
                onClick={() => dispatch({ type: 'setTheme', data: 'light' })}
              >
                {theme === 'light' && <CheckOutlined />}
              </div>
            </Tooltip>
          </div>
        </div>
        <div className={cls(styles.item, styles.vertical)}>
          <p className={styles.itemtitle}>Menu Layout</p>
          <div style={{ display: 'flex' }}>
            <Tooltip title="Horizontal">
              <div
                className={styles.inline}
                onClick={() => dispatch({ type: 'setMenuMode', data: 'inline' })}
              >
                {menuMode === 'inline' && <CheckOutlined />}
              </div>
            </Tooltip>

            <Tooltip title="Vertical">
              <div
                className={styles.horizontal}
                onClick={() => dispatch({ type: 'setMenuMode', data: 'horizontal' })}
              >
                {menuMode === 'horizontal' && <CheckOutlined />}
              </div>
            </Tooltip>

            <Tooltip title="Mixin">
              <div
                className={styles.mixin}
                onClick={() => {
                  dispatch({ type: 'setMenuMode', data: 'mixin' });
                }}
              >
                {menuMode === 'mixin' && <CheckOutlined />}
              </div>
            </Tooltip>
          </div>
        </div>
        {/* <div className={cls(styles.flex, styles.horizontal)}>
          <div>Pin Menu</div>
          <Switch defaultChecked onChange={v => dispatch({ type: 'setFixHeader', data: v })} />
        </div> */}
        <div className={cls(styles.item, styles.flex)} />
      </Drawer>
    </>
  );
};
export default SettingMenu;
