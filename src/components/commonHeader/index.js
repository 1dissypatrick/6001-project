import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Button, Dropdown, Badge } from 'antd';
import { MenuFoldOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { collapseMenu } from '../../store/reducers/tab';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../commonHeader/index.css";

const { Header } = Layout;

const CommonHeader = ({ collapsed }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Retrieve the username from localStorage
        const loggedInUsername = localStorage.getItem('username') || 'Guest';
        setUsername(loggedInUsername);

        // Fetch unread notifications count if user is logged in
        if (loggedInUsername && loggedInUsername !== 'Guest') {
            fetchUnreadCount();
        }
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const username = localStorage.getItem('username');
            if (username) {
                const { data } = await axios.get(`http://localhost:5001/notifications/${username}/unread-count`);
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const goBackLogin = () => {
        // Use replace: true to prevent adding the current page to history
        navigate('/login', { replace: true });
    };

    const logout = () => {
        localStorage.removeItem('username');
        goBackLogin();
    };

    const items = [
        {
            key: '1',
            label: (
                <Link to="/notification" rel="noopener noreferrer">
                    Notifications {unreadCount > 0 && <Badge count={unreadCount} size="small" />}
                </Link>
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
                    {username}
                </span>
                <Dropdown menu={{ items }} className="avatar-item">
                    <Badge count={unreadCount} offset={[-5, 5]}>
                        <Avatar src={<img src={require("../../assets/images/user.png")} alt="User Avatar" />} />
                    </Badge>
                </Dropdown>
            </div>
        </Header>
    );
};

export default CommonHeader;