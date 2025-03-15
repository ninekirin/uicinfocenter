import { apiBaseUrl, siteName } from '@/assets/js/config.js';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './index.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const { email, navBackMsg } = location.state || '';
  const { isMobile } = useSelector(state => state.SettingModel);

  useEffect(() => {
    if (email) {
      form.setFieldsValue({
        email: email,
      });
    }
  }, [email]);

  useEffect(() => {
    if (navBackMsg) {
      message.info(navBackMsg);
    }
  }, [navBackMsg]);

  const afterLogin = response => {
    if (response.success) {
      message.info(response.message);
      localStorage.setItem('userToken', response.data.userToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = `/${response.data.user.default_entrypoint}`;
    } else {
      message.info(response.message);
    }
  };

  const onFinish = values => {
    fetch(`${apiBaseUrl}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
    })
      .then(res => res.json())
      .then(response => {
        afterLogin(response);
      })
      .catch(error => {
        message.info(error);
      });
  };

  return (
    <div className="app">
      <div className="header-placeholder" />
      <div className="form-container" style={isMobile ? { width: '90%' } : { width: '400px' }}>
        <div className="center-text">
          <div className="top-padding">
            <span className="title-span">Login</span>
          </div>
          <div className="sitename-span">{siteName}</div>
        </div>
        <Form form={form} name="normal_login" className="login-form" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: 'Email is required.',
              },
            ]}
          >
            <Input
              allowClear
              size="large"
              prefix={<UserOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />}
              placeholder="E-Mail"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Password is required.',
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              style={{ width: '100%' }}
              size="large"
            >
              Login
            </Button>
          </Form.Item>
        </Form>
        <Link
          to="/register"
          style={{ display: 'flex', justifyContent: 'center', fontSize: '14px' }}
        >
          Need an account? Register now!
        </Link>
      </div>
      <div className="footer">
        <div className="footer-top" style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: '8px' }} />
        <div className="copyright-span">{siteName}</div>
      </div>
    </div>
  );
};

export default Login;
