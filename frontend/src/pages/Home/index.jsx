import { apiBaseUrl } from '@/assets/js/config.js';
import {
  DeleteOutlined,
  EditOutlined,
  EditTwoTone,
  ExclamationCircleOutlined,
  LinkOutlined,
  PlusOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { confirm } = Modal;

const Home = () => {
  const navigate = useNavigate();
  const { isMobile } = useSelector(state => state.SettingModel);
  const [user, setUser] = useState(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {}
  );
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentWebAddress, setCurrentWebAddress] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [form] = Form.useForm();
  const userToken = localStorage.getItem('userToken');
  const isAdmin = localStorage.getItem('user')
    ? ['ADMIN'].includes(JSON.parse(localStorage.getItem('user')).user_type)
    : false;
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      setUser(JSON.parse(localStorage.getItem('user')));
      fetchCategories();
    }
  }, [navigate]);

  const fetchCategories = () => {
    fetch(`${apiBaseUrl}/navigator/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setCategories(response.data);
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
        message.error('Error fetching categories.');
      });
  };

  const handleAddCategory = () => {
    setModalType('addCategory');
    setModalTitle('Add Category');
    setIsModalVisible(true);
  };

  const handleAddWebAddress = category => {
    setCurrentCategory(category);
    setModalType('addWebPage');
    setModalTitle('Add Web Page');
    setIsModalVisible(true);
  };

  const handleEditCategory = category => {
    setCurrentCategory(category);
    setModalType('editCategory');
    setModalTitle('Edit Category');
    setIsModalVisible(true);
    form.setFieldsValue(category); // 自动填充原有内容
  };

  const handleEditWebAddress = webaddr => {
    setCurrentWebAddress(webaddr);
    setModalType('editWebPage');
    setModalTitle('Edit Web Page');
    setIsModalVisible(true);
    form.setFieldsValue(webaddr); // 自动填充原有内容
  };

  const showDeleteConfirm = (type, id) => {
    confirm({
      title: `Are you sure you want to delete this ${
        type === 'category' ? 'category' : 'web page'
      }?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        if (type === 'category') {
          handleDeleteCategory(id);
        } else {
          handleDeleteWebAddress(id);
        }
      },
    });
  };

  const handleDeleteCategory = categoryId => {
    fetch(`${apiBaseUrl}/navigator/category`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({ id: categoryId }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          fetchCategories();
        } else {
          message.error(response.message);
        }
      })
      .catch(error => {
        message.error('Error deleting category.');
      });
  };

  const handleDeleteWebAddress = webaddrId => {
    fetch(`${apiBaseUrl}/navigator/webaddress`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({ id: webaddrId }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          fetchCategories();
        } else {
          message.error(response.message);
        }
      })
      .catch(error => {
        message.error('Error deleting web page.');
      });
  };

  const renderCategory = category => (
    <Card
      id={category.name}
      key={category.id}
      title={
        <Space>
          {category.cover ? <img src={category.cover} style={{ height: 30 }} /> : <TagOutlined />}
          {category.name}
          {!isMobile && category.name_en}
          {isMobile
            ? category.abbreviation
              ? category.abbreviation
              : ''
            : category.abbreviation
            ? `(${category.abbreviation})`
            : ''}
        </Space>
      }
      extra={
        isAdmin && isEditing ? (
          <Space>
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => handleAddWebAddress(category)}
            >
              {!isMobile && 'Add Web Page'}
            </Button>
            <Button type="link" icon={<EditTwoTone />} onClick={() => handleEditCategory(category)}>
              {!isMobile && 'Edit Category'}
            </Button>
            <Button
              type="link"
              icon={<DeleteOutlined />}
              style={{ color: 'red' }}
              onClick={() => showDeleteConfirm('category', category.id)}
            >
              {!isMobile && 'Delete Category'}
            </Button>
          </Space>
        ) : null
      }
    >
      {category.web_addresses.map((addr, index) => (
        <Card.Grid key={addr.id} style={{ width: isMobile ? '100%' : '25%', textAlign: 'center' }}>
          <Space direction="vertical" size="small" style={{ display: 'flex' }}>
            <Tooltip title={addr.description}>
              <Link to={addr.url} target="_blank">
                <Space direction="horizontal">
                  {addr.icon ? (
                    <img src={addr.icon} alt={addr.title} style={{ width: 20 }} />
                  ) : (
                    <LinkOutlined />
                  )}
                  {addr.title_en ? (
                    <Space direction="vertical" size={0}>
                      <span>{addr.title}</span>
                      <span style={{ fontSize: 12, color: 'gray' }}>{addr.title_en}</span>
                    </Space>
                  ) : (
                    <span>{addr.title}</span>
                  )}
                </Space>
              </Link>
            </Tooltip>
            {isAdmin && isEditing && (
              <Space direction="horizontal" size={0}>
                <Button
                  type="link"
                  icon={<EditTwoTone />}
                  onClick={() => handleEditWebAddress(addr)}
                >
                  {!isMobile && 'Edit'}
                </Button>
                <Button
                  type="link"
                  icon={<DeleteOutlined />}
                  style={{ color: 'red' }}
                  onClick={() => showDeleteConfirm('webaddr', addr.id)}
                >
                  {!isMobile && 'Delete'}
                </Button>
              </Space>
            )}
          </Space>
        </Card.Grid>
      ))}
    </Card>
  );

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        if (modalType === 'addCategory' || modalType === 'editCategory') {
          const url =
            modalType === 'addCategory'
              ? `${apiBaseUrl}/navigator/category`
              : `${apiBaseUrl}/navigator/category/${currentCategory.id}`;
          const method = modalType === 'addCategory' ? 'POST' : 'PUT';
          fetch(url, {
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
                fetchCategories();
              } else {
                message.error(response.message);
              }
            })
            .catch(error => {
              if (modalType === 'addCategory') {
                message.error('Error adding category.');
              } else if (modalType === 'editCategory') {
                message.error('Error editing category.');
              }
            });
        } else if (modalType === 'addWebPage') {
          const url = `${apiBaseUrl}/navigator/webaddress`;
          const method = 'POST';
          fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`,
            },
            body: JSON.stringify({ ...values, category_id: currentCategory.id }),
          })
            .then(res => res.json())
            .then(response => {
              if (response.success) {
                message.success(response.message);
                fetchCategories();
              } else {
                message.error(response.message);
              }
            })
            .catch(error => {
              message.error('Error adding web page.');
            });
        } else if (modalType === 'editWebPage') {
          const url = `${apiBaseUrl}/navigator/webaddress/${currentWebAddress.id}`;
          const method = 'PUT';
          fetch(url, {
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
                fetchCategories();
              } else {
                message.error(response.message);
              }
            })
            .catch(error => {
              message.error('Error editing web page.');
            });
        }
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      {/* <Card title="Dashboard">
        <p>
          Welcome <b>{user.username}</b> to {siteName}.
        </p>
        <p>
          Your current role is <b>{user.user_type}</b>.
        </p>
        <p>
          Your account is <b>{user.account_status}</b>.
        </p>
        <p>
          Last online: <b>{user.last_online}</b>
        </p>
      </Card> */}
      <Card
        title="UIC 网址导航 - UIC Website Navigation"
        id="navigator"
        extra={
          isAdmin ? (
            isEditing ? (
              <Space direction="horizontal">
                <Button type="link" icon={<PlusOutlined />} onClick={handleAddCategory}>
                  {!isMobile && 'Add Category'}
                </Button>
                <Button type="link" icon={<EditOutlined />} onClick={() => setIsEditing(false)}>
                  {!isMobile && 'Done'}
                </Button>
              </Space>
            ) : (
              <Space direction="horizontal">
                <Button type="link" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                  {!isMobile && 'Edit'}
                </Button>
              </Space>
            )
          ) : null
        }
      >
        <Row gutter={16}>
          <Col flex="auto">
            {/* {!isMobile && (
              <div id="content" style={{ overflow: 'auto', height: '80vh' }}>
                <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                  {categories.map(renderCategory)}
                </Space>
              </div>
            )}
            {isMobile && ( */}
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
              {categories.map(renderCategory)}
            </Space>
            {/* )} */}
          </Col>
          {/* {!isMobile && (
            <Col flex="200px">
              <Anchor
                getContainer={() => document.getElementById('content')}
                items={categories.map(category => ({
                  key: category.id,
                  href: `#${category.name}`,
                  title: category.name,
                }))}
              />
            </Col>
          )} */}
        </Row>
      </Card>
      <Modal title={modalTitle} onOk={handleOk} onCancel={handleCancel} open={isModalVisible}>
        <Form form={form} layout="vertical">
          {(modalType === 'addCategory' || modalType === 'editCategory') && (
            <>
              <Form.Item
                name="name"
                label="Category Name"
                rules={[{ required: true, message: 'Please input the category name!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="name_en"
                label="Category Name (EN)"
                rules={[{ required: false, message: 'Please input the category name (EN)!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="abbreviation"
                label="Abbreviation of the department"
                rules={[{ required: false, message: 'Please input the abbreviation!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="dept_website"
                label="Department Website URL"
                rules={[{ required: false, message: 'Please input the department website URL!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="cover"
                label="Cover URL"
                rules={[{ required: false, message: 'Please input the cover URL!' }]}
              >
                <Input />
              </Form.Item>
            </>
          )}
          {(modalType === 'addWebPage' || modalType === 'editWebPage') && (
            <>
              <Form.Item
                name="title"
                label="Web Page Title"
                rules={[{ required: true, message: 'Please input the web page title!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="title_en"
                label="Web Page Title (EN)"
                rules={[{ required: false, message: 'Please input the web page title (EN)!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="subtitle"
                label="Web Page Subtitle"
                rules={[{ required: false, message: 'Please input the web page subtitle!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="subtitle_en"
                label="Web Page Subtitle (EN)"
                rules={[{ required: false, message: 'Please input the web page subtitle (EN)!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="url"
                label="Web Page URL"
                rules={[{ required: true, message: 'Please input the web page URL!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="icon"
                label="Icon URL"
                rules={[{ required: false, message: 'Please input the icon URL!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description"
                label="Web Page Description"
                rules={[{ required: false, message: 'Please input the web page description!' }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="description_en"
                label="Web Page Description (EN)"
                rules={[
                  { required: false, message: 'Please input the web page description (EN)!' },
                ]}
              >
                <Input />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </Space>
  );
};

export default Home;
