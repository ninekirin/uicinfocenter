// 从 localStorage 获取 settings，如果不存在则使用默认值
const getInitialSettings = () => {
  const savedSettings = localStorage.getItem('menuSettings');
  const defaultSettings = {
    mixinMenuActivePath: window.location.pathname.split('/').filter(x => x)[0],
    sideBarCollapsed: false,
    isMobile: false,
    theme: 'light',
    themeColor: '#1677ff',
    fixHeader: true,
    // menuEnable: window.innerWidth < 768 ? false : true,
    menuEnable: true,
    menuMode: 'inline',
    sideBarHidden: false,
  };

  // 如果 localStorage 中没有存储的设置，使用默认值并存入 localStorage
  if (!savedSettings) {
    localStorage.setItem('menuSettings', JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  // 解析 localStorage 中的 JSON 值并返回
  try {
    return JSON.parse(savedSettings);
  } catch (error) {
    // 处理解析错误，返回默认值并更新 localStorage
    localStorage.setItem('menuSettings', JSON.stringify(defaultSettings));
    return defaultSettings;
  }
};

// 使用 getInitialSettings 函数获取初始状态
const initState = getInitialSettings();

const updateLocalStorage = newState => {
  localStorage.setItem('menuSettings', JSON.stringify(newState));
};

const SettingModel = (state = initState, { type, data }) => {
  let newState;
  switch (type) {
    case 'setSideBarCollapsed': {
      newState = {
        ...state,
        sideBarCollapsed: data !== undefined ? data : !state.sideBarCollapsed,
        isMobile: data !== undefined ? data : !state.isMobile,
      };
      updateLocalStorage(newState);
      return newState;
    }
    case 'setSideBarHidden': {
      newState = { ...state, sideBarHidden: data };
      updateLocalStorage(newState);
      return newState;
    }
    case 'setTheme': {
      newState = { ...state, theme: data };
      updateLocalStorage(newState);
      return newState;
    }
    case 'setFixHeader': {
      newState = { ...state, fixHeader: data };
      updateLocalStorage(newState);
      return newState;
    }
    case 'setShowSettings': {
      newState = { ...state, showSettings: data };
      updateLocalStorage(newState);
      return newState;
    }
    case 'setMenuEnable': {
      newState = { ...state, menuEnable: data };
      updateLocalStorage(newState);
      return newState;
    }
    case 'setMenuMode': {
      newState = { ...state, menuMode: data };
      updateLocalStorage(newState);
      return newState;
    }
    case 'setThemeColor': {
      newState = { ...state, themeColor: data };
      updateLocalStorage(newState);
      return newState;
    }
    case 'setMixinMenuActivePath': {
      newState = { ...state, mixinMenuActivePath: data };
      updateLocalStorage(newState);
      return newState;
    }
    default: {
      return state;
    }
  }
};

export default SettingModel;
