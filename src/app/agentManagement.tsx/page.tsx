'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Select, 
  Input, 
  Button, 
  Table, 
  Tag, 
  Divider, 
  Form,
  Row,
  Col,
  Tooltip
} from 'antd';
import { PlusOutlined, LineChartOutlined, WarningOutlined, InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Mock data - would be replaced with real API calls
const MOCK_HOSTS = [
  { value: '192.168.1.100', label: 'Web Server (192.168.1.100)' },
  { value: '192.168.1.101', label: 'Database Server (192.168.1.101)' },
  { value: '192.168.1.102', label: 'Application Server (192.168.1.102)' },
  { value: '192.168.1.103', label: 'Cache Server (192.168.1.103)' },
];

const MOCK_METRICS = [
  { value: 'cpu_usage', label: 'CPU Usage (%)' },
  { value: 'memory_usage', label: 'Memory Usage (%)' },
  { value: 'disk_usage', label: 'Disk Usage (%)' },
  { value: 'network_in', label: 'Network In (Mbps)' },
  { value: 'network_out', label: 'Network Out (Mbps)' },
  { value: 'iops', label: 'IOPS' },
];

interface TrendRule {
  id: string;
  hostIp: string;
  metricName: string;
  ruleDescription: string;
  status: 'active' | 'triggered' | 'disabled';
  createdAt: string;
}

// Sample rules
const MOCK_RULES: TrendRule[] = [
  {
    id: '1',
    hostIp: '192.168.1.100',
    metricName: 'cpu_usage',
    ruleDescription: '如果CPU使用率在未来30分钟内预计超过90%，发送告警',
    status: 'active',
    createdAt: '2023-03-24 10:30:00',
  },
  {
    id: '2',
    hostIp: '192.168.1.101',
    metricName: 'memory_usage',
    ruleDescription: '如果内存使用量在1小时内呈指数增长趋势，发送告警',
    status: 'triggered',
    createdAt: '2023-03-23 15:45:00',
  },
];

const TrendAlertsPage = () => {
  const [form] = Form.useForm();
  const [rules, setRules] = useState<TrendRule[]>(MOCK_RULES);
  
  // Form handling
  const handleAddRule = (values: any) => {
    const newRule: TrendRule = {
      id: Date.now().toString(),
      hostIp: values.hostIp,
      metricName: values.metricName,
      ruleDescription: values.ruleDescription,
      status: 'active',
      createdAt: new Date().toLocaleString(),
    };
    
    setRules([...rules, newRule]);
    form.resetFields();
  };
  
  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };
  
  const columns: ColumnsType<TrendRule> = [
    {
      title: '主机IP',
      dataIndex: 'hostIp',
      key: 'hostIp',
      render: (ip) => {
        const host = MOCK_HOSTS.find(h => h.value === ip);
        return host ? host.label : ip;
      }
    },
    {
      title: '指标名称',
      dataIndex: 'metricName',
      key: 'metricName',
      render: (metric) => {
        const metricObj = MOCK_METRICS.find(m => m.value === metric);
        return metricObj ? metricObj.label : metric;
      }
    },
    {
      title: '趋势预测规则',
      dataIndex: 'ruleDescription',
      key: 'ruleDescription',
      width: '35%',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        let text = '活跃';
        
        if (status === 'triggered') {
          color = 'red';
          text = '已触发';
        } else if (status === 'disabled') {
          color = 'gray';
          text = '已禁用';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<LineChartOutlined />} 
            title="查看趋势"
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            title="删除规则"
            onClick={() => handleDeleteRule(record.id)}
          />
        </Space>
      )
    },
  ];

  return (
    <div className="trend-alerts-container">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={4}>
            <Space>
              <WarningOutlined />
              趋势预警
            </Space>
          </Title>
          <Text type="secondary">
            基于Zabbix监控指标的趋势变化进行预测和预警，通过自然语言描述预警规则
          </Text>
          
          <Divider />
          
          <Form
            form={form}
            name="trend_alert_form"
            layout="vertical"
            onFinish={handleAddRule}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="hostIp"
                  label="选择主机"
                  rules={[{ required: true, message: '请选择主机' }]}
                >
                  <Select 
                    placeholder="选择需要监控的主机" 
                    showSearch
                    optionFilterProp="label"
                  >
                    {MOCK_HOSTS.map(host => (
                      <Option key={host.value} value={host.value} label={host.label}>
                        {host.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="metricName"
                  label="选择指标"
                  rules={[{ required: true, message: '请选择指标' }]}
                >
                  <Select 
                    placeholder="选择需要监控的指标" 
                    showSearch
                    optionFilterProp="label"
                  >
                    {MOCK_METRICS.map(metric => (
                      <Option key={metric.value} value={metric.value} label={metric.label}>
                        {metric.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="ruleDescription"
                  label={
                    <Space>
                      <span>趋势预测规则</span>
                      <Tooltip title="使用自然语言描述预警规则，例如：如果CPU使用率在未来30分钟内预计超过90%，发送告警">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  rules={[{ required: true, message: '请输入趋势预测规则描述' }]}
                >
                  <TextArea
                    placeholder="使用自然语言描述预警规则，例如：如果CPU使用率在未来30分钟内预计超过90%，发送告警"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                添加规则
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Title level={4}>
            <Space>
              <LineChartOutlined />
              趋势预警规则列表
            </Space>
          </Title>
          
          <Table
            columns={columns}
            dataSource={rules}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default TrendAlertsPage; 