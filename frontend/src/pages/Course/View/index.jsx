import { apiBaseUrl } from '@/assets/js/config.js';
import { EditOutlined, EyeOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Result, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CourseDetail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const userToken = localStorage.getItem('userToken');
  const { isMobile } = useSelector(state => state.SettingModel);

  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('id');

  const [course, setCourse] = useState({
    id: '',
    course_code: '',
    name_en: '',
    name_cn: '',
    units: 3,
    curriculum_type: '',
    elective_type: '',
    offering_faculty: '',
    offering_programme: '',
    description: '',
    prerequisites: '',
  });

  const getCourse = id => {
    fetch(`${apiBaseUrl}/course?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setCourse(response.data);
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
        message.error('Error getting course.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    }
    if (courseId) {
      getCourse(courseId);
    }
  }, [navigate, courseId, userToken]);

  if (!courseId) {
    return (
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card title="Course Detail" styles={{ header: { fontSize: '20px' } }}>
          <Result
            status="404"
            title="No course selected"
            subTitle="Please go to Course List page to choose a course."
            extra={
              <Button type="primary" key="console" onClick={() => navigate('/course/list')}>
                Go to Course List
              </Button>
            }
          />
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card
        title="Course Detail"
        styles={{ header: { fontSize: '20px' } }}
        extra={
          <Button type="primary" onClick={() => navigate(-1)}>
            {!isMobile && 'Back'}
            <ArrowLeftOutlined />
          </Button>
        }
      >
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Card title="Course Information">
            <Descriptions column={1}>
              <Descriptions.Item label="Course ID">{course.id}</Descriptions.Item>
              <Descriptions.Item label="Course Code">{course.course_code}</Descriptions.Item>
              <Descriptions.Item label="Course Name (EN)">{course.name_en}</Descriptions.Item>
              <Descriptions.Item label="Course Name (CN)">{course.name_cn}</Descriptions.Item>
              <Descriptions.Item label="Units">{course.units}</Descriptions.Item>
              <Descriptions.Item label="Curriculum Type">
                {course.curriculum_type}
              </Descriptions.Item>
              <Descriptions.Item label="Elective Type">{course.elective_type}</Descriptions.Item>
              <Descriptions.Item label="Offering Faculty">
                {course.offering_faculty}
              </Descriptions.Item>
              <Descriptions.Item label="Offering Programme">
                {course.offering_programme}
              </Descriptions.Item>
              <Descriptions.Item label="Description">{course.description}</Descriptions.Item>
              <Descriptions.Item label="Prerequisites">{course.prerequisites}</Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="Actions" style={{ display: 'flex' }}>
            <Space wrap>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/section/list?course_id=${courseId}`)}
              >
                View Sections
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(`/section/editor?course_id=${courseId}`)}
              >
                Add Section
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/course/editor?id=${courseId}`)}
              >
                Edit Course
              </Button>
            </Space>
          </Card>
        </Space>
      </Card>
    </Space>
  );
};

export default CourseDetail;
