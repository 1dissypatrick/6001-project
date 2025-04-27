// import React  from "react";
// import { Layout, Menu,} from 'antd';
// import MenuConfig from '../../config'
// // import {
// //   MenuFoldOutlined,
// //   MenuUnfoldOutlined,
// //   UploadOutlined,
// //   UserOutlined,
// //   VideoCameraOutlined,
// // } from '@ant-design/icons';
// //改成import Icon對象
// import * as Icon from '@ant-design/icons'
// //Menu
// import {useNavigate} from 'react-router-dom'
// import {useDispatch} from 'react-redux'
// import { selectMenuList } from "../../store/reducers/tab";
// import "../commonAside/index.css";

// const { Sider } = Layout;

// //動態獲得icon， 要用React.createElement才能寫出對象，()傳遞對象
// const iconToElement = (name) => React.createElement(Icon[name])

// const items = MenuConfig.map((icon) => {
//   // 沒有子菜單的所需要的屬性，上官網看ItemType
//     const child = {
//       key: icon.path,
//       //把icon對象寫成function才能用，(icon.configiconname),看第17行
//       icon: iconToElement(icon.icon),
//       label:icon.label
//     }
//     //有子菜單的所需要的屬性 eg: pageOne,pageTwo
//     if(icon.children){
//       //children是itemtype 是array
//       child.children = icon.children.map(item =>{
//           return{
//             key:item.path,
//             label:item.label
//           }    
//       })
//     }
//     return child
// })


// const CommonAside = ({collapsed}) =>{
//   const navigate = useNavigate()
//   const dispatch = useDispatch()
//   const setTabsList = (val) =>{
//       dispatch(selectMenuList(val))
//   }
//     //拿菜單前要先有路徑
//     const SelectMenu = (e) =>{
//       console.log(e,'e')
//       let data
//       MenuConfig.forEach(item =>{
//         //拿第一路徑
//         if(item.path === e.keyPath[e.keyPath.length-1]){
//           data = item
//           //如果是有二級菜單
//           if(e.keyPath.length >1){
//             data = item.children.find(child =>{
//               return child.path === e.key

//             })
//           }
//         }
//       })
//       setTabsList({
//         path:data.path,
//         name:data.name,
//         label: data.label
//       })
//       navigate(e.key)
//     }
//     return(
// <Sider
//   trigger={null}
//   collapsed={collapsed}
// >
//     <h3 className="main-container">{collapsed ? 'ER' : 'Education Resource'}

//     <Menu
//       theme="dark"
//       mode="inline"
//       defaultSelectedKeys={['1']}
//       items={items}
//       onClick={SelectMenu}
//     />
//     </h3>
// </Sider>


//     )
// }

// export default CommonAside

import React from "react";
import { Layout, Menu } from 'antd';
import MenuConfig from '../../config';
import * as Icon from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectMenuList } from "../../store/reducers/tab";
import "../commonAside/index.css";

const { Sider } = Layout;

const iconToElement = (name) => React.createElement(Icon[name]);

const CommonAside = ({ collapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get user role from Redux or localStorage
  const userRole = useSelector(state => state.auth?.user?.role) || 
                   localStorage.getItem('role') || 
                   'user';

  // Filter menu items based on user role
  const filteredMenuItems = MenuConfig.filter(menuItem => {
    // Show all items for admin
    if (userRole === 'admin') return true;
    
    // For non-admin users, hide items with show:false or path:'/other'
    if (menuItem.path === '/other') return false;
    if (menuItem.show === false) return false;
    
    return true;
  });

  // Convert filtered menu config to AntD menu items
  const items = filteredMenuItems.map((item) => {
    const menuItem = {
      key: item.path,
      icon: iconToElement(item.icon),
      label: item.label
    };
    
    if (item.children) {
      menuItem.children = item.children.map(child => ({
        key: child.path,
        label: child.label
      }));
    }
    
    return menuItem;
  });

  const setTabsList = (val) => {
    dispatch(selectMenuList(val));
  };

  const SelectMenu = (e) => {
    let data;
    MenuConfig.forEach(item => {
      if (item.path === e.keyPath[e.keyPath.length - 1]) {
        data = item;
        if (e.keyPath.length > 1) {
          data = item.children.find(child => child.path === e.key);
        }
      }
    });
    
    if (data) {
      setTabsList({
        path: data.path,
        name: data.name,
        label: data.label
      });
      navigate(e.key);
    }
  };

    return(
<Sider
  trigger={null}
  collapsed={collapsed}
>
    <h3 className="main-container">{collapsed ? 'ER' : 'Education Resource'}

    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={['1']}
      items={items}
      onClick={SelectMenu}
    />
    </h3>
</Sider>
  );
};

export default CommonAside;