import { apiBaseUrl } from '@/assets/js/config.js';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Table, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title } = Typography;
const { confirm } = Modal;

const ListForumThreads = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobile } = useSelector(state => state.SettingModel);

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const [threadCategories, setThreadCategories] = useState([
    { category: 'GENERAL', name: 'General' },
    { category: 'BUG', name: 'Bug' },
    { category: 'FEATURE', name: 'Feature' },
    { category: 'QUESTION', name: 'Question' },
    { category: 'ANNOUNCEMENT', name: 'Announcement' },
  ]);

  const columns = [
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
      title: 'Thread',
      children: [
        {
          title: 'Thread Subject',
          dataIndex: 'thread_subject',
          key: 'thread_subject',
          render: text => (text.length > 80 ? `${text.substring(0, 80)}...` : text),
        },
        {
          title: 'Category',
          dataIndex: 'thread_category',
          key: 'thread_category',
          render: category => {
            const found = threadCategories.find(cat => cat.category === category);
            return found ? found.name : category;
          },
        },
      ],
    },
    {
      title: 'Action',
      key: 'operation',
      width: 150,
      render: (text, thread) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/forum/view?id=${thread.id}`)}
            />
          </Tooltip>
          {JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' && (
            <>
              <Tooltip title="Edit">
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/forum/thread-editor?id=${thread.id}`)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => showDeleteConfirm(thread.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleTokenError = code => {
    if (['NO_TOKEN', 'INVALID_TOKEN', 'EXPIRED_TOKEN'].includes(code)) {
      localStorage.removeItem('userToken');
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      message.error('An error occurred.');
    }
  };

  const getThreads = params => {
    setLoading(true);
    const query = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    fetch(`${apiBaseUrl}/forum/threads?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setThreads(response.data.threads);
          setTableParams(prev => ({
            ...prev,
            pagination: {
              current: response.data.pagination.current,
              pageSize: response.data.pagination.pageSize,
              total: response.data.pagination.total,
            },
          }));
        } else {
          handleTokenError(response.code);
        }
        setLoading(false);
      })
      .catch(error => {
        message.error('Error fetching threads.');
      });
  };

  const deleteThread = id => {
    fetch(`${apiBaseUrl}/forum/thread`, {
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
          message.success('Thread deleted successfully!');
          getThreads({ current: 1, pageSize: 10 });
        } else {
          handleTokenError(response.code);
        }
      })
      .catch(error => {
        message.error('Error deleting thread.');
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this thread?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteThread(id);
      },
    });
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      const params = Object.fromEntries(searchParams.entries());
      getThreads(params);
    }
  }, [navigate, userToken]);

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card
        title="List of Threads"
        styles={{ header: { fontSize: '20px' } }}
        extra={
          JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' && (
            <Button type="primary" onClick={() => navigate('/forum/thread-editor')}>
              <PlusOutlined />
              {isMobile ? '' : 'Create a New Thread'}
            </Button>
          )
        }
      >
        <Title level={4} style={{ textAlign: 'center' }}>
          Threads
        </Title>
        <p style={{ textAlign: 'center' }}>
          {/* Showing {tableParams.pagination?.current} to {tableParams.pagination?.pageSize} of{' '}
          {tableParams.pagination?.total} entries */}
        </p>
        <Table
          columns={columns}
          dataSource={threads}
          rowKey="id"
          pagination={tableParams.pagination}
          loading={loading}
          style={{ overflowX: 'auto' }}
          scroll={{ x: 'max-content' }}
          size="small"
          bordered
          onChange={pagination => {
            setTableParams(prev => ({ ...prev, pagination }));
            const newParams = {
              ...Object.fromEntries(searchParams.entries()),
              current: pagination.current,
              pageSize: pagination.pageSize,
            };
            setSearchParams(newParams);
            getThreads(newParams);
          }}
        />
      </Card>
    </Space>
  );
};

export default ListForumThreads;
