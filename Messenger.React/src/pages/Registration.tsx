import axios from "axios";
import React, { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Registration: FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        phone: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (errors.phone) {
            alert(errors.phone);
            return;
        }

        try {
            const response = await axios.post('http://192.168.0.100:5187/Users/register', formData);
            navigate("/login");
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };

    return (
        <section className="py-3 py-md-5 py-xl-8">
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="mb-5">
                            <h2 className="display-5 fw-bold text-center">Registration</h2>
                            <p className="text-center m-0">Have an account? <Link to={"/login"}>Sign in</Link></p>
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
                                                    type="text" 
                                                    className="form-control border-0 border-bottom rounded-0 " 
                                                    name="userName" 
                                                    id="userName" 
                                                    placeholder="User Name" 
                                                    required 
                                                    value={formData.userName}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="userName" className="form-label">User Name</label>
                                            </div>
                                        </div>
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
                                                    value={formData.phone}
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
                                                    required 
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="password" className="form-label">Password</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-floating mb-3">
                                                <input 
                                                    type="password" 
                                                    className="form-control border-0 border-bottom rounded-0" 
                                                    name="confirmPassword" 
                                                    id="confirmPassword" 
                                                    placeholder="Confirm Password" 
                                                    required 
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                />
                                                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="d-grid">
                                                <button className="btn btn-lg btn-dark rounded-0 fs-6" type="submit">Register</button>
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
}

export default Registration;
