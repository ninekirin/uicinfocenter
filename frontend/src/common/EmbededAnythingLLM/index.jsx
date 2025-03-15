import React, { useEffect } from 'react';

const EmbededAnythingLLM = () => {
  useEffect(() => {
    const s = document.querySelector('#anythingllm');
    if (s) {
      s.parentNode.removeChild(s);
    }

    const script = document.createElement('script');
    script.id = 'anythingllm';
    script.dataset.embedId = '589398c2-b63a-4f6d-bab6-c79df50abb54';
    script.dataset.baseApiUrl = 'http://home.bakaawt.com:3001/api/embed';
    script.src = 'http://home.bakaawt.com:3001/embed/anythingllm-chat-widget.min.js';
    document.body.appendChild(script);
  }, []); // 空数组作为依赖，表示这个 effect 只在组件挂载和卸载时运行

  return <div className="chat-widget" />;
};

export default EmbededAnythingLLM;
