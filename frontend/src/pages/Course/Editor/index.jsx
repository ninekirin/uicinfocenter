import { apiBaseUrl } from '@/assets/js/config.js';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CourseEditor = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const { isMobile } = useSelector(state => state.SettingModel);
  const [searchParams] = useSearchParams();

  const courseId = searchParams.get('id');

  const [course, setCourse] = useState({});

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
          form.setFieldsValue(response.data);
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

  const onFinish = values => {
    const data = courseId ? { ...values, id: courseId } : values;

    const method = courseId ? 'PUT' : 'POST';
    const endpoint = `${apiBaseUrl}/course`;

    fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          navigate(-1);
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
        message.error('Error saving course.');
      });
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
  }, []);

  return (
    <Card
      title={courseId ? 'Edit Course' : 'Create Course'}
      styles={{ header: { fontSize: '20px' } }}
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          {!isMobile && 'Back'}
          <ArrowLeftOutlined />
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Form
          form={form}
          name="create_or_edit_course"
          onFinish={onFinish}
          initialValues={course}
          layout="vertical"
        >
          {/* <Row gutter={[16, 16]}> */}
          {courseId && (
            <Col span={24}>
              <Form.Item name="id" label="Course ID" initialValue={courseId}>
                <Input placeholder="Course ID" disabled />
              </Form.Item>
            </Col>
          )}
          <Col span={24}>
            <Form.Item
              name="course_code"
              label="Course Code"
              rules={[{ required: true, message: 'Please input course code!' }]}
            >
              <Input placeholder="Course Code" disabled={courseId} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="name_en"
              label="Course Name (EN)"
              rules={[{ required: true, message: 'Please input course name (EN)!' }]}
            >
              <Input placeholder="Course Name (EN)" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="name_cn" label="Course Name (CN)">
              <Input placeholder="Course Name (CN)" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="units"
              label="Units"
              rules={[{ required: true, message: 'Please input course units!' }]}
            >
              <Input placeholder="Units" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="curriculum_type"
              label="Curriculum Type"
              rules={[{ required: true, message: 'Please input curriculum type!' }]}
            >
              <Input placeholder="Curriculum Type" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="elective_type" label="Elective Type">
              <Input placeholder="Elective Type" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="offering_faculty" label="Offering Faculty">
              <Input placeholder="Offering Faculty" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="offering_programme" label="Offering Programme">
              <Input placeholder="Offering Programme" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="description" label="Description">
              <Input.TextArea placeholder="Description" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="prerequisites" label="Prerequisites">
              <Input.TextArea placeholder="Prerequisites" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit">
                Save Course
              </Button>
            </Form.Item>
          </Col>
          {/* </Row> */}
        </Form>
      </Space>
    </Card>
  );
};

export default CourseEditor;
