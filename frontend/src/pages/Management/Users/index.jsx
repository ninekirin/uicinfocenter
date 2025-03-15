import { apiBaseUrl } from '@/assets/js/config.js';
import {
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  SecurityScanOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
const { confirm } = Modal;

const UserAccount = () => {
  const navigate = useNavigate();
  const userToken = localStorage.getItem('userToken');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    children,
    ...restProps
  }) => {
    const getInput = () => {
      if (dataIndex === 'user_type') {
        return (
          <Select
            options={[
              { label: 'Admin', value: 'ADMIN' },
              { label: 'Teacher', value: 'TEACHER' },
              { label: 'Student', value: 'STUDENT' },
              { label: 'Alumni', value: 'ALUMNI' },
              { label: 'Guest', value: 'GUEST' },
            ]}
          />
        );
      }
      if (dataIndex === 'account_status') {
        return (
          <Select
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' },
            ]}
          />
        );
      }
      if (dataIndex === 'default_entrypoint') {
        return (
          <Select
            options={[
              { label: 'Home', value: 'home' },
              { label: 'ChatUIC', value: 'chat' },
            ]}
          />
        );
      }

      return <Input />;
    };

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[{ required: true, message: `Please Input ${title}!` }]}
          >
            {getInput()}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const isEditing = record => record.id === editingKey;

  const edit = record => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id);
  };

  const cancel = () => setEditingKey('');

  const save = id => {
    form
      .validateFields()
      .then(row => {
        const newData = [...users];
        const index = newData.findIndex(item => id === item.id);

        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, { ...item, ...row });
          setUsers(newData);
          setEditingKey('');

          fetch(`${apiBaseUrl}/user`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
            body: JSON.stringify({ id, ...row }),
          })
            .then(res => res.json())
            .then(response => {
              if (response.success) {
                message.success(response.message);
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
            .catch(() => {
              message.error('Error saving user.');
            });
        }
      })
      .catch(() => {
        message.error('Error saving user.');
      });
  };

  const showDeleteConfirm = id => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteUser(id);
      },
    });
  };

  const deleteUser = id => {
    fetch(`${apiBaseUrl}/user`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({ id }),
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          message.success(response.message);
          getUsers({ pagination });
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
      .catch(() => {
        message.error('Error deleting user.');
      });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Username', dataIndex: 'username', editable: true },
    { title: 'Email', dataIndex: 'email', editable: true },
    {
      title: 'User Type',
      dataIndex: 'user_type',
      editable: true,
      render: type => {
        if (type === 'ADMIN') {
          return (
            <Tag icon={<SecurityScanOutlined />} color="red">
              Admin
            </Tag>
          );
        } else if (type === 'TEACHER') {
          return (
            <Tag icon={<SecurityScanOutlined />} color="blue">
              Teacher
            </Tag>
          );
        } else if (type === 'STUDENT') {
          return (
            <Tag icon={<SecurityScanOutlined />} color="green">
              Student
            </Tag>
          );
        } else if (type === 'ALUMNI') {
          return (
            <Tag icon={<SecurityScanOutlined />} color="purple">
              Alumni
            </Tag>
          );
        } else if (type === 'GUEST') {
          return (
            <Tag icon={<SecurityScanOutlined />} color="orange">
              Guest
            </Tag>
          );
        }
      },
    },
    {
      title: 'Account Status',
      dataIndex: 'account_status',
      editable: true,
      render: status => {
        if (status === 'ACTIVE') {
          return <Tag color="green">Active</Tag>;
        } else if (status === 'INACTIVE') {
          return <Tag color="volcano">Inactive</Tag>;
        }
      },
    },
    {
      title: 'Default Entrypoint',
      dataIndex: 'default_entrypoint',
      editable: true,
      render: entrypoint => {
        if (entrypoint === 'home') {
          return 'Home';
        } else if (entrypoint === 'chat') {
          return 'ChatUIC';
        } else {
          return 'Unknown (Default: Home)';
        }
      },
    },
    { title: 'Last Online', dataIndex: 'last_online', width: 150 },
    {
      title: 'Operation',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Tooltip title="Save">
              <Button type="primary" onClick={() => save(record.id)} icon={<SaveOutlined />} />
            </Tooltip>
            <Tooltip title="Cancel" onClick={cancel}>
              <Button icon={<UndoOutlined />} />
            </Tooltip>
          </Space>
        ) : (
          <Space>
            <Tooltip title="Edit">
              <Button
                type="default"
                onClick={() => edit(record)}
                icon={<EditOutlined />}
                disabled={editingKey !== ''}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(record.id)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: record => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const getUsers = params => {
    setLoading(true);
    const query = new URLSearchParams({
      current: params.pagination.current,
      pageSize: params.pagination.pageSize,
    }).toString();

    fetch(`${apiBaseUrl}/users?${query}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setUsers(response.data.users);
          setPagination({
            ...params.pagination,
            total: response.data.total,
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
      .catch(() => {
        message.error('Error fetching users.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!userToken) {
      navigate('/login', {
        state: { navBackMsg: 'Your session has timed out. Please log in again.' },
      });
    } else {
      getUsers({ pagination });
    }
  }, []);

  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card
        title="User Account Management"
        size="default"
        styles={{ header: { fontSize: '20px' } }}
      >
        <Form form={form} component={false}>
          <Table
            components={{ body: { cell: EditableCell } }}
            bordered
            dataSource={users}
            columns={mergedColumns}
            rowKey="id"
            size="small"
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => {
                setPagination(prev => ({
                  ...prev,
                  current: page,
                  pageSize,
                }));
                getUsers({ pagination: { current: page, pageSize } });
              },
            }}
            loading={loading}
            scroll={{ x: 'max-content' }}
            style={{ overflowX: 'auto' }}
          />
        </Form>
      </Card>
    </Space>
  );
};

export default UserAccount;
