import logo from '@/assets/image/uic_logo.svg';
import { apiBaseUrl } from '@/assets/js/config.js';
import {
  DeleteOutlined,
  DownOutlined,
  EllipsisOutlined,
  FormOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  ShareAltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ProChat } from '@ant-design/pro-chat';
import {
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Flex,
  Layout,
  Menu,
  message,
  Space,
  Spin,
  theme,
  Typography,
} from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { useToken } = theme;
const { Header, Sider, Content } = Layout;

const Chat = () => {
  const { token } = useToken();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
  );
  const [controller, setController] = useState(null);
  const { isMobile } = useSelector(state => state.SettingModel);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [conversationListLoading, setConversationListLoading] = useState(true);

  const proChatRef = useRef(null);
  const [proChatLoading, setProChatLoading] = useState(false);
  const [proChatData, setProChatData] = useState({ chats: [], config: {} });
  const [currentConversation, setCurrentConversation] = useState({
    conversation_id: '',
    conversation_index: NaN, // 初始化为NaN，避免与会话列表的index冲突
    conversation_name: '',
  });
  const [conversations, setConversations] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  const [hasMore, setHasMore] = useState(false);
  const [lastId, setLastId] = useState(null);

  const getConversations = useCallback(() => {
    fetch(`${apiBaseUrl}/dify/demo/conversations?limit=20`, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(response => {
        if (response.data) {
          setConversations(response.data);
          setHasMore(response.has_more);
          if (response.data.length > 0) {
            setLastId(response.data[response.data.length - 1].id);
          }
          // 使用 useState 回调函数来确保访问最新的 currentConversation
          setCurrentConversation(prevState => {
            if (prevState.conversation_id) {
              console.log('Detected conversation id on prevState:', prevState);
              const updatedConversation = response.data.find(
                item => item.id === prevState.conversation_id
              );
              if (updatedConversation) {
                return {
                  ...prevState,
                  // update current conversation name
                  conversation_name: updatedConversation.name,
                  // update current conversation index
                  conversation_index: response.data.findIndex(
                    item => item.id === prevState.conversation_id
                  ),
                };
              }
            }
            return prevState;
          });
        } else {
          message.error('Something went wrong. Please try again later.');
        }
        setConversationListLoading(false);
      })
      .catch(error => {
        message.error('Error getting conversations.');
      });
  });

  const getMoreConversations = () => {
    fetch(`${apiBaseUrl}/dify/demo/conversations?limit=20${lastId ? `&last_id=${lastId}` : ''}`, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(response => {
        if (response.data) {
          setConversations(prev => [...prev, ...response.data]);
          setHasMore(response.has_more);
          if (response.data.length > 0) {
            setLastId(response.data[response.data.length - 1].id);
          }
        } else {
          handleTokenError(response.code);
        }
        setConversationListLoading(false);
      })
      .catch(error => {
        message.error('Error getting more conversations.');
      });
  };

  const deleteConversation = conversationId => {
    fetch(`${apiBaseUrl}/dify/demo/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.result === 'success') {
          setConversations(prev => prev.filter(item => item.id !== conversationId));
          if (conversationId === currentConversation.conversation_id) {
            setCurrentConversation({
              conversation_id: '',
              conversation_index: NaN,
              conversation_name: '',
            });
            setProChatData({ chats: [], config: {} });
          }
          message.success('Conversation deleted successfully');
        } else {
          handleTokenError(response.code);
        }
      })
      .catch(error => {
        message.error('Error deleting conversation.');
      });
  };

  // 获取会话历史消息的函数
  const fetchConversationMessages = conversationId => {
    if (controller) controller.abort(); // 中断上一个请求
    const newController = new AbortController();
    setController(newController);

    setProChatLoading(true);
    if (conversationId === '') {
      setProChatData({ chats: [], config: {} });
      setProChatLoading(false);
      return;
    }
    fetch(`${apiBaseUrl}/dify/demo/messages?conversation_id=${conversationId}`, {
      method: 'GET',
      signal: newController.signal,
    })
      .then(res => res.json())
      .then(response => {
        if (response.data) {
          const messages = [];
          response.data.forEach(item => {
            // dify >= 1.0.0
            // response.data.reverse().forEach(item => { // dify <= 0.15.3
            messages.push({
              content: item.query,
              createAt: new Date(item.created_at).getTime() * 1000,
              id: `${item.id}`,
              role: 'user',
              updateAt: new Date(item.updated_at).getTime() * 1000,
              extra: item.extra || {},
            });
            messages.push({
              content: item.answer,
              createAt: new Date(item.created_at).getTime() * 1000,
              id: `${item.id}_assistant`,
              parentId: item.id,
              role: 'assistant',
              updateAt: new Date(item.updated_at).getTime() * 1000,
              model: item.model || 'unknown',
            });
          });
          console.log('fetchConversationMessages:', conversationId, messages);
          // 更新 ProChat 的消息
          console.log('Updating ProChat data...');
          setProChatData(prevState => ({
            ...prevState,
            chats: messages,
          }));
        } else {
          message.error(response.message);
          handleTokenError(response.code);
        }
        setProChatLoading(false);
      })
      .catch(error => {
        if (error.name === 'AbortError') {
          console.log('Request aborted.');
          return;
        }
        message.error('Error getting conversation messages.');
        console.log('Error getting conversation messages:', error);
        setProChatLoading(false);
      });
  };

  const getSuggestedQuestions = useCallback(message_id => {
    if (message_id === '') return;
    fetch(`${apiBaseUrl}/dify/demo/messages/${message_id}/suggested`, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(response => {
        if (response.data) {
          console.log('Suggested questions:', response.data);
          setSuggestedQuestions(response.data);
        } else {
          handleTokenError(response.code);
        }
      })
      .catch(error => {
        message.error('Error getting suggested questions.');
      });
  }, []);

  // 处理点击会话的事件
  const handleConversationClick = conversationId => {
    console.log('Conversation clicked:', conversationId);
    if (isMobile) setDrawerOpen(false); // 移动端点击后关闭抽屉
    if (conversationId !== currentConversation.conversation_id) {
      setCurrentConversation({
        conversation_id: conversationId,
        conversation_index: conversations.findIndex(item => item.id === conversationId),
        conversation_name: conversations.find(item => item.id === conversationId).name,
      });
      fetchConversationMessages(conversationId);
      // 更新 URL 的 search params
      console.log('Updating URL search params to:', conversationId);
      const params = Object.fromEntries(searchParams.entries());
      setSearchParams({ ...params, cid: conversationId });
    }
  };

  // 处理新会话的创建
  const handleNewConversation = () => {
    if (controller) controller.abort(); // 中断上一个请求
    const newController = new AbortController();
    setController(newController);

    // 如果当前会话已经是新会话，则不再创建新会话
    console.log('currentConversation:', currentConversation);
    // 会话列表为空的情况，conversations.length === 0
    // conversations 首位不是新会话是另一种需要创建新对话的情况
    console.log('conversations:', conversations);
    if (conversations[0]?.id !== '' || conversations.length === 0) {
      console.log('Creating new conversation...');
      const newConversation = { id: '', name: 'New conversation' };
      setConversations([newConversation, ...conversations]);
    } else {
      // 如果 conversations 首位是新会话，则不再创建新会话
      console.log('New conversation already exists.');
      console.log('proChatData:', proChatData);
    }
    // 选中新会话
    setCurrentConversation({
      conversation_id: '',
      conversation_index: 0,
      conversation_name: 'New conversation',
    });
    // 清空 ProChat 的消息
    setProChatData({ chats: [], config: {} });
    setProChatLoading(false);
    // 清空推荐问题
    setSuggestedQuestions([]);
    // 滚动到顶部
    document.querySelector('.conversation-list-menu').scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    console.log('scrollToTop:', document.querySelector('.conversation-list-menu'));
  };

  const navBarDropdownMenuItems = [
    {
      key: user.user_type === 'ADMIN' ? 'goToHome' : 'goToRegister',
      label:
        user.user_type === 'ADMIN' ? (
          <Space>
            <LogoutOutlined />
            Home
          </Space>
        ) : (
          <Space>
            <LogoutOutlined />
            Register Now!
          </Space>
        ),
      onClick: () => {
        if (user.user_type === 'ADMIN') {
          navigate('/home');
        } else {
          navigate('/register');
        }
      },
    },
  ];

  const conversationDropdownMenuItems = useCallback(conversationId => {
    const items = [];

    if (conversationId !== '') {
      items.push({
        key: 'share',
        label: (
          <Space>
            <ShareAltOutlined />
            Share
          </Space>
        ),
        onClick: e => {
          e.domEvent.stopPropagation();
          const shareUrl = `${window.location.origin}/chat-demo?cid=${conversationId}`;
          if (window.isSecureContext) {
            // This feature is available only in secure contexts (HTTPS), in some or all supporting browsers.
            navigator.clipboard.writeText(shareUrl);
            message.success('Share link copied to clipboard.');
          } else {
            message.error('Clipboard access is only available in secure contexts (HTTPS).');
          }
        },
      });
    }

    if (user.user_type === 'ADMIN') {
      items.push({
        key: 'delete',
        label: (
          <Space>
            <DeleteOutlined />
            Delete
          </Space>
        ),
        onClick: e => {
          e.domEvent.stopPropagation();
          deleteConversation(conversationId);
        },
      });
    }

    return items;
  }, []);

  useEffect(() => {
    // If the user is already logged in, redirect to the chat page
    if (user.user_type && user.user_type !== 'ADMIN') {
      message.info('User is already logged in. Redirecting to chat page...');
      navigate('/chat');
      return;
    }
    getConversations();
    const params = Object.fromEntries(searchParams.entries());
    if (params.cid) {
      console.log('URL search params:', params);
      setCurrentConversation({
        conversation_id: params.cid,
        conversation_index: NaN,
        conversation_name: '',
      });
      fetchConversationMessages(params.cid);
    }
  }, [navigate]);

  return (
    <Layout style={{ height: '100vh', height: '100dvh' }}>
      {isMobile ? (
        <Drawer // 移动端抽屉
          title="Select Chat"
          placement="left"
          closable={false}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          styles={{ body: { padding: '0px' } }}
          width={300}
          extra={
            <Space>
              <Button
                type="primary"
                shape="default"
                size="large"
                icon={<FormOutlined />}
                // style={{ width: '100%' }}
                onClick={handleNewConversation}
              >
                New Chat
              </Button>
            </Space>
          }
        >
          {/* 移动端聊天列表 */}
          <Spin
            spinning={conversationListLoading}
            style={{
              width: '100%',
              height: 'calc(100vh - 150px)',
              height: 'calc(100dvh - 150px)',
            }}
          >
            <Menu
              className="conversation-list-menu"
              mode="inline"
              disabled={conversationListLoading}
              selectedKeys={[String(currentConversation.conversation_index + 1)]}
              style={{
                height: isMobile ? 'calc(100vh - 73px)' : 'calc(100vh - 146px)',
                height: isMobile ? 'calc(100dvh - 73px)' : 'calc(100dvh - 146px)',
                overflowY: 'auto',
              }} // 设置高度，使抽屉内的菜单可滚动
              items={[
                ...conversations.map((item, index) => ({
                  key: String(index + 1),
                  icon: <MessageOutlined />,
                  onClick: e => {
                    e.domEvent.stopPropagation();
                    handleConversationClick(item.id);
                  },
                  label: (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      title={item.name}
                    >
                      <span
                        style={{
                          maxWidth: 'calc(100% - 24px)',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </span>
                      {currentConversation.conversation_id === item.id && (
                        <Dropdown
                          menu={{
                            items: conversationDropdownMenuItems(item.id),
                          }}
                          trigger={['click']}
                        >
                          <Button
                            type="text"
                            shape="circle"
                            icon={
                              <EllipsisOutlined
                                style={{ fontSize: '20px', color: token.colorPrimary }}
                              />
                            }
                            onClick={e => e.stopPropagation()}
                          />
                        </Dropdown>
                      )}
                    </div>
                  ),
                })),
                hasMore && {
                  key: 'load-more',
                  icon: <DownOutlined style={{ color: '#1677ff' }} />,
                  onClick: e => {
                    e.domEvent.stopPropagation();
                    setConversationListLoading(true);
                    getMoreConversations();
                  },
                  label: (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'left',
                        alignItems: 'left',
                        color: '#1677ff',
                      }}
                    >
                      Click to Load More
                    </div>
                  ),
                },
              ]}
            />
          </Spin>
        </Drawer>
      ) : (
        <Sider // 桌面端侧边栏
          collapsible
          collapsed={sideBarCollapsed}
          onCollapse={setSideBarCollapsed}
          width={300}
          collapsedWidth={48}
          theme="light"
        >
          {/* Logo及标题 */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', // 添加此行以使元素居中
              width: '100%',
              height: '48px',
              padding: '12px',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            <img
              src={logo}
              alt="logo"
              style={{ width: '32px', height: '32px', borderRadius: '4px' }}
            />
            {!sideBarCollapsed && (
              <span
                style={{
                  display: 'inline-block',
                  marginLeft: '16px',
                  color: '#1677ff',
                  fontWeight: 500,
                  fontSize: '20px',
                  whiteSpace: 'nowrap',
                }}
              >
                ChatUIC
              </span>
            )}
          </div>
          {/* 按钮区域 */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              padding: '5px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              type="primary"
              shape="default"
              size="large"
              icon={<FormOutlined />}
              style={{ width: '100%' }}
              onClick={handleNewConversation}
            >
              {sideBarCollapsed ? '' : 'New Chat'}
            </Button>
          </div>
          {/* 桌面端聊天列表 */}
          <Spin
            spinning={conversationListLoading}
            style={{
              width: '100%',
              height: 'calc(100vh - 150px)',
              height: 'calc(100dvh - 150px)',
            }}
          >
            <Menu
              className="conversation-list-menu"
              mode="inline"
              disabled={conversationListLoading}
              selectedKeys={[String(currentConversation.conversation_index + 1)]}
              style={{
                height: isMobile ? 'calc(100vh - 73px)' : 'calc(100vh - 146px)',
                height: isMobile ? 'calc(100dvh - 73px)' : 'calc(100dvh - 146px)',
                overflowY: sideBarCollapsed ? 'hidden' : 'auto',
              }} // 设置高度，使抽屉内的菜单可滚动
              items={[
                ...conversations.map((item, index) => ({
                  key: String(index + 1),
                  icon: <MessageOutlined />,
                  onClick: e => {
                    e.domEvent.stopPropagation();
                    handleConversationClick(item.id);
                  },
                  label: (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      title={item.name}
                    >
                      <span
                        style={{
                          maxWidth: 'calc(100% - 24px)',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </span>
                      {currentConversation.conversation_id === item.id && (
                        <Dropdown
                          menu={{
                            items: conversationDropdownMenuItems(item.id),
                          }}
                          trigger={['click']}
                        >
                          <Button
                            type="text"
                            shape="circle"
                            icon={
                              <EllipsisOutlined
                                style={{ fontSize: '20px', color: token.colorPrimary }}
                              />
                            }
                            onClick={e => e.stopPropagation()}
                          />
                        </Dropdown>
                      )}
                    </div>
                  ),
                })),
                hasMore && {
                  key: 'load-more',
                  icon: <DownOutlined style={{ color: '#1677ff' }} />,
                  onClick: e => {
                    e.domEvent.stopPropagation();
                    setConversationListLoading(true);
                    getMoreConversations();
                  },
                  label: (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'left',
                        alignItems: 'left',
                        color: '#1677ff',
                      }}
                    >
                      Click to Load More
                    </div>
                  ),
                },
              ]}
            />
          </Spin>
        </Sider>
      )}
      <Layout style={{ height: '100vh', height: '100dvh' }}>
        {/* 头部区域 */}
        <Header
          style={{
            height: '48px',
            lineHeight: '48px',
            padding: '0',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button
            type="text"
            icon={
              isMobile ? (
                drawerOpen ? (
                  <MenuFoldOutlined />
                ) : (
                  <MenuUnfoldOutlined />
                )
              ) : sideBarCollapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            style={{ marginLeft: '12px' }}
            onClick={() =>
              isMobile ? setDrawerOpen(!drawerOpen) : setSideBarCollapsed(!sideBarCollapsed)
            }
          />
          {/* <Button
            type="default"
            shape="default"
            size="small"
            onClick={() => {
              console.log('getProChatData:', proChatData);
            }}
          >
            getProChatData
          </Button> */}
          <Typography.Title
            level={5}
            style={{
              margin: '0 12px',
              flex: 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {currentConversation.conversation_name || 'New conversation'}
          </Typography.Title>
          <Dropdown
            menu={{
              items: navBarDropdownMenuItems,
            }}
          >
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
              <Space style={{ marginRight: '12px' }}>
                <UserOutlined />
                {user.user_type === 'ADMIN' ? user.username : 'Demo User'}
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </Header>
        {/* ProChat 区域 */}
        <Content>
          <ProChat
            loading={proChatLoading}
            helloMessage="Welcome to ChatUIC, I'm your personal assistant. Where should we start?"
            locale="en-US"
            showTitle
            userMeta={{
              avatar: '🤓',
              title: 'UICer',
            }}
            chatRef={proChatRef}
            chats={proChatData.chats}
            onChatsChange={chats => {
              setProChatData(prevState => ({
                ...prevState,
                chats,
              }));
            }}
            assistantMeta={{ avatar: logo, title: 'ChatUIC' }}
            messageItemExtraRender={item => {
              if (item.role === 'assistant') {
                return (
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    ChatUIC can make mistakes. Check important info.
                  </Typography.Text>
                );
              }
              return null;
            }}
            actions={{
              render: () => {
                return [
                  <ConfigProvider
                    key={'suggested-questions-config-provider'}
                    theme={{
                      token: {
                        colorBorder: 'rgba(0, 0, 0, 0.25)',
                        colorPrimaryHover: '#4096ff',
                        colorText: 'rgba(0, 0, 0, 0.88)',
                      },
                    }}
                  >
                    <Flex wrap key="suggested-questions" style={{ minHeight: '32px' }}>
                      {suggestedQuestions.map((question, index) => (
                        <Button
                          key={`suggested-question-${index}`}
                          type="dashed"
                          style={{ margin: '0 8px 8px 8px' }}
                          onClick={() => {
                            proChatRef.current.sendMessage(question);
                            setSuggestedQuestions([]);
                          }}
                        >
                          {question}
                        </Button>
                      ))}
                    </Flex>
                  </ConfigProvider>,
                ];
              },
              flexConfig: {
                gap: 24,
                direction: 'horizontal',
                // justify: 'center',
              },
            }}
            onChatEnd={(id, type) => {
              const messages = proChatRef.current.getChatMessages();
              if (messages[messages.length - 1].role === 'assistant') {
                const lastUserMessage = messages[messages.length - 2];
                // 获取推荐问题
                getSuggestedQuestions(lastUserMessage.id);
                // 重新获取会话列表
                getConversations();
                // 有bug，会打断输出
                // console.log(
                //   `Reset original assistant message_id ${id} to ${lastUserMessage.id}_assistant`
                // );
                // proChatRef.current.setMessageValue(id, 'parentId', lastUserMessage.id);
                // proChatRef.current.setMessageValue(id, 'id', `${lastUserMessage.id}_assistant`);
              }
            }}
            request={async messages => {
              if (
                currentConversation.conversation_id === '' &&
                (conversations[0]?.id !== '' || conversations.length === 0)
              ) {
                console.log('Creating new conversation...');
                const newConversation = { id: '', name: 'New conversation' };
                setConversations([newConversation, ...conversations]);
                // 选中新会话
                setCurrentConversation({
                  conversation_id: '',
                  conversation_index: 0,
                  conversation_name: 'New conversation',
                });
              }
              const query = messages[messages.length - 1].content;
              const payload = {
                inputs: {},
                query,
                response_mode: 'streaming',
                conversation_id: currentConversation.conversation_id,
              };

              if (!payload.conversation_id) {
                delete payload.conversation_id;
              }

              try {
                const response = await fetch(`${apiBaseUrl}/dify/demo/chat-messages`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error('Failed to fetch response from the Dify API');

                const reader = response.body?.getReader();
                const decoder = new TextDecoder('utf-8');
                const encoder = new TextEncoder();
                let buffer = '';
                let bufferObj = {};
                // 将 isFirstMessage 移到这里
                let isFirstMessage = true;

                const readableStream = new ReadableStream({
                  async start(controller) {
                    async function push() {
                      try {
                        const { done, value } = await reader.read();
                        if (done) {
                          controller.close();
                          return;
                        }
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        try {
                          lines.forEach(message => {
                            if (message.startsWith('data: ')) {
                              try {
                                bufferObj = JSON.parse(message.substring(6));
                              } catch (e) {
                                return;
                              }
                              // 处理错误消息
                              if (bufferObj.status === 400 || !bufferObj.event) {
                                console.log('Error:', bufferObj);
                                controller.enqueue(encoder.encode(bufferObj.message));
                                controller.close();
                                return;
                              }
                              // 检查是否是第一条消息并更新conversation_id
                              if (isFirstMessage) {
                                if (
                                  bufferObj.conversation_id &&
                                  bufferObj.conversation_id !== currentConversation.conversation_id
                                ) {
                                  // 条件：有conversation_id且不等于当前会话的conversation_id
                                  console.log(
                                    `Set conversation_id to ${bufferObj.conversation_id}`
                                  );
                                  setCurrentConversation(prevState => ({
                                    ...prevState,
                                    conversation_id: bufferObj.conversation_id,
                                  }));
                                }
                                console.log(
                                  `Reset original message_id ${
                                    messages[messages.length - 1].id
                                  } to ${bufferObj.message_id}`
                                );
                                proChatRef.current.setMessageValue(
                                  messages[messages.length - 1].id,
                                  'id',
                                  bufferObj.message_id
                                );
                                // 设置为false,表示已经不是第一条消息了
                                isFirstMessage = false;
                              }

                              if (
                                bufferObj.event === 'message' ||
                                bufferObj.event === 'agent_message'
                              ) {
                                controller.enqueue(encoder.encode(bufferObj.answer));
                              }
                            }
                          });
                          buffer = lines[lines.length - 1];
                        } catch (e) {
                          controller.error(e);
                          return;
                        }
                        push();
                      } catch (err) {
                        controller.error(err);
                      }
                    }
                    push();
                  },
                });

                return {
                  content: new Response(readableStream, {
                    headers: { 'Content-Type': 'application/json' },
                  }),
                };
              } catch (error) {
                return new Response('Sorry, something went wrong while processing your request.');
              }
            }}
          />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Chat;
