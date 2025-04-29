import React from "react";
import { Form, Input, Button, message, Divider } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import "./register.css";
import axios from 'axios';
import { MailOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';

const Register = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        try {
            await axios.post('http://localhost:5000/register', values);
            message.success('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (error) {
            if (error.response && error.response.data) {
                message.error(error.response.data.message);
            } else {
                console.error('Error registering user:', error);
                message.error('An unexpected error occurred. Please try again.');
            }
        }
    };

    const goBack = () => {
        navigate('/home');
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-header">
                    <h1>Create Your Account</h1>
                    <p>Join Education Resource to access premium learning materials</p>
                </div>
                
                <Form 
                    form={form}
                    className="register-form"
                    onFinish={handleSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        label="Email Address"
                        name="emailAddress"
                        rules={[
                            { required: true, message: 'Please input your Email Address!' },
                            { type: 'email', message: 'Please enter a valid email address!' }
                        ]}
                    >
                        <Input 
                            prefix={<MailOutlined className="input-icon" />}
                            placeholder="your.email@example.com" 
                            className="input-field"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input 
                            prefix={<UserOutlined className="input-icon" />}
                            placeholder="Choose a username" 
                            className="input-field"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 8, message: 'Password must be at least 8 characters long' }
                        ]}
                        hasFeedback
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="input-icon" />}
                            placeholder="Create a password" 
                            className="input-field"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match!'));
                                },
                            }),
                        ]}
                        hasFeedback
                    >
                        <Input.Password 
                            prefix={<LockOutlined className="input-icon" />}
                            placeholder="Confirm your password" 
                            className="input-field"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="register-button"
                            size="large"
                            block
                        >
                            Create Account
                        </Button>
                    </Form.Item>

                    <Divider className="divider">or</Divider>

                    <div className="alternative-actions">
                        <Button
                            type="default"
                            onClick={goBack}
                            className="back-button"
                            size="large"
                            block
                        >
                            Return to Home
                        </Button>
                    </div>
                </Form>

                <div className="login-cta">
                    Already have an account? <Link to="/login" className="login-link">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;