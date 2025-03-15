import { apiBaseUrl, siteName } from '@/assets/js/config.js';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Result, message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './index.css';

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [stage, setStage] = useState(1); // Stage 1: Email Verification, Stage 2: Back to Login Page, Stage 3: Complete Registration
  const [loading, setLoading] = useState(false);
  const [stage2_status, setStage2Status] = useState({
    code: 'email_sent',
    status: 'success',
    title: 'Email Sent',
    subTitle: 'Please check your email for the verification link.',
    buttonText: 'Back to Registration Page',
  });

  const { isMobile } = useSelector(state => state.SettingModel);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const vCode = searchParams.get('code');
    if (vCode) {
      fetch(`${apiBaseUrl}/user/vcode-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vCode: vCode }),
      })
        .then(response => response.json())
        .then(response => {
          if (response.success) {
            setStage(3);
            form.setFieldsValue({ email: response.data.email });
          } else {
            setStage(2);
            setStage2Status({
              code: 'verification_failed',
              status: 'warning',
              title: 'Verification Failed',
              subTitle: response.message,
              buttonText: 'Back to Registration Page',
            });
          }
        })
        .catch(() => {
          setStage(2);
          setStage2Status({
            code: 'verification_failed',
            status: 'warning',
            title: 'Verification Failed',
            subTitle: 'The verification code is invalid or expired.',
            buttonText: 'Back to Registration Page',
          });
        });
    }
  }, [form, searchParams]);

  const requestVerificationEmail = values => {
    setLoading(true);
    fetch(`${apiBaseUrl}/user/email-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: values.email }),
    })
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          setLoading(false);
          setStage(2);
          message.success(response.message);
        } else {
          setLoading(false);
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
        setLoading(false);
        message.error('Failed to send verification email.');
      });
  };

  const registerUser = values => {
    setLoading(true);
    const vCode = searchParams.get('code');
    fetch(`${apiBaseUrl}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vCode: vCode,
        username: values.username,
        password: values.password,
      }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setLoading(false);
          setStage(2);
          setStage2Status({
            code: 'registration_success',
            status: 'success',
            title: 'Successfully Registered',
            subTitle: response.message,
            buttonText: 'Back to Login Page',
          });
          message.success(response.message);
          // navigate('/login', { state: { email: values.email } });
        } else {
          setLoading(false);
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
        setLoading(false);
        message.error('An error occurred while registering.');
      });
  };

  const onFinish = values => {
    if (stage === 1) {
      requestVerificationEmail(values);
    } else if (stage === 2) {
      if (stage2_status.code === 'email_sent') {
        setStage(1);
      } else if (stage2_status.code === 'verification_failed') {
        // clear the verification code
        setSearchParams({});
        setStage(1);
      } else if (stage2_status.code === 'registration_success') {
        navigate('/login', { state: { email: values.email } });
      }
    } else if (stage === 3) {
      registerUser(values);
    }
  };

  return (
    <div className="app">
      <div className="header-placeholder" />
      <div className="form-container" style={isMobile ? { width: '90%' } : { width: '400px' }}>
        {stage === 1 || stage === 3 ? (
          <div className="center-text">
            <div className="top-padding">
              <span className="title-span">Register</span>
            </div>
            <div className="sitename-span">{siteName}</div>
          </div>
        ) : null}
        <Form form={form} name="normal_register" className="register-form" onFinish={onFinish}>
          {stage === 1 && (
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'E-Mail is required.' },
                { type: 'email', message: 'The E-Mail is invalid.' },
              ]}
            >
              <Input
                prefix={
                  <MailOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />
                }
                placeholder="E-Mail"
                allowClear
                size="large"
              />
            </Form.Item>
          )}
          {stage === 2 && (
            <Card>
              <Result
                status={stage2_status.status}
                title={stage2_status.title}
                subTitle={stage2_status.subTitle}
              />
            </Card>
          )}
          {stage === 3 && (
            <>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'E-Mail is required.' },
                  { type: 'email', message: 'The E-Mail is invalid.' },
                ]}
              >
                <Input
                  prefix={
                    <MailOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />
                  }
                  placeholder="E-Mail"
                  allowClear
                  size="large"
                  disabled={stage === 2 || stage === 3}
                />
              </Form.Item>
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Username is required.' }]}
              >
                <Input
                  prefix={
                    <UserOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />
                  }
                  placeholder="Username"
                  autoComplete="off"
                  allowClear
                  size="large"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Password is required.' }]}
              >
                <Input.Password
                  allowClear
                  size="large"
                  placeholder="Password"
                  autoComplete="new-password"
                  prefix={
                    <LockOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />
                  }
                  type="password"
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
                      return Promise.reject(
                        new Error('The passwords that you entered do not match!')
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  allowClear
                  size="large"
                  autoComplete="new-password"
                  prefix={
                    <LockOutlined className="site-form-item-icon" style={{ color: '#1677ff' }} />
                  }
                  placeholder="Confirm Password"
                />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="register-form-button"
              style={{ width: '100%' }}
              size="large"
              loading={loading}
            >
              {stage === 1 && 'Send Verification Email'}
              {stage === 2 && stage2_status.buttonText}
              {stage === 3 && 'Register'}
            </Button>
          </Form.Item>
        </Form>
        {stage === 1 ? (
          <>
            <div className="placeholder" />
            <Link
              to="/login"
              style={{ display: 'flex', justifyContent: 'center', fontSize: '14px' }}
            >
              Already have an account? Login
            </Link>
          </>
        ) : null}
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
