import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Badge, Space, Typography, message } from 'antd';
import axios from 'axios';
import './index.css';

const { Title } = Typography;

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const username = localStorage.getItem('username');

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`http://localhost:5001/notifications/${username}`);
            setNotifications(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            message.error('Failed to load notifications');
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        if (username) {
            fetchNotifications();
        }
    }, [username, fetchNotifications]);

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:5001/notifications/${notificationId}/mark-read`);
            message.success('Notification marked as read');
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
            message.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.read);
            await Promise.all(
                unreadNotifications.map(n => 
                    axios.put(`http://localhost:5001/notifications/${n._id}/mark-read`)
                )
            );
            message.success('All notifications marked as read');
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
            message.error('Failed to mark all notifications as read');
        }
    };

    const columns = [
        {
            title: 'Message',
            dataIndex: 'message',
            render: (text, record) => (
                <Space>
                    {!record.read && <Badge dot />}
                    <span>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Document',
            dataIndex: 'documentName',
            render: (text) => text || 'N/A',
        },
        {
            title: 'File',
            dataIndex: 'fileName',
            render: (text) => text || 'N/A',
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            render: (date) => new Date(date).toLocaleString(),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Actions',
            render: (_, record) => (
                <Button 
                    type="link" 
                    onClick={() => markAsRead(record._id)}
                    disabled={record.read}
                >
                    Mark as Read
                </Button>
            ),
        },
    ];

    return (
        <div className="notification-container">
            <div className="notification-header">
                <Title level={3}>My Notifications</Title>
                <div className="notification-actions">
                    <Button 
                        type="primary" 
                        onClick={markAllAsRead}
                        disabled={notifications.every(n => n.read) || notifications.length === 0}
                    >
                        Mark All as Read
                    </Button>
                    <Button 
                        type="default" 
                        onClick={fetchNotifications}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </div>
            </div>
            
            <Table
                rowKey="_id"
                columns={columns}
                dataSource={notifications}
                loading={loading}
                pagination={{ pageSize: 10 }}
                rowClassName={(record) => record.read ? 'read-notification' : 'unread-notification'}
                locale={{
                    emptyText: 'No notifications found'
                }}
            />
        </div>
    );
};

export default Notification;

