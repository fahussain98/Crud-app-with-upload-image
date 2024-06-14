import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  //state list of the users
  const [users, setUsers] = useState([]);
  //state manage form inputs
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollnumber: '',
    lastname: '',
    image: null
  });
  //state update the user
  const [updateId, setUpdateId] = useState(null);

//Function to fetch the list of users from the server
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:9060/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
// Function to handle changes in the form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
//image upload
  const handleFileChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };
// Function to handle form submission for adding/updating users
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }
    try {
      if (updateId) {
        // Update user
        await axios.put(`http://localhost:9060/update/${updateId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setUpdateId(null);
      } else {
        // Add user
        await axios.post('http://localhost:9060/add', formData, {
          // headers: {
          //   'Content-Type': 'multipart/form-data'
          // }
        });
      }
      // Reset the form after successful submission

      setForm({ name: '', email: '', password: '', rollnumber: '', lastname: '', image: null });
      fetchUsers();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: user.password,
      rollnumber: user.rollnumber,
      lastname: user.lastname,
      image: null
    });
    setUpdateId(user._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:9060/delete/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container">
      <h1>login form</h1>
      <form onSubmit={handleSubmit} className="form">
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} 
        required/>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange}required />

        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required/>

        <input type="text" name="rollnumber" placeholder="Roll Number" value={form.rollnumber} onChange={handleChange} required/>

        <input type="text" name="lastname" placeholder="Last Name" value={form.lastname} onChange={handleChange} required/>

        <input type="file" name="image" onChange={handleFileChange} />

        <button type="submit">Submit</button>
      </form>

      <h2>Users List</h2>
      <ul className="user-list">
        {users.map(user => (
          <li key={user._id} className="user-item">
            <div className="user-info">
              <div>{user.name}</div>
              <div>{user.email}</div>
              <div>{user.rollnumber}</div>
              <div>{user.lastname}</div>
            </div>
            {user.image && <img src={`http://localhost:9060/uploads/${user.image}`} alt={user.name} className="user-image" />}
            <div className="user-actions">
              <button onClick={() => handleEdit(user)}>Edit</button>
              <button onClick={() => handleDelete(user._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
