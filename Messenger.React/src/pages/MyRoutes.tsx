import { FC, useEffect } from "react"
import Shop from "./Messenger"
import { Navigate, Route, Routes } from "react-router-dom"
import Login from "./Login"
import Registration from "./Registration"
import User from "../Models/User"
import Messenger from "./Messenger"


interface MyRoutesProps {
    isAuthenticated: Boolean;
    user: User;
}
const MyRoutes: FC<MyRoutesProps> = ({ isAuthenticated, user }) => {

    if (isAuthenticated) {
        return (
            <>
                <div className="d-flex flex-column justify-content-center">
                    <Routes>
                    <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                        />
                        <Route path="/" element={<Messenger />}></Route>
                    </Routes>
                </div>
            </>
        )
    }
    else {
        return (
            <>
                <div className="d-flex flex-column justify-content-center">
                    <Routes>
                        <Route
                            path="*"
                            element={<Navigate to="/login" replace />}
                        />
                        <Route path="/login" element={<Login />}></Route>
                        <Route path="/registation" element={<Registration />}></Route>

                    </Routes>
                </div>
            </>
        )
    }

}

export default MyRoutes;