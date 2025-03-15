import { apiBaseUrl } from '@/assets/js/config.js';
import { LockOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Form, Input, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const userToken = localStorage.getItem('userToken');
  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
  );

  // Redirect to login if not logged in
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      setUser(JSON.parse(localStorage.getItem('user')));
    }
  }, [navigate]);

  const onFinish = values => {
    fetch(`${apiBaseUrl}/user/${user.id}/password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        old_password: values.old_password,
        new_password: values.new_password,
      }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          form.resetFields();
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
        message.error('An error occurred while changing password.');
      });
  };

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card title="Change Password" size="default" styles={{ header: { fontSize: '20px' } }}>
        <p>
          Password must be at least 8 characters long and contain at least one number, one uppercase
          letter, and one lowercase letter.
        </p>
        <Divider />
        <Form form={form} name="Change Password" onFinish={onFinish} scrollToFirstError>
          <Form.Item
            name="old_password"
            prefix={<LockOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />}
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Please input your old password!',
              },
            ]}
            hasFeedback
          >
            <Input.Password
              type="password"
              prefix={<LockOutlined style={{ color: '#1677ff' }} />}
              placeholder="Enter your old password"
            />
          </Form.Item>
          <Form.Item
            name="new_password"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Please input your new password!',
              },
            ]}
            hasFeedback
          >
            <Input.Password
              type="password"
              prefix={<LockOutlined style={{ color: '#1677ff' }} />}
              placeholder="Enter your new password"
            />
          </Form.Item>
          <Form.Item
            name="new_password_confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Please confirm your password!',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              type="password"
              prefix={<LockOutlined style={{ color: '#1677ff' }} />}
              placeholder="Confirm password"
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};
export default ChangePassword;
