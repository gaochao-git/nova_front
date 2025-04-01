'use client';

import React, { useState } from 'react';
import { Typography, Form, Input, Button, Upload, Select, Card, Divider, message } from 'antd';
import { UploadOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateAgentPage: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Categories for the agent
  const agentCategories = [
    { key: 'troubleshooting', name: '故障排查' },
    { key: 'log_analysis', name: '日志分析' },
    { key: 'code', name: '代码' },
    { key: 'security_audit', name: '安全审计' },
    { key: 'other', name: '其他' },
  ];

  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Form values:', values);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success('智能体创建成功！');
      router.push('/agent'); // Redirect back to agent list page
    }, 1500);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        style={{ marginBottom: '24px' }}
        onClick={() => router.push('/agent')}
      >
        返回智能体列表
      </Button>
      
      <Title level={2}>创建新智能体</Title>
      <Paragraph style={{ marginBottom: '24px' }}>
        定制您自己的智能体，让它成为您的得力助手
      </Paragraph>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ categories: ['other'] }}
        >
          <Form.Item
            name="name"
            label="智能体名称"
            rules={[{ required: true, message: '请输入智能体名称' }]}
          >
            <Input placeholder="给您的智能体起个名字" />
          </Form.Item>
          
          <Form.Item
            name="avatar"
            label="智能体头像"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="智能体描述"
            rules={[{ required: true, message: '请输入智能体描述' }]}
          >
            <TextArea 
              placeholder="描述这个智能体的功能和特点" 
              rows={4} 
            />
          </Form.Item>
          
          <Form.Item
            name="categories"
            label="分类"
            rules={[{ required: true, message: '请选择至少一个分类' }]}
          >
            <Select mode="multiple" placeholder="选择分类">
              {agentCategories.map(category => (
                <Option key={category.key} value={category.key}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Divider />
          
          <Form.Item
            name="instructions"
            label="智能体指令"
            rules={[{ required: true, message: '请输入智能体指令' }]}
          >
            <TextArea 
              placeholder="输入详细的指令，告诉智能体应该如何工作" 
              rows={6} 
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ 
                borderRadius: '20px',
                background: '#6366f1',
                width: '100%',
                height: '40px'
              }}
            >
              创建智能体
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateAgentPage;