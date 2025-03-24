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
  QuestionCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useTheme } from '@/lib/theme/theme.context';
import cronstrue from 'cronstrue';
import MarkdownRenderer from '@/components/features/markdown/MarkdownRenderer';

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
  result?: string;
}

// 定义任务历史记录类型
interface TaskHistory {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  status: 'success' | 'failed' | 'running';
  result?: string;
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
  {
    id: '3',
    name: '磁盘SMART巡检',
    description: '每天凌晨00:05检查所有磁盘的SMART健康状态',
    cronExpression: '5 0 * * *',
    difyApiUrl: 'http://127.0.0.1',
    difyApiKey: 'Bearer app-s1LO3fgBHF0vJc0l9wbmutn8',
    systemPrompt: '你是一个系统运维专家，专注于硬件健康监控和故障预测',
    query: `请分析以下磁盘SMART数据，识别潜在问题并提供建议：
    
磁盘1: /dev/sda
型号: Samsung SSD 860 EVO 500GB
健康状态: PASSED
温度: 38°C
通电时间: 8760小时
重分配扇区数: 0
等待重分配扇区数: 0
无法修正的扇区数: 0

磁盘2: /dev/sdb
型号: WD Blue 2TB
健康状态: PASSED
温度: 42°C
通电时间: 15340小时
重分配扇区数: 2
等待重分配扇区数: 0
无法修正的扇区数: 0

磁盘3: /dev/sdc
型号: Seagate Barracuda 4TB
健康状态: WARNING
温度: 45°C
通电时间: 26280小时
重分配扇区数: 12
等待重分配扇区数: 4
无法修正的扇区数: 0

请提供每个磁盘的健康评估，并对有潜在问题的磁盘给出具体建议。`,
    active: true,
    lastRun: '2023-06-01 00:05:00',
    nextRun: '2023-06-02 00:05:00',
    result: `# 磁盘SMART健康状态分析报告

## 磁盘1: /dev/sda (Samsung SSD 860 EVO 500GB)
**健康状态: 良好**
- 温度正常 (38°C)，在SSD的理想工作温度范围内
- 无重分配扇区，表明闪存单元健康
- 无等待重分配或无法修正的扇区
- 通电时间约1年，对SSD来说属于正常使用寿命范围

**建议**: 继续正常使用，无需采取任何措施。

## 磁盘2: /dev/sdb (WD Blue 2TB)
**健康状态: 良好，需要监控**
- 温度正常 (42°C)，在机械硬盘的安全工作范围内
- 有2个重分配扇区，数量较少，暂不构成严重问题
- 无等待重分配或无法修正的扇区
- 通电时间约1.75年，属于正常使用寿命范围

**建议**: 
- 继续使用，但建议定期备份重要数据
- 密切监控重分配扇区数量的变化趋势，如果短期内快速增加，应考虑更换硬盘

## 磁盘3: /dev/sdc (Seagate Barracuda 4TB)
**健康状态: 警告，需要注意**
- 温度偏高 (45°C)，虽然仍在安全范围内，但接近上限
- 12个重分配扇区，数量明显增加，表明磁盘表面可能存在物理损伤
- 4个等待重分配扇区，表明有更多扇区可能即将失效
- 通电时间约3年，使用时间较长

**建议**:
- 立即备份此磁盘上的所有重要数据
- 考虑改善系统散热，降低磁盘工作温度
- 运行完整的磁盘表面扫描，标记并隔离坏扇区
- 密切监控状态变化，如果重分配扇区或等待重分配扇区数量继续增加，建议尽快更换硬盘
- 考虑在未来3-6个月内计划更换此硬盘

## 总体建议
1. 建立定期备份策略，确保重要数据至少有一份额外备份
2. 每月检查一次所有磁盘的SMART状态，特别关注/dev/sdc
3. 检查服务器散热系统，确保通风良好
4. 为/dev/sdc磁盘上的数据制定迁移计划`,
  },
];

// 模拟任务历史数据
const initialTaskHistory: TaskHistory[] = [
  {
    id: '101',
    taskId: '3', // 磁盘SMART巡检任务
    startTime: '2023-06-01 00:05:00',
    endTime: '2023-06-01 00:05:42',
    status: 'success',
    result: initialTasks.find(t => t.id === '3')?.result,
  },
  {
    id: '102',
    taskId: '3',
    startTime: '2023-05-31 00:05:00',
    endTime: '2023-05-31 00:05:38',
    status: 'success',
  },
  {
    id: '103',
    taskId: '3',
    startTime: '2023-05-30 00:05:00',
    endTime: '2023-05-30 00:05:45',
    status: 'success',
  },
  {
    id: '104',
    taskId: '1', // 每日数据分析任务
    startTime: '2023-06-01 08:00:00',
    endTime: '2023-06-01 08:01:12',
    status: 'success',
  },
  {
    id: '105',
    taskId: '1',
    startTime: '2023-05-31 08:00:00',
    endTime: '2023-05-31 08:01:05',
    status: 'failed',
  },
];

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form] = Form.useForm();
  const { themeMode } = useTheme();
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [currentResult, setCurrentResult] = useState<string>('');
  const [currentTaskName, setCurrentTaskName] = useState<string>('');
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>(initialTaskHistory);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string>('');
  const [currentTaskHistory, setCurrentTaskHistory] = useState<TaskHistory[]>([]);

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

  // 查看任务结果
  const viewTaskResult = (task: Task) => {
    setCurrentTaskName(task.name);
    setCurrentResult(task.result || '暂无结果');
    setResultModalVisible(true);
  };

  // 查看任务历史
  const viewTaskHistory = (taskId: string) => {
    setCurrentTaskId(taskId);
    const history = taskHistory.filter(h => h.taskId === taskId);
    setCurrentTaskHistory(history);
    setHistoryModalVisible(true);
  };

  // 查看历史记录的结果
  const viewHistoryResult = (history: TaskHistory) => {
    setCurrentTaskName(`历史记录 - ${history.startTime}`);
    setCurrentResult(history.result || '暂无结果');
    setResultModalVisible(true);
  };

  // 手动运行任务
  const runTask = (task: Task) => {
    message.loading(`正在运行任务: ${task.name}`);
    
    // 创建一个新的运行中的历史记录
    const now = new Date();
    const startTime = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const newHistoryId = `history-${Date.now()}`;
    const newHistory: TaskHistory = {
      id: newHistoryId,
      taskId: task.id,
      startTime: startTime,
      endTime: '',
      status: 'running',
    };
    
    // 添加到历史记录
    setTaskHistory([newHistory, ...taskHistory]);
    
    // 模拟API调用
    setTimeout(() => {
      // 生成模拟结果
      let simulatedResult = '';
      if (task.name === '磁盘SMART巡检') {
        simulatedResult = initialTasks.find(t => t.id === '3')?.result || '';
      } else {
        simulatedResult = `# ${task.name} 执行结果\n\n任务已成功执行，生成的分析报告如下：\n\n## 主要发现\n- 发现点1\n- 发现点2\n- 发现点3\n\n## 详细分析\n这里是详细的分析内容...`;
      }
      
      // 更新任务的最后运行时间和结果
      setTasks(
        tasks.map(t => 
          t.id === task.id 
            ? { 
                ...t, 
                lastRun: startTime,
                result: simulatedResult
              } 
            : t
        )
      );
      
      // 更新历史记录状态为完成
      const endTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      setTaskHistory(
        taskHistory.map(h => 
          h.id === newHistoryId 
            ? { 
                ...h, 
                endTime: endTime,
                status: 'success',
                result: simulatedResult
              } 
            : h
        )
      );
      
      message.success(`任务 ${task.name} 已成功运行`);
      
      // 如果当前正在查看该任务的历史，更新显示
      if (currentTaskId === task.id) {
        setCurrentTaskHistory(
          taskHistory
            .filter(h => h.taskId === task.id)
            .map(h => 
              h.id === newHistoryId 
                ? { 
                    ...h, 
                    endTime: endTime,
                    status: 'success',
                    result: simulatedResult
                  } 
                : h
            )
        );
      }
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
      fixed: 'right',
      width: 250,
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
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => viewTaskResult(record)}
            disabled={!record.result}
          />
          <Button
            type="text"
            icon={<HistoryOutlined />}
            onClick={() => viewTaskHistory(record.id)}
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

  // 历史记录表格列定义
  const historyColumns = [
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'success') {
          return <Tag icon={<CheckCircleOutlined />} color="success">成功</Tag>;
        } else if (status === 'failed') {
          return <Tag icon={<CloseCircleOutlined />} color="error">失败</Tag>;
        } else {
          return <Tag icon={<ClockCircleOutlined />} color="processing">运行中</Tag>;
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TaskHistory) => (
        <Button
          type="link"
          onClick={() => viewHistoryResult(record)}
          disabled={!record.result}
        >
          查看结果
        </Button>
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
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
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
                <Tooltip title={
                  <div>
                    <p>Cron表达式格式: 分 时 日 月 周</p>
                    <p>常用示例:</p>
                    <ul style={{ paddingLeft: '20px', marginBottom: '5px' }}>
                      <li><code>0 8 * * *</code> - 每天早上8点</li>
                      <li><code>0 0 * * *</code> - 每天午夜0点</li>
                      <li><code>*/10 * * * *</code> - 每10分钟执行一次</li>
                      <li><code>0 */2 * * *</code> - 每2小时执行一次</li>
                      <li><code>0 9-18 * * 1-5</code> - 工作日上午9点到下午6点，每小时执行一次</li>
                      <li><code>0 0 * * 0</code> - 每周日午夜执行</li>
                      <li><code>0 12 1 * *</code> - 每月1日中午12点执行</li>
                      <li><code>30 4 1,15 * *</code> - 每月1日和15日的4:30执行</li>
                      <li><code>0 0 1 1 *</code> - 每年1月1日午夜执行</li>
                      <li><code>0 0,12 * * *</code> - 每天午夜和中午12点执行</li>
                      <li><code>0 15 10 * * 1-5</code> - 工作日上午10:15执行</li>
                      <li><code>0 0 1-7 * 1</code> - 每月第一个星期一执行</li>
                    </ul>
                  </div>
                }>
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

      {/* 结果查看模态框 */}
      <Modal
        title={`${currentTaskName} - 执行结果`}
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setResultModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          <MarkdownRenderer content={currentResult} />
        </div>
      </Modal>
      
      {/* 历史记录模态框 */}
      <Modal
        title={`任务历史记录 - ${tasks.find(t => t.id === currentTaskId)?.name || ''}`}
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <Table
          columns={historyColumns}
          dataSource={currentTaskHistory}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 600 }}
        />
      </Modal>
    </div>
  );
};

export default TaskManagement; 