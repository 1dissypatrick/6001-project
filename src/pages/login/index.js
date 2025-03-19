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
    
            // Assuming the backend sends back additional user details
            const { username, message: successMessage } = response.data;
    
            localStorage.setItem('username', username); // Store the username
            message.success(successMessage || 'Login successful!'); // Show a success message
            navigate('/home'); // Redirect to the home page
        } catch (error) {
            if (error.response && error.response.data) {
                message.error(error.response.data.message); // Show the backend error message
            } else {
                console.error('Error logging in user:', error);
            }
        }
    };
    
    const goBack = () =>{
        navigate('/home');
    }

    return (
        <Form className="login-container" onFinish={handleSubmit}>
            <div className="login_title">Login System</div>
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
    rules={[{ required: true, message: 'Please input your password!' }]}
>
    <Input.Password placeholder="Input your password" />
</Form.Item>


            <Form.Item className="login-button">
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
                    Login
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
                
                    onClick={() => goBack()}
                >
                back
                </Button>
            </Form.Item>
            <p>or <Link to="/register" rel="noopener noreferrer">Register now!</Link></p>
        </Form>
    );
}

export default Login;
