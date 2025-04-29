import React, { useState } from 'react';
import { Input, Form, Button, Checkbox, Dropdown, Space, Card, Typography, Row, Col, Divider } from 'antd';
import { 
    SearchOutlined, 
    ReadOutlined, 
    BookOutlined, 
    TeamOutlined, 
    SolutionOutlined, 
    BankOutlined, 
    ExperimentOutlined,
    TrophyOutlined,
    UserOutlined,
    AppstoreOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './home.css';

const { Search } = Input;
const { Title, Text } = Typography;
const CheckboxGroup = Checkbox.Group;

const plainOptions = [
    { label: 'Chinese Language Education', value: 'Chinese Language Education' },
    { label: 'English Language Education', value: 'English Language Education' },
    { label: 'Mathematics Education', value: 'Mathematics Education' },
    { label: 'Science Education', value: 'Science Education' },
    { label: 'Social and Humanistic Education', value: 'Social and Humanistic Education' },
    { label: 'Physical Education', value: 'Physical Education' },
    { label: 'Arts and Humanities', value: 'Arts and Humanities' },
    { label: 'History', value: 'History' },
    { label: 'Business and Communication', value: 'Business and Communication' },
    { label: 'Career and Technical Education', value: 'Career and Technical Education' },
    { label: 'General Studies', value: 'General Studies' },
];

const educationLevels = [
    { 
        name: 'Preschool', 
        icon: <SafetyCertificateOutlined />,
        description: 'Early childhood education (ages 3-5)'
    },
    { 
        name: 'Lower Primary', 
        icon: <BookOutlined />,
        description: 'Grades 1-3 (ages 6-8)'
    },
    { 
        name: 'Upper Primary', 
        icon: <ReadOutlined />,
        description: 'Grades 4-6 (ages 9-11)'
    },
    { 
        name: 'Middle School', 
        icon: <TeamOutlined />,
        description: 'Grades 7-9 (ages 12-14)'
    },
    { 
        name: 'High School', 
        icon: <SolutionOutlined />,
        description: 'Grades 10-12 (ages 15-18)'
    },
    { 
        name: 'Community College/Lower Division', 
        icon: <BankOutlined />,
        description: '2-year programs and associate degrees'
    },
    { 
        name: 'College/Upper Division', 
        icon: <ExperimentOutlined />,
        description: 'Undergraduate and graduate programs'
    },
    { 
        name: 'Career/Technical', 
        icon: <TrophyOutlined />,
        description: 'Career and technical education'
    }
];

const Home = () => {
    const [checkedList, setCheckedList] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('');
    const navigate = useNavigate();

    const onSearch = (value) => {
        const filters = {
            keyword: value,
            subjects: checkedList,
            educationLevel: selectedLevel,
        };
        navigate('/searchResult', { state: filters });
    };

    const onChange = (list) => {
        setCheckedList(list);
    };

    const handleMenuClick = (e) => {
        setSelectedLevel(e.key);
    };

    const items = educationLevels.map(level => ({
        label: (
            <Space>
                {level.icon}
                <div>
                    <div>{level.name}</div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{level.description}</Text>
                </div>
            </Space>
        ),
        key: level.name
    }));

    const menuProps = {
        items,
        onClick: handleMenuClick,
    };

    const selectedLevelData = educationLevels.find(level => level.name === selectedLevel);

    return (
        <div className="home-container">

            <Card className="search-card" hoverable>
                <Form layout="vertical">
                    <Form.Item label={<Text strong>Search Educational Resources</Text>}>
                        <Search
                            placeholder="Try 'fractions lesson plan' or 'world history worksheets'"
                            enterButton={
                                <Button type="primary" icon={<SearchOutlined />}>
                                    Find Resources
                                </Button>
                            }
                            size="large"
                            onSearch={onSearch}
                        />
                    </Form.Item>

                    <Row gutter={[24, 16]}>
                        <Col span={24} md={16}>
                            <Form.Item label={<Text strong>Filter by Subject Area :</Text>}>
                                <CheckboxGroup
                                    options={plainOptions}
                                    value={checkedList}
                                    onChange={onChange}
                                    className="checkbox-group"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24} md={8}>
                            <Form.Item label={<Text strong>Education Level :</Text>}>
                                <Dropdown menu={menuProps} trigger={['click']}>
                                    <Button block size="large">
                                        <Space>
                                            {selectedLevelData ? (
                                                <>
                                                    {selectedLevelData.icon}
                                                    {selectedLevelData.name}
                                                </>
                                            ) : (
                                                'Select education level'
                                            )}
                                            
                                        </Space>
                                    </Button>
                                </Dropdown>
                                {selectedLevelData && (
                                    <Text type="secondary" className="selected-level">
                                        {selectedLevelData.description}
                                    </Text>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Divider />

            <div className="features-section">
                <Title level={4} className="section-title">Why Use Our Platform</Title>
                <Row gutter={[24, 24]}>
                    <Col span={24} md={8}>
                        <Card className="feature-card" hoverable>
                            <AppstoreOutlined className="feature-icon" />
                            <Title level={4} className="feature-title">Comprehensive Collection</Title>
                            <Text>Over 50,000 resources across all subjects and grade levels, carefully curated by educators</Text>
                        </Card>
                    </Col>
                    <Col span={24} md={8}>
                        <Card className="feature-card" hoverable>
                            <UserOutlined className="feature-icon" />
                            <Title level={4} className="feature-title">Teacher-Approved</Title>
                            <Text>Every resource is reviewed and rated by experienced classroom teachers</Text>
                        </Card>
                    </Col>
                    <Col span={24} md={8}>
                        <Card className="feature-card" hoverable>
                            <SearchOutlined className="feature-icon" />
                            <Title level={4} className="feature-title">Smart Search</Title>
                            <Text>Advanced filters help you find exactly what you need in seconds</Text>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Home;