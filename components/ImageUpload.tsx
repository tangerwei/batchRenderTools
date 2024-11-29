import React from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

interface ImageUploadProps {
  fileList: UploadFile[];
  onChange: (fileList: UploadFile[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ fileList, onChange }) => {
  const handleBeforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片必须小于2MB!');
      return false;
    }
    return true;
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    onChange(newFileList);
  };

  return (
    <Upload
      listType="picture"
      fileList={fileList}
      onChange={handleChange}
      beforeUpload={handleBeforeUpload}
      multiple={true}
      customRequest={({ onSuccess }) => {
        if (onSuccess) {
          onSuccess("ok");
        }
      }}
    >
      <Button icon={<UploadOutlined />}>点击上传图片</Button>
    </Upload>
  );
};

export default ImageUpload;
