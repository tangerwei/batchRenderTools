import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Button, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useWatch } from "antd/es/form/Form";
import type { FormInstance } from "antd";
import { filter, from } from "rxjs";
import apiTestDB from "../db";
import OptionsListener from "./OptionsListener";

interface ApiKeyInputProps {
  form: FormInstance;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ form }) => {
  const [loading, setLoading] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<string>();

  const apiUrl = useWatch("apiUrl", form);
  const apiKey = useWatch("apiKey", form);
  const cachedApiKey = useWatch("cachedApiKey", form);

  const handleLoadApiKey = useCallback(async () => {
    try {
      setLoading(true);
      const apiKey = form.getFieldValue("apiKey");

      if (!apiKey) {
        message.error("请输入API Key");
        return;
      }
      setCurrentApiKey(apiKey);
    } catch (error) {
      message.error("API Key 加载失败");
      console.error("Load API Key error:", error);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    if (apiUrl) {
      const subscription = from(apiTestDB.getApiKeyByUrl(apiUrl))
        .pipe(filter((apiKey) => {
          if(!apiKey){
            form.setFieldsValue({ apiKey: "" });
          }
          return !!apiKey
        }))
        .subscribe((apiKey) => {
          form.setFieldsValue({ apiKey });
          if (apiKey) {
            setCurrentApiKey(apiKey);
          }
        });
      return () => subscription.unsubscribe();
    }
  }, [apiUrl, form]);

  useEffect(() => {
    const shouldAutoLoad = () => {
      if (!cachedApiKey || cachedApiKey.trim() === "") return false;
      if (!apiKey) return false;
      return apiKey.length === cachedApiKey.length;
    };
    if (shouldAutoLoad()) {
      handleLoadApiKey();
    }
  }, [apiKey, cachedApiKey, handleLoadApiKey]);

  return (
    <div>
      <Form.Item
        label="API Key"
        name="apiKey"
        rules={[{ required: true, message: "请输入API Key" }]}
      >
        <Input
            placeholder="请输入API Key"
            addonAfter={
              <Button
                onClick={handleLoadApiKey}
                loading={loading}
                disabled={!apiKey || apiKey === cachedApiKey}
                icon={loading ? <LoadingOutlined /> : null}
              >
                加载
              </Button>
            }
          />
      </Form.Item>
      <Form.Item name="cachedApiKey" hidden>
        <Input />
      </Form.Item>
      <OptionsListener form={form} apiKey={currentApiKey} />
    </div>
  );
};

export default ApiKeyInput;
