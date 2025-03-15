import BusWeekdays from '@/assets/image/Schedule of Shuttles between UIC Campuses_Weekdays.png';
import BusWeekendsAndHolidays from '@/assets/image/Schedule of Shuttles between UIC Campuses_Weekends and Holidays.png';
import AcademicCalendar from '@/assets/image/Academic Calendar.png';
import GYMScheduleEN from '@/assets/image/GYM Schedule_en.png';
import GYMScheduleZH from '@/assets/image/GYM Schedule_zh.png';
import CampusMap from '@/assets/image/UIC Campus Map.jpg';
import { ArrowRightOutlined, ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import { Markdown } from '@ant-design/pro-editor';
import { Button, Card, Image, Space, Tabs, Typography } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ZhuhaiBusZ82ScheduleTJWUIC = `
## Z82 Schedule

城轨唐家湾站 => UIC 学院（文创楼）

### 06:30~10:00 (早高峰)
- 06:30    06:55    07:15
- 07:35    07:45    07:55 
- 08:10    08:30    08:50
- 09:10    09:30    09:50

### 10:00~16:00 (平峰)
- 10:10    10:30    10:50
- 11:15    11:35    11:55
- 12:15    12:35    12:55
- 13:15    13:35    13:55
- 14:15    14:35    14:55
- 15:15    15:35    15:55

### 16:00~20:00 (晚高峰)
- 16:15    16:35    16:55
- 17:15    17:35    17:55
- 18:15    18:35    18:55
- 19:15    19:35    19:55

### 20:00~21:50 (平峰)
- 20:10    20:25    20:40
- 21:00    21:25    21:50

[珠海公交Z82支线 - 珠海交通维基](https://w.zhbus.org/%E7%8F%A0%E6%B5%B7%E5%85%AC%E4%BA%A4Z82%E6%94%AF%E7%BA%BF)
`;

const ZhuhaiBusZ82ScheduleUICTJW = `
## Z82 Schedule

UIC 学院（文创楼） => 城轨唐家湾站

### 07:00~10:00 (早高峰)
- 07:00  07:20  07:40
- 08:00  08:15  08:25  08:40
- 09:00  09:20  09:40

### 10:00~16:00 (平峰)
- 10:00  10:20  10:40
- 11:00  11:20  11:40
- 12:00  12:20  12:40
- 13:00  13:20  13:40
- 14:00  14:20  14:40
- 15:00  15:20  15:40

### 16:00~20:00 (晚高峰)
- 16:00  16:20  16:45
- 17:05  17:25  17:45
- 18:05  18:25  18:45
- 19:05  19:25  19:45

### 20:00~22:20 (平峰)
- 20:05  20:25  20:45
- 21:05  21:25  21:50
- 22:20

[珠海公交Z82支线 - 珠海交通维基](https://w.zhbus.org/%E7%8F%A0%E6%B5%B7%E5%85%AC%E4%BA%A467%E8%B7%AF%E7%BA%BF)
`;

const ZhuhaiBus67ScheduleJindingBaiyelin = `
## 67 Schedule

本线路为定班发车线路，以下发车时间仅供参考。

金鼎 => 柏叶林

### 06:50~10:00
- 6:50  7:25  8:05
- 8:48  9:31

### 10:00~16:00
- 10:13  10:56  11:38
- 12:21  13:03  13:46
- 14:28  15:11  15:53
- 16:36

### 16:00~20:30
- 17:18  17:59  18:41
- 19:22  20:00  20:30

[珠海公交67路线 - 珠海交通维基](https://w.zhbus.org/%E7%8F%A0%E6%B5%B7%E5%85%AC%E4%BA%A467%E8%B7%AF%E7%BA%BF)
`;

const ZhuhaiBus67ScheduleBaiyelinJinding = `
## 67 Schedule

本线路为定班发车线路，以下发车时间仅供参考。

柏叶林 => 金鼎

### 06:50~10:00
- 6:50  7:27  8:03
- 8:44  9:26

### 10:00~16:00
- 10:09  10:51  11:33
- 12:16  12:58  13:41
- 14:23  15:06  15:48

### 16:00~20:30
- 16:30  17:13  17:55
- 18:36  19:17  19:52
- 20:30

[珠海公交67路线 - 珠海交通维基](https://w.zhbus.org/%E7%8F%A0%E6%B5%B7%E5%85%AC%E4%BA%A467%E8%B7%AF%E7%BA%BF)
`;

const AcademicCalendarText = `
## Academic Calendar

**Note:**
For the latest academic calendar, please visit [UIC Academic Calendar](https://ar.uic.edu.cn/current_students/student_handbook/Academic_Calendar.htm). 欲查看最新校历，请访问[UIC校历](https://ar.uic.edu.cn/current_students/student_handbook/Academic_Calendar.htm)或留意邮件通知。
`;

const GYMScheduleText = `
## GYM Schedule

**UIC Sports Complex Opening Hours**

**Note:**
Gym opening hours are updated frequently, for the latest GYM schedule, please visit [UIC Sports Complex Opening Hours](https://www.uic.edu.cn/en/more/sports_complex.htm). 体育馆开放时间经常更新，最新的体育馆时间表，请访问[UIC体育馆开放时间](https://www.uic.edu.cn/quick_link/gyp.htm)或留意邮件通知。
`;

const CampusEssentials = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [searchParams, setSearchParams] = useSearchParams();
  const key = searchParams.get('key') || 'academic-calendar';
  const busRoute = searchParams.get('busRoute') || 'phase-i-ii-weekdays';

  const onChange = key => {
    console.log(key);
    const newParams = {
      ...Object.fromEntries(searchParams.entries()),
      key,
    };
    setSearchParams(newParams);
  };

  const onChangeBus = busRoute => {
    console.log(busRoute);
    const newParams = {
      ...Object.fromEntries(searchParams.entries()),
      busRoute,
    };
    setSearchParams(newParams);
  };

  const busScheduleItems = [
    {
      key: 'phase-i-ii-weekdays',
      label: 'Phase I <-> II Weekdays',
      children: (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Last Updated on 2024/9/9
          </Typography.Text>
          <Image preview={{ mask: null }} src={BusWeekdays} />
        </Space>
      ),
    },
    {
      key: 'phase-i-ii-weekends-and-holidays',
      label: 'Phase I <-> II Weekends and Holidays',
      children: (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Last Updated on 2024/9/9
          </Typography.Text>
          <Image preview={{ mask: null }} src={BusWeekendsAndHolidays} />
        </Space>
      ),
    },
    {
      key: 'z82-tjw-uic',
      label: 'Z82 Tangjiawan -> UIC',
      children: (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Last Updated on 2024/11/11
          </Typography.Text>
          <Markdown>{ZhuhaiBusZ82ScheduleTJWUIC}</Markdown>
        </Space>
      ),
    },
    {
      key: 'z82-uic-tjw',
      label: 'Z82 UIC -> Tangjiawan',
      children: (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Last Updated on 2024/11/11
          </Typography.Text>
          <Markdown>{ZhuhaiBusZ82ScheduleUICTJW}</Markdown>
        </Space>
      ),
    },
    {
      key: '67-jinding-baiyelin',
      label: '67 Jinding -> Baiyelin',
      children: (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Last Updated on 2024/11/11
          </Typography.Text>
          <Markdown>{ZhuhaiBus67ScheduleJindingBaiyelin}</Markdown>
        </Space>
      ),
    },
    {
      key: '67-baiyelin-jinding',
      label: '67 Baiyelin -> Jinding',
      children: (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Last Updated on 2024/11/11
          </Typography.Text>
          <Markdown>{ZhuhaiBus67ScheduleBaiyelinJinding}</Markdown>
        </Space>
      ),
    },
  ];

  const campusEssentialsItems = [
    {
      key: 'academic-calendar',
      label: 'Academic Calendar',
      children: (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Last Updated on 2025/3/1
          </Typography.Text>
          <Markdown>{AcademicCalendarText}</Markdown>
          <Image preview={{ mask: null }} src={AcademicCalendar} />
        </Space>
      ),
    },
    {
      key: 'bus-schedule',
      label: 'Bus Schedule',
      children: (
        <Tabs
          defaultActiveKey={busRoute}
          type="card"
          items={busScheduleItems}
          onChange={onChangeBus}
        />
      ),
    },
    {
      key: 'campus-map',
      label: 'Campus Map',
      children: (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Last Updated on 2024/08/20
          </Typography.Text>
          <Image preview={{ mask: null }} src={CampusMap} />
        </Space>
      ),
    },
    {
      key: 'gym-schedule',
      label: 'GYM Schedule',
      children: (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            Last Updated on 2025/3/1
          </Typography.Text>
          <Markdown>{GYMScheduleText}</Markdown>
          <Image preview={{ mask: null }} src={GYMScheduleEN} />
          <Image preview={{ mask: null }} src={GYMScheduleZH} />
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card
        title="Campus Essentials"
        size="default"
        styles={{ body: { padding: '8px', margin: '0 16px 0 16px' }, header: { fontSize: '20px' } }}
        extra={
          userToken ? (
            // <Button type="primary" onClick={() => navigate('/')}>
            //   Home
            //   <HomeOutlined />
            // </Button>
            <Button type="primary" onClick={() => navigate(-1)}>
              Back
              <ArrowLeftOutlined />
            </Button>
          ) : (
            <Button type="primary" onClick={() => navigate('/register')}>
              Register
              <ArrowRightOutlined />
            </Button>
          )
        }
      >
        <Tabs defaultActiveKey={key} items={campusEssentialsItems} onChange={onChange} />
      </Card>
    </Space>
  );
};

export default CampusEssentials;
