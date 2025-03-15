import { apiBaseUrl } from '@/assets/js/config.js';
import {
  CloseCircleOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { Button, Card, Result, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Teachers = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [importState, setImported] = useState(0); // 0: not imported, 1: importing, 2: imported, 3: failed

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
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      getUser();
    }
  }, [navigate]);

  const confirmImport = () => {
    setImported(1);
    fetch(`${apiBaseUrl}/teacher/import`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          setImported(2);
        } else {
          setImported(3);
          message.error(response.message);
        }
      })
      .catch(error => {
        setImported(3);
        // message.error('An error occurred while importing teachers.');
        message.error(error.message);
      });
  };

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card title="Import Teachers" size="default" styles={{ header: { fontSize: '20px' } }}>
        {importState === 0 ? (
          <Result
            icon={<QuestionCircleOutlined />}
            status="info"
            title="Import Teachers"
            subTitle="Do you want to import teachers from UIC website?"
            extra={[
              <Button key="import" type="primary" onClick={confirmImport}>
                Import
              </Button>,
            ]}
          />
        ) : importState === 1 ? (
          <Result
            icon={<LoadingOutlined />}
            status="info"
            title="Importing Teachers"
            subTitle="Please wait..."
          />
        ) : importState === 2 ? (
          <Result
            icon={<SmileOutlined />}
            status="success"
            title="Successfully Imported Teachers"
            subTitle="You have successfully imported the teachers from UIC website."
            extra={[
              <Button key="back" type="primary" onClick={() => setImported(0)}>
                Back to Import
              </Button>,
            ]}
          />
        ) : (
          <Result
            icon={<CloseCircleOutlined />}
            status="error"
            title="Failed to Import Teachers"
            subTitle="An error occurred while importing teachers."
            extra={[
              <Button key="retry" type="primary" onClick={confirmImport}>
                Retry
              </Button>,
              <Button onClick={() => setImported(0)}>Back to Import</Button>,
            ]}
          />
        )}
      </Card>
    </Space>
  );
};

export default Teachers;
