import React from "react";
import { Form, Input, Button, message} from 'antd';
import "./register.css";
import { Link, useNavigate } from 'react-router-dom';
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
            // Display error message from the backend
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
        <Form className="register-container" onFinish={handleSubmit}>
            <div className="register_title">Register System</div>
        <Form.Item
            label="Email Address:"
            name="emailAddress"
            rules={[
                { required: true, message: 'Please input your Email Address!' },
                { type: 'email', message: 'Please enter a valid email address!' } // Email format validation
            ]}
>
    <Input placeholder="Input your Email Address" />
</Form.Item>

            <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input placeholder="Input your username" />
            </Form.Item>
            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' },
            {
                min: 8,
                message: 'Password must be at least 8 characters long',
            },
    ]}
>
    <Input.Password placeholder="Input your password" />
</Form.Item>

<Form.Item
    label="Confirm Password"
    name="confirmPassword"
    dependencies={['password']} // Specifies that this field depends on the "password" field
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
    <Input.Password placeholder="Input your confirm password" />
</Form.Item>

            <Form.Item className="register-button">
                <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                        fontSize: '16px',
                        width: '100px',
                        height: '40px',
                        margin: '0 10px',
                        backgroundColor: '#1890ff',
                        borderRadius: '5px',
                        border: 'none',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    Register
                </Button>
                <Button
                    type="primary"
                    style={{
                        fontSize: '16px',
                        width: '100px',
                        height: '40px',
                        margin: '0 10px',
                        backgroundColor: '#f5222d',
                        borderRadius: '5px',
                        border: 'none',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                    onClick={goBack}
                >
                    Back
                </Button>
                <p></p>or <Link to="/login" rel="noopener noreferrer"> Login now!</Link>
            </Form.Item>
        </Form>
    );
};

export default Register;
