'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Switch, 
  message, 
  Popconfirm,
  Card,
  Typography,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClockCircleOutlined,
  ApiOutlined,
  KeyOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useTheme } from '@/lib/theme/theme.context';
import cronstrue from 'cronstrue';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 定义任务类型
interface Task {
  id: string;
  name: string;
  description: string;
  cronExpression: string;
  difyApiUrl: string;
  difyApiKey: string;
  systemPrompt: string;
  query: string;
  active: boolean;
  lastRun?: string;
  nextRun?: string;
}

// 模拟任务数据
const initialTasks: Task[] = [
  {
    id: '1',
    name: '每日数据分析',
    description: '每天早上8点运行数据分析任务',
    cronExpression: '0 8 * * *',
    difyApiUrl: 'http://127.0.0.1',
    difyApiKey: 'Bearer app-s1LO3fgBHF0vJc0l9wbmutn8',
    systemPrompt: '你是一个数据分析专家',
    query: '分析今日数据并生成报告',
    active: true,
    lastRun: '2023-06-01 08:00:00',
    nextRun: '2023-06-02 08:00:00',
  },
  {
    id: '2',
    name: '周报生成',
    description: '每周五下午5点生成周报',
    cronExpression: '0 17 * * 5',
    difyApiUrl: 'http://127.0.0.1',
    difyApiKey: 'Bearer app-s1LO3fgBHF0vJc0l9wbmutn8',
    systemPrompt: '你是一个专业的报告撰写助手',
    query: '根据本周数据生成周报',
    active: false,
    lastRun: '2023-05-26 17:00:00',
    nextRun: '2023-06-02 17:00:00',
  },
];

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const { themeMode } = useTheme();

  // 打开创建任务模态框
  const showCreateModal = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑任务模态框
  const showEditModal = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue(task);
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 保存任务
  const handleSave = () => {
    form.validateFields().then(values => {
      const newTask: Task = {
        id: editingTask ? editingTask.id : Date.now().toString(),
        ...values,
      };

      if (editingTask) {
        // 更新任务
        setTasks(tasks.map(task => (task.id === editingTask.id ? newTask : task)));
        message.success('任务已更新');
      } else {
        // 创建新任务
        setTasks([...tasks, newTask]);
        message.success('任务已创建');
      }

      setIsModalVisible(false);
    });
  };

  // 删除任务
  const handleDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    message.success('任务已删除');
  };

  // 切换任务状态
  const toggleTaskStatus = (id: string, active: boolean) => {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, active } : task
      )
    );
    message.success(`任务已${active ? '启用' : '禁用'}`);
  };

  // 手动运行任务
  const runTask = (task: Task) => {
    message.loading(`正在运行任务: ${task.name}`);
    
    // 模拟API调用
    setTimeout(() => {
      message.success(`任务 ${task.name} 已成功运行`);
      
      // 更新最后运行时间
      setTasks(
        tasks.map(t => 
          t.id === task.id 
            ? { 
                ...t, 
                lastRun: new Date().toLocaleString('zh-CN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                })
              } 
            : t
        )
      );
    }, 2000);
  };

  // 表格列定义
  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Task) => (
        <Space>
          {text}
          {record.active && (
            <Tag color="green">已启用</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '定时表达式',
      dataIndex: 'cronExpression',
      key: 'cronExpression',
      render: (text: string) => (
        <Tooltip title={cronstrue.toString(text, { locale: 'zh_CN' })}>
          <Tag icon={<ClockCircleOutlined />} color="blue">{text}</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Dify API',
      dataIndex: 'difyApiUrl',
      key: 'difyApiUrl',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Tag icon={<ApiOutlined />} color="purple">{new URL(text).hostname}</Tag>
        </Tooltip>
      ),
    },
    {
      title: '上次运行',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (text: string) => text || '-',
    },
    {
      title: '下次运行',
      dataIndex: 'nextRun',
      key: 'nextRun',
      render: (text: string) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Task) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          <Button 
            type="text" 
            icon={record.active ? <PauseCircleOutlined /> : <PlayCircleOutlined />} 
            onClick={() => toggleTaskStatus(record.id, !record.active)}
          />
          <Button 
            type="text" 
            icon={<PlayCircleOutlined />} 
            disabled={!record.active}
            onClick={() => runTask(record)}
          />
          <Popconfirm
            title="确定要删除此任务吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>任务管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showCreateModal}
          >
            创建任务
          </Button>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={tasks} 
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingTask ? '编辑任务' : '创建任务'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ active: true }}
        >
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="输入任务名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="任务描述"
          >
            <Input.TextArea placeholder="输入任务描述" rows={2} />
          </Form.Item>
          
          <Form.Item
            name="cronExpression"
            label={
              <Space>
                <span>Cron 表达式</span>
                <Tooltip title="Cron表达式格式: 分 时 日 月 周, 例如: 0 8 * * * 表示每天早上8点">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
            rules={[{ required: true, message: '请输入Cron表达式' }]}
          >
            <Input placeholder="例如: 0 8 * * * (每天早上8点)" />
          </Form.Item>
          
          <Form.Item
            name="difyApiUrl"
            label="Dify API URL"
            rules={[{ required: true, message: '请输入Dify API URL' }]}
          >
            <Input 
              prefix={<ApiOutlined />} 
              placeholder="例如: http://127.0.0.1" 
            />
          </Form.Item>
          
          <Form.Item
            name="difyApiKey"
            label="Dify API Key"
            rules={[{ required: true, message: '请输入Dify API Key' }]}
          >
            <Input.Password 
              prefix={<KeyOutlined />} 
              placeholder="例如: Bearer app-s1LO3fgBHF0vJc0l9wbmutn8" 
            />
          </Form.Item>
          
          <Form.Item
            name="systemPrompt"
            label="系统提示词"
          >
            <TextArea 
              placeholder="设置AI助手的角色和行为" 
              rows={3}
            />
          </Form.Item>
          
          <Form.Item
            name="query"
            label="查询内容"
            rules={[{ required: true, message: '请输入查询内容' }]}
          >
            <TextArea 
              placeholder="输入要发送给AI的查询内容" 
              rows={3}
            />
          </Form.Item>
          
          <Form.Item
            name="active"
            label="启用任务"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskManagement; 