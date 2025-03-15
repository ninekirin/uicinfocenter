import { apiBaseUrl } from '@/assets/js/config.js';
import { Card, Descriptions, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserInformation = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');

  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
  );

  const getUser = () => {
    fetch(`${apiBaseUrl}/user/${user.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          setUser(response.data);
          // Save user information to local storage
          localStorage.setItem('user', JSON.stringify(response.data));
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
        message.error('An error occurred while fetching user information.');
      });
  };

  // Redirect to login if not logged in
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      getUser();
    }
  }, [navigate]);

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card title="User Information" size="default" styles={{ header: { fontSize: '20px' } }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="User Type">{user.user_type}</Descriptions.Item>
          <Descriptions.Item label="Account Status">{user.account_status}</Descriptions.Item>
          <Descriptions.Item label="Default Entrypoint">
            {user.default_entrypoint}
          </Descriptions.Item>
          <Descriptions.Item label="Last Online">{user.last_online}</Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
};

export default UserInformation;
