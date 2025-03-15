import { apiBaseUrl } from '@/assets/js/config.js';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Input,
  Modal,
  Result,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title } = Typography;
const { confirm } = Modal;
const { Search } = Input;

const ListDocuments = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobile } = useSelector(state => state.SettingModel);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const datasetId = searchParams.get('dataset_id');
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('keyword') || '');

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: text => (text.length > 50 ? `${text.substring(0, 50)}...` : text),
    },
    {
      title: 'Data Source',
      dataIndex: 'data_source_type',
      render: sourceType => {
        const tagProps = {
          upload_file: { color: 'blue', label: 'Upload File' },
          notion_import: { color: 'green', label: 'Notion Import' },
          website_crawl: { color: 'orange', label: 'Website Crawl' },
        }[sourceType] || { color: 'default', label: sourceType };

        return <Tag color={tagProps.color}>{tagProps.label}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      render: timestamp => new Date(timestamp * 1000).toLocaleString(),
    },
    // indexing parsing
    {
      title: 'Indexing Status',
      dataIndex: 'indexing_status',
      render: status => {
        const tagProps = {
          indexing: { color: 'gold', label: 'Indexing' },
          waiting: { color: 'cyan', label: 'Waiting' },
          parsing: { color: 'orange', label: 'Processing' },
          completed: { color: 'geekblue', label: 'Completed' },
        }[status] || { color: 'magenta', label: status };

        return <Tag color={tagProps.color}>{tagProps.label}</Tag>;
      },
    },
    {
      title: 'Enabling Status',
      dataIndex: 'enabled',
      render: enabled => {
        const tagProps = {
          true: { color: 'success', label: 'Enabled' },
          false: { color: 'default', label: 'Disabled' },
        }[enabled.toString()] || { color: 'default', label: enabled.toString() };

        return <Tag color={tagProps.color}>{tagProps.label}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'operation',
      render: (text, document) =>
        JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' && (
          <Space>
            {/* <Tooltip title="View Document">
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() =>
                  navigate(`/datasets/documents-viewer?dataset_id=${datasetId}&id=${document.id}`)
                }
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() =>
                  navigate(`/datasets/documents-editor?dataset_id=${datasetId}&id=${document.id}`)
                }
              />
            </Tooltip> */}
            <Tooltip title="Delete">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(document.id)}
              />
            </Tooltip>
          </Space>
        ),
    },
  ];

  const getDocuments = params => {
    if (!datasetId) {
      return;
    }
    setLoading(true);
    const query = Object.entries(params)
      .filter(([k, _]) => k !== 'dataset_id') // 拿掉 dataset_id 這個參數
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    fetch(`${apiBaseUrl}/dify/datasets/${datasetId}/documents?${query}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.data) {
          setDocuments(response.data);
          setTableParams(prev => ({
            ...prev,
            pagination: {
              current: response.page,
              pageSize: response.limit,
              total: response.total,
            },
          }));
        } else {
          message.error('Failed to fetch documents.');
        }
      })
      .catch(() => {
        message.error('Error fetching documents.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteDocument = id => {
    fetch(`${apiBaseUrl}/dify/datasets/${datasetId}/documents/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.result === 'success') {
          message.success('Document deleted successfully!');
          getDocuments({
            page: tableParams.pagination.current,
            limit: tableParams.pagination.pageSize,
          });
        } else {
          message.error('Failed to delete document.');
        }
      })
      .catch(() => {
        message.error('Error deleting document.');
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this document?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteDocument(id);
      },
    });
  };

  const handleSearch = value => {
    const params = Object.fromEntries(searchParams.entries());
    setSearchKeyword(value);
    setSearchParams({ ...params, keyword: value });
    getDocuments({ ...params, keyword: value });
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      const params = Object.fromEntries(searchParams.entries());
      setSearchKeyword(params.keyword || '');
      if (!params.page || !params.limit) {
        setSearchParams({ ...params, page: 1, limit: 10 });
        getDocuments({ ...params, page: 1, limit: 10 });
      } else {
        getDocuments(params);
      }
    }
  }, [navigate, userToken]);

  if (!datasetId) {
    return (
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card title="List of Documents" styles={{ header: { fontSize: '20px' } }}>
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
    <Card
      title="List of Documents"
      styles={{ header: { fontSize: '20px' } }}
      extra={
        ['ADMIN'].includes(JSON.parse(localStorage.getItem('user')).user_type) && (
          <Button
            type="primary"
            onClick={() => navigate(`/datasets/uploader?dataset_id=${datasetId}`)}
          >
            <PlusOutlined />
            {!isMobile && 'Add a file'}
          </Button>
        )
      }
    >
      <Title level={4} style={{ textAlign: 'center' }}>
        Documents
      </Title>
      <Search
        placeholder="Search documents by name"
        enterButton="Search"
        size="large"
        onSearch={handleSearch}
        style={{
          marginBottom: '20px',
          maxWidth: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'block',
        }}
        value={searchKeyword}
        onChange={e => setSearchKeyword(e.target.value)}
      />
      <Table
        columns={columns}
        dataSource={documents}
        rowKey="id"
        pagination={tableParams.pagination}
        loading={loading}
        bordered
        scroll={{ x: 'max-content' }}
        size="small"
        onChange={pagination => {
          setTableParams(prev => ({ ...prev, pagination }));
          const newParams = {
            ...Object.fromEntries(searchParams.entries()),
            page: pagination.current,
            limit: pagination.pageSize,
          };
          setSearchParams(newParams);
          getDocuments(newParams);
        }}
      />
    </Card>
  );
};

export default ListDocuments;
