import React from 'react';
import { Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import './style.less';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'AID API 测试',
      description: 'AID API 接口测试工具',
      path: '/aid-test'
    }
  ];

  return (
    <div className="home-container page-container">
      <Row gutter={[16, 16]}>
        {features.map((feature, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              title={feature.title}
              onClick={() => navigate(feature.path)}
            >
              {feature.description}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
