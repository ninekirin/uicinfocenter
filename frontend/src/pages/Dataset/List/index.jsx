import { apiBaseUrl } from '@/assets/js/config.js';
import { EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Input, Modal, Space, Table, Tag, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title } = Typography;
const { confirm } = Modal;
const { Search } = Input;

const ListDatasets = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [searchParams, setSearchParams] = useSearchParams();

  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');

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
      title: 'Description',
      dataIndex: 'description',
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
      title: 'Document Count',
      dataIndex: 'document_count',
      render: count => count.toLocaleString(),
    },
    {
      title: 'Word Count',
      dataIndex: 'word_count',
      render: count => count.toLocaleString(),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      render: timestamp => new Date(timestamp * 1000).toLocaleString(),
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      render: timestamp => new Date(timestamp * 1000).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'operation',
      render: (text, dataset) =>
        JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' && (
          <Space>
            <Tooltip title="View Documents">
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/datasets/documents?dataset_id=${dataset.id}`)}
              />
            </Tooltip>
            <Tooltip title="Upload Documents">
              <Button
                type="default"
                icon={<UploadOutlined />}
                onClick={() => navigate(`/datasets/uploader?dataset_id=${dataset.id}`)}
              />
            </Tooltip>
            {/* <Tooltip title="Edit Dataset">
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => navigate(`/datasets/editor?dataset_id=${dataset.id}`)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(dataset.id)}
              />
            </Tooltip> */}
          </Space>
        ),
    },
  ];

  const getDatasets = params => {
    setLoading(true);
    const query = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    fetch(`${apiBaseUrl}/dify/datasets?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.data) {
          const filteredData = response.data.filter(
            dataset =>
              dataset.name.includes('UIC') ||
              dataset.description.includes('UIC') ||
              dataset.name.includes('BNBU') ||
              dataset.description.includes('BNBU')
          );
          setDatasets(filteredData);
          setTableParams(prev => ({
            ...prev,
            pagination: {
              current: response.page,
              pageSize: response.limit,
              total: filteredData.length,
            },
          }));
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
        message.error('Error fetching datasets.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteDataset = id => {
    fetch(`${apiBaseUrl}/dify/datasets/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        // 204 No Content -> success
        if (response.status === 204) {
          message.success('Dataset deleted successfully!');
          getDatasets({ page: 1, limit: 10 }); // Refresh the list
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
        message.error('Error deleting dataset.');
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this dataset?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteDataset(id);
      },
    });
  };

  const handleSearch = value => {
    const params = Object.fromEntries(searchParams.entries());
    setSearchKeyword(value);
    setSearchParams({ ...params, keyword: value });
    getDatasets({ ...params, keyword: value });
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
      return;
    }

    const params = Object.fromEntries(searchParams.entries());
    setSearchKeyword(params.keyword);

    // First visit: Set default pagination parameters without fetching data
    if (!params.page || !params.limit) {
      setSearchParams({ ...params, page: 1, limit: 10 });
      return;
    }

    // Only fetch data when we have the required parameters
    getDatasets(params);
  }, [navigate, searchParams, userToken]);

  return (
    <Card
      title="List of Datasets"
      styles={{ header: { fontSize: '20px' } }}
      // extra={
      //   ['ADMIN', 'TEACHER'].includes(JSON.parse(localStorage.getItem('user')).user_type) && (
      //     <Button type="primary" onClick={() => navigate('/datasets/editor')}>
      //       <PlusOutlined />
      //       {!isMobile && 'Create a New Dataset'}
      //     </Button>
      //   )
      // }
    >
      <Title level={4} style={{ textAlign: 'center' }}>
        Datasets
      </Title>
      <Search
        placeholder="Search datasets by name or description"
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
        dataSource={datasets}
        rowKey="id"
        pagination={tableParams.pagination}
        loading={loading}
        bordered
        scroll={{ x: 'max-content' }}
        size="small"
        style={{ overflowX: 'auto' }}
        onChange={pagination => {
          setTableParams(prev => ({ ...prev, pagination }));
          const newParams = {
            ...Object.fromEntries(searchParams.entries()),
            page: pagination.current,
            limit: pagination.pageSize,
          };
          setSearchParams(newParams);
          getDatasets(newParams);
        }}
      />
    </Card>
  );
};

export default ListDatasets;
