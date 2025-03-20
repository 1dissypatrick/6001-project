import React, { useState } from 'react';
import { Input, Form, Button, Checkbox, Dropdown, Space, Divider } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './home.css';

const { Search } = Input;
const CheckboxGroup = Checkbox.Group;
const plainOptions = [
    'Chinese Language Education', 'English Language Education', 'Mathematics Education', 
    'Science Education', 'Social and Humanistic Education', 'Physical Education', 
    'Arts and Humanities', 'History', 'Business and Communication', 
    'Career and Technical Education', 'General Studies', 123
];

const Home = () => {
    const [checkedList, setCheckedList] = useState([]); // Selected subjects
    const [selectedLevel, setSelectedLevel] = useState(''); // Selected education level
    const navigate = useNavigate(); // Navigation function

    const onSearch = (value) => {
        // Combine all filters into an object
        const filters = {
            keyword: value, // Search keyword
            subjects: checkedList, // Selected subjects
            educationLevel: selectedLevel, // Selected education level
        };

        console.log('Filters to pass:', filters);

        // Navigate to SearchResult page and pass filters as state
        navigate('/searchResult', { state: filters });
    };

    const onChange = (list) => {
        setCheckedList(list); // Update selected subjects
    };

    const handleMenuClick = (e) => {
        setSelectedLevel(e.key); // Update selected education level
    };

    const items = [
        { label: 'Preschool', key: 'Preschool' },
        { label: 'Lower Primary', key: 'Lower Primary' },
        { label: 'Upper Primary', key: 'Upper Primary' },
        { label: 'Middle School', key: 'Middle School' },
        { label: 'High School', key: 'High School' },
        { label: 'Community College/Lower Division', key: 'Community College/Lower Division' },
        { label: 'College/Upper Division', key: 'College/Upper Division' },
        { label: 'Career/Technical', key: 'Career/Technical' },
    ];

    const menuProps = {
        items,
        onClick: handleMenuClick,
    };

    return (
        <Form className="search">
            {/* Keyword Search Input */}
            <Search
                placeholder="Enter search keywords"
                onSearch={onSearch} // Trigger filtering on search
            />

            {/* Subject Filters */}
            <p>Subject:</p>
            <CheckboxGroup
                options={plainOptions}
                value={checkedList}
                onChange={onChange} // Update selected subjects
            />

            <Divider />

            {/* Education Level Dropdown */}
            <Dropdown menu={menuProps}>
                <Button>
                    <Space>
                        {selectedLevel
                            ? `Selected: ${selectedLevel}`
                            : 'Education Level'}
                        <DownOutlined />
                    </Space>
                </Button>
            </Dropdown>
        </Form>
    );
};

export default Home;
