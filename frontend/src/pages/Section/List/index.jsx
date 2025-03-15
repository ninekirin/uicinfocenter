import { apiBaseUrl } from '@/assets/js/config.js';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Input, Modal, Space, Table, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title } = Typography;
const { confirm } = Modal;
const { Search } = Input;

const ListSections = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobile } = useSelector(state => state.SettingModel);

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  const courseId = searchParams.get('course_id');
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
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'Course Code',
      dataIndex: 'course_code',
    },
    {
      title: 'Course Name',
      dataIndex: 'course_name',
    },
    {
      title: 'Section Number',
      dataIndex: 'section_number',
    },
    {
      title: 'Teachers',
      dataIndex: 'teachers',
    },
    {
      title: 'Classroom',
      dataIndex: 'classroom',
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
    },
    {
      title: 'Action',
      key: 'operation',
      render: (text, section) => (
        <Space>
          <Tooltip title="View Section">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/section/view?id=${section.id}`)}
            />
          </Tooltip>
          {JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' && (
            <>
              <Tooltip title="Edit">
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/section/editor?id=${section.id}&course_id=${courseId}`)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => showDeleteConfirm(section.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const getSections = params => {
    setLoading(true);
    const query = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    fetch(`${apiBaseUrl}/sections?${query}${courseId ? `&course_id=${courseId}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setSections(response.data.sections);
          setTableParams(prev => ({
            ...prev,
            pagination: {
              current: response.data.pagination.current,
              pageSize: response.data.pagination.pageSize,
              total: response.data.pagination.total,
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
        message.error('Error fetching sections.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteSection = id => {
    fetch(`${apiBaseUrl}/section`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({ id: id }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success('Section deleted successfully!');
          getSections({
            current: tableParams.pagination.current,
            pageSize: tableParams.pagination.pageSize,
          });
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
        message.error('Error deleting section.');
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this section?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteSection(id);
      },
    });
  };

  const handleSearch = value => {
    setSearchKeyword(value);
    setSearchParams({ keyword: value });
    getSections({ keyword: value });
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      const params = Object.fromEntries(searchParams.entries());
      setSearchKeyword(params.keyword);
      getSections(params);
    }
  }, [navigate, userToken]);

  return (
    <Card
      title="List of Sections"
      styles={{ header: { fontSize: '20px' } }}
      extra={
        ['ADMIN'].includes(JSON.parse(localStorage.getItem('user')).user_type) && (
          <Button
            type="primary"
            onClick={() => navigate(`/section/editor${courseId ? `?course_id=${courseId}` : ''}`)}
          >
            <PlusOutlined />
            {!isMobile && 'Create a New Section'}
          </Button>
        )
      }
    >
      <Title level={4} style={{ textAlign: 'center' }}>
        {`Sections of ${courseId ? sections[0]?.course_name : 'All Courses'}`}
      </Title>
      <Search
        placeholder="Search sections by course name or course code"
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
        dataSource={sections}
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
            current: pagination.current,
            pageSize: pagination.pageSize,
          };
          setSearchParams(newParams);
          getSections(newParams);
        }}
      />
    </Card>
  );
};

export default ListSections;
