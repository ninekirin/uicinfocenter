import { apiBaseUrl, siteName } from '@/assets/js/config.js';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import './index.css';

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { isMobile } = useSelector(state => state.SettingModel);

  const onFinish = values => {
    fetch(`${apiBaseUrl}/user/register-old`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: values.username,
        email: values.email,
        password: values.password,
      }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          navigate('/login', { state: { email: values.email } });
        } else {
          message.error(esponse.message);
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
        message.error('An error occurred while registering.');
      });
  };

  return (
    <div className="app">
      <div className="header-placeholder" />
      <div className="form-container" style={isMobile ? { width: '90%' } : { width: '400px' }}>
        <div className="center-text">
          <div className="top-padding">
            <span className="title-span">Register</span>
          </div>
          <div className="sitename-span">{siteName}</div>
        </div>
        <Form form={form} name="normal_register" className="register-form" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'E-Mail is required.' },
              { type: 'email', message: 'The E-Mail is invalid.' },
            ]}
          >
            <Input
              prefix={<MailOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />}
              placeholder="E-Mail"
              allowClear
              autoComplete="off"
              size="large"
            />
          </Form.Item>
          <Form.Item name="username" rules={[{ required: true, message: 'Username is required.' }]}>
            <Input
              prefix={<UserOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />}
              placeholder="Username"
              allowClear
              autoComplete="off"
              size="large"
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Password is required.' }]}>
            <Input.Password
              allowClear
              size="large"
              autoComplete="new-password"
              prefix={<LockOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>
          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              allowClear
              size="large"
              autoComplete="new-password"
              prefix={<LockOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />}
              placeholder="Confirm Password"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="register-form-button"
              style={{ width: '100%' }}
            >
              Register
            </Button>
          </Form.Item>
        </Form>
        <Link to="/login" style={{ display: 'flex', justifyContent: 'center', fontSize: '14px' }}>
          Already have an account? Login
        </Link>
      </div>
      <div className="footer">
        <div className="footer-top" style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: '8px' }}>
          <div className="copyright-span">{siteName}</div>
        </div>
      </div>
    </div>
  );
};

export default Register;
