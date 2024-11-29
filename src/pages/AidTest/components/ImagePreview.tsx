import React, { useEffect, useState, useRef, useCallback } from "react";
import { Image, Row, Col, Button, Space } from "antd";
import apiTestDB from "../db";
import { debounceTime, Subject } from "rxjs";
import { DeleteOutlined } from "@ant-design/icons";
import RoomTypeSelect from "@/pages/AidTest/components/RoomType";
import { useWatch } from "antd/es/form/Form";

interface ImagePreviewProps {
  imageIdList?: string[];
}

const loadImage$ = new Subject<string[]>();

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageIdList = [] }) => {
  const [imageUrls, setImageUrls] = useState<{ id: string, url: string; title: string, roomType: string }[]>(
    []
  );
  const urlsRef = useRef<string[]>([]);

  const loadImages = useCallback(async (imageIdList: string[]) => {
    if (imageIdList.length < 1 || !imageIdList) {
      setImageUrls([]);
    }
    const images = await apiTestDB.getImagesForPreview(imageIdList);
    const urls = images.map((img) => {
      const url = URL.createObjectURL(img.blob);
      urlsRef.current.push(url);
      return {
        url,
        title: img.title,
        id: img.id,
        roomType: img.roomeType
      };
    });
    setImageUrls(urls);
  }, []);

  useEffect(() => {
    const subscription = loadImage$
      .pipe(debounceTime(300))
      .subscribe((imageIdList: string[]) => {
        loadImages(imageIdList);
      });

    return () => subscription.unsubscribe();
  }, [loadImages]);

  useEffect(() => {
    loadImage$.next(imageIdList);
  }, [imageIdList]);

  const handleDelete = useCallback((index: number) => {
    const image = imageUrls[index];
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    apiTestDB.deleteById(image.id)
  }, [imageUrls])

  const handleTypeChange = useCallback((index: number, roomType: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index].roomType = roomType;
    setImageUrls(newImageUrls);
    apiTestDB.updateImageType(newImageUrls[index].id, roomType)
  }, [imageUrls])

  const apiUrl = useWatch("apiUrl");
  const apiKey = useWatch("cachedApiKey")

  if (imageUrls.length === 0) {
    return null;
  }

  return (
    <Image.PreviewGroup>
      <Row gutter={[20, 20]}>
        {imageUrls.map((image, index) => (
          <Col key={index} span={8}>
            <Row align="middle" gutter={12}>
              <Col>
                <Image
                  src={image.url}
                  title={image.title}
                  width={200}
                  style={{ marginBottom: 8 }}
                />
              </Col>
              <Col flex="1">
                <Space size="small" direction="vertical">
                  <RoomTypeSelect
                    style={{ width: 200 }}
                    defaultValue="normal"
                    value={image.roomType}
                    onChange={(value: string) => handleTypeChange(index, value)}
                    apiUrl={apiUrl}
                    apiKey={apiKey}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(index)}
                  >
                    删除
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
        ))}
      </Row>
    </Image.PreviewGroup>
  );
};

export default ImagePreview;
