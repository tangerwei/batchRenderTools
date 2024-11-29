import React, { useEffect } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import { from, Subject } from "rxjs";
import { debounceTime, filter, map, switchMap } from "rxjs/operators";
import apiTestDB from "../db";
import ImagePreview from './ImagePreview';

interface ImageUploadProps {
  value?: string[];
  onChange?: (imageIds: string[]) => void;
}

const uploadSubject = new Subject<UploadProps["fileList"]>();

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value }) => {
  const handleBeforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("只能上传图片文件!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("图片必须小于2MB!");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const subscription = uploadSubject
      .pipe(debounceTime(300))
      .pipe(
        filter(
          (fileList): fileList is UploadFile<File>[] => fileList !== undefined
        ),
        map((fileList) => fileList.map((file) => file.originFileObj as File)),
        switchMap((fileList) => from(apiTestDB.batchSaveImages(fileList)))
      )
      .subscribe({
        next: (imageIds) => {
          console.log("Images saved with IDs:", imageIds);
          onChange?.(imageIds);
        },
        error: (error) => {
          console.error("Error saving images:", error);
        },
      });

    return () => subscription.unsubscribe();
  }, [onChange]);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    uploadSubject.next(newFileList);
  };

  return (
    <div>
      <Upload
        listType="picture"
        onChange={handleChange}
        beforeUpload={handleBeforeUpload}
        multiple={true}
        showUploadList={false}
        customRequest={({ onSuccess }) => {
          if (onSuccess) {
            onSuccess("ok", undefined);
          }
        }}
      >
        <Button icon={<UploadOutlined />}>点击上传图片</Button>
      </Upload>
      <ImagePreview imageIdList={value} />
    </div>
  );
};

export default ImageUpload;
