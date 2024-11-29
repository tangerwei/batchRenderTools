import React, { useState } from 'react';
import { Breadcrumb, Card, Form, Input, Button, message, Space, Radio } from 'antd';
import { Link } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { RadioChangeEvent } from 'antd/es/radio';
import ImageUpload from './components/ImageUpload';
import './style.less';

interface FormValues {
  apiUrl: string;
  params?: string;
  images?: UploadFile[];
  apiKey: string;  // 确保这里有 apiKey 字段
}

const API_ENDPOINTS = {
  PROD: 'https://www.kainoai.com/api/open/v1',
  STG: 'https://ai.stream-svc.com/api/open/v1'
} as const;

const breadcrumbItems = [
  {
    title: <Link to="/">首页</Link>,
  },
  {
    title: 'AID API 测试',
  },
];

type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];

const AidTest: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApi, setSelectedApi] = useState<ApiEndpoint>(API_ENDPOINTS.PROD);

  const handleApiChange = (e: RadioChangeEvent) => {
    setSelectedApi(e.target.value);
    handleApiEndpointChange();
  };

  const handleApiEndpointChange = () => {
    // TODO: 处理API地址改变的效果
  };

  const handleLoadApiKey = async () => {
    try {
      setLoading(true);
      const apiKey = form.getFieldValue('apiKey');  // 这里使用的字段名必须和 Form.Item 的 name 属性匹配
      
      if (!apiKey) {
        message.error('请输入API Key');
        return;
      }

      message.success('API Key 加载成功');
    } catch (error) {
      message.error('API Key 加载失败');
      console.error('Load API Key error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (newFileList: UploadFile[]) => {
    setFileList(newFileList);
    form.setFieldsValue({ images: newFileList });
  };

  const onFinish = (values: FormValues) => {
    console.log('Form values:', {
      ...values,
      fileList
    });
  };

  return (
    <div className="aid-test-container page-container">
      <div>
        <Breadcrumb items={breadcrumbItems} className="breadcrumb-container" />
      </div>

      <Card title="AID API 测试">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="API 地址"
            name="apiUrl"
            initialValue={API_ENDPOINTS.PROD}
          >
            <Radio.Group onChange={handleApiChange} value={selectedApi}>
              <Radio.Button value={API_ENDPOINTS.PROD}>KainoAI</Radio.Button>
              <Radio.Button value={API_ENDPOINTS.STG}>KainoAI STG</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="API Key"
            name="apiKey"
            rules={[{ required: true, message: '请输入API Key' }]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Input 
                placeholder="请输入API Key" 
                type="password"
              />
              <Button 
                onClick={handleLoadApiKey}
                loading={loading}
                icon={loading ? <LoadingOutlined /> : null}
              >
                加载
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            label="请求参数"
            name="params"
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入JSON格式的请求参数"
            />
          </Form.Item>

          <Form.Item
            label="上传图片"
            name="images"
            valuePropName="fileList"
          >
            <ImageUpload 
              fileList={fileList}
              onChange={handleImageChange}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="submit-button">
              发送请求
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AidTest;
