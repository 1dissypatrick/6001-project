import React from 'react';
import { Input, Checkbox, Divider, Dropdown, Button, Space, Rate, Col, Row } from 'antd';
import { DownOutlined, HomeOutlined } from '@ant-design/icons'; // Import Home icon
import { useNavigate } from 'react-router-dom';
import useSearchResult from './useSearchResult';
import './searchResult.css';

const { Search } = Input;
const CheckboxGroup = Checkbox.Group;

const plainOptions = [
    'Chinese language education', 'English Language Education', 'Mathematics education',
    'Science education', 'Personal, social and humanistic education', 'Physical education',
    'Arts and Humanities', 'History', 'Business and Communication',
    'Career and Technical Education', 'General Studies',
];

const menuItems = [
    { label: 'Preschool', key: 'Preschool' },
    { label: 'Lower Primary', key: 'Lower Primary' },
    { label: 'Upper Primary', key: 'Upper Primary' },
    { label: 'Middle School', key: 'Middle School' },
    { label: 'High School', key: 'High School' },
    { label: 'Community College/Lower Division', key: 'Community College/Lower Division' },
    { label: 'College/Upper Division', key: 'College/Upper Division' },
    { label: 'Career/Technical', key: 'Career/Technical' },
];

const pages = [
    { label: '10', key: '1' },
    { label: '20', key: '2' },
    { label: '50', key: '3' },
];

const title = [
    { label: 'Rating', key: '1' },
    { label: 'Date Added', key: '2' },
];

const SearchResult = () => {
    const navigate = useNavigate();
    const {
        checkedList,
        selectedLevel,
        selectedPageSize,
        selectedSort,
        fileData,
        onSearch,
        onChange,
        handleMenuClick,
        handlePageSize,
        handleSort,
        handleRateChange
    } = useSearchResult();

    const renderResults = () => fileData.map((file, index) => (
        <Row gutter={16} key={file._id} className="result-row">
            <Col span={24}>
                <div className="result-item">
                    <div className="result-content">
                        <h3>
                            <a href={`http://localhost:5001/uploads/${encodeURIComponent(file.fileName)}`}
                                target="_blank" rel="noopener noreferrer">
                                {file.fileName || 'No File Name'}
                            </a>
                        </h3>
                        <p><strong>Rate:</strong> {file.rating || 'No Rating'}</p>
                        <p><strong>Subject:</strong> {file.subjects?.join(', ') || 'N/A'}</p>
                        <p><strong>Education Level:</strong> {file.educationLevel || 'N/A'}</p>
                        <p><strong>Material Type:</strong> {file.materialTypes?.join(', ') || 'N/A'}</p>
                        <p><strong>Education Level:</strong> {file.educationLevel || 'N/A'}</p>
                        <p><strong>Author:</strong> {file.username || 'N/A'}</p>
                        <p><strong>Date Added:</strong> {file.date ? new Date(file.date).toLocaleDateString() : 'N/A'}</p>
                        <Rate value={file.rating || 0} onChange={value => handleRateChange(value, index)} />
                    </div>
                </div>
            </Col>
        </Row>
    ));

    return (
        <div className="container">
    <header>
        <div className="header-title">
            <h1>Search Resources</h1>
            <Button 
                type="link" 
                className="back-to-home" 
                onClick={() => navigate('/')} 
                icon={<HomeOutlined />}
            >
                Back to Home
            </Button>
        </div>
        <Search placeholder="Enter your keyword(s) here" onSearch={onSearch} />
    </header>

            <div className="content">
                <div className="aside">
                    <h2>Filter By</h2>
                    <div className="filter-section">
                        <h3>Subject Area</h3>
                        <CheckboxGroup options={plainOptions} value={checkedList} onChange={onChange} />
                    </div>
                    <Divider />
                    <Dropdown menu={{ items: menuItems, onClick: e => handleMenuClick(e.key) }}>
                        <Button>
                            <Space>
                                {selectedLevel || 'Education Level'}
                                <DownOutlined />
                            </Space>
                        </Button>
                    </Dropdown>
                </div>
                
                <div className="results-body">
                    <div className="results-header">
                        <span>Results ({fileData.length})</span>
                        <div className="results-controls">
                            <label>Per Page</label>
                            <Dropdown menu={{ items: pages, onClick: e => 
                                handlePageSize(pages.find(p => p.key === e.key).label)
                            }}>
                                <Button>
                                    <Space>
                                        {selectedPageSize} <DownOutlined />
                                    </Space>
                                </Button>
                            </Dropdown>
                            <label>Sort By</label>
                            <Dropdown menu={{ items: title, onClick: e => 
                                handleSort(title.find(t => t.key === e.key).label)
                            }}>
                                <Button>
                                    <Space>
                                        {selectedSort} <DownOutlined />
                                    </Space>
                                </Button>
                            </Dropdown>
                        </div>
                    </div>
                    {renderResults()}
                </div>
            </div>
        </div>
    );
};

export default SearchResult;
