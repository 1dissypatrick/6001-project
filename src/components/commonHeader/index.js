import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Button, Dropdown } from 'antd';
import { MenuFoldOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { collapseMenu } from '../../store/reducers/tab';
import { Link } from 'react-router-dom';
import "../commonHeader/index.css";

const { Header } = Layout;

const CommonHeader = ({ collapsed }) => {
    const [username, setUsername] = useState(''); // State to hold the username

    useEffect(() => {
        // Retrieve the username from localStorage
        const loggedInUsername = localStorage.getItem('username') || 'Guest'; // Fallback to "Guest"
        setUsername(loggedInUsername); // Update the username in state
    }, []);

    const logout = () => {
        localStorage.removeItem('username'); // Clear username on logout
        window.location.reload(); // Optionally reload to reset the app state
    };

    const items = [
        {
            key: '1',
            label: (
                <a target="_blank" rel="noopener noreferrer">
                    Personal Center
                </a>
            ),
        },
        {
            key: '2',
            label: (
                <Link to="/register" rel="noopener noreferrer"> Register </Link>
            ),
        },
        {
            key: '3',
            label: (
                <Link to="/login" rel="noopener noreferrer"> Login </Link>
            ),
        },
        {
            key: '4',
            label: (
                <a onClick={logout} rel="noopener noreferrer">
                    Logout
                </a>
            ),
        },
    ];

    const dispatch = useDispatch();

    const setCollapsed = () => {
        dispatch(collapseMenu());
    };

    return (
        <Header className="header-container">
            <Button
                type="text"
                icon={<MenuFoldOutlined />}
                style={{
                    fontSize: '16px',
                    width: 64,
                    height: 32,
                    backgroundColor: '#fff',
                }}
                onClick={() => setCollapsed()}
            />

            {/* Display username near the dropdown menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                    {username} {/* Show logged-in username */}
                </span>
                <Dropdown menu={{ items }} className="avatar-item">
                    <Avatar src={<img src={require("../../assets/images/user.png")} alt="User Avatar" />} />
                </Dropdown>
            </div>
        </Header>
    );
};

export default CommonHeader;
