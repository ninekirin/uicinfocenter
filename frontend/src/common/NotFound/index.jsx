import React from 'react';
import { Result, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const userToken = localStorage.getItem('userToken');
  const navigate = useNavigate();
  if (userToken) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Space>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
            <Button type="primary">
              <Link to="/">Back Home</Link>
            </Button>
          </Space>
        }
      />
    );
  } else {
    window.location.href = '/login';
  }
}
