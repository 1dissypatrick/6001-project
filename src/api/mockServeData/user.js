import { message } from 'antd';
import Mock from 'mockjs';

// Function to generate a random date within 2023-2024
function getRandomDate() {
  const start = new Date(2023, 0, 1).getTime();
  const end = new Date(2024, 11, 31).getTime();
  const randomDate = new Date(start + Math.random() * (end - start));
  return `${randomDate.getFullYear()}-${String(randomDate.getMonth() + 1).padStart(2, '0')}-${String(randomDate.getDate()).padStart(2, '0')}`;
}

function param2Obj(url) {
  const search = url.split('?')[1];
  if (!search) {
    return {};
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"') +
    '"}'
  );
}

let List = [];
const count = 200;

for (let i = 0; i < count; i++) {
  List.push(
    Mock.mock({
      id: Mock.Random.guid(),
      fileName: Mock.Random.word() + '.' + Mock.Random.pick(['txt', 'doc', 'pdf', 'jpg', 'png']),
      restrictions: Mock.Random.integer(0, 1),
      date: getRandomDate(), // Use custom function to generate date
      'views|0-1000': 1,
      'comments|0-50': 1,
      'rating|1-5': 1,
    })
  );
}

export default {
  getUserList: config => {
    const { name, page = 1, limit = 20 } = param2Obj(config.url);
    const mockList = List.filter(user => {
      if (name && user.fileName.indexOf(name) === -1) return false;
      return true;
    });
    const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1));
    return {
      code: 20000,
      count: mockList.length,
      list: pageList
    };
  },

  createUser: config => {
    const { fileName, restrictions, date, views, comments, rating } = JSON.parse(config.body);
    List.unshift({
      id: Mock.Random.guid(),
      fileName: fileName,
      restrictions: restrictions,
      date: date,
      views: views,
      comments: comments,
      rating: rating
    });
    return {
      code: 20000,
      data: {
        message: 'User added successfully'
      }
    };
  },

  updateUser: config => {
    const { id, fileName, restrictions, date, views, comments, rating } = JSON.parse(config.body);
    List = List.map(user => {
      if (user.id === id) {
        return { ...user, fileName, restrictions, date, views, comments, rating };
      }
      return user;
    });
    return {
      code: 20000,
      data: {
        message: 'User updated successfully'
      }
    };
  },

  deleteUser: config => {
    const { id } = JSON.parse(config.body);
    if (!id) {
      return {
        code: -999,
        message: '參數不正確'
      };
    } else {
      List = List.filter(u => u.id !== id);
      return {
        code: 20000,
        message: '刪除成功'
      };
    }
  }
};
