import { apiBaseUrl } from '@/assets/js/config.js';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Result, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SectionDetail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditingSection, setIsEditingSection] = useState(false);
  const userToken = localStorage.getItem('userToken');
  const { isMobile } = useSelector(state => state.SettingModel);

  const [searchParams] = useSearchParams();
  const section_id = searchParams.get('id');

  const [section, setSection] = useState({});

  const getSection = id => {
    let query = `id=${id}`;

    fetch(`${apiBaseUrl}/section?${query}`, {
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
        message.error('Error getting section.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    }
    if (section_id) {
      getSection(section_id);
    }
  }, [navigate, section_id]);

  if (!section_id) {
    return (
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card title="Section Detail" styles={{ header: { fontSize: '20px' } }}>
          <Result
            status="404"
            title="No section selected"
            subTitle="Please go to Section List page to choose a section."
            extra={
              <Button type="primary" key="console" onClick={() => navigate('/section/list')}>
                Go to Section List
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
        title="Section Detail"
        styles={{ header: { fontSize: '20px' } }}
        extra={
          <Button type="primary" onClick={() => navigate(-1)}>
            {!isMobile && 'Back'}
            <ArrowLeftOutlined />
          </Button>
        }
      >
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Card
            title="Section Information"
            extra={
              JSON.parse(localStorage.getItem('user')).user_type === 'ADMIN' && (
                <Button type="primary" onClick={() => navigate(`/section/editor?id=${section_id}`)}>
                  {!isMobile && 'Edit'}
                  <EditOutlined />
                </Button>
              )
            }
          >
            <Descriptions column={1}>
              <Descriptions.Item label="Section ID">{section.id}</Descriptions.Item>
              <Descriptions.Item label="Course Code">{section.course_code}</Descriptions.Item>
              <Descriptions.Item label="Course Name">{section.course_name}</Descriptions.Item>
              <Descriptions.Item label="Offer Semester">{section.offer_semester}</Descriptions.Item>
              <Descriptions.Item label="Section Number">{section.section_number}</Descriptions.Item>
              <Descriptions.Item label="Classroom">{section.classroom}</Descriptions.Item>
              <Descriptions.Item label="Schedule">{section.schedule}</Descriptions.Item>
              <Descriptions.Item label="Hours">{section.hours}</Descriptions.Item>
              <Descriptions.Item label="Remarks">{section.remarks}</Descriptions.Item>
              <Descriptions.Item label="Teachers">{section.teachers}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      </Card>
    </Space>
  );
};

export default SectionDetail;
