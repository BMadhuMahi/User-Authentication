import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const res = await axios.post('http://localhost:8000/api/login/', {
        username,
        password
      });

      localStorage.setItem('access', res.data.access);

      const profileRes = await axios.get('http://localhost:8000/api/profile/', {
        headers: { Authorization: `Bearer ${res.data.access}` }
      });
      console.log('Profile Response:', profileRes);

      localStorage.setItem('role', profileRes.data.role);


      if (profileRes.data.role === 'admin') {

        navigate('/admin-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.heading}>Login</h2>
        <input name="username" placeholder="Username" style={styles.input} />
        <input name="password" type="password" placeholder="Password" style={styles.input} />
        <button type="submit" style={styles.button}>Login</button>
        <p style={styles.text}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5'
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  heading: {
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc'
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  text: {
    marginTop: '15px',
    fontSize: '14px',
    color: '#555'
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none'
  }
};

export default LoginPage;
