import logo from '@/assets/image/uic_logo.svg';
import { apiBaseUrl } from '@/assets/js/config.js';
import { ProChat } from '@ant-design/pro-chat';
import { Layout, message } from 'antd';
import Typography from 'antd/es/typography/Typography';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const { Header, Content } = Layout;

const ChatShared = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const sharedConversationId = searchParams.get('cid') || '';
  const sharedUserId = searchParams.get('uid') || '';

  const [proChatLoading, setProChatLoading] = useState(false);
  const [proChatData, setProChatData] = useState({ chats: [], config: {} });

  const [errorMessage, setErrorMessage] = useState('');
  const [username, setUsername] = useState('User');

  // 获取会话历史消息的函数
  const getConversation = (conversationId, sharedUserId) => {
    setProChatLoading(true);
    if (conversationId === '') {
      setProChatData({ chats: [], config: {} });
      setProChatLoading(false);
      return;
    }
    fetch(
      `${apiBaseUrl}/dify/shared-messages?conversation_id=${conversationId}&user=${sharedUserId}`,
      {
        method: 'GET',
      }
    )
      .then(res => res.json())
      .then(response => {
        if (response.data) {
          const messages = [];
          response.data.forEach(item => {
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
          setProChatData({ chats: messages });
        } else {
          setErrorMessage(response.message);
          message.error(response.message);
        }
        setProChatLoading(false);
      })
      .catch(error => {
        setErrorMessage('Error getting conversation messages.');
        message.error('Error getting conversation messages.');
        console.log('Error getting conversation messages:', error);
        setProChatLoading(false);
      });
  };

  const getUsername = uuid => {
    fetch(`${apiBaseUrl}/user/${uuid}/username`, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(response => {
        if (response.data.username) {
          setUsername(response.data.username);
        }
      })
      .catch(error => {
        console.log('Error getting username:', error);
      });
  };

  useEffect(() => {
    getConversation(sharedConversationId, sharedUserId);
    getUsername(sharedUserId);
  }, [navigate]);

  return (
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
          <Link
            to="/"
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
          </Link>
        </div>
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
      </Header>
      {/* ProChat 区域 */}
      <Content>
        <ProChat
          loading={proChatLoading}
          helloMessage={errorMessage}
          locale="en-US"
          showTitle
          userMeta={{
            avatar: '🤓',
            title: username,
          }}
          inputAreaRender={() => {
            return (
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
                  background: '#e6f7ff',
                }}
              >
                <Link
                  to="/register"
                  style={{
                    display: 'inline-block',
                    marginLeft: '16px',
                    color: '#1677ff',
                    fontWeight: 500,
                    fontSize: '20px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Try ChatUIC
                </Link>
              </div>
            );
          }}
          chatItemRenderConfig={{
            actionsRender: () => {
              return [];
            },
          }}
          chats={proChatData.chats}
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
          backToBottomConfig={{
            style: {
              position: 'fixed',
              bottom: '60px',
              right: '16px',
            },
          }}
        />
      </Content>
    </Layout>
  );
};

export default ChatShared;
