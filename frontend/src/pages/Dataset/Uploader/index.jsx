import { apiBaseUrl } from '@/assets/js/config.js';
import { InboxOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Result, Space, Steps, Typography, Upload, message, theme } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Dragger } = Upload;

const DocumentUploader = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [searchParams, setSearchParams] = useSearchParams();

  const datasetId = searchParams.get('dataset_id');

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

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      getUser();
    }
  }, [navigate]);

  const { token } = theme.useToken();
  const [currStep, setcurrStep] = useState(0);
  const next = () => {
    setcurrStep(currStep + 1);
  };
  const prev = () => {
    setcurrStep(currStep - 1);
  };
  const [uploadResultMessageList, setUploadResultMessageList] = useState([]);

  const uploaderProps = {
    name: 'file',
    multiple: true,
    accept: '.txt,.md,.pdf,.docx,.html,.xlsx,.xls,.csv',
    action: `${apiBaseUrl}/dify/datasets/${datasetId}/document/create-by-file`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    data: {
      data: JSON.stringify({
        indexing_technique: 'high_quality',
        process_rule: {
          mode: 'automatic',
        },
      }),
    },
    beforeUpload: file => {
      const isLt15M = file.size / 1024 / 1024 < 15;
      if (!isLt15M) {
        message.error('File must be smaller than 15MB!');
        return false;
      }
    },
    onChange(info) {
      const { status, response } = info.file;
      if (status === 'done' && response?.document) {
        message.success(`${info.file.name} uploaded successfully.`);
        setUploadResultMessageList(prev => [
          ...prev,
          `${info.file.name}: Upload successful, document is ${response.document.display_status}`,
        ]);
        // if (response.document.display_status === 'indexing') {
        //   setcurrStep(1);
        // }
      } else if (status === 'error') {
        message.error(`${info.file.name} upload failed.`);
        setUploadResultMessageList(prev => [...prev, `${info.file.name}: Upload failed`]);
      }
    },
  };

  const steps = [
    {
      title: 'Upload file',
      content: (
        <Flex vertical style={{ fontSize: '20px', margin: '20px 20px', marginTop: '20px' }}>
          Upload file
          <Dragger {...uploaderProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Supports TXT, MARKDOWN, PDF, DOCX, HTML, XLSX, XLS, CSV. Max 15MB each.
            </p>
          </Dragger>
          {uploadResultMessageList.length > 0 && (
            <>
              <p style={{ marginTop: '20px' }}>Upload Results</p>
              {uploadResultMessageList.map((msg, index) => (
                <Typography.Text key={index}>{msg}</Typography.Text>
              ))}
            </>
          )}
          <Button type="primary" style={{ marginTop: '20px', width: '100px' }} onClick={next}>
            Next
          </Button>
        </Flex>
      ),
    },
    {
      title: 'Finish Upload',
      content: (
        <Result
          status="success"
          title="Document uploaded"
          subTitle="The document has been uploaded to the dataset, you can find it in the document list of the dataset."
          extra={[
            <Button
              type="primary"
              onClick={() => navigate(`/datasets/documents?dataset_id=${datasetId}`)}
            >
              View documents in dataset
            </Button>,
            <Button type="primary" onClick={() => navigate('/datasets/list')}>
              View all datasets
            </Button>,
            <Button onClick={() => setcurrStep(0)}>Upload another document</Button>,
          ]}
        />
      ),
    },
  ];

  const items = steps.map(item => ({
    key: item.title,
    title: item.title,
  }));
  const contentStyle = {
    // height: '400px',
    // maxHeight: '500px',
    // display: 'flex',
    // flexDirection: 'column',
    // justifyContent: 'center',
    alignItems: 'center',
    // color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  if (!datasetId) {
    return (
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card title="Documents Uploader" styles={{ header: { fontSize: '20px' } }}>
          <Result
            status="404"
            title="No dataset selected"
            subTitle="Please go to Dataset List page to choose a dataset."
            extra={
              <Button type="primary" key="console" onClick={() => navigate('/datasets/list')}>
                Go to Dataset List
              </Button>
            }
          />
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card title="Document Uploader" size="default" styles={{ header: { fontSize: '20px' } }}>
        <>
          <Steps current={currStep} items={items} />
          <div style={contentStyle}>{steps[currStep].content}</div>
        </>
      </Card>
    </Space>
  );
};

export default DocumentUploader;
