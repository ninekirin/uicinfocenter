import { AreaChartOutlined, BarsOutlined, FundViewOutlined } from '@ant-design/icons';
import { Card, Form, Input, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title } = Typography;
const { Search } = Input;

const SearchForThreads = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobile } = useSelector(state => state.SettingModel);

  const [searchType, setSearchType] = useState('text'); // Types: subject, category, text

  const gridStyle = type => ({
    width: isMobile ? '100%' : '33.33%',
    textAlign: 'center',
    backgroundColor: searchType === type ? '#f0f0f0' : 'white', // Conditional background color
    color: searchType === type ? 'black' : '#1677ff', // Conditional text color
    cursor: 'pointer',
  });

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    }
  }, [navigate]);

  const handleSearch = value => {
    const params = { current: 1, pageSize: 10 };
    if (searchType === 'thread_subject' && value) {
      params.thread_subject = value;
    } else if (searchType === 'thread_category' && value) {
      params.thread_category = value;
    } else if (searchType === 'text' && value) {
      params.keyword = value;
    }
    navigate(`/forum/list?${new URLSearchParams(params).toString()}`);
  };

  const SearchBox = ({ placeholder }) => (
    <Form style={{ width: '100%' }}>
      <Form.Item name="search">
        <Search
          placeholder={placeholder}
          allowClear
          enterButton="Search"
          size="large"
          onSearch={handleSearch}
        />
      </Form.Item>
    </Form>
  );

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card title="Search for Threads" styles={{ header: { fontSize: '20px' } }}>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <Title level={4} style={{ textAlign: 'center' }}>
            Select Search Type
          </Title>
          <Card>
            <Card.Grid style={gridStyle('text')} onClick={() => setSearchType('text')}>
              <Space>
                <AreaChartOutlined />
                Search by thread text
              </Space>
            </Card.Grid>
            <Card.Grid
              style={gridStyle('thread_subject')}
              onClick={() => setSearchType('thread_subject')}
            >
              <Space>
                <FundViewOutlined />
                Search by thread subject
              </Space>
            </Card.Grid>
            <Card.Grid
              style={gridStyle('thread_category')}
              onClick={() => setSearchType('thread_category')}
            >
              <Space>
                <BarsOutlined />
                Search by thread category
              </Space>
            </Card.Grid>
          </Card>
          <Title level={4} style={{ textAlign: 'center' }}>
            Search by{' '}
            {searchType === 'thread_subject'
              ? 'Thread Subject'
              : searchType === 'thread_category'
              ? 'Thread Category'
              : 'Thread Text'}
          </Title>
          {searchType === 'text' && <SearchBox placeholder="Search by thread text" />}
          {searchType === 'thread_subject' && <SearchBox placeholder="Enter the thread subject" />}
          {searchType === 'thread_category' && (
            <SearchBox placeholder="Enter the thread category" />
          )}
        </Space>
      </Card>
    </Space>
  );
};

export default SearchForThreads;
