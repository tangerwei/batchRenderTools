import React, { useCallback, useEffect } from 'react';
import { Breadcrumb, Card, Form, Button, Radio } from 'antd';
import { Link } from 'react-router-dom';
import ImageUpload from './components/ImageUpload';
import './style.less';
import ApiKeyInput from './components/ApiKeyInput';
import apiTestDB from './db';

interface FormValues {
  apiUrl: string;
  params?: string;
  imageIdList?: string[];
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

const AidTest: React.FC = () => {
  const [form] = Form.useForm<FormValues>();

  const initForm = useCallback(async () => {
    try {
      // 获取所有已保存的图片ID
      const imageIds = await apiTestDB.getAllImageIds();
      console.log(imageIds)
      // 更新表单
      form.setFieldsValue({
        imageIdList: imageIds
      });
    } catch (error) {
      console.error('Failed to initialize form:', error);
    }
  }, [form])

  useEffect(() => {
    initForm();
  }, [initForm]);

  const onFinish = (values: FormValues) => {
    console.log('Form values:', {
      ...values
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
            initialValue={API_ENDPOINTS.STG}
          >
            <Radio.Group>
              <Radio.Button value={API_ENDPOINTS.STG}>KainoAI STG</Radio.Button>
              <Radio.Button value={API_ENDPOINTS.PROD}>KainoAI</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <ApiKeyInput form={form} />
          <Form.Item
            label="上传图片"
            name="imageIdList"
          >
            <ImageUpload />
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
