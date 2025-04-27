import React from "react";
import { Form, Input, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import "./register.css";
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            await axios.post('http://localhost:5000/register', values);
            message.success('Registration successful! Redirecting to login...');
            navigate('/login');
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
            <Form className="register-container" onFinish={handleSubmit}>
                <div className="register-title">Welcome to Education Resource</div>
                <div className="inputbox">
                    <Form.Item
                        label="Email Address"
                        name="emailAddress"
                        rules={[
                            { required: true, message: 'Please input your Email Address!' },
                            { type: 'email', message: 'Please enter a valid email address!' }
                        ]}
                    >
                        <Input placeholder="Enter your Email Address" className="input-field" />
                    </Form.Item>
                </div>
                <div className="inputbox">
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input placeholder="Enter your username" className="input-field" />
                    </Form.Item>
                </div>
                <div className="inputbox">
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 8, message: 'Password must be at least 8 characters long' }
                        ]}
                    >
                        <Input.Password placeholder="Enter your password" className="input-field" />
                    </Form.Item>
                </div>
                <div className="inputbox">
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
                    >
                        <Input.Password placeholder="Confirm your password" className="input-field" />
                    </Form.Item>
                </div>
                <Form.Item className="register-button-container">
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="action-button"
                    >
                        Register
                    </Button>
                    <Button
                        type="primary"
                        onClick={goBack}
                        className="action-button"
                    >
                        Back
                    </Button>
                </Form.Item>
                <p className="login-link">
                    Already have an account? <Link to="/login">Login now!</Link>
                </p>
            </Form>
        </div>
    );
};

export default Register;