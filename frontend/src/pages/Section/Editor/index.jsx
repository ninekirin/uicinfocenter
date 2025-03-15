import { apiBaseUrl } from '@/assets/js/config.js';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SectionEditor = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const { isMobile } = useSelector(state => state.SettingModel);
  const [searchParams] = useSearchParams();

  const initialSectionId = searchParams.get('id') || '';
  const initialCourseId = searchParams.get('course_id') || '';
  const initialCourseCode = searchParams.get('course_code') || '';

  const [courseIdDisabled, setCourseIdDisabled] = useState(false);
  const [courseCodeDisabled, setCourseCodeDisabled] = useState(false);

  const [course, setCourse] = useState({});
  const [section, setSection] = useState({});

  // Edit mode only: get section data
  const getSection = id => {
    fetch(`${apiBaseUrl}/section?id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setSection(response.data);
          form.setFieldsValue(response.data);
          getCourse(response.data.course_id);
          setCourseIdDisabled(true);
        } else {
          handleTokenError(response.code);
        }
      })
      .catch(error => {
        message.error('Error getting section.');
      });
  };

  const getCourse = course_id => {
    fetch(`${apiBaseUrl}/course?id=${course_id}`, {
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
          form.setFieldValue('name_en', response.data.name_en);
        } else {
          handleTokenError(response.code);
        }
      })
      .catch(error => {
        message.error('Error getting course.');
      });
  };

  const getCourseByCourseCode = course_code => {
    fetch(`${apiBaseUrl}/course?course_code=${course_code}`, {
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
          form.setFieldValue('name_en', response.data.name_en);
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
      });
  };

  const handleTokenError = code => {
    if (['NO_TOKEN', 'INVALID_TOKEN', 'EXPIRED_TOKEN'].includes(code)) {
      localStorage.removeItem('userToken');
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      message.error('An error occurred.');
    }
  };

  const onCourseCodeChange = e => {
    const course_code = e.target.value;
    if (course_code.length > 0) {
      clearTimeout(window.questionFetchTimeout);
      window.questionFetchTimeout = setTimeout(() => getCourseByCourseCode(course_code), 500);
    }
  };

  const onFinish = values => {
    const method = section.id ? 'PUT' : 'POST';
    const endpoint = `${apiBaseUrl}/section`;

    fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(values),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          navigate(-1);
        } else {
          handleTokenError(response.code);
        }
      })
      .catch(error => {
        message.error('Error saving section.');
      });
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    }
    if (initialSectionId) {
      getSection(initialSectionId);
    } else if (initialCourseId) {
      form.setFieldValue('course_id', initialCourseId);
      getCourse(initialCourseId);
      setCourseIdDisabled(true);
    } else if (initialCourseCode) {
      form.setFieldValue('course_code', initialCourseCode);
      getCourseByCourseCode(initialCourseCode);
      setCourseCodeDisabled(true);
    }
  }, [initialSectionId, initialCourseId, initialCourseCode]);

  return (
    <Card
      title={initialSectionId ? 'Edit Section' : 'Create Section'}
      styles={{ header: { fontSize: '20px' } }}
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          {!isMobile && 'Back'}
          <ArrowLeftOutlined />
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Form form={form} name="create_or_edit_section" onFinish={onFinish} layout="vertical">
          {initialSectionId && (
            <Col span={24}>
              <Form.Item name="id" label="Section ID">
                <Input placeholder="Section ID" disabled />
              </Form.Item>
            </Col>
          )}
          {initialCourseId ? (
            <Col span={24}>
              <Form.Item
                name="course_id"
                label="Course ID"
                rules={[{ required: true, message: 'Please input course id!' }]}
              >
                <Input placeholder="Course ID" disabled={courseIdDisabled} />
              </Form.Item>
            </Col>
          ) : (
            <Col span={24}>
              <Form.Item
                name="course_code"
                label="Course Code"
                rules={[{ required: true, message: 'Please input course code!' }]}
              >
                <Input
                  placeholder="Course Code"
                  onChange={onCourseCodeChange}
                  disabled={courseCodeDisabled}
                />
              </Form.Item>
            </Col>
          )}
          {course.name_en && (
            <Col span={24}>
              <Form.Item name="name_en" label="Course Name (EN)">
                <Input placeholder="Course Name (EN)" disabled />
              </Form.Item>
            </Col>
          )}
          <Col span={24}>
            <Form.Item
              name="section_number"
              label="Section Number"
              rules={[{ required: true, message: 'Please input section number!' }]}
            >
              <Input placeholder="Section Number" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="offer_semester"
              label="Offer Semester"
              rules={[{ required: true, message: 'Please input offer semester!' }]}
            >
              <Input placeholder="Offer Semester" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="classroom" label="Classroom">
              <Input placeholder="Classroom" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="schedule" label="Schedule">
              <Input placeholder="Schedule" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="hours" label="Hours">
              <Input placeholder="Hours" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="remarks" label="Remarks">
              <Input.TextArea placeholder="Remarks" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="teachers" label="Teachers">
              <Input placeholder="Teachers" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                Save Section
              </Button>
            </Form.Item>
          </Col>
        </Form>
      </Space>
    </Card>
  );
};

export default SectionEditor;
