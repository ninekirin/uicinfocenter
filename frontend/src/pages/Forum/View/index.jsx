import { apiBaseUrl } from '@/assets/js/config.js';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Divider,
  Input,
  Modal,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkCold } from 'react-syntax-highlighter/dist/esm/styles/prism';
import gfm from 'remark-gfm';

const { Search } = Input;
const { confirm } = Modal;

const ThreadDetail = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isEditingThread, setIsEditingThread] = useState(false);
  const userToken = localStorage.getItem('userToken');
  const { isMobile } = useSelector(state => state.SettingModel);

  const code = ({ node, inline, className, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter style={coldarkCold} language={match[1]} PreTag="div" {...props}>
        {props.children}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {props.children}
      </code>
    );
  };

  const thread_id = searchParams.get('id');

  const [thread, setThread] = useState({
    id: '',
    thread_subject: '',
    thread_text: '',
    thread_category: '',
    username: '',
  });
  const [replies, setReplies] = useState([]);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const replyColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: text => `#${text}`,
    },
    {
      title: 'OP',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Reply Text',
      dataIndex: 'reply_text',
      key: 'reply_text',
      render: text => (
        <Markdown
          remarkPlugins={[gfm]}
          components={{
            img(props) {
              return <img {...props} style={{ maxWidth: '100%' }} />;
            },
            code: code,
          }}
        >
          {text}
        </Markdown>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space>
          <Tooltip title="Edit Reply">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => navigate(`/forum/reply-editor?id=${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Delete Reply">
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getThread = id => {
    fetch(`${apiBaseUrl}/forum/thread?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setThread(response.data);
          getReplies({ current: 1, pageSize: 10, thread_id: id });
        } else {
          if (['NO_TOKEN', 'INVALID_TOKEN', 'EXPIRED_TOKEN'].includes(response.code)) {
            localStorage.removeItem('userToken');
            navigate('/login', {
              state: { navBackMsg: 'Your session has timed out. Please log in again.' },
            });
          } else {
            message.error(response.message);
          }
        }
      })
      .catch(error => {
        message.error('Error getting thread.');
      });
  };

  const editThread = thread => {
    fetch(`${apiBaseUrl}/forum/thread`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(thread),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Thread updated successfully!');
          setThread(response.data);
        } else {
          if (['NO_TOKEN', 'INVALID_TOKEN', 'EXPIRED_TOKEN'].includes(response.code)) {
            localStorage.removeItem('userToken');
            navigate('/login', {
              state: { navBackMsg: 'Your session has timed out. Please log in again.' },
            });
          } else {
            message.error(response.message);
          }
        }
      })
      .catch(error => {
        message.error('Error updating thread.');
      })
      .finally(() => {
        setIsEditingThread(false);
      });
  };

  const deleteReply = id => {
    fetch(`${apiBaseUrl}/forum/reply`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({ id: id }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Reply deleted successfully!');
          getReplies({ ...tableParams.pagination, thread_id: thread_id });
        }
      })
      .catch(error => {
        message.error('Error deleting reply.');
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this reply?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteReply(id);
      },
    });
  };

  const getReplies = params => {
    setLoading(true);
    const query = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    fetch(`${apiBaseUrl}/forum/replies?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setReplies(response.data.replies);
          setTableParams(prev => ({
            ...prev,
            pagination: {
              current: response.data.pagination.current,
              pageSize: response.data.pagination.pageSize,
              total: response.data.pagination.total,
            },
          }));
        } else {
          if (['NO_TOKEN', 'INVALID_TOKEN', 'EXPIRED_TOKEN'].includes(response.code)) {
            localStorage.removeItem('userToken');
            navigate('/login', {
              state: { navBackMsg: 'Your session has timed out. Please log in again.' },
            });
          } else {
            message.error(response.message);
          }
        }
        setLoading(false);
      })
      .catch(error => {
        message.error('Error fetching replies.');
      });
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    }
    if (thread_id) {
      getThread(thread_id);
    }
  }, [navigate, thread_id]);

  if (!thread_id) {
    return (
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card
          title="Thread Detail"
          styles={{ header: { fontSize: '20px' } }}
          extra={
            <Button type="primary" onClick={() => navigate(-1)}>
              {!isMobile && 'Back'}
              <ArrowLeftOutlined />
            </Button>
          }
        >
          You have not selected any thread. Please navigate to a thread by its ID.
          <Divider />
          <Search
            placeholder="Enter Thread ID"
            allowClear
            enterButton="Go"
            size="large"
            type="number"
            onSearch={value => {
              if (value) {
                getThread(value);
                setSearchParams({ id: value });
              }
            }}
          />
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card
        title="Thread Detail"
        styles={{ header: { fontSize: '20px' } }}
        extra={
          <Space>
            {JSON.parse(localStorage.getItem('user')).user_type == 'ADMIN' && (
              <Button
                type="primary"
                onClick={() => {
                  setIsEditingThread(!isEditingThread);
                  if (isEditingThread) {
                    editThread(thread);
                  }
                }}
              >
                {!isMobile && (isEditingThread ? 'Save' : 'Edit')}
                {isEditingThread ? <SaveOutlined /> : <EditOutlined />}
              </Button>
            )}
            <Button type="primary" onClick={() => navigate(-1)}>
              {!isMobile && 'Back'}
              <ArrowLeftOutlined />
            </Button>
          </Space>
        }
      >
        <Typography.Title level={3}>{thread.thread_subject}</Typography.Title>
        <Typography.Paragraph>
          <Typography.Text strong>Posted by:</Typography.Text> {thread.username}
        </Typography.Paragraph>

        {isEditingThread ? (
          <Input.TextArea
            showCount
            maxLength={65535}
            style={{ height: '200px' }}
            value={thread.thread_text}
            onChange={e => setThread({ ...thread, thread_text: e.target.value })}
          />
        ) : (
          <Typography.Paragraph>
            <Markdown
              remarkPlugins={[gfm]}
              components={{
                img(props) {
                  return <img {...props} style={{ maxWidth: '100%' }} />;
                },
                code: code,
              }}
            >
              {thread.thread_text}
            </Markdown>
          </Typography.Paragraph>
        )}
      </Card>
      <Card
        title="Replies to this thread"
        styles={{ header: { fontSize: '20px' } }}
        extra={
          <Button
            type="primary"
            onClick={() => navigate(`/forum/reply-editor?thread_id=${thread_id}`)}
          >
            {!isMobile && 'Create Reply'}
            <PlusOutlined />
          </Button>
        }
      >
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Table
            columns={replyColumns}
            dataSource={replies}
            pagination={tableParams.pagination}
            loading={loading}
            onChange={pagination => getReplies({ ...pagination, searchText })}
            fixedHeader={true}
            style={{ overflowX: 'auto' }}
            scroll={{ x: 'max-content' }}
            size="small"
            bordered
          />
        </Space>
      </Card>
    </Space>
  );
};

export default ThreadDetail;
