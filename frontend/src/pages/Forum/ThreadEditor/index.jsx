import { apiBaseUrl } from '@/assets/js/config.js';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CreateThread = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const { isMobile } = useSelector(state => state.SettingModel);
  const [searchParams] = useSearchParams();
  const initialThreadId = searchParams.get('id') || '';
  const [threadId, setThreadId] = useState(initialThreadId);
  const [thread, setThread] = useState({});

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
          form.setFieldsValue(response.data);
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

  const onFinish = values => {
    const method = threadId ? 'PUT' : 'POST';
    const endpoint = `${apiBaseUrl}/forum/thread`;

    fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(values),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Thread saved successfully!');
          navigate('/forum/list');
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
        message.error('Error saving thread.');
      });
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    }
    if (initialThreadId) {
      getThread(initialThreadId);
    }
  }, [initialThreadId]);

  return (
    <Card
      title={threadId ? 'Edit Thread' : 'Create Thread'}
      style={{ width: '100%' }}
      styles={{ header: { fontSize: '20px' } }}
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          {!isMobile && 'Back'}
          <ArrowLeftOutlined />
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Form
          form={form}
          name="create_or_edit_thread"
          onFinish={onFinish}
          initialValues={thread}
          layout="vertical"
        >
          {threadId && (
            <Col span={24}>
              <Form.Item name="id" label="Thread ID" initialValue={threadId}>
                <Input size="large" placeholder="Thread ID" disabled />
              </Form.Item>
            </Col>
          )}
          <Col span={24}>
            <Form.Item
              name="thread_subject"
              label="Thread Subject"
              rules={[{ required: true, message: 'Please input thread subject!' }]}
            >
              <Input placeholder="Enter the thread subject" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="thread_text"
              label="Thread Text"
              rules={[{ required: true, message: 'Please input thread text!' }]}
            >
              <Input.TextArea
                showCount
                maxLength={65535}
                style={{ height: '100px' }}
                placeholder="Enter the thread text"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="thread_category"
              label="Thread Category"
              rules={[{ required: true, message: 'Please input thread category!' }]}
            >
              <Input placeholder="Enter the thread category" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                Save Thread
              </Button>
            </Form.Item>
          </Col>
        </Form>
      </Space>
    </Card>
  );
};

export default CreateThread;
