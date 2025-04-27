import React from "react";
import { Form, Input, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import "./login.css";
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            const response = await axios.post('http://localhost:5000/login', values);
            const { username, role, message: successMessage } = response.data;
            localStorage.setItem('username', username);
            localStorage.setItem('role', role);
            message.success(successMessage || 'Login successful!');
            if (role === 'admin') {
                navigate('/other/review');
            } else {
                navigate('/home');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                message.error(error.response.data.message);
            } else {
                message.error('Login failed. Please try again.');
                console.error('Error logging in:', error);
            }
        }
    };

    const goBack = () => {
        navigate('/home');
    };

    return (
        <div className="login-page">
            <Form className="login-container" onFinish={handleSubmit}>
                <div className="login-title">Welcome to Education Resource</div>
                <div className="inputboxUsername">
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input placeholder="Enter your username" className="input-field" />
                </Form.Item>
                </div>
                <div className="inputboxUsername">
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password placeholder="Enter your password" className="input-field" />
                </Form.Item>
                </div>
                <Form.Item className="login-button-container">
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="action-button"
                    >
                        Login
                    </Button>
                    <Button
                        type="primary"
                        onClick={goBack}
                        className="action-button"
                    >
                        Back
                    </Button>
                </Form.Item>
                <p className="register-link">
                    Don't have an account? <Link to="/register">Register now!</Link>
                </p>
            </Form>
        </div>
    );
};

export default Login;