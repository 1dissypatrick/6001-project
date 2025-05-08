import React from "react";
import { Form, Input, Button, message, Divider } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import "./login.css";
import axios from 'axios';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

const Login = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

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

    

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to access your Education Resource account</p>
                </div>
                
                <Form 
                    form={form}
                    className="login-form"
                    onFinish={handleSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input 
                            prefix={<UserOutlined className="input-icon" />}
                            placeholder="Enter your username" 
                            className="input-field"
                            size="large"
                        />
                    </Form.Item>
                    
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="input-icon" />}
                            placeholder="Enter your password" 
                            className="input-field"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="login-button"
                            size="large"
                            block
                        >
                            Sign In
                        </Button>
                    </Form.Item>

                    <Divider className="divider">or</Divider>

                </Form>

                <div className="register-cta">
                    Don't have an account? <Link to="/register" className="register-link">Create account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;