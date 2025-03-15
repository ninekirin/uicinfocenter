import { apiBaseUrl } from '@/assets/js/config.js';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ReplyEditor = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const { isMobile } = useSelector(state => state.SettingModel);
  const [searchParams] = useSearchParams();

  const initialReplyId = searchParams.get('id') || '';
  const initialThreadId = searchParams.get('thread_id') || '';
  const [replyId, setReplyId] = useState(initialReplyId);
  const [threadId, setThreadId] = useState(initialThreadId);
  const [reply, setReply] = useState({});

  const getReply = id => {
    fetch(`${apiBaseUrl}/forum/reply?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setReply(response.data);
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
        message.error('Error getting reply.');
      });
  };

  const onFinish = values => {
    const method = replyId ? 'PUT' : 'POST';
    const endpoint = `${apiBaseUrl}/forum/reply`;

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
          message.success('Reply saved successfully!');
          navigate(`/forum/view?id=${threadId}`);
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
        message.error('Error saving reply.');
      });
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    }
    if (initialReplyId) {
      getReply(initialReplyId);
    }
    if (initialThreadId) {
      setThreadId(initialThreadId);
    }
  }, [initialReplyId, initialThreadId]);

  return (
    <Card
      title={replyId ? 'Edit Reply' : 'Create Reply'}
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
          name="create_or_edit_reply"
          onFinish={onFinish}
          initialValues={reply}
          layout="vertical"
        >
          {replyId && (
            <Col span={24}>
              <Form.Item name="id" label="Reply ID" initialValue={replyId}>
                <Input placeholder="Reply ID" disabled />
              </Form.Item>
            </Col>
          )}
          <Col span={24}>
            <Form.Item name="thread_id" label="Thread ID" initialValue={threadId}>
              <Input placeholder="Thread ID" disabled={!!replyId} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="reply_text"
              label="Reply Text"
              rules={[{ required: true, message: 'Please input reply text!' }]}
            >
              <Input.TextArea
                showCount
                maxLength={65535}
                style={{ height: '100px' }}
                placeholder="Enter your reply"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                Save Reply
              </Button>
            </Form.Item>
          </Col>
        </Form>
      </Space>
    </Card>
  );
};

export default ReplyEditor;
