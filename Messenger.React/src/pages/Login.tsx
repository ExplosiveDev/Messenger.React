import React, { ChangeEvent, FC, FormEvent, useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import UserLoginReques from "../Models/UserLoginReques";
import { AuthContext } from "../context/AuthContext";


const Login: FC = () => {
    const initState = {
        phone: '',
        password: '',
    };

    const navigate = useNavigate();
    const auth = useContext(AuthContext);
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
            const response = await axios.post<UserLoginReques>('https://localhost:7250/Users/login', UserLogin);
            const data = response.data;
            auth.login(data.token, data.user);
            setUserLogin(initState);
            navigate("/");
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <section className="py-3 py-md-5 py-xl-8">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="mb-5">
                            <h2 className="display-5 fw-bold text-center">Sign in</h2>
                            <p className="text-center m-0">Don't have an account? <Link to={"/registation"}>Sign up</Link></p>
                        </div>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10 col-xl-8">
                        <div className="row gy-5 justify-content-center">
                            <div className="col-12 col-lg-5">
                                <form onSubmit={handleSubmit}>
                                    <div className="row gy-3 overflow-hidden">
                                        <div className="col-12">
                                            <div className="form-floating mb-3">
                                                <input
                                                    type="tel"
                                                    className="form-control border-0 border-bottom rounded-0"
                                                    name="phone"
                                                    id="phone"
                                                    placeholder="+380XXXXXXXXX"
                                                    pattern="^\+380\d{9}$"
                                                    required
                                                    value={UserLogin.phone}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="phone" className="form-label">Phone</label>
                                                {errors.phone && <div className="text-danger">{errors.phone}</div>}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-floating mb-3">
                                                <input
                                                    type="password"
                                                    className="form-control border-0 border-bottom rounded-0"
                                                    name="password"
                                                    id="password"
                                                    placeholder="Password"
                                                    value={UserLogin.password}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <label htmlFor="password" className="form-label">Password</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="row justify-content-between">
                                                <div className="col-6">
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" value="" name="remember_me" id="remember_me" />
                                                        <label className="form-check-label text-secondary" htmlFor="remember_me">
                                                            Remember me
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="text-end">
                                                        <a href="#!" className="link-secondary text-decoration-none">Forgot password?</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="d-grid">
                                                <button className="btn btn-lg btn-dark rounded-0 fs-6" type="submit">Log in</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
