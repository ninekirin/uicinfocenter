// @hooks/common.js
import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

export const useMenu = () => {
  const location = useLocation();

  Array.prototype.getDefaultKeys = function () {
    let pre = '';
    return this.map((x, i, arr) => {
      pre += `/${x}`;
      return !arr[i - 1] ? `/${x}` : `${pre}`;
    });
  };

  const defaultKeys = useMemo(() => {
    return (
      location.pathname
        .split('/')
        .filter(x => x)
        .getDefaultKeys() || []
    );
  }, [location]);

  return defaultKeys;
};
