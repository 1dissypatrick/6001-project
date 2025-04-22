//作爲主頁面和幫子頁面寫出口
import React from 'react'
import {Outlet} from 'react-router-dom'
//$ npm install antd --save
import {  Layout, theme } from 'antd';

import CommonAside from '../components/commonAside';
import CommonHeader from '../components/commonHeader';
import {useSelector} from 'react-redux'

const { Content } = Layout;


const Main = () => {
    // const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  //獲取動態
  const collapsed =useSelector(state =>state.tab.isCollapse)
  return (
    
    <Layout className="main-container">
        
      {/* <Sider trigger={null} collapsible collapsed={collapsed}>
        <h3 className="main-container">通用後臺管理系統</h3>
        
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <UserOutlined />,
              label: 'nav 1',
            },
            {
              key: '2',
              icon: <VideoCameraOutlined />,
              label: 'nav 2',
            },
            {
              key: '3',
              icon: <UploadOutlined />,
              label: 'nav 3',
            },
          ]}
          style={{
            height:"100%"
          }}
        />
      </Sider> */}
      <CommonAside collapsed={collapsed}/>
      
      <Layout>
        {/* <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        >
          <Button
            type="text"
            // icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            // onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header> */}
        <CommonHeader collapsed={collapsed}/>
          
        <Content
          style={{
            margin: '40px 16px',
            padding: 24,
            minHeight: 1000,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet/>
        </Content>
      </Layout>
    </Layout>
    
  )
    
}

export default Main