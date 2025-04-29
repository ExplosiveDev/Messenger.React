import { FC } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Login from "./Login"
import Registration from "./Registration"
import Messenger from "./Messenger"

interface MyRoutesProps {
    isAuthenticated: Boolean;
}
const MyRoutes: FC<MyRoutesProps> = ({ isAuthenticated }) => {

    if (isAuthenticated) {
        return (
            <>
                <div className="main-menu d-flex flex-column justify-content-center" style={{maxWidth: '1800px', margin: '0 auto'}}>
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