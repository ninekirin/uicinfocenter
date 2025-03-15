import { apiBaseUrl } from '@/assets/js/config.js';
import { InboxOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Flex,
  Result,
  Space,
  Steps,
  Table,
  Typography,
  Upload,
  message,
  theme,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const { Dragger } = Upload;

const CourseImport = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');

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
          // Save user information to local storage
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

  // Redirect to login if not logged in
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
  const [courseDataProcessed, setCourseDataProcessed] = useState(false);
  const [courseDescProcessed, setCourseDescProcessed] = useState(false);

  const uploaderProps = {
    name: 'file',
    multiple: true,
    action: `${apiBaseUrl}/course/upload`,
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
    style: { marginTop: '20px' },
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        // message.success(`${info.file.name} file uploaded successfully.`);
        message.success(info.file.response.message);
        // 追加上传结果信息
        setUploadResultMessageList([
          ...uploadResultMessageList,
          info.file.response.data.callback_msg,
        ]);
        setCourseDataProcessed(info.file.response.data.course_data_processed);
        setCourseDescProcessed(info.file.response.data.course_desc_processed);
      } else if (status === 'error') {
        // message.error(`${info.file.name} file upload failed.`);
        message.error(info.file.response.message);
        setUploadResultMessageList([...uploadResultMessageList, info.file.response.message]);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const confirmImport = () => {
    fetch(`${apiBaseUrl}/course/import`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(response => response.json())
      .then(response => {
        if (response.success) {
          setcurrStep(3);
          message.success(response.message);
        } else {
          message.error(response.message);
        }
      })
      .catch(error => {
        // message.error('An error occurred while importing courses.');
        message.error(error.message);
      });
  };

  const columns = [
    { title: 'Course Code', dataIndex: 'courseCode', key: 'courseCode' },
    { title: 'Course Title & Session', dataIndex: 'courseTitle', key: 'courseTitle' },
    { title: 'Offering Unit', dataIndex: 'offeringUnit', key: 'offeringUnit' },
    { title: 'Offering Programme', dataIndex: 'offeringProgramme', key: 'offeringProgramme' },
    { title: 'Units', dataIndex: 'units', key: 'units' },
    { title: 'Curriculum Type', dataIndex: 'curriculumType', key: 'curriculumType' },
    { title: 'Elective Type', dataIndex: 'electiveType', key: 'electiveType' },
    { title: 'Teachers', dataIndex: 'teachers', key: 'teachers' },
    { title: 'Class Schedule', dataIndex: 'classSchedule', key: 'classSchedule' },
    { title: 'Hours', dataIndex: 'hours', key: 'hours' },
    { title: 'Classroom', dataIndex: 'classroom', key: 'classroom' },
    { title: 'Requirements', dataIndex: 'requirements', key: 'requirements' },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
  ];

  const steps = [
    {
      title: 'Download Template',
      content: (
        <Flex vertical style={{ fontSize: '20px', margin: '20px 20px', marginTop: '20px' }}>
          <Link to="https://ecm.uic.edu.hk" target="_blank">
            (Click Here) Download Course List and Timetable & Course Description from UIC ECM
          </Link>
          <div style={{ marginTop: '20px' }}>Ensure the xlsx file follows the template below:</div>
          <Table
            columns={columns}
            dataSource={[
              // Example data, replace with actual data
              {
                key: '1',
                courseCode: 'COMP1023',
                courseTitle: 'Foundations of C Programming (1001)',
                offeringUnit: 'FST',
                offeringProgramme: 'CST',
                units: 3,
                curriculumType: 'MR',
                electiveType: 'N/A',
                teachers: 'Dr. Judy Xin FENG',
                classSchedule: 'Fri 16:00-17:50',
                hours: 2,
                classroom: 'T4-301',
                requirements: '未曾修读过GCIT1013 同时 未曾修读过...',
                remarks: 'Y1',
              },
            ]}
            pagination={false}
            bordered
            scroll={{ x: 'max-content' }}
            title={() => (
              <div style={{ textAlign: 'left' }}>
                <u>
                  <b>Course List and Timetable_Semester 1 of AY2024-25</b>
                </u>
              </div>
            )}
            style={{ marginTop: '20px', overflowX: 'auto' }}
            size="middle"
          />
          <Button type="primary" style={{ marginTop: '20px', width: '100px' }} onClick={next}>
            Next
          </Button>
        </Flex>
      ),
    },
    {
      title: 'Upload Files',
      content: (
        <Flex vertical style={{ fontSize: '20px', margin: '20px 20px', marginTop: '20px' }}>
          Upload two files: Course List and Timetable, and Course Description.
          <Dragger {...uploaderProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Acceptable file types: .xlsx, .xls, .csv for Course List and Timetable, and .pdf for
              Course Description.
            </p>
          </Dragger>
          {/* <Typography.Title level={4}>Upload Results</Typography.Title> */}
          {uploadResultMessageList.length > 0 && (
            <>
              <p style={{ marginTop: '20px' }}>Upload Results</p>
              {uploadResultMessageList.map((msg, index) => (
                <Typography.Text key={index}>{msg}</Typography.Text>
              ))}
            </>
          )}
          {courseDataProcessed && courseDescProcessed && (
            <Button type="primary" style={{ marginTop: '20px', width: '100px' }} onClick={next}>
              Next
            </Button>
          )}
          {/* <Typography.Text>
            <b>Course Description:</b> 100 courses imported successfully.
          </Typography.Text> */}
        </Flex>
      ),
    },
    // 增加一个步骤，显示导入结果，并确认导入，导入会清空原有数据
    {
      title: 'Confirm Import',
      content: (
        <Flex vertical style={{ fontSize: '20px', margin: '20px 20px', marginTop: '20px' }}>
          {/* <Typography.Title level={4}>Confirm Import</Typography.Title> */}
          <p>Confirm Import</p>
          <Typography.Text>
            Are you sure you want to import the courses? This will clear all existing course data.
          </Typography.Text>
          <Button
            type="primary"
            style={{ marginTop: '20px', width: '180px' }}
            onClick={confirmImport}
          >
            Confirm Import
          </Button>
        </Flex>
      ),
    },
    {
      title: 'Import Complete',
      content: (
        <Result
          status="success"
          title="Successfully Imported Courses"
          subTitle="You have successfully imported the courses. You can now view the courses or import another file."
          extra={[
            <Button key="navigate" type="primary" onClick={() => navigate('/course')}>
              View Courses
            </Button>,
            <Button onClick={() => setcurrStep(0)}>Import Another</Button>,
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

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card title="Course Import" size="default" styles={{ header: { fontSize: '20px' } }}>
        <>
          <Steps current={currStep} items={items} />
          <div style={contentStyle}>{steps[currStep].content}</div>
          {/* <div
            style={{
              marginTop: 24,
            }}
          >
            {currStep < steps.length - 1 && (
              <Button type="primary" onClick={() => next()}>
                Next
              </Button>
            )}
            {currStep === steps.length - 1 && (
              <Button type="primary" onClick={() => message.success('Processing complete!')}>
                Done
              </Button>
            )}
            {currStep > 0 && (
              <Button
                style={{
                  margin: '0 8px',
                }}
                onClick={() => prev()}
              >
                Previous
              </Button>
            )}
          </div> */}
        </>
      </Card>
    </Space>
  );
};

export default CourseImport;
