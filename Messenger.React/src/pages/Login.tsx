import React, { ChangeEvent, FC, FormEvent, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import UserLoginReques from "../Models/RequestModels/UserLoginRequest";
import { AuthContext } from "../context/AuthContext";
import styles from "../assets/styles/Login.module.css";
import { useAppDispatch } from "../store/store";
import { login } from "../store/features/userSlice";

const Login: FC = () => {
    const initState = {
        phone: '',
        password: '',
    };
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [UserLogin, setUserLogin] = useState(initState);
    const [errors, setErrors] = useState({
        phone: ''
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserLogin({
            ...UserLogin,
            [name]: value
        });

        if (name === 'phone') {
            const phonePattern = /^\+380\d{9}$/;
            if (!phonePattern.test(value)) {
                setErrors({
                    ...errors,
                    phone: 'Please enter a valid phone number in the format +380XXXXXXXXX'
                });
            } else {
                setErrors({
                    ...errors,
                    phone: ''
                });
            }
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (errors.phone) {
            alert(errors.phone);
            return;
        }

        try {
            const response = await axios.post<UserLoginReques>('http://192.168.0.100:5187/Users/login', UserLogin);
            console.log("Login", response.data);
            const data = response.data;
            dispatch(login({token:data.token, user:data.user}))
            setUserLogin(initState);
            navigate("/");
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <section className={styles.loginSection}>
            <div className={styles.loginContainer}>
                <h2 className={styles.loginTitle}>Sign in</h2>
                <p className={styles.loginSubtitle}>
                    Don't have an account? <Link to={"/registation"}>Sign up</Link>
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-floating mb-3">
                        <input
                            type="tel"
                            className={`form-control ${styles.formControl}`}
                            name="phone"
                            id="phone"
                            placeholder="Phone"
                            pattern="^\+380\d{9}$"
                            required
                            value={UserLogin.phone}
                            onChange={handleChange}
                        />

                        {errors.phone && <div className={styles.textDanger}>{errors.phone}</div>}
                    </div>
                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            className={`form-control ${styles.formControl}`}
                            name="password"
                            id="password"
                            placeholder="Enter your password"
                            value={UserLogin.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="d-grid">
                        <button className={`btn ${styles.btnLogin}`} type="submit">Log in</button>
                    </div>
                    <div className="text-center mt-3">
                        <Link to="/forgot-password" className="text-light">Forgot password?</Link>
                    </div>
                    <div className="text-center mt-3">
                        <button className="btn btn-outline-light" type="button">
                            <i className="fab fa-google"></i> Sign in with Google
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Login;