import React, { useEffect, useState } from "react";
import type { FormInstance } from "antd";
import { filter, from, catchError, EMPTY } from "rxjs";
import { message, Form, Checkbox, Spin, Row, Col } from "antd";
import { parseApiResponse } from "@/tools/api";
import apiTestDB from '../db';
import "./OptionsListener.less";

interface OptionsListenerProps {
  form: FormInstance;
  apiKey?: string;
}

interface OptionItem {
  label: string;
  value: string;
}

const OptionsListener: React.FC<OptionsListenerProps> = ({ form, apiKey }) => {
  const [styleOptions, setStyleOptoins] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (apiKey) {
      const apiUrl = form.getFieldValue("apiUrl");
      setLoading(true);
      const subscription = from(
        fetch(`${apiUrl}/sd_params/options/style`, {
          headers: {
            "aid-api-key": apiKey,
          },
        })
      )
        .pipe(
          filter(
            (styleResponse) => styleResponse.ok
          ),
          catchError((error) => {
            message.error("获取选项失败");
            console.error("Fetch options error:", error);
            return EMPTY;
          })
        )
        .subscribe(async (styleResponse) => {
          const styleJson = await styleResponse.json();

          // 使用 parseApiResponse 解析数据并简化选项
          try {
            const styleOptions = parseApiResponse<OptionItem[]>(styleJson);
            setStyleOptoins(styleOptions);

            await apiTestDB.setApiKeyByUrl(apiUrl, apiKey);
            form.setFieldValue("cachedApiKey", apiKey)
          } finally {
            setLoading(false);
          }
        });
      return () => subscription.unsubscribe();
    }
  }, [apiKey, form]);

  return (
    <div className="loader-container">
      {loading && (
        <div className="loading-overlay">
          <Spin size="large" />
        </div>
      )}

      <Form.Item
        label="风格类型"
        name="style"
        rules={[{ required: true, message: "请选择风格类型" }]}
        hidden={styleOptions.length < 1}
      >
        <Checkbox.Group>
          <Row gutter={[16, 16]}>
            {styleOptions.map((option) => (
              <Col span={6} key={option.value}>
                <Checkbox value={option.value}>{option.label}</Checkbox>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Form.Item>
    </div>
  );
};

export default OptionsListener;
