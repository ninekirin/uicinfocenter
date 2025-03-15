import { apiBaseUrl } from '@/assets/js/config.js';
import {
  BarsOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Card, Input, Modal, Space, Table, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title } = Typography;
const { confirm } = Modal;
const { Search } = Input;

const ListCourses = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobile } = useSelector(state => state.SettingModel);

  const [courses, setCourses] = useState([]);
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
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'Course Code',
      dataIndex: 'course_code',
    },
    {
      title: 'Course Name',
      dataIndex: 'name_en',
    },
    {
      title: 'Units',
      dataIndex: 'units',
    },
    {
      title: 'Curriculum Type',
      dataIndex: 'curriculum_type',
    },
    {
      title: 'Elective Type',
      dataIndex: 'elective_type',
    },
    {
      title: 'Offering Faculty',
      dataIndex: 'offering_faculty',
    },
    {
      title: 'Offering Programme',
      dataIndex: 'offering_programme',
    },
    {
      title: 'Action',
      key: 'operation',
      render: (text, course) => (
        <Space>
          <Tooltip title="View Course">
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/course/view?id=${course.id}`)}
            />
          </Tooltip>
          <Tooltip title="View Sections">
            <Button
              type="default"
              icon={<BarsOutlined />}
              onClick={() => navigate(`/section/list?course_id=${course.id}`)}
            />
          </Tooltip>
          {JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' && (
            <>
              <Tooltip title="Edit Course">
                <Button
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/course/editor?id=${course.id}`)}
                />
              </Tooltip>
              <Tooltip title="Add Section">
                <Button
                  type="default"
                  icon={<PlusOutlined />}
                  onClick={() => navigate(`/section/editor?course_id=${course.id}`)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => showDeleteConfirm(course.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const getCourses = params => {
    setLoading(true);
    const query = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

    fetch(`${apiBaseUrl}/courses?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setCourses(response.data.courses);
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
        message.error('Error fetching courses.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteCourse = id => {
    fetch(`${apiBaseUrl}/course`, {
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
          message.success('Course deleted successfully!');
          getCourses({ current: 1, pageSize: 10 }); // Refresh the list
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
        message.error('Error deleting course.');
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this course?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteCourse(id);
      },
    });
  };

  const handleSearch = value => {
    setSearchKeyword(value);
    setSearchParams({ keyword: value });
    getCourses({ keyword: value });
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      const params = Object.fromEntries(searchParams.entries());
      setSearchKeyword(params.keyword);
      getCourses(params);
    }
  }, [navigate, userToken]);

  return (
    <Card
      title="List of Courses"
      styles={{ header: { fontSize: '20px' } }}
      extra={
        ['ADMIN', 'TEACHER'].includes(JSON.parse(localStorage.getItem('user')).user_type) && (
          <Button type="primary" onClick={() => navigate('/course/editor')}>
            <PlusOutlined />
            {!isMobile && 'Create a New Course'}
          </Button>
        )
      }
    >
      <Title level={4} style={{ textAlign: 'center' }}>
        Courses
      </Title>
      <Search
        placeholder="Search courses by name or code"
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
        dataSource={courses}
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
          getCourses(newParams);
        }}
      />
    </Card>
  );
};

export default ListCourses;
